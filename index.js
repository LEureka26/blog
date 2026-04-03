const express = require('express');
const app = express();
const port = 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 引入路由
const routes = require('./router/index');

// 根路径重定向到 /articles
app.get('/', (req, res) => {
  res.redirect('/articles');
});

app.use('/', routes);

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});