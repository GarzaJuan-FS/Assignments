const http = require("http");

let todos = [
  { id: 1, task: "Task 1" },
  { id: 2, task: "Task 2" },
  { id: 3, task: "Task 3" },
];
let nextId = 4;

const server = http.createServer((req, res) => {
  const { method, url } = req;
  const urlRoutes = url.split("/").filter(Boolean);

  res.setHeader("Content-Type", "application/json");

  // Actuator endpoint
  if (url === "/" && method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Service is up");
    return;
  }

  // Route for /todos
  if (urlRoutes[0] === "todos") {
    const id = parseInt(urlRoutes[1]);

    // GET /todos
    if (method === "GET" && !id) {
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data: todos }));
      return;
    }

    // GET /todos/:id
    if (method === "GET" && id) {
      const todo = todos.find((t) => t.id === id);
      if (todo) {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: todo }));
      } else {
        res.writeHead(404);
        res.end(
          JSON.stringify({
            success: false,
            message: `Todo with ID ${id} not found`,
          })
        );
      }
      return;
    }

    // POST /todos
    if (method === "POST" && !id) {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          const { task } = JSON.parse(body);
          if (!task) {
            res.writeHead(400);
            res.end(
              JSON.stringify({
                success: false,
                message: "Missing 'task' in request body",
              })
            );
            return;
          }
          const newTodo = { id: nextId++, task };
          todos.push(newTodo);
          res.writeHead(201);
          res.end(JSON.stringify({ success: true, data: newTodo }));
        } catch (error) {
          res.writeHead(400);
          res.end(
            JSON.stringify({ success: false, message: "Invalid JSON body" })
          );
        }
      });
      return;
    }

    // PUT /todos/:id
    if (method === "PUT" && id) {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          const { task } = JSON.parse(body);
          if (!task) {
            res.writeHead(400);
            res.end(
              JSON.stringify({
                success: false,
                message: "Missing 'task' in request body",
              })
            );
            return;
          }
          const todoIndex = todos.findIndex((t) => t.id === id);
          if (todoIndex !== -1) {
            todos[todoIndex] = { ...todos[todoIndex], task };
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, data: todos[todoIndex] }));
          } else {
            res.writeHead(404);
            res.end(
              JSON.stringify({
                success: false,
                message: `Todo with ID ${id} not found`,
              })
            );
          }
        } catch (error) {
          res.writeHead(400);
          res.end(
            JSON.stringify({ success: false, message: "Invalid JSON body" })
          );
        }
      });
      return;
    }

    // DELETE /todos/:id
    if (method === "DELETE" && id) {
      const todoIndex = todos.findIndex((t) => t.id === id);
      if (todoIndex !== -1) {
        const deletedTodo = todos.splice(todoIndex, 1);
        res.writeHead(200);
        res.end(
          JSON.stringify({
            success: true,
            message: `Todo with ID ${id} deleted`,
            data: deletedTodo[0],
          })
        );
      } else {
        res.writeHead(404);
        res.end(
          JSON.stringify({
            success: false,
            message: `Todo with ID ${id} not found`,
          })
        );
      }
      return;
    }
  }

  // Fallback for unhandled routes
  res.writeHead(404);
  res.end(JSON.stringify({ success: false, message: "Endpoint not found" }));
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
