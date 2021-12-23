const mongoose = require("mongoose");

const mongoURL =
  "mongodb+srv://shivam:shivam@appstorm.e4ife.mongodb.net/appStorm?retryWrites=true&w=majority";
// console.log(process.env.mongoURL);

const connectMongo = () => {
  mongoose.connect(mongoURL, () => {
    console.log("Conected to mongo");
  });
};

module.exports = connectMongo;
