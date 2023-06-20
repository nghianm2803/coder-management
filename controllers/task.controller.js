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
    const listOfFound = await Task.find(filter)
      .skip(offset)
      .limit(limit)
      .populate("assignTo");

    sendResponse(
      res,
      200,
      true,
      listOfFound,
      null,
      "Get Task List Successfully!"
    );
  } catch (err) {
    next(err);
  }
};

// Get a task by id
taskController.getTask = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const detailTask = await Task.findOne({ _id: targetId }).populate(
      "assignTo"
    );

    sendResponse(
      res,
      200,
      true,
      detailTask,
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
  const targetId = req.params.id;
  const { userAssignedID } = req.body;

  try {
    // Find the task by targetId
    const task = await Task.findById(targetId);
    if (!task) {
      throw new AppError(404, "Not Found", "Task not found");
    }

    // Find the user by userAssignedID
    const user = await User.findById(userAssignedID);
    if (!user) {
      throw new AppError(404, "Not Found", "User not found");
    }
    // Update the assignTo field of the task
    task.assignTo = userAssignedID;
    const updatedTask = await task.save();
    // Add the task's ObjectId to the tasksList array of the user
    user.tasksList.push(updatedTask._id.toString()); // Convert ObjectId to string
    await user.save();

    sendResponse(
      res,
      200,
      true,
      { data: updatedTask },
      null,
      "Assigned to user"
    );
  } catch (err) {
    next(err);
  }
};

// Update a task by id
taskController.editTask = async (req, res, next) => {
  try {
    const targetId = req.params.id;
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
    const existingTask = await Task.findById(targetId);
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
    const updated = await Task.findByIdAndUpdate(targetId, updateTask, options);
    sendResponse(res, 200, true, updated, null, "Update task success");
  } catch (err) {
    next(err);
  }
};

// Delete a task by id
taskController.deleteTask = async (req, res, next) => {
  try {
    const targetId = req.params.id;

    const softDeleteTask = await Task.findByIdAndUpdate(
      targetId,
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
