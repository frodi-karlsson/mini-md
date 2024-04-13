import express from "express";
import { miniMd } from "mini-md";

const app = express();
app.use(
  miniMd({
    rootDir: "md",
  })
);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
