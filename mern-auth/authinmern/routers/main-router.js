const express =require('express');
const router=express.Router();
const {register,login, logout}=require('../components/authmain');
const {verify_otp_sent, verifyemail, resetpassword, verifyresetotp, authmiddleware, isauthenticated}=require('../components/authmain');

router.post('/register', register);
router.post('/login', login);
router.post('/logout',logout);
router.post('/verify-otp',authmiddleware, verify_otp_sent);
router.post('/verifyaccount',authmiddleware, verifyemail);
router.post('/resetpassword', resetpassword);
router.post('/reset-password', resetpassword);
router.post('/verify-reset-otp', verifyresetotp);
router.get('/isauthenticated',authmiddleware, isauthenticated);

module.exports = router;