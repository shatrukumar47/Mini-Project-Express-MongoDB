const express = require("express");
const { UserModel } = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { auth } = require("../middleware/auth");
const { BlacklistModel } = require("../model/blacklistModel");

const userRouter = express.Router();

//Registration or SignUp
userRouter.post("/register", async (req, res) => {
  const { username, email, password, DOB, role, location, confirm_password } =
    req.body;
  re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  let temp = re.test(password);
  if (temp) {
    try {
      let checkingUser = await UserModel.findOne({ email: email });
      if (checkingUser) {
        res.status(200).send({ message: "User is already registered !!" });
      } else {
        bcrypt.hash(password, +process.env.saltRounds, (err, hash) => {
          if (err) {
            res.status(400).send({ error: err });
          }
          const newUser = new UserModel({
            username,
            email,
            password: hash,
            confirm_password: hash,
            DOB,
            role,
            location,
          });
          newUser.save();
          res.status(200).send({ message: "Registered Successfully" });
        });
      }
    } catch (error) {
      res.status(400).send({ error: error });
    }
  } else {
    res.status(200).send({
      message:
        "Password should contain 1 UpperCase, 1 Lowercase, 1 Number and 1 Special Character !!",
    });
  }
});

//Login or Authentication
userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      bcrypt.compare(password, user?.password, (err, result) => {
        if (!result) {
          res.status(200).send({ message: "Wrong Password !!" });
        } else {
          const accessToken = jwt.sign({ sid: "raajz" }, "shatru47", {
            expiresIn: "1h",
          });

          const refreshToken = jwt.sign({ sid: "kumar" }, "shatru47", {
            expiresIn: "7 days",
          });

          let tokens = { accessToken, refreshToken };

          res.cookie("token", tokens, {
            httpOnly: true,
          });

          res.status(200).send({
            message: "Logged-in successfully",
            userID: user?._id,
            username: user?.username,
            token: accessToken,
            reToken: refreshToken,
          });
        }
      });
    } else {
      res.status(200).send({ message: "User Not Found !!" });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
});

//Logout
userRouter.get("/logout", async (req, res) => {
  const tokens = req.cookies.token;
  try {
    let newBlacklistToken = new BlacklistModel({ token: tokens?.refreshToken });
    await newBlacklistToken.save();
    res.clearCookie("token");
    res.status(200).send({ message: "Logged out successfully" });
  } catch (error) {
    res.status(400).send({ error: error });
  }
});

// GET
userRouter.get("/", async(req, res)=>{
  try {
    let users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).send({ error: error });
  }
})

module.exports = {
  userRouter,
};
