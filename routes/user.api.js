const express = require("express");
const {
  createUser,
  getUsers,
  getUser,
  editUser,
  deleteUser,
} = require("../controllers/user.controller");
const mongoose = require("mongoose");
const router = express.Router();

// Middleware to validate ID
const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID type" });
  }
  next();
};

/**
 * @route GET api/users
 * @description Get a list of users
 * @access private
 * @allowedQueries: name
 */
router.get("/", getUsers);

/**
 * @route GET api/users/:id
 * @description Get user by id
 * @access public
 */
router.get("/:id", validateId, getUser);

/**
 * @route POST api/users
 * @description Create a new user
 * @access private, manager
 * @requiredBody: name
 */
router.post("/", createUser);

/**
 * @route PUT api/users/:id
 * @description Update a user by id
 * @access private, manager
 * @requiredBody: name
 */
router.put("/:id", validateId, editUser);

/**
 * @route DELETE api/users/:id
 * @description Delete a user by id
 * @access private, manager
 */
router.delete("/:id", validateId, deleteUser);

module.exports = router;
