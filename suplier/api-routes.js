// Filename: api-routes.js
// Initialize express router
let router = require("express").Router();
// Set default API response
router.get("/", function(req, res) {
  res.json({
    status: "Tradezod Suplier",
    message: "Welcome to Tradezod Suplier"
  });

  
});

// Import suplier controller
var suplierController = require("./controllers/supliers.controller");
// suplier routes
router
  .route("/supliers")
  .get(suplierController.index)
  .post(suplierController.new);
router
  .route("/suplier/:suplier_id")
  .get(suplierController.view)
  .patch(suplierController.update)
  .put(suplierController.update)
  .delete(suplierController.delete);



// Export API routes
module.exports = router;
