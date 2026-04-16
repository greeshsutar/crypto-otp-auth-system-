const loginModel = require("../model/loginmodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/email");

// 🔥 Generate OTP
function generateotp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ CREATE USER + SEND OTP
async function createlogin(req, res) {
    try {
        let { name, lastname, gmail, mobileno, password } = req.body;

        // check existing user
        let existingUser = await loginModel.findOne({ gmail });
        if (existingUser) {
            return res.status(400).send({ message: "User already exists" });
        }

        // hash password
        let hashedpassword = await bcrypt.hash(password, 10);

        // generate OTP
        let otp = generateotp();

        // create user
        let user = await loginModel.create({
            name,
            lastname,
            gmail,
            mobileno,
            password: hashedpassword,
            otp,
            otpExpires: Date.now() + 5 * 60 * 1000,
            isVerified: false
        });

        // send email
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: gmail,
                subject: "OTP Verification",
                text: `Your OTP is ${otp}`
            });
        } catch (err) {
            console.log("Email sending failed:", err.message);
        }

        res.status(201).send({ message: "User created. OTP sent to email" });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error" });
    }
}


// ✅ VERIFY OTP
async function verifyotp(req, res) {
    try {
        let { gmail, otp } = req.body;

        if (!otp || !gmail) {
            return res.status(400).send({ message: "OTP and email required" });
        }

        let user = await loginModel.findOne({ gmail });

        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        if (user.otp !== otp) {
            return res.status(400).send({ message: "Invalid OTP" });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).send({ message: "OTP expired" });
        }

        // mark verified
        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;

        await user.save();

        res.status(200).send({ message: "OTP verified successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error" });
    }
}


// ✅ LOGIN (ONLY VERIFIED USERS)
async function reallogin(req, res) {
    try {
        let { gmail, password } = req.body;

        if (!gmail || !password) {
            return res.status(400).send({ message: "All fields required" });
        }

        let user = await loginModel.findOne({ gmail });

        // 🔥 FIRST check user exists
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        // 🔥 THEN check OTP verified
        if (!user.isVerified) {
            return res.status(400).send({ message: "Please verify OTP first" });
        }

        let isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send({ message: "Invalid password" });
        }

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


// ✅ PROFILE
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


module.exports = {
    createlogin,
    verifyotp,
    reallogin,
    getProfile
};