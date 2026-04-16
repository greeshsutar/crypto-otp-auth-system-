const { createlogin,  reallogin, getProfile, verifyotp } = require("../controller/login.controller");

const authMiddleware = require("../auth/auth");
function Routing(app){

    app.post("/user/signup",createlogin);
    app.post("/user/login",reallogin);

    // app.patch("/user/login/:id",updatelogin);

      app.get("/user/profile", authMiddleware,getProfile );
      app.post("/user/otp-verify",verifyotp)

}

module.exports = Routing;