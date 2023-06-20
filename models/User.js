const mongoose = require("mongoose");
//Create schema
const UserSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["Employee", "Manager"],
      default: "Employee",
      required: true,
    },
    isDeleted: { type: Boolean, default: false, required: true },
    tasksList: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Task" }],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre(/^find/, function (next) {
  if (!("_conditions" in this)) return next();
  if (!("isDeleted" in UserSchema.paths)) {
    delete this["_conditions"]["all"];
    return next();
  }
  if (!("all" in this["_conditions"])) {
    //@ts-ignore
    this["_conditions"].isDeleted = false;
  } else {
    delete this["_conditions"]["all"];
  }
  next();
});

//Create and export model
const User = mongoose.model("User", UserSchema);

module.exports = User;
