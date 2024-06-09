const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const orders = [];
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use("/", express.static(path.join(__dirname, "uploads")));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const jwtSecret = "JWT_SECRET";
const users = {};

const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "토큰이 없습니다." });
  }
  try {
    const data = jwt.verify(
      req.headers.authorization.replace("Bearer ", ""),
      jwtSecret
    );
    res.locals.email = data.email;
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return res
        .status(419)
        .json({ message: "만료된 액세스 토큰입니다.", code: "expired" });
    }
    return res
      .status(401)
      .json({ message: "유효하지 않은 액세스 토큰입니다." });
  }
  next();
};

const verifyRefreshToken = (req, res, next) => {
  if (!req.cookies.refreshToken) {
    return res.status(401).json({ message: "토큰이 없습니다." });
  }
  try {
    const data = jwt.verify(req.cookies.refreshToken, jwtSecret);
    res.locals.email = data.email;
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return res
        .status(419)
        .json({ message: "만료된 리프레시 토큰입니다.", code: "expired" });
    }
    return res
      .status(401)
      .json({ message: "유효하지 않은 리프레시 토큰입니다." });
  }
  next();
};

app.get("/", (req, res) => {
  res.send("ok");
});

app.post("/refreshToken", verifyRefreshToken, (req, res, next) => {
  const accessToken = jwt.sign(
    { sub: "access", email: res.locals.email },
    jwtSecret,
    { expiresIn: "5m" }
  );
  if (!users[res.locals.email]) {
    return res.status(404).json({ message: "가입되지 않은 회원입니다." });
  }
  res.json({
    data: {
      accessToken,
      email: res.locals.email,
      name: users[res.locals.email].name,
    },
  });
});

app.post("/user", (req, res, next) => {
  if (users[req.body.email]) {
    return res.status(401).json({ message: "이미 가입한 회원입니다." });
  }
  users[req.body.email] = {
    email: req.body.email.toLowerCase(),
    password: req.body.password,
    name: req.body.name,
  };

  return res.json({
    data: {
      email: req.body.email,
      name: req.body.name,
    },
  });
});

app.post("/login", (req, res, next) => {
  if (!users[req.body.email]) {
    return res.status(401).json({ message: "가입하지 않은 회원입니다." });
  }
  if (req.body.password !== users[req.body.email].password) {
    return res.status(401).json({ message: "잘못된 비밀번호입니다." });
  }
  const refreshToken = jwt.sign(
    { sub: "refresh", email: req.body.email },
    jwtSecret,
    { expiresIn: "24h" }
  );
  const accessToken = jwt.sign(
    { sub: "access", email: req.body.email },
    jwtSecret,
    { expiresIn: "5m" }
  );
  users[req.body.email].refreshToken = refreshToken;
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  return res.json({
    data: {
      name: users[req.body.email].name,
      email: req.body.email,
      accessToken,
    },
  });
});

app.post("/logout", verifyToken, (req, res, next) => {
  delete users[res.locals.email];
  res.clearCookie("refreshToken");
  res.json({ message: "ok" });
});

app.get("/showmethemoney", verifyToken, (req, res, next) => {
  console.log(orders);
  res.json({
    data: orders
      .filter((v) => v.rider === res.locals.email && v.completedAt)
      .map((v) => v.price)
      .reduce((a, c) => a + c, 0),
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

app.listen(3105, () => {
  console.log("연결되었습니다.");
});
