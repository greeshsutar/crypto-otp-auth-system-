const loginModel = require("../model/loginmodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/email");
const client = require("../utils/sms");

// 🔥 Generate OTP
function generateotp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ================== SIGNUP ==================
async function createlogin(req, res) {
    try {
        let { name, lastname, gmail, mobileno, password, method } = req.body;

        if (!name || !password || !method) {
            return res.status(400).send({ message: "Required fields missing" });
        }

        // 🔥 check existing user safely
        let query = [];
        if (gmail) query.push({ gmail });
        if (mobileno) query.push({ mobileno });

        let existingUser = await loginModel.findOne({ $or: query });

        if (existingUser) {
            return res.status(400).send({ message: "User already exists" });
        }

        // 🔐 hash password
        let hashedpassword = await bcrypt.hash(password, 10);

        // 🔢 generate OTP
        let otp = generateotp();

        // 🔥 prepare user data cleanly
        let userData = {
            name,
            lastname,
            password: hashedpassword,
            otp,
            otpExpires: Date.now() + 5 * 60 * 1000,
            isVerified: false
        };

        if (method === "email") {
            if (!gmail) {
                return res.status(400).send({ message: "Email required" });
            }
            userData.gmail = gmail;
        } else {
            if (!mobileno) {
                return res.status(400).send({ message: "Mobile required" });
            }
            userData.mobileno = mobileno;
        }

        let user = await loginModel.create(userData);

        // 🔥 format phone safely
        let formattedNumber = mobileno
            ? mobileno.startsWith("+91")
                ? mobileno
                : `+91${mobileno}`
            : null;

        // 🔥 send OTP (safe)
        try {
            if (method === "phone") {
                console.log("PHONE OTP:", otp);

                // await client.messages.create({
                //     body: `Your OTP is ${otp}`,
                //     from: process.env.TWILIO_PHONE,
                //     to: formattedNumber
                // });

            } else {
                console.log("EMAIL OTP:", otp);

                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: gmail,
                    subject: "OTP Verification",
                    text: `Your OTP is ${otp}`
                });
            }
        } catch (err) {
            console.log("OTP sending failed:", err.message);
        }

        res.status(201).send({
            message: `User created. OTP sent via ${method}`
        });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error" });
    }
}


// ================== VERIFY OTP ==================
async function verifyotp(req, res) {
    try {
        let { gmail, mobileno, otp } = req.body;

        if (!otp) {
            return res.status(400).send({ message: "OTP required" });
        }

        let user;

        if (gmail) {
            user = await loginModel.findOne({ gmail });
        } else if (mobileno) {
            user = await loginModel.findOne({ mobileno });
        } else {
            return res.status(400).send({ message: "Email or mobile required" });
        }

        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        if (user.otp !== otp) {
            return res.status(400).send({ message: "Invalid OTP" });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).send({ message: "OTP expired" });
        }

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


// ================== LOGIN ==================
async function reallogin(req, res) {
    try {
        let { gmail, mobileno, password } = req.body;

        if (!password) {
            return res.status(400).send({ message: "Password required" });
        }

        let query = {};
        if (gmail) query.gmail = gmail;
        if (mobileno) query.mobileno = mobileno;

        let user = await loginModel.findOne(query);

        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        if (!user.isVerified) {
            return res.status(400).send({ message: "Please verify OTP first" });
        }

        let isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send({ message: "Invalid password" });
        }

        let token = jwt.sign(
            { id: user._id },
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


// ================== PROFILE ==================
async function getProfile(req, res) {
    try {
        const userId = req.user.id;

        const user = await loginModel
            .findById(userId)
            .select("-password");

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