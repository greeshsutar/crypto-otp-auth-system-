let express = require("express");
let MongoConnect =require("./configure/login.configuare");
const cors = require("cors");
let Routing = require("./router/login.route");
require("dotenv").config();
// instance entire application 
let app = express(); //create
let authMiddleware = require("./auth/auth");
const { getProfile } = require("./controller/login.controller");

app.use(express.json());
// middleware body parsing 
app.get("/user/profile", authMiddleware, getProfile);


//cors
app.use(cors());


//route
Routing(app);

// call function to connect Db
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Something went wrong" });
});

app.get("/",(req,res)=>{
   res.send("Hello How are You")
})
let PORT =process.env.PORT;
MongoConnect().then(() => {
  app.listen(3080, () => {
    console.log("Server running on port 3080");
  });
});
