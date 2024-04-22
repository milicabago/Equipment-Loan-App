const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
  // Provjera Header-a bez obzira je li napisan malim ili velikim slovom
  // Moguce poslati u header-u i body-u
  let authHeader = req.headers.Authorization || req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    res.status(401);
    throw new Error("User is not authorized or token is missing!");
  }

  const token = authHeader.split(" ")[1];
  try {
    // Verifikacija tokena
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {

    if (error.name === 'TokenExpiredError') {
      console.log('WARNING: Token expired.');
    }

    res.status(401);
    throw new Error("User is not authorized, token failed!");
  }
});

module.exports = validateToken;
