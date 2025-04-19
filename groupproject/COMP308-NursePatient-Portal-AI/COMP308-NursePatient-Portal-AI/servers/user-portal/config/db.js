const mongoose = require("mongoose");
require("dotenv").config();

const mongoUri = "mongodb://localhost:27017/studentsandcourses-db";
mongoose.connect(mongoUri, {});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

module.exports = db;