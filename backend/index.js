const express = require("express");
const { connection } = require("./connection");
const { userRouter } = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { BlacklistModel } = require("./model/blacklistModel");

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/users", userRouter);

//Home
app.get("/", (req, res)=>{
    res.status(200).send("Welcome to IMPLEMENTATION of JWT BLACKLISTING and REFRESH TOKENS in EXPRESS APP");
})

//Refersh Token Generation
app.get("/refreshtoken", async (req, res) => {
    let tokens = req.cookies.token;
    const {refreshToken} = tokens;
    try {
      let checkBlacklist = await BlacklistModel.findOne({
        token: refreshToken,
      });
      if (checkBlacklist) {
        res.status(200).send({ msg: "Please Login Again !!" });
      } else {
        jwt.verify(refreshToken, "shatru47", (err, decoded) => {
          if (err) res.status(400).send({ error: err });
          if (decoded) {
            let accessToken = jwt.sign({ sid: "raajz" }, "shatru47", {
              expiresIn: "1h",
            });
            tokens = { accessToken, refreshToken };
            res.cookie("token", tokens, {
                httpOnly: true,
            });
            res.status(200).send({ newToken: accessToken });
          }
        });
      }
    } catch (error) {
      res.status(400).send({ error: error });
    }
});

app.listen(8080, async()=>{
    try {
        await connection;
        console.log("Server is live at Port 8080");
        console.log("Connected to MongoDB")
    } catch (error) {
        console.log(error)
    }
})