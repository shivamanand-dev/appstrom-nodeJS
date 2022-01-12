const mongoose = require("mongoose");
const { Schema } = mongoose;

const ActivitySchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  forDays: {
    type: Number,
    required: true,
  },
  days: {
    type: Array,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("activity", ActivitySchema);
