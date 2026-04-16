const loginModel = require("../model/loginmodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/email");
function generateotp(){
    return Math.floor(100000 + Math.random()*900000);
}
// ✅ CREATE USER
async function createlogin(req, res) {
    try {
        let { name, lastname, gmail, mobileno, password } = req.body;

        // 🔥 check existing user
        let existingUser = await loginModel.findOne({ gmail });
        if (existingUser) {
            return res.status(400).send({ message: "User already exists" });
        }

        // hash password
        let hashedpassword = await bcrypt.hash(password, 10);
    let otp = generateotp();
        await loginModel.create({
            name,
            lastname,
            gmail,
            mobileno,
            password: hashedpassword,
            otp,   //stored otp in database for comparizen
            otpExpires: Date.now()+ 5*60 +1000
            
        });

           await transporter.sendMail({
             from: process.env.EMAIL_USER,
            to: gmail,
            subject: "OTP Verification",
            text: `Your OTP is ${otp}`
        })


        res.status(201).send({ message: "User created. OTP sent to email" });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error" });
    }
}
async function verifyotp(req,res){
    let {gmail,otp} =req.body;
     
  try{
    
    if(!otp || !gmail){
        res.status(400).send({message:"otp and email not entered"})
    }
    let user= loginModel.findOne({gmail});
    if(!user){
        res.status(400).send({message:"user enter invalid gmail"});
    }
       if(!otp ==user.otp){
         return res.status(400).send({ message: "Invalid OTP" });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).send({ message: "OTP expired" });
        }
       user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;

        await user.save();
     res.status(20).send({ message: "OTP verified successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error" });
    }



}


// ✅ LOGIN
async function reallogin(req, res) {
    try {
        let { gmail, password } = req.body;

        if (!gmail || !password) {
            return res.status(400).send({ message: "All fields required" });
        }

        let user = await loginModel.findOne({ gmail });
        console.log(user);
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        let isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ message: "Invalid password" });
        }

        // ✅ JWT TOKEN
        let token = jwt.sign(
            { id: user._id, gmail: user.gmail },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).send({
            message: "Login successful",
            token
        });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error" });
    }
}


// ✅ GET USERS (hide password)
async function getProfile(req, res) {

    try {
        const userId = req.user.id;

        const user = await loginModel
            .findById(userId)
            .select("-password");

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        res.status(200).send(user);

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error" });
    }
}


// ✅ UPDATE USER
// async function updatelogin(req, res) {
//     try {
//         let { id } = req.params;

//         // 🔥 hash password if updating
//         if (req.body.password) {
//             req.body.password = await bcrypt.hash(req.body.password, 10);
//         }

//         await loginModel.findByIdAndUpdate(id, req.body);

//         res.status(200).send({ message: "Updated successfully" });

//     } catch (err) {
//         console.error(err);
//         res.status(500).send({ message: "Error updating data" });
//     }
// }

module.exports = {
    createlogin,
    reallogin,
    getProfile,   // ✅ updated
    // updatelogin
    verifyotp
};