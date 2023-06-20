const express = require("express");
const {
  createTask,
  getTasks,
  getTask,
  editTask,
  deleteTask,
  assignTask,
} = require("../controllers/task.controller");
const router = express.Router();

/**
 * @route GET api/tasks
 * @description Get a list of tasks
 * @access private
 * @allowedQueries: name
 */
router.get("/", getTasks);

/**
 * @route GET api/tasks/:id
 * @description Get task by id
 * @access public
 */
router.get("/:id", getTask);

/**
 * @route POST api/tasks
 * @description Create a new task
 * @access private, manager
 * @requiredBody: name
 */
router.post("/", createTask);

/**
 * @route PUT api/tasks
 * @description Update a task by id
 * @access public
 * @requiredBody: name
 */
router.put("/:id", editTask);

/**
 * @route DELETE api/tasks
 * @description Delete a task by id
 * @access private, manager
 */
router.delete("/:id", deleteTask);

/**
 * @route PUT api/tasks/:id/assign
 * @description Assign or unassign a task to a user
 * @access public
 * @requiredBody: userId
 */
router.put("/:id/assign", assignTask);

module.exports = router;
