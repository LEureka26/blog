const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initDatabase() {
  const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    multipleStatements: true
  };

  try {
    console.log('正在连接数据库...');
    const connection = await mysql.createConnection(connectionConfig);
    console.log('数据库连接成功');

    const sqlFilePath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('正在执行数据库初始化脚本...');
    await connection.query(sql);
    console.log('数据库初始化完成');

    await connection.end();
    console.log('数据库连接已关闭');
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    return false;
  }
}

if (require.main === module) {
  initDatabase().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = initDatabase;