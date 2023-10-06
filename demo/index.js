import { MiniMD } from "mini-md";
import helmet from "helmet";
import expressRateLimit from "express-rate-limit";

const miniMd = new MiniMD();

miniMd.use(helmet());
miniMd.use(
  expressRateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests,
  })
);

miniMd.modify((app) => app.disable("x-powered-by"));

const routes = [
  ["/", "index"],
  ["/syntax", "syntax"],
  ["/schemes", "schemes"],
  ["/seo", "SEO"],
  ["/components", "components"],
  ["/scripts", "scripts"],
  ["/basic-implementation", "Basic Implementation"],
  ["*", "404"],
];

miniMd.addRoutes(routes);

const port = 3000;

miniMd.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
