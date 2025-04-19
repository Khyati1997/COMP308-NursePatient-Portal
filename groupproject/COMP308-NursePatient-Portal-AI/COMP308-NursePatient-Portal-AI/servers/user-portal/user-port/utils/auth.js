const jwt = require("jsonwebtoken");
require("dotenv").config(); // ensure .env is loaded

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { verifyToken };