import express from "express";
import mongoose from "mongoose";
import { registerValidation, loginValidation, postCreateValidation } from "./validations.js";
import { checkAuth, handleErrors } from "./utils/index.js";
import { UserController, PostController } from "./controllers/index.js";
import multer from "multer";
import cors from "cors";

mongoose
  .connect(
    "mongodb+srv://lukoyanowamaria:wwwwww@cluster0.mkqzcqw.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("DB OK");
  })
  .catch((err) => console.log("DB err", err));

const app = express();

const storage = multer.diskStorage({
  destination: (x, y, cb) => {
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(cors());

// для чтения json
app.use(express.json());

// для доступа к картинкам
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/auth/me", checkAuth, UserController.getMe);
app.post("/auth/login", loginValidation, handleErrors, UserController.login);
app.post("/auth/register", registerValidation, handleErrors, UserController.register);

app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get("/tags", PostController.getLastTags);

app.get("/posts", PostController.getAll);
app.get("/posts/:id", PostController.getOne);
app.post("/posts", checkAuth, postCreateValidation, handleErrors, PostController.create);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch("/posts/:id", checkAuth, handleErrors, PostController.update);

app.listen(4444, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Server OK");
});
