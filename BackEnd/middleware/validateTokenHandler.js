const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
  let token;
  // Provjera Header-a bez obzira je li napisan malim ili velikim slovom
  // Moguce poslati u header-u i body-u
  let authHeader = req.headers.Authorization || req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        res.status(401);
        throw new Error("User is not authorized, token failed!");
      }

      req.user = decoded;
      next();
    });

    if (!token) {
      res.status(401);
      throw new Error("User is not authorized or token is missing!");
    }
  }
});

module.exports = validateToken;
