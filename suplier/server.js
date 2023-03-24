require("dotenv").config();
let express = require("express");
let app = express();
const environment = require("./config/environment");
let cors = require("cors");
let path = require("path");
let bodyParser = require("body-parser");
// Import Mongoose
let mongoose = require("mongoose");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to Mongoose and set connection variable
// MongoDB connection
console.log("connection string", environment.mongodb.uri);
console.log("secret", environment.secret);
mongoose.connect(environment.mongodb.uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
mongoose.Promise = global.Promise;

// On connection error
mongoose.connection.on("error", (error) => {
  console.log("Database error: ", error);
});

// On successful connection
mongoose.connection.on("connected", () => {
  console.log("Connected to database");
});

// addtional configuration when serving Angular SPA (static reource and Anugalr routing)
const allowedExt = [
  ".js",
  ".ico",
  ".css",
  ".png",
  ".jpg",
  ".woff2",
  ".woff",
  ".ttf",
  ".svg",
  ".webmanifest",
  ".html",
  ".txt"
];

// Import routes
let apiRoutes = require("./api-routes");
// Use Api routes in the App
app.use("/api", apiRoutes);


const HOST = "0.0.0.0";
const port = Number(process.env.EXPRESS_PORT) || 3000;

// start server
// Launch app to listen to specified port
app.listen(port, () => {
  console.log(`Running  on http://${HOST}:${port}`);
});
