const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/userController');
const { pool } = require('../config/database');

// 创建文章
async function createArticle(req, res) {
  try {
    if (!req.body) {
      return res.status(400).json({ error: '请求体不能为空' });
    }

    const { title, content, category, tags, cover, author_id } = req.body;

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

    // 保存到数据库
    const [result] = await pool.execute(
      'INSERT INTO articles (title, content, cover, category, tags, author_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, cover, category, JSON.stringify(tags), author_id]
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

// 首页-文章列表
router.get('/articleslist', getArticles);

// 用户注册
router.post('/register', register);

// 用户登录
router.post('/login', login);

// 用户个人中心
router.get('/user', (req, res) => {
  res.send('用户个人中心');
});

// 发布文章
router.post('/articles', createArticle);

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

// 分类列表
router.get('/categories', getCategories);

// 文章详情
router.get('/articles/:id', getArticle);

// 文章搜索
router.get('/articles/search=:search', searchArticles);

module.exports = router;