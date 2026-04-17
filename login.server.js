let express = require("express");
let MongoConnect =require("./configure/login.configuare");
const cors = require("cors");
let Routing = require("./router/login.route");
require("dotenv").config();
// instance entire application 
let app = express(); //create
app.use(cors());
app.use(express.json());
let authMiddleware = require("./auth/auth");
const { getProfile } = require("./controller/login.controller");


// middleware body parsing 
app.get("/user/profile", authMiddleware, getProfile);


//cors



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
const PORT = process.env.PORT || 3080;
MongoConnect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
