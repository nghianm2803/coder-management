const mongoose = require("mongoose");
//Create schema
const TaskSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Working", "Review", "Done", "Archive"],
      default: "Pending",
      required: true,
    },
    assignTo: { type: mongoose.SchemaTypes.ObjectId, ref: "User" }, //one to one optional
    isDeleted: { type: Boolean, default: false, required: true },
  },
  {
    timestamps: true,
  }
);

TaskSchema.pre(/^find/, function (next) {
  if (!("_conditions" in this)) return next();
  if (!("isDeleted" in TaskSchema.paths)) {
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
const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
