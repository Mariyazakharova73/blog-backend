import express from "express";
import mongoose from "mongoose";
import { registerValidation, loginValidation, postCreateValidation } from "./validations.js";
import checkAuth from "./utils/checkAuth.js";
import { login, register, getMe } from "./controllers/UserController.js";
import { create, getAll, getOne, remove, update } from "./controllers/PostController.js";
import multer from "multer";

mongoose
  .connect(
    "mongodb+srv://lukoyanowamaria:wwwwww@cluster0.mkqzcqw.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("DB OK");
  })
  .catch((err) => console.log("DB err", err));

const app = express();
// для чтения json
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/auth/me", checkAuth, getMe);
app.post("/auth/login", loginValidation, login);
app.post("/auth/register", registerValidation, register);

app.get("/posts", getAll);
app.get("/posts/:id", getOne);
app.post("/posts", checkAuth, postCreateValidation, create);
app.delete("/posts/:id", checkAuth, remove);
app.patch("/posts/:id", checkAuth, update);

app.listen(4444, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Server OK");
});
