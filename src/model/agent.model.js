const mongoose = require("mongoose");

// Create User schema
let userSchema = new mongoose.Schema(
  {
    name: { type: String },
    // phone: { type: String, required: true },
    email: { type: String },
    phoneNo : { type: String, required: true},
    isOnline : {type : Boolean,default : false},
    
    
    

  },
  { timestamps: true }
);
module.exports = mongoose.model("Agent", userSchema);
