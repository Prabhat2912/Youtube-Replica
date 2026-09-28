import "./src/utils/nodeCompat.js";
import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import { app } from "./src/app.js";

// Local dev / `npm start` entry. The Vercel function entry is
// `api/index.js` — keep app.listen() out of serverless code.
dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port : ${process.env.PORT || 8000}`);
    });
    app.on("Error !!", (err) => {
      console.log("Error on app!!!", err);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed !!!", err);
  });

export { app };
