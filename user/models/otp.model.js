// otp.model.js
var mongoose = require("mongoose");
// Setup schema
var otpSchema = mongoose.Schema({
  otp_value: {
    type: String,
    required: true
  },
  otp_type: {
    type: String,
    enum : [ 'EMAIL', 'MOBILE', 'BOTH'],
    default: 'MOBILE'
  },
  type_value: {
    type: String,
    required: true
  },
  operation_type: {
    type: String,
    enum : [ 'LOGIN', 'SIGNUP', 'EMAIL_VERIFICATION', "MOBILE_VERIFICATION", "RESET_PASSWORD"],
    default: 'LOGIN'
  },
  create_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum : [ 'ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
});
// Export User model
var Otp = (module.exports = mongoose.model("otps", otpSchema));
module.exports.get = function (callback, limit) {
  Otp.find(callback).limit(limit);
};
