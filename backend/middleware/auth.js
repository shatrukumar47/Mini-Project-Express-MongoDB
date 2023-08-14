const jwt = require("jsonwebtoken");
const { BlacklistModel } = require("../model/blacklistModel");

const auth = async (req, res, next) => {
  const tokens = req.cookies.token;
  try {
    const blockedAccessToken = await BlacklistModel.findOne({token: tokens?.accessToken})
    if(blockedAccessToken){
      res.status(200).send({"message": "Please Login Again !!"})
    }else{
      jwt.verify(tokens?.refreshToken, "shatru47", (err, decoded) => {
        if (err) {
          res.status(400).send({ "error": err });
        }
        if (decoded){
          next();
        }
      });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
}  

module.exports = {
  auth,
};
