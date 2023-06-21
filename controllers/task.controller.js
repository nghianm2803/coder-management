const { sendResponse, AppError } = require("../helpers/utils.js");
const Task = require("../models/Task");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const taskController = {};

// Get a list of tasks
taskController.getTasks = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  // Filter search by name or status or both
  const filter = {};

  // Filter search by status sort by createdAt : updatedAt and order by asc : desc
  const status = req.query.status;
  if (
    status &&
    ["Pending", "Working", "Review", "Done", "Archive"].includes(status)
  ) {
    filter.status = status;
  }

  // Filter search by name sort by createdAt : updatedAt and order by asc : desc
  const name = req.query.name;
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }

  const sortBy = req.query.sortBy === "updatedAt" ? "updatedAt" : "createdAt";
  const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder;

  try {
    let taskList = await Task.find(filter || {})
      .sort(sortOptions)
      .skip(offset)
      .limit(limit)
      .populate("assignTo");

    // Extract the task names from the populated assignTo field
    taskList = taskList.map((task) => {
      const assignedTo = task.assignTo;
      return {
        ...task.toJSON(),
        assignTo: assignedTo ? assignedTo.name : "",
      };
    });

    sendResponse(res, 200, true, taskList, null, "Get Task List Successfully!");
  } catch (err) {
    next(err);
  }
};

// Get a task by id
taskController.getTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const detailTask = await Task.findOne({ _id: taskId }).populate("assignTo");

    // Extract the username from the populated assignTo field
    const assignedTo = detailTask.assignTo;
    const modifiedTask = {
      ...detailTask.toJSON(),
      assignTo: assignedTo ? assignedTo.name : "",
    };

    sendResponse(
      res,
      200,
      true,
      modifiedTask,
      null,
      "Get Task Info Successfully!"
    );
  } catch (err) {
    next(err);
  }
};

// Add a new task
taskController.createTask = async (req, res, next) => {
  try {
    await Promise.all([
      body("name")
        .notEmpty()
        .withMessage("Task name is empty")
        .custom(async (value) => {
          const existingTask = await Task.findOne({ name: value });
          if (existingTask) {
            throw new Error("Task name already exists");
          }
        })
        .run(req),
      body("description")
        .notEmpty()
        .withMessage("Description is empty")
        .run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      throw new AppError(400, "Bad Request", errorMessages.join(", "));
    }

    const taskData = req.body;

    if (!taskData) throw new AppError(402, "Bad Request", "Create Task Error");
    const createdTask = await Task.create(taskData);
    // console.log(taskData);
    sendResponse(res, 200, true, createdTask, null, "Create Task Success");
  } catch (err) {
    next(err);
  }
};

// Assign task to user
taskController.assignTask = async (req, res, next) => {
  const taskId = req.params.id;
  const { userId } = req.body;

  try {
    // Find the task by taskId
    const task = await Task.findById(taskId);
    if (!task) {
      throw new AppError(404, "Not Found", "Task not found");
    }

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, "Not Found", "User not found");
    }

    // Assign or unassign the task
    if (task.assignTo && task.assignTo.equals(userId)) {
      // Unassign the task
      task.assignTo = null;
      const updatedTask = await task.save();

      // Remove the task ID from the user's tasksList
      const taskIndex = user.tasksList.indexOf(updatedTask._id.toString());
      if (taskIndex !== -1) {
        user.tasksList.splice(taskIndex, 1);
      }
      await user.save();

      sendResponse(res, 200, true, null, "Task unassigned successfully");
    } else {
      // Assign the task
      task.assignTo = userId;
      const updatedTask = await task.save();
      user.tasksList.push(updatedTask._id.toString());
      await user.save();

      sendResponse(res, 200, true, null, "Task assigned successfully");
    }
  } catch (err) {
    next(err);
  }
};

// Update a task by id
taskController.editTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const updateTask = req.body;

    await Promise.all([
      body("status")
        .notEmpty()
        .withMessage("Status is empty")
        .isIn(["Pending", "Working", "Review", "Done", "Archive"])
        .withMessage("Status must be Pending, Working, Review, Done or Archive")
        .run(req),
      body("name")
        .optional()
        .custom(async (value) => {
          if (value) {
            const existingTask = await Task.findOne({ name: value });
            if (existingTask) {
              throw new Error("Task name already exists");
            }
          }
        })
        .run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      throw new AppError(400, "Bad Request", errorMessages.join(", "));
    }

    // Retrieve the existing task
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      throw new AppError(404, "Not Found", "Task not found");
    }

    // Check if the status change is valid
    if (existingTask.status === "Done" && updateTask.status !== "Archive") {
      throw new AppError(
        400,
        "Bad Request",
        "Invalid status change. The 'Done' status cannot be changed except to 'Archive'."
      );
    }

    if (existingTask.status === "Archive" && updateTask.status !== "Archive") {
      throw new AppError(
        400,
        "Bad Request",
        "Invalid status change. The 'Archive' status cannot be changed."
      );
    }

    // Options modify query return data after update
    const options = { new: true };
    const updated = await Task.findByIdAndUpdate(taskId, updateTask, options);
    sendResponse(res, 200, true, updated, null, "Update task success");
  } catch (err) {
    next(err);
  }
};

// Delete a task by id
taskController.deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    const softDeleteTask = await Task.findByIdAndUpdate(
      taskId,
      { isDeleted: true },
      { new: true }
    );

    if (!softDeleteTask) {
      throw new AppError(404, "Not Found", "Task not found");
    }

    sendResponse(
      res,
      200,
      true,
      softDeleteTask,
      null,
      "Soft delete task success"
    );
  } catch (err) {
    next(err);
  }
};

module.exports = taskController;
