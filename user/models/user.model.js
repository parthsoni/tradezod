// user.model.js
var mongoose = require("mongoose");
// Setup schema
var userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  token: String,
  email: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum : [ 'BUYER', 'SUPLIER', 'FINANCE', 'INTERNAL'],
    default: 'INTERNAL'
  },
  roleType: {
    type: String,
    enum : [ 'ADMIN', 'USER'],
    default: 'USER'
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
var User = (module.exports = mongoose.model("users", userSchema));
module.exports.get = function (callback, limit) {
  User.find(callback).limit(limit);
};
