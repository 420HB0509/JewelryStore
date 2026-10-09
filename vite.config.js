import fs from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/* During `npm run dev`, serve the files in /api the same way Vercel does:
   /api/admin/login → api/admin/login.js → its exported POST(request). */
function devApi() {
  return {
    name: "dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith("/api/")) return next();
        const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
        const route = url.pathname.replace(/^\/api\//, "").replace(/\/+$/, "");
        const file = path.resolve("api", `${route}.js`);
        const valid = /^[a-z0-9/_-]+$/i.test(route) && !route.split("/").some((s) => s.startsWith("_"));

        if (!valid || !fs.existsSync(file)) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: "Not found" }));
        }
        try {
          const mod = await server.ssrLoadModule(file);
          const handler = mod[req.method];
          if (typeof handler !== "function") {
            res.statusCode = 405;
            return res.end(JSON.stringify({ error: "Method not allowed" }));
          }
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) {
            if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
          }
          const response = await handler(
            new Request(url, {
              method: req.method,
              headers,
              body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks),
            })
          );
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          server.ssrFixStacktrace(err);
          console.error(err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Server error" }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Make .env.local values (e.g. ADMIN_PASSWORD) visible to the dev API
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }

  return {
    plugins: [react(), devApi()],
    // Relative asset paths so the build works on any static host
    base: "./",
    build: {
      rollupOptions: {
        input: {
          main: path.resolve("index.html"),
          admin: path.resolve("admin/index.html"),
        },
      },
    },
  };
});
