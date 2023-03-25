// Filename: api-routes.js
// Initialize express router
let router = require("express").Router();
const { body, validationResult } = require('express-validator');

// Set default API response
router.get("/", function(req, res) {
  res.json({
    status: "TradeZod APIs",
    message: "Welcome to TradeZod"
  });
});

// Import user controller
var userController = require("./controllers/users.controller");


const firstNameValidationRule = body("firstName")
  .notEmpty()
  .withMessage("First name is required")
  .isLength({ min: 2 })
  .withMessage("First name must be at least 2 characters long");

const lastNameValidationRule = body("lastName")
  .notEmpty()
  .withMessage("Last name is required")
  .isLength({ min: 2 })
  .withMessage("Last name must be at least 2 characters long");

const statusValidationRule = body("status")
  .optional()
  .isIn(["ACTIVE", "INACTIVE"])
  .withMessage("Invalid status");
// Define validation rules for the user registration endpoint
const userRegistrationValidationRules = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("mobile")
    .notEmpty()
    .withMessage("Mobile number is required")
    .isMobilePhone("en-IN")
    .withMessage("Invalid mobile number"),
    firstNameValidationRule,
    lastNameValidationRule,
    statusValidationRule
];

router
  .route("/users")
  // Apply the validation rules to the user registration endpoint
  .post(userRegistrationValidationRules, (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there are validation errors, return a 400 response with the errors array
      return res.status(200).json({status:"error", type: "VALIDATION_FAILED",  message:errors.array(),  errors: errors.array() });
    }

    // If there are no errors, call the userController.new function to process the registration request
    userController.new(req, res);
  });

router
  .route("/users/:user_id")
  .get(userController.view)
  .patch(userController.update)
  .put(userController.update)
  .delete(userController.delete);

router.route("/users/sendOtp").post(userController.sendOtp);
router.route("/users/authenticate").post(userController.authenticate);
router
  .route("/users/changepassword/:user_id")
  .put(userController.changePassword);

// Export API routes
module.exports = router;
