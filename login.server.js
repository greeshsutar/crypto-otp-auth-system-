let express = require("express");
let MongoConnect = require("./configure/login.configuare");
const cors = require("cors");
let Routing = require("./router/login.route");
require("dotenv").config();

const path = require("path");

let app = express();

// middleware
app.use(cors());
app.use(express.json());

// serve frontend
app.use(express.static(path.join(__dirname, "view")));

// routes
Routing(app);

// root route
app.get("/", (req, res) => {
   res.send("Hello How are You");
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Something went wrong" });
});

// start server
const PORT = process.env.PORT || 3080;
MongoConnect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});