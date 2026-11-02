import { createApp } from './app.js';
import { config } from './config.js';

const server = createApp().listen(config.port, config.host, () => {
  console.log(`GlobeCopy backend: http://${config.host}:${config.port}`);
});

server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE' ? '后端端口已被占用，请修改 PORT。' : '后端启动失败，请检查本机配置。');
  process.exitCode = 1;
});
