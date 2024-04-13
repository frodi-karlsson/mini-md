import express from "express";
import { miniMd } from "mini-md";
import markdownItAttrs from "markdown-it-attrs";

const app = express();
app.use(express.static('public'))
app.use(
  miniMd({
    rootDir: "md",
    mdOptions: {
        html: true,
    },
    plugins: [markdownItAttrs],
  })
);

app.use((_, res) => {
  res.status(404).send("Not found");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
