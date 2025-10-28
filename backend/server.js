import express from "express";
import connectDatabase from "./config/database.js";
import dotenv from "dotenv";
//to access .env
dotenv.config();

const app = express();

//api
app.get("/", (req, res) => {
  res.send("<h1>Hello, Express.js Server!</h1>");
}); 


const port = process.env.PORT || 4000;

connectDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
