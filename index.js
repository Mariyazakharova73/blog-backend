import express from "express";
import jwt from "jsonwebtoken";
// для шифровки пароля
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { registerValidation } from "./validations/auth.js";
import { validationResult } from "express-validator";
import userModel from "./models/User.js";
import checkAuth from "./utils/checkAuth.js";

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

app.get("/auth/me", checkAuth, (req, res) => {
  try {
    res.json({ success: true });
  } catch (err) {}
});

app.post("/auth/login", async (req, res) => {
  try {
    // проверям по email, есть ли в базе данных пользователь
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    // сравниваем пароли в запросе и в базе данных
    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
    if (!isValidPass) {
      return res.status(400).json({ message: "Неверный логин или пароль" });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      { expiresIn: "30d" }
    );

    const { passwordHash, ...userData } = user._doc;

    // возвращаем ответ пользователю
    res.json({ ...userData, token });
  } catch (err) {
    // для себя
    console.log(err);
    // ответ пользователю
    res.status(500).json({
      message: "Не удалось авторизоваться",
    });
  }
});

app.post("/auth/register", registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    console.log(res);
    // если есть ошибки
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    const password = req.body.password;
    // алгоритм шифрования пароля
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new userModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });

    // сохраням в базу данных документ
    const user = await doc.save();

    // после записи в базу данных
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      { expiresIn: "30d" }
    );

    const { passwordHash, ...userData } = user._doc;

    // возвращаем ответ пользователю
    res.json({ ...userData, token });
  } catch (err) {
    // для себя
    console.log(err);
    // ответ пользователю
    res.status(500).json({
      message: "Не удалось зарегистрироваться",
    });
  }
});

app.listen(4444, (err) => {
  if (err) {
    console.log(err);
  }

  console.log("Server OK");
});
