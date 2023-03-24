// suplier.model.js
var mongoose = require("mongoose");
// Setup schema
var suplierSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: String,
  mobile: String,
  userId: {
    type: String,
    required: true
  },
  create_date: {
    type: Date,
    default: Date.now
  }
});
// Export Suplier model
var Suplier = (module.exports = mongoose.model("suplier", suplierSchema));
module.exports.get = function (callback, limit) {
  Suplier.find(callback).limit(limit);
};
