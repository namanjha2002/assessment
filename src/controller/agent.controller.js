require('dotenv').config({ path: '../.env' });


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.TWILIO_SERVICE_TOKEN;
const TwilioClient = require("twilio")(accountSid, authToken);
const secretKey = process.env.SECRET_KEY
const Agent = require('../model/agent.model')
const jwt = require('jsonwebtoken');


exports.sendOTP = async (req, res) => {
  try {
    const verification = await TwilioClient.verify.v2
      .services(serviceId)
      .verifications.create({ to: req.body.mobile, channel: "sms" });
    console.log(verification.status);
    return res.status(200).json({ 
        success : true,
        message : "otp send successfully",

    })
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: e.message,
    });
  }
};

exports.verifyOTP = async (req, res) => {
    try {
      const verification = await TwilioClient.verify.v2
        .services(serviceId)
        .verificationChecks.create({ to: req.body.mobile, code: req.body.code });
        
      console.log(verification.status);
      
      if (verification.status === "approved") {
        
        let existingUser = await Agent.findOne({ phoneNo: req.body.mobile });
  
        if (!existingUser) {
          
          let newAgent = new Agent({
            
            phoneNo: req.body.mobile 
          });
  
          await newAgent.save();
          existingUser = newAgent; 
        }
  
        // Generate JWT token
        const token = jwt.sign({ userId: existingUser._id }, secretKey, { expiresIn: '30d' });
        await Agent.updateOne({ _id: existingUser._id }, { isOnline: true });
  
        return res.status(200).json({
          success: true,
          message: "Verified successfully",
          token: token
        });
      }
      else {
        return res.status(400).json({
          success: false,
          message: "Verification failed. Invalid OTP."
        });
      }
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: e.message,
      });
    }
  };

  exports.userDetail = async(req,res)=>{
    try{
        let userDetails = await User.findOne({_id:req.decoded.userId})
        return res.status(200).json({
            success :true ,
            message : "user details successfully fetched",
            data : userDetails
        })

    }
    catch (e) {
        return res.status(500).json({
          success: false,
          message: "Server error",
          error: e.message,
        });
      }
  }