var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).send("Welcome to User Management!");
});

/* User router */
const userAPI = require("./user.api.js");
router.use("/users", userAPI);

/* Task router */
const taskAPI = require("./task.api.js");
router.use("/tasks", taskAPI);

module.exports = router;
