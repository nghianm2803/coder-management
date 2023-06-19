const mongoose = require("mongoose");
//Create schema
const UserSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, require: true },
  },
  {
    timestamps: true,
  }
);

//Create and export model
const User = mongoose.model("User", UserSchema);
module.exports = User;
