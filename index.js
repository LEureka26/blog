const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3001;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 引入路由
const routes = require('./router/index');

// 使用路由
app.use('/', routes);

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
