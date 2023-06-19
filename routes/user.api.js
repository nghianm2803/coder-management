const express = require("express");
const {
  createUser,
  getUsers,
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
//router.get("/:userId", getUsers);

/**
 * @route POST api/users
 * @description Create a new user
 * @access private, manager
 * @requiredBody: name
 */
// router.post("/", createUser);

/**
 * @route PUT api/users
 * @description Update a user by id
 * @access private, manager
 * @requiredBody: name
 */
// router.put("/:userId", editUser);

/**
 * @route DELETE api/users
 * @description Delete a user by id
 * @access private, manager
 * @requiredBody: name
 */
// router.delete("/:userId", deleteUser);

module.exports = router;
