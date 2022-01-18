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
  tweet: {
    type: String,
    required: true,
  },
  tweetType: {
    type: String,
    default: "public",
  },
  time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("elaichi", ElaichiSchema);
