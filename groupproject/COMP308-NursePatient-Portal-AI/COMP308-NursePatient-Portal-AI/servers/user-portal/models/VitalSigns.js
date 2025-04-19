const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VitalSignsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bodyTemperature: {
    type: Number,
    required: true,
  },
  heartRate: {
    type: Number,
    required: true,
  },
  bloodPressure: {
    type: String,
    required: true,
  },
  respiratoryRate: {
    type: Number,
    required: true,
  },
  bodyWeight: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now, // retrieve this on the front end using
  },
});

module.exports = mongoose.model("VitalSigns", VitalSignsSchema);
