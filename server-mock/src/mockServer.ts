import { createServer } from "node:http";

const PORT = 3001;

const lectures = [
  {
    id: "lec-1",
    title: "Предел функции",
    subject: "Математический анализ",
    author: "VisualMath Team",
    tags: ["предел", "график"],
    updatedAt: new Date().toISOString()
  },
  {
    id: "lec-2",
    title: "Производная",
    subject: "Математический анализ",
    author: "VisualMath Team",
    tags: ["производная", "касательная"],
    updatedAt: new Date().toISOString()
  }
];

const server = createServer((req, res) => {
  const url = req.url ?? "/";
  const method = req.method ?? "GET";

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (method === "GET" && url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "server-mock",
        time: new Date().toISOString()
      })
    );
    return;
  }

  if (method === "GET" && url === "/lectures") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(lectures));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  res.end(
    JSON.stringify({
      error: "Not Found",
      path: url
    })
  );
});

server.listen(PORT, () => {
  console.log(`Mock server started on http://localhost:${PORT}`);
});