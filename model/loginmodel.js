let mongoose =require("mongoose");

mongoose.set("strictQuery", true);

let loginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  lastname: String,

  gmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/
  },

  mobileno: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/
  },

  password: {
    type: String,
    required: true,
    minlength: 8,
    match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
  },

  // 🔥 FIXED STRUCTURE
  otp: String,
  otpExpires: Date,

  isVerified: {
    type: Boolean,
    default: false
  }
});

let loginModel =mongoose.model("loginModel",loginSchema); // create collection for login with ame as loginModel

module.exports =loginModel;

