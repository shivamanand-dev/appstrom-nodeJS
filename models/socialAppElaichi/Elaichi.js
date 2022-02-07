const mongoose = require("mongoose");
const { Schema } = mongoose;

const ElaichiSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  username: {
    type: mongoose.Schema.Types.String,
    ref: "username",
  },
  name: {
    type: mongoose.Schema.Types.String,
    ref: "name",
  },
  elaichi: {
    type: String,
    required: true,
  },
  elaichiType: {
    type: String,
    default: "public",
  },
  time: {
    type: Date,
    default: Date.now,
  },
  like: {
    type: Number,
    default: 0,
  },
  likedBy: {
    type: Array,
    default: [],
  },
  comment: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("elaichi", ElaichiSchema);
