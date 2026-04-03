const express = require('express');
const router = express.Router();

// 首页-文章列表
router.get('/articles', (req, res) => {
  res.send('获取文章列表');
});

// 用户注册
router.post('/register', (req, res) => {
  res.send('用户注册');
});

// 用户登录
router.post('/login', (req, res) => {
  res.send('用户登录');
});

// 用户个人中心
router.get('/user', (req, res) => {
  res.send('用户个人中心');
});

// 发布文章
router.post('/articles', (req, res) => {
  res.send('发布文章');
});

// 分类列表
router.get('/categories', (req, res) => {
  res.send('分类列表');
});

// 文章详情
router.get('/articles/:id', (req, res) => {
  res.send(`文章详情: ${req.params.id}`);
});

// 文章搜索
router.get('/articles/search=:search', (req, res) => {
  res.send(`文章搜索: ${req.params.search}`);
});

module.exports = router;