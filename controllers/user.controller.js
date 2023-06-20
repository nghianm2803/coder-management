const { sendResponse, AppError } = require("../helpers/utils.js");
const User = require("../models/User");

const userController = {};

// Get a list of users
userController.getUsers = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const searchName = req.query.name;
  const filter = {};

  if (searchName) {
    filter.name = { $regex: searchName, $options: "i" };
  }

  try {
    let userList = await User.find(filter)
      .sort({ name: 1 })
      .skip(offset)
      .limit(limit)
      .populate("tasksList");

    // Extract the task names from the populated tasksList field
    userList = userList.map((user) => {
      const tasks = user.tasksList.map((task) => task.name);
      return { ...user.toJSON(), tasksList: tasks };
    });

    sendResponse(res, 200, true, userList, null, "Get User List Successfully!");
  } catch (err) {
    next(err);
  }
};

// Get a user by id
userController.getUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const detailUser = await User.findOne({ _id: userId }).populate(
      "tasksList"
    );

    // Extract the string representation of ObjectIds in tasksList
    const taskAssigned = detailUser.tasksList.map((task) => task.name);

    const modifiedUser = {
      ...detailUser.toJSON(),
      tasksList: taskAssigned,
    };

    sendResponse(
      res,
      200,
      true,
      modifiedUser,
      null,
      "Get User Info Successfully!"
    );
  } catch (err) {
    next(err);
  }
};

// Add a new user
userController.createUser = async (req, res, next) => {
  try {
    // Validate input
    const userData = req.body;

    // Validate required fields
    const requiredFields = {
      name: "Name is empty",
    };

    const missingFields = [];
    for (const [field, errorMessage] of Object.entries(requiredFields)) {
      if (!userData[field]) {
        missingFields.push(errorMessage);
      }
    }

    if (missingFields.length > 0) {
      throw new AppError(400, "Bad Request", missingFields.join(", "));
    }

    if (!userData) throw new AppError(402, "Bad Request", "Create User Error");
    const createdUser = await User.create(userData);
    sendResponse(res, 200, true, createdUser, null, "Create User Success");
  } catch (err) {
    next(err);
  }
};

// Update a user by id
userController.editUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updateUser = req.body;

    // Validate required fields
    const requiredFields = {
      name: "Name is empty",
    };

    const missingFields = [];
    for (const [field, errorMessage] of Object.entries(requiredFields)) {
      if (!updateUser[field]) {
        missingFields.push(errorMessage);
      }
    }

    if (missingFields.length > 0) {
      throw new AppError(400, "Bad Request", missingFields.join(", "));
    }

    //options allow you to modify query. e.g new true return lastest update of data
    const options = { new: true };
    //mongoose query
    const updated = await User.findByIdAndUpdate(userId, updateUser, options);
    sendResponse(res, 200, true, updated, null, "Update user success");
  } catch (err) {
    next(err);
  }
};

// Delete a user by id
userController.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const softDeleteUser = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true }
    );

    if (!softDeleteUser) {
      throw new AppError(404, "Not Found", "User not found");
    }

    sendResponse(
      res,
      200,
      true,
      softDeleteUser,
      null,
      "Soft delete user success"
    );
  } catch (err) {
    next(err);
  }
};

module.exports = userController;
