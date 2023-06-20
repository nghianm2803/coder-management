const { sendResponse, AppError } = require("../helpers/utils.js");
const Task = require("../models/Task");
const User = require("../models/User");
const taskController = {};

// Get a list of tasks
taskController.getTasks = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const filter = {};

  try {
    let taskList = await Task.find(filter)
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
    // Validate input
    const taskData = req.body;

    // Validate required fields
    const requiredFields = {
      name: "Task name is empty",
      description: "Description is empty",
    };

    const missingFields = [];
    for (const [field, errorMessage] of Object.entries(requiredFields)) {
      if (!taskData[field]) {
        missingFields.push(errorMessage);
      }
    }

    if (missingFields.length > 0) {
      throw new AppError(400, "Bad Request", missingFields.join(", "));
    }

    if (!taskData) throw new AppError(402, "Bad Request", "Create Task Error");
    const createdTask = await Task.create(taskData);
    console.log(taskData);
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

    // Validate required fields
    const requiredFields = {
      name: "Task name is empty",
      description: "Description is empty",
    };

    const missingFields = [];
    for (const [field, errorMessage] of Object.entries(requiredFields)) {
      if (!updateTask[field]) {
        missingFields.push(errorMessage);
      }
    }

    if (missingFields.length > 0) {
      throw new AppError(400, "Bad Request", missingFields.join(", "));
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

    //options modify query return data after undate
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
