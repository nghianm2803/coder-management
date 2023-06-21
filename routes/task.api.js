const express = require("express");
const {
  createTask,
  getTasks,
  getTask,
  editTask,
  deleteTask,
  assignTask,
} = require("../controllers/task.controller");
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
router.get("/:id", validateId, getTask);

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
router.put("/:id", validateId, editTask);

/**
 * @route DELETE api/tasks
 * @description Delete a task by id
 * @access private, manager
 */
router.delete("/:id", validateId, deleteTask);

/**
 * @route PUT api/tasks/:id/assign
 * @description Assign or unassign a task to a user
 * @access public
 * @requiredBody: userId
 */
router.put("/:id/assign", validateId, assignTask);

module.exports = router;
