let jwt = require("jsonwebtoken");
 require("dotenv").config();
function authMiddlware(req,res,next){
    try{
    let sendingjwt = req.headers.authorization;

    if(!sendingjwt){
        return res.status(402).send({message:"user not found"})
    }

    let payload  =sendingjwt.split(" ")[1]
   
    let verifingtoken =  jwt.verify(payload,process.env.JWT_SECRET);

      req.user = verifingtoken;

      next();
}
catch(error){
     return res.status(401).send({ message: "Invalid token" });
}

}
module.exports = authMiddlware;