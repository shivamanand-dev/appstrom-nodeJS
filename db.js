const mongoose = require("mongoose");

const mongoURL =
  "mongodb://localhost:27017/appstrom?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";
// console.log(process.env.mongoURL);

const connectMongo = () => {
  mongoose.connect(mongoURL, () => {
    console.log("Conected to mongo");
  });
};

module.exports = connectMongo;
