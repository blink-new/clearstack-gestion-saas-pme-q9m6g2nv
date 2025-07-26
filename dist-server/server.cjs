"use strict";

// src/server.ts
var import_node_http = require("http");
var import_node_fs = require("fs");
var import_node_path = require("path");
var import_node_url = require("url");
var PORT = process.env.PORT || 4e3;
var distDir = (0, import_node_path.join)(process.cwd(), "dist");
var mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};
var server = (0, import_node_http.createServer)((req, res) => {
  const parsedUrl = (0, import_node_url.parse)(req.url || "", true);
  const pathname = parsedUrl.pathname || "/";
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }
  if (pathname === "/api/v1/__health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, ts: Date.now() }));
    return;
  }
  if (pathname === "/api/v1/softwares/_probe") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, route: "softwares" }));
    return;
  }
  let filePath = (0, import_node_path.join)(distDir, pathname === "/" ? "index.html" : pathname);
  if (!(0, import_node_fs.existsSync)(filePath)) {
    filePath = (0, import_node_path.join)(distDir, "index.html");
  }
  try {
    const content = (0, import_node_fs.readFileSync)(filePath);
    const ext = (0, import_node_path.extname)(filePath);
    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch (error) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});
server.listen(PORT, () => {
  console.log(`[ClearStack] http://localhost:${PORT}`);
});
