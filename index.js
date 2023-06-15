const express = require('express');
const process = require('process');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const SECRET_PATH=process.env.SECRET_PATH || "status-board";
const ORGANIZATION=process.env.ORGANIZATION;
const BEARER=process.env.BEARER;

if (!ORGANIZATION || !BEARER) {
  console.log("make sure you have setup ORGANIZATION, BEARER and SECRET_PATH environment variables");
  return 1;
}

app.use(`/${SECRET_PATH}/${ORGANIZATION}`, createProxyMiddleware({
  target: 'https://raw.githubusercontent.com',
  changeOrigin: true,
  pathRewrite: {[`^/${SECRET_PATH}/`]: '/'},
  onProxyReq(proxyReq, req, res) {
    proxyReq.setHeader('Authorization', `Bearer ${BEARER}`);
  }
}));

app.use(`/${SECRET_PATH}/repos`, createProxyMiddleware({
  target: 'https://api.github.com',
  changeOrigin: true,
  pathRewrite: {[`^/${SECRET_PATH}/`]: '/'},
  onProxyReq(proxyReq, req, res) {
    proxyReq.setHeader('Authorization', `Bearer ${BEARER}`);
  }
}));

app.listen(3000, 'localhost', () => {
  console.log('Server listening on port ', 3000);
});
