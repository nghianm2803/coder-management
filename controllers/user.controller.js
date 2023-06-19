const { sendResponse, AppError } = require("../helpers/utils.js");
const User = require("../models/User");
const userController = {};

userController.getUsers = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
  
    const offset = (page - 1) * limit;
  
    const filter = {};
  
    try {
      
    await User.updateMany({}, { $set: { isDeleted: false } });

    console.log('Field isDeleted updated successfully.');

      const listOfFound = await User.find(filter)
        .skip(offset)
        .limit(limit);
  
      sendResponse(
        res,
        200,
        true,
        listOfFound,
        null,
        "Get User List Successfully!",
      );
    } catch (err) {
      next(err);
    }
  };

module.exports = userController;
