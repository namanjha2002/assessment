require('dotenv').config({ path: '../.env' });
const express = require('express')
const {sendOTP,verifyOTP,userDetail} = require('../controller/agent.controller')
const verifyToken = require('../middleware/auth')
console.log(verifyToken)
const router = express.Router()
router.post('/send-otp',sendOTP)
router.post('/verify-otp',verifyOTP)
router.get('/get-user-detail',verifyToken,userDetail)

module.exports = router;