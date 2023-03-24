require("dotenv").config();
let express = require("express");
let app = express();
const environment = require("./config/environment");
let cors = require("cors");
let path = require("path");
let bodyParser = require("body-parser");
const { expressjwt: expressjwt } = require("express-jwt");
// Import Mongoose
let mongoose = require("mongoose");
const { createProxyMiddleware, responseInterceptor, fixRequestBody  } = require('http-proxy-middleware');


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

// use JWT auth to secure the api, the token can be passed in the authorization header or querystring
app.use(
  expressjwt({
    secret: environment.secret,
    algorithms: ["HS256"],
    onExpired: async (req, err) => {
      if (new Date() - err.inner.expiredAt < 5000) { return;}
      throw err;
    },
    getToken: function (req) {
      if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
      ) {
        return req.headers.authorization.split(" ")[1];
      } else if (req.query && req.query.token) {
        return req.query.token;
      }
      return null;
    }
  }).unless({
    path: [
      "/api/users/authenticate",
      "/api/users",
      "/api/supliers",
      "/index.html",
      "/*.js",
      "/*.css"
    ]
  })
);

app.use(function(err, req, res, next) {
  if(err.name === 'UnauthorizedError') {
    res.status(err.status).send({status: "error", message:err.message});
    return;
  }
next();
});


// proxy middleware options
/** @type {import('http-proxy-middleware/dist/types').Options} */
const options = {
  target: 'http://suplier:3002', // target host
  changeOrigin: true, // needed for virtual hosted sites
  ws: true, // proxy websockets,
  onProxyReq: fixRequestBody
  
};
app.use('/api/supliers', createProxyMiddleware(options));



const HOST = "0.0.0.0";
const port = Number(process.env.EXPRESS_PORT) || 3000;

// start server
// Launch app to listen to specified port
app.listen(port, () => {
  console.log(`Running  on http://${HOST}:${port}`);
});
