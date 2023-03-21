// Filename: api-routes.js
// Initialize express router
let router = require("express").Router();
// Set default API response
router.get("/", function(req, res) {
  res.json({
    status: "TradeZod APIs",
    message: "Welcome to TradeZod"
  });
});

// Import user controller
var userController = require("./controllers/users.controller");
// user routes
router
  .route("/users")
  .get(userController.index)
  .post(userController.new);
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
