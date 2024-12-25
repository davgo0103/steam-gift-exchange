const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors'); // 新增

const app = express();
const PORT = 3000;

// 使用 CORS 中介軟體
app.use(cors({ origin: 'http://localhost:3001' })); // 指定允許的來源

app.use(bodyParser.json());

const FILE_PATH = './users.json';

// 初始化檔案
if (!fs.existsSync(FILE_PATH)) {
  fs.writeFileSync(FILE_PATH, JSON.stringify([]));
}

// 取得所有使用者
app.get('/users', (req, res) => {
  const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
  res.json(data);
});

// 新增或更新使用者
app.post('/users', (req, res) => {
  const { id, planA, planB, timestamp } = req.body;
  if (!id || !planA || !planB) {
    return res.status(400).json({ error: '缺少必要欄位' });
  }

  const users = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
  const existingIndex = users.findIndex(user => user.id === id);

  if (existingIndex !== -1) {
    users[existingIndex] = { id, planA, planB, timestamp };
  } else {
    users.push({ id, planA, planB, timestamp });
  }

  fs.writeFileSync(FILE_PATH, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`伺服器運行於 http://localhost:${PORT}`);
});
