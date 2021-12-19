const jwt = require("jsonwebtoken");
const JWT_Secret = process.env.JWT_Secret;

const getUser = (req, res, next) => {
  try {
    const token = req.header("auth-token");

    if (!token) {
      return res.status(401).json({ errors: "Login First" });
    }

    const data = jwt.verify(token, JWT_Secret);
    // console.log("data ", data);
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).json({ errors: "Login First" });
  }
};

module.exports = getUser;
