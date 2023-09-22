import { MiniMD } from "mini-md";
import helmet from "helmet";
import expressRateLimit from "express-rate-limit";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const miniMd = new MiniMD(__dirname, app);

app.use(helmet());
app.use(
  expressRateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests,
  })
);

const requestHandler = miniMd.getRequestHandler();

app.use(requestHandler);

app.use((req, res) => {
  console.log("404: " + req.path);
  res.status(404).send(miniMd.renderTemplate(miniMd.getTemplate("404")));
});

const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
