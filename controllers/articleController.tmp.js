const { pool } = require('../config/database');

async function createArticle(req, res) {
  try {
    if (!req.body) {
      return res.status(400).json({ error: '请求体不能为空' });
    }

    const { title, content, category, tags, cover } = req.body;

    // 验证参数
    if (!title || !content || !category) {
      return res.status(400).json({ error: '标题、内容和分类为必填项' });
    }

    if (title.length < 1 || title.length > 255) {
      return res.status(400).json({ error: '标题长度必须在 1-255 字符之间' });
    }

    if (content.length < 1) {
      return res.status(400).json({ error: '内容不能为空' });
    }

    // 假设用户已经登录，从 token 中获取用户 ID
    // 这里简化处理，使用固定的用户 ID
    const author_id = 1;

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

async function getArticles(req, res) {
  try {
    const [articles] = await pool.execute(
      'SELECT * FROM articles ORDER BY created_at DESC'
    );
    res.status(200).json(articles);
  } catch (error) {
    console.error('获取文章列表失败:', error);
    res.status(500).json({ error: '获取文章列表失败，请稍后重试' });
  }
}

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

module.exports = {
  createArticle,
  getArticles,
  getArticle,
  searchArticles
};