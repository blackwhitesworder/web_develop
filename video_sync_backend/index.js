const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const port = 8080;

// 使用中间件
app.use(bodyParser.json());
app.use(cors());

// 存储客户端连接
const clients = {};

// 验证码验证路由
app.post('/verify', (req, res) => {
  const { verificationCode } = req.body;
  if (verificationCode === 'caochong') {
    res.json({ success: true, videoUrl: 'https://www.bilibili.com/video/BV1pt4y1T7Ny/?spm_id_from=333.1007.top_right_bar_window_custom_collection.content.click&vd_source=2f564a473d5cea482b05c269677af9a8' });
  } else {
    res.json({ success: false });
  }
});

// 启动Express服务器
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// 启动WebSocket服务器
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.action === 'join') {
      clients[data.verificationCode] = ws;
    } else if (data.action === 'update') {
      Object.values(clients).forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ action: 'sync', currentTime: data.currentTime }));
        }
      });
    }
  });
});