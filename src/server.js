import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import { router } from "./routes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "public");

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "100kb" }));
app.use(express.static(publicDir));

app.use(router);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  res.status(500).json({
    ok: false,
    error: "Unexpected server error"
  });
});

app.listen(config.port, () => {
  console.log(`Phone verification service listening on port ${config.port}`);
});
