const express = require("express");
const {
  createUser,
  getUsers,
  getUser,
  editUser,
  deleteUser,
} = require("../controllers/user.controller");
const router = express.Router();

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
router.get("/:id", getUser);

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
router.put("/:id", editUser);

/**
 * @route DELETE api/users/:id
 * @description Delete a user by id
 * @access private, manager
 * @requiredBody: name
 */
router.delete("/:id", deleteUser);

module.exports = router;
