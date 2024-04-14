const asyncHandler = require("express-async-handler");
const { constants } = require("../constants");
const errorHandler = require("./errorHandler");

/** ADMIN **/
const checkAdmin = asyncHandler(async (req, res, next) => {
  try {
    const userRole = req.user.user.role;
    if (userRole.includes("admin")) {
      next();
    } else {
      res.status(403);
      throw new Error("Access denied. You are not authorized to access this page!");
    }
  } catch (error) {
    next(error);
  }
});

/** USER **/
const checkUser = asyncHandler(async (req, res, next) => {
  try {
    const userRole = req.user.user.role;
    if (!userRole.includes("admin")) {
      next();
    } else {
      res.status(403);
      throw new Error("Access denied. You are not authorized to access this page!");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = { checkAdmin, checkUser };
