const express = require("express");
const process = require("process");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const morgan = require("morgan");
const cors = require('cors');

const BASEURL = process.env.BASEURL || "https://status.ekyo.app";
const ORGANIZATION = process.env.ORGANIZATION;
const BEARER = process.env.BEARER;

if (!ORGANIZATION || !BEARER) {
  console.log(
    "make sure you have setup ORGANIZATION and BEARER environment variables"
  );
  return 1;
}

app.use(cors({
    origin: BASEURL
}));
app.use(morgan("combined"));

app.use(
  `/status-board/${ORGANIZATION}`,
  createProxyMiddleware({
    target: "https://raw.githubusercontent.com",
    changeOrigin: true,
    pathRewrite: { [`^/status-board/`]: "/" },
    onProxyReq(proxyReq, req, res) {
      proxyReq.setHeader("Authorization", `Bearer ${BEARER}`);
    },
  })
);

app.use(
  `/status-board/repos`,
  createProxyMiddleware({
    target: "https://api.github.com",
    changeOrigin: true,
    pathRewrite: { [`^/status-board/`]: "/" },
    onProxyReq(proxyReq, req, res) {
      proxyReq.setHeader("Authorization", `Bearer ${BEARER}`);
    },
  })
);

app.use(`/healthcheck`, (_, res) => {
  res.status(200);
  res.send("OK");
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server listening on port ", 3000);
});
