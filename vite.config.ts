import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Dev server middleware to serve serverless functions in /api/
function apiDevPlugin(): Plugin {
  return {
    name: "api-dev-server",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();
        try {
          const url = new URL(req.url, "http://localhost");
          const pathname = url.pathname.replace(/\/+$/, "");
          const parts = pathname.split("/").filter(Boolean); // ['api', 'anichin'|'anime', 'home'|'detail'...]

          if (parts.length >= 3) {
            const action = parts[2]; // home, detail, stream, latest, search, schedule
            const filePath = path.resolve(__dirname, `./api/anichin/${action}.js`);
            const mod = await server.ssrLoadModule(filePath);

            if (mod && mod.default) {
              const query: Record<string, string> = {};
              url.searchParams.forEach((val, key) => {
                query[key] = val;
              });

              const customReq = Object.assign(req, { query });
              const customRes = Object.assign(res, {
                status(code: number) {
                  res.statusCode = code;
                  return customRes;
                },
                json(data: unknown) {
                  res.setHeader("Content-Type", "application/json; charset=utf-8");
                  res.end(JSON.stringify(data));
                },
                set(headers: Record<string, string>) {
                  for (const [k, v] of Object.entries(headers)) {
                    res.setHeader(k, v);
                  }
                  return customRes;
                },
              });

              return await mod.default(customReq, customRes);
            }
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[API Dev Error]", err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          return res.end(JSON.stringify({ status: 500, message: msg }));
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    apiDevPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
