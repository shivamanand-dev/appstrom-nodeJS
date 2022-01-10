const mongoose = require("mongoose");

const mongoURL =
  "mongodb://localhost:27017/appStrom?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";
// const mongoURL = "mongodb+srv://shivam:shivam@appstorm.e4ife.mongodb.net/";
// console.log(process.env.mongoURL);

const connectMongo = () => {
  mongoose.connect(mongoURL, () => {
    console.log("Conected to mongo");
  });
};

module.exports = connectMongo;
