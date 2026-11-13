const mongo = require("mongoose");
const Schema = mongo.Schema;

const Log = new Schema(
  {
    user: String,
    action: String,
    service: String,
    method: String,
    route: String,
    statusCode: Number,
  },
  { timestamps: true }
);

module.exports = mongo.model("log", Log);