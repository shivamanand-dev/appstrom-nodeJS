const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const mongoURL = process.env.DB_CONNECT_STRING;
// const mongoURL = "mongodb+srv://shivam:shivam@appstorm.e4ife.mongodb.net/";
// console.log(process.env.mongoURL);

const connectMongo = () => {
  mongoose.connect(mongoURL, () => {
    console.log("Conected to mongo");
  });
};

module.exports = connectMongo;
