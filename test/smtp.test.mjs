import test from 'node:test';
import assert from 'node:assert/strict';

import { createSmtpSender, MailSendError, isPermanentSmtpCode } from '../lib/notify/send/smtp.js';
import { startFakeSmtp } from './fake-smtp.mjs';

test('SMTP：AUTH LOGIN → MAIL/RCPT/DATA 全流程，中文主题被编码', async (t) => {
  const fake = await startFakeSmtp();
  t.after(() => fake.close());

  const sender = createSmtpSender({
    host: '127.0.0.1',
    port: fake.port,
    secure: 'plain',
    user: 'me@example.com',
    password: 'auth-code',
    timeoutMs: 5000,
  });

  const result = await sender.send({
    from: 'DSH 通知 <me@example.com>',
    to: ['you@example.com'],
    subject: '[DSH] 任务完成 · 修复登录页',
    text: '正文',
    html: '<p>正文</p>',
  });

  assert.equal(result.ok, true);
  assert.ok(fake.received.lines.some((l) => l.startsWith('MAIL FROM:<me@example.com>')));
  assert.ok(fake.received.lines.some((l) => l.startsWith('RCPT TO:<you@example.com>')));
  assert.equal(fake.received.authUser, Buffer.from('me@example.com', 'utf8').toString('base64'));
  assert.equal(fake.received.authPassword, Buffer.from('auth-code', 'utf8').toString('base64'));
  assert.match(fake.received.data, /^Subject: =\?UTF-8\?B\?/m);
  assert.match(fake.received.data, /Content-Type: multipart\/alternative/);
});

test('SMTP：535 认证失败 → AUTH 且不可重试（不放大风控锁定）', async (t) => {
  const fake = await startFakeSmtp({ rejectAuth: true });
  t.after(() => fake.close());

  const sender = createSmtpSender({
    host: '127.0.0.1',
    port: fake.port,
    secure: 'plain',
    user: 'me@example.com',
    password: 'wrong',
    timeoutMs: 5000,
  });

  await assert.rejects(
    () => sender.send({ from: 'me@example.com', to: ['you@example.com'], subject: 's', text: 't' }),
    (error) => {
      assert.ok(error instanceof MailSendError);
      assert.equal(error.code, 'AUTH');
      assert.equal(error.retryable, false);
      assert.equal(error.status, 535);
      return true;
    },
  );
});

test('SMTP：没配 host 时直接报 CONFIG，不建连接', async () => {
  const sender = createSmtpSender({ host: '', port: 465, user: '', password: '' });
  await assert.rejects(
    () => sender.send({ from: 'a@b.com', to: ['c@d.com'], subject: 's', text: 't' }),
    (error) => error instanceof MailSendError && error.code === 'CONFIG' && error.retryable === false,
  );
});

test('isPermanentSmtpCode：5xx 不该重试，4xx 可以', () => {
  assert.equal(isPermanentSmtpCode(535), true);
  assert.equal(isPermanentSmtpCode(550), true);
  assert.equal(isPermanentSmtpCode(421), false);
  assert.equal(isPermanentSmtpCode(450), false);
});
