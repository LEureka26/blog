const express = require('express');
const app = express();
const port = 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});