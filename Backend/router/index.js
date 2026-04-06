const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/userController');
const { pool } = require('../config/database');
const { verifyToken } = require('../utils/auth.js');
const multer = require('multer');
const path = require('path');

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsPath = path.join(__dirname, '../uploads');
    console.log('Multer uploads path:', uploadsPath);
    cb(null, uploadsPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 创建文章
async function createArticle(req, res) {
  try {
    if (!req.body) {
      return res.status(400).json({ error: '请求体不能为空' });
    }

    const { title, content, category, tags, cover, author_id } = req.body;

    // console.log('接收到的文章数据:', req.body);
    // console.log('标签数据:', tags);
    // console.log('标签类型:', typeof tags);

    // 验证参数
    if (!title || !content || !category || !author_id) {
      return res.status(400).json({ error: '标题、内容、分类和作者 ID 为必填项' });
    }

    if (title.length < 1 || title.length > 255) {
      return res.status(400).json({ error: '标题长度必须在 1-255 字符之间' });
    }

    if (content.length < 1) {
      return res.status(400).json({ error: '内容不能为空' });
    }

    // 验证用户是否存在
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [author_id]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ error: '用户不存在，请先注册' });
    }

    // 验证分类是否存在
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE name = ?',
      [category]
    );
    
    if (categories.length === 0) {
      return res.status(400).json({ error: '分类不存在' });
    }

    // 处理标签数据
    let tagsJson = '[]';
    if (tags && Array.isArray(tags)) {
      tagsJson = JSON.stringify(tags);
    } else if (tags && typeof tags === 'string') {
      try {
        const parsedTags = JSON.parse(tags);
        tagsJson = JSON.stringify(Array.isArray(parsedTags) ? parsedTags : []);
      } catch (e) {
        tagsJson = '[]';
      }
    }

    console.log('处理后的标签 JSON:', tagsJson);

    // 保存到数据库
    const [result] = await pool.execute(
      'INSERT INTO articles (title, content, cover, category, tags, author_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, cover, category, tagsJson, author_id]
    );

    res.status(201).json({
      message: '文章创建成功',
      article_id: result.insertId
    });
  } catch (error) {
    console.error('创建文章失败:', error);
    res.status(500).json({ error: '创建文章失败，请稍后重试' });
  }
}

// 获取文章列表
async function getArticles(req, res) {
  try {
    const { page = 1, pageSize = 10, category = '', search = '' } = req.query;
    
    let query = 'SELECT * FROM articles WHERE 1=1';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    // 分页
    const offset = (page - 1) * pageSize;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), parseInt(offset));
    
    const [articles] = await pool.execute(query, params);
    
    // 获取总条数
    let countQuery = 'SELECT COUNT(*) as total FROM articles WHERE 1=1';
    const countParams = [];
    
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    
    if (search) {
      countQuery += ' AND (title LIKE ? OR content LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.status(200).json({
      data: articles,
      total
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    res.status(500).json({ error: '获取文章列表失败，请稍后重试' });
  }
}

// 获取文章详情
async function getArticle(req, res) {
  try {
    const { id } = req.params;
    const [articles] = await pool.execute(
      'SELECT * FROM articles WHERE id = ?',
      [id]
    );
    
    if (articles.length === 0) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    // 增加浏览次数
    await pool.execute(
      'UPDATE articles SET views = views + 1 WHERE id = ?',
      [id]
    );
    
    res.status(200).json(articles[0]);
  } catch (error) {
    console.error('获取文章详情失败:', error);
    res.status(500).json({ error: '获取文章详情失败，请稍后重试' });
  }
}

// 搜索文章
async function searchArticles(req, res) {
  try {
    const { search } = req.params;
    const [articles] = await pool.execute(
      'SELECT * FROM articles WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC',
      [`%${search}%`, `%${search}%`]
    );
    res.status(200).json(articles);
  } catch (error) {
    console.error('搜索文章失败:', error);
    res.status(500).json({ error: '搜索文章失败，请稍后重试' });
  }
}

// 编辑文章
async function updateArticle(req, res) {
  try {
    const { id } = req.params;
    const { title, content, category, tags, cover, author_id } = req.body;

    console.log('=== 编辑文章请求 ===');
    console.log('文章 ID:', id);
    console.log('接收到的完整数据:', JSON.stringify(req.body));
    console.log('标签原始值:', tags);
    console.log('标签类型:', typeof tags);

    // 验证参数
    if (!title || !content || !category || !author_id) {
      return res.status(400).json({ error: '标题、内容、分类和作者 ID 为必填项' });
    }

    if (title.length < 1 || title.length > 255) {
      return res.status(400).json({ error: '标题长度必须在 1-255 字符之间' });
    }

    if (content.length < 1) {
      return res.status(400).json({ error: '内容不能为空' });
    }

    // 验证用户是否存在
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [author_id]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ error: '用户不存在，请先注册' });
    }

    // 验证分类是否存在
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE name = ?',
      [category]
    );
    
    if (categories.length === 0) {
      return res.status(400).json({ error: '分类不存在' });
    }

    // 验证用户是否是文章作者
    const [articles] = await pool.execute(
      'SELECT * FROM articles WHERE id = ? AND author_id = ?',
      [id, author_id]
    );
    
    if (articles.length === 0) {
      return res.status(400).json({ error: '您没有权限编辑这篇文章' });
    }

    let tagsJson = '[]';
    if (tags && Array.isArray(tags)) {
      tagsJson = JSON.stringify(tags);
      console.log('标签是数组，直接序列化:', tagsJson);
    } else if (tags && typeof tags === 'string') {
      try {
        const parsedTags = JSON.parse(tags);
        tagsJson = JSON.stringify(Array.isArray(parsedTags) ? parsedTags : []);
        console.log('标签是字符串，解析后序列化:', tagsJson);
      } catch (e) {
        tagsJson = '[]';
        console.log('标签字符串解析失败，使用空数组');
      }
    } else {
      console.log('标签为空或类型不正确，使用空数组');
    }

    // 保存到数据库
    const [result] = await pool.execute(
      'UPDATE articles SET title = ?, content = ?, cover = ?, category = ?, tags = ? WHERE id = ?',
      [title, content, cover, category, tagsJson, id]
    );

    console.log('更新结果: 影响行数 =', result.affectedRows);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '文章不存在' });
    }

    res.status(200).json({
      message: '文章编辑成功'
    });
  } catch (error) {
    console.error('编辑文章失败:', error);
    res.status(500).json({ error: '编辑文章失败，请稍后重试' });
  }
}

// 删除文章
async function deleteArticle(req, res) {
  try {
    const { id } = req.params;
    const { author_id } = req.body;

    // 验证参数
    if (!author_id) {
      return res.status(400).json({ error: '作者 ID 为必填项' });
    }

    // 验证用户是否存在
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [author_id]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ error: '用户不存在，请先注册' });
    }

    // 验证用户是否是文章作者
    const [articles] = await pool.execute(
      'SELECT * FROM articles WHERE id = ? AND author_id = ?',
      [id, author_id]
    );
    
    if (articles.length === 0) {
      return res.status(400).json({ error: '您没有权限删除这篇文章' });
    }

    // 删除文章
    const [result] = await pool.execute(
      'DELETE FROM articles WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '文章不存在' });
    }

    res.status(200).json({
      message: '文章删除成功'
    });
  } catch (error) {
    console.error('删除文章失败:', error);
    res.status(500).json({ error: '删除文章失败，请稍后重试' });
  }
}

// 获取用户信息
async function getUser(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const [users] = await pool.execute(
      'SELECT id, username, email, avatar, created_at, updated_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.status(200).json(users[0]);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: '无效的认证令牌' });
    }
    res.status(500).json({ error: '获取用户信息失败，请稍后重试' });
  }
}

async function getUserStats(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const [articles] = await pool.execute(
      'SELECT COUNT(*) as articleCount, COALESCE(SUM(views), 0) as totalViews FROM articles WHERE author_id = ?',
      [decoded.userId]
    );

    res.status(200).json({
      articleCount: articles[0].articleCount || 0,
      totalViews: articles[0].totalViews || 0
    });
  } catch (error) {
    console.error('获取用户统计信息失败:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: '无效的认证令牌' });
    }
    res.status(500).json({ error: '获取用户统计信息失败，请稍后重试' });
  }
}

// 分类列表
async function getCategories(req, res) {
  try {
    const [categories] = await pool.execute(
      'SELECT * FROM categories'
    );
    res.status(200).json(categories);
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({ error: '获取分类列表失败，请稍后重试' });
  }
}

// 编辑个人信息
async function updateUser(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const { username, email, avatar } = req.body;

    // 验证参数
    if (!username && !email && !avatar) {
      return res.status(400).json({ error: '至少需要提供一项要更新的信息' });
    }

    // 验证邮箱格式
    if (email) {
      const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: '邮箱格式不正确' });
      }
    }

    // 验证用户名长度
    if (username && (username.length < 3 || username.length > 20)) {
      return res.status(400).json({ error: '用户名长度必须在 3-20 字符之间' });
    }

    // 检查用户名是否已存在
    if (username) {
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, decoded.userId]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ error: '用户名已存在' });
      }
    }

    // 检查邮箱是否已存在
    if (email) {
      const [existingEmails] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, decoded.userId]
      );

      if (existingEmails.length > 0) {
        return res.status(400).json({ error: '邮箱已存在' });
      }
    }

    // 获取当前用户信息
    const [currentUsers] = await pool.execute(
      'SELECT username, email, avatar FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (currentUsers.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const currentUser = currentUsers[0];
    const updateUsername = username || currentUser.username;
    const updateEmail = email || currentUser.email;
    const updateAvatar = avatar || currentUser.avatar;

    // 更新用户信息
    const [result] = await pool.execute(
      'UPDATE users SET username = ?, email = ?, avatar = ? WHERE id = ?',
      [updateUsername, updateEmail, updateAvatar, decoded.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 获取更新后的用户信息
    const [users] = await pool.execute(
      'SELECT id, username, email, avatar, created_at, updated_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    res.status(200).json({
      message: '个人信息更新成功',
      user: users[0]
    });
  } catch (error) {
    console.error('更新个人信息失败:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: '无效的认证令牌' });
    }
    res.status(500).json({ error: '更新个人信息失败，请稍后重试' });
  }
}

// 编辑个人信息
router.put('/user', updateUser);

// 上传头像
router.post('/upload/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }

    // 构建头像 URL
    const avatarUrl = `http://localhost:3001/uploads/${req.file.filename}`;

    // 更新用户头像
    const [result] = await pool.execute(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [avatarUrl, decoded.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.status(200).json({
      message: '头像上传成功',
      url: avatarUrl
    });
  } catch (error) {
    console.error('上传头像失败:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: '无效的认证令牌' });
    }
    res.status(500).json({ error: '上传头像失败，请稍后重试' });
  }
});

// 首页-文章列表
router.get('/articles', getArticles);

// 用户注册
router.post('/register', register);

// 用户登录
router.post('/login', login);

// 用户个人中心
router.get('/user', getUser);

// 用户统计信息
router.get('/user/stats', getUserStats);

// 发布文章
router.post('/articles', createArticle);

// 分类列表
router.get('/categories', getCategories);

// 文章详情
router.get('/articles/:id', getArticle);

// 文章搜索
router.get('/articles/search=:search', searchArticles);

// 编辑文章
router.put('/articles/:id', updateArticle);

// 删除文章
router.delete('/articles/:id', deleteArticle);

// 测试路由 - 检查 __dirname 的值
router.get('/test-dirname', (req, res) => {
  res.json({
    __dirname: __dirname,
    uploadsPath: path.join(__dirname, '../uploads'),
    normalizedPath: path.normalize(path.join(__dirname, '../uploads'))
  });
});

module.exports = router;
