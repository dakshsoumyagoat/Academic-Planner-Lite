import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

const isProduction = process.env["NODE_ENV"] === "production";

// On Replit, the frontend and API are served by separate services behind a
// shared proxy. On hosts like Render that only run a single web service
// (e.g. this API server), we optionally serve the built frontend directly
// from here if its build output is present alongside this package.
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDistDir = path.resolve(
  currentDir,
  "../../jee-planner/dist/public",
);
const shouldServeFrontend = isProduction && fs.existsSync(frontendDistDir);

if (isProduction) {
  // Needed for cookies to work correctly behind a reverse proxy
  // (e.g. Render's load balancer) that terminates TLS.
  app.set("trust proxy", 1);
}

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

if (shouldServeFrontend) {
  app.use(express.static(frontendDistDir));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(frontendDistDir, "index.html"));
  });
}

export default app;
