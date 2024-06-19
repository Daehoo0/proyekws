const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.verifyToken = async (req, res, next) => {
  let token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  try {
    req.body.userdata = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).send({ message: "Invalid token" });
  }
  next();
};

exports.verifyAccess = async (req,res,next) =>{
  let token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  try {
    req.body.userdata = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { user_id: req.body.userdata.id } });
    const old_api_hit = user.api_hit
    const old_balance = user.balance
    if(user.api_hit < 5){
      let new_api_hit = parseInt(old_api_hit) + 1;
      await User.update(
        { api_hit: new_api_hit },
        { where: { user_id: req.body.userdata.id } }
      ); 
    }
    else{
      if(user.balance < 1000){
        return res.status(401).send({ message: "Reached API hit limit and no balance. Need recharge" });
      }
      else{
        let new_balance = parseInt(old_balance) - 1000
        await User.update(
          { balance: new_balance },
          { where: { user_id: req.body.userdata.id } }
        );
      }
    }
  } catch (error) {
    return res.status(401).send({ message: "Invalid token" });
  }
  next();
}
