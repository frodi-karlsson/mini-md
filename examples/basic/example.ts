import express from "express";
import path from "path";
import { miniMd } from "mini-md";

const app = express();
app.use(
  miniMd({
    rootDir: path.resolve(__dirname, "md"),
  })
);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
