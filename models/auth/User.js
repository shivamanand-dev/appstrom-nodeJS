const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  promocode: {
    type: String,
    unique: true,
  },
  appliedPromocode: {
    type: String,
  },
  openningBalance: {
    type: Number,
    required: true,
  },
  followers: {
    type: Array,
    default: [],
  },
  following: {
    type: Array,
    default: [],
  },
  location: {
    type: String,
    default: "MilkyWay Galaxy",
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
  },
});

module.exports = mongoose.model("user", UserSchema);
