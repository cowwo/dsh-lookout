// dsh-notify-p · 测试用的脚本化假 SMTP 服务器
//
// 从 smtp.test.mjs 里提出来共用：端到端用例（plugin.test.mjs）也要真的走一遍 SMTP 协议，
// 「只记录」通道删掉之后，这是"不连外网但跑通真实投递链路"的唯一办法。
import { createServer } from 'node:net';

/**
 * 起一个脚本化的假 SMTP 服务器，记录会话过程。
 * @param {object} [options] 行为开关
 * @param {boolean} [options.rejectAuth] 是否对 AUTH 回 535
 * @returns {Promise<{ port: number, received: object, close: () => Promise<void> }>}
 */
export async function startFakeSmtp(options = {}) {
  const received = { lines: [], data: '', authUser: '', authPassword: '' };
  const sockets = new Set();
  const server = createServer((socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    socket.setEncoding('utf8');
    socket.write('220 fake.example ESMTP\r\n');
    let buffer = '';
    let inData = false;
    let awaiting = null;
    let dataLines = [];

    const handle = (line) => {
      if (awaiting === 'user') {
        received.authUser = line;
        awaiting = 'password';
        socket.write('334 UGFzc3dvcmQ6\r\n');
        return;
      }
      if (awaiting === 'password') {
        received.authPassword = line;
        awaiting = null;
        socket.write(options.rejectAuth === true ? '535 5.7.8 Authentication failed\r\n' : '235 2.7.0 Accepted\r\n');
        return;
      }
      received.lines.push(line);
      const cmd = line.toUpperCase();
      if (cmd.startsWith('EHLO')) socket.write('250-fake.example\r\n250-AUTH LOGIN PLAIN\r\n250 SIZE 10485760\r\n');
      else if (cmd.startsWith('AUTH LOGIN')) { awaiting = 'user'; socket.write('334 VXNlcm5hbWU6\r\n'); }
      else if (cmd.startsWith('MAIL FROM')) socket.write('250 2.1.0 OK\r\n');
      else if (cmd.startsWith('RCPT TO')) socket.write('250 2.1.5 OK\r\n');
      else if (cmd === 'DATA') { inData = true; dataLines = []; socket.write('354 End data with <CR><LF>.<CR><LF>\r\n'); }
      else if (cmd === 'QUIT') { socket.write('221 2.0.0 Bye\r\n'); socket.end(); }
      else socket.write('250 OK\r\n');
    };

    socket.on('data', (chunk) => {
      buffer += chunk;
      for (;;) {
        const nl = buffer.indexOf('\r\n');
        if (nl === -1) break;
        const line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 2);
        if (inData) {
          if (line === '.') {
            inData = false;
            received.data = dataLines.join('\n');
            socket.write('250 2.0.0 OK queued\r\n');
          } else {
            dataLines.push(line.replace(/^\.\./, '.'));
          }
          continue;
        }
        handle(line);
      }
    });
    socket.on('error', () => {});
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  return {
    port,
    received,
    /** 清掉已录到的会话过程，便于同一个服务器上跑多个用例。 */
    reset: () => {
      received.lines = [];
      received.data = '';
      received.authUser = '';
      received.authPassword = '';
    },
    close: () => new Promise((resolve) => {
      for (const socket of sockets) socket.destroy();
      server.close(() => resolve());
    }),
  };
}
