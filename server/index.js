import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, ".env") });

const { connectdb } = await import("./src/db/index.js");
const { app } = await import("./app.js");
const port = process.env.PORT || 8000;
connectdb()
  .then(() => {
    app.listen(port, () => {
      console.log(`App is running at port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
