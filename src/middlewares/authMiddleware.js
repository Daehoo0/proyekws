const jwt = require("jsonwebtoken");

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
