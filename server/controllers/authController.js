import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import { response, text } from 'express';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';

export const register = async (req, res)=>{
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        return res.json({success: false, message: 'Missing Details'})

    }
    try {

        const existingUser = await userModel.findOne({email});

        if(existingUser){
            return res.json({success: false, message: 'User Already Exist'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({
            name,
            email,
            password: hashedPassword
        });
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge : 7*24*60*60*1000
        });


        //SENDING WELCOME EMAIL
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to App',
            text: `Welcome to the App. Your account has been created with email id: ${email}`

        }

        await transporter.sendMail(mailOptions);

        return res.json({success: true});
         
    } catch (error) {
        res.json({success: false, message: error.message})
        
    }
}

export const login = async (req, res)=>{
        const {email, password} = req.body;

          if (!email || !password) {
            return res.json({success: false, message: 'Email and password are required'});
          }


          try {
            const user = await userModel.findOne({email});

            if (!user){
                return res.json({success: false, message: 'Invalid Email'});
            }
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch){
                return res.json({success: false, message: 'Invalid Password'});
            }

            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge : 7*24*60*60*1000
        });

        return res.json({success: true});

            
          } catch (error) {
            return res.json({success: false, message: error.message});
            
          }
    
}

export const logout = async (req, res)=>{
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({success: true, message: 'Logged Out'});
        
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}


// Send verification OTP to the User's Email
export const sendVerifyOtp = async (req, res)=>{
    try {
        const {userId} = req.body;

        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({success: false, message: 'Account Already Verified'});
        }

        const otp = String(Math.floor(100000 +  Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpires = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
           //text: `Your OTP for Account Verification is ${otp}. Verify your account using this OTP`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }

        await transporter.sendMail(mailOptions);
        res.json({success: true, message: 'OTP Sent On Email'});

    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// Verify the Email Using OTP
export const verifyEmail = async (req, res)=>{
    const {userId, otp} = req.body;

    if (!userId || !otp){
        return res.json({success: false, message: 'Missing Details'});
    }
    try {
        
        const user = await userModel.findById(userId);

        if (!user){
            return res.json({success: false, message: 'User Not Found'});
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json({success: false, message: 'Invalid OTP'});
        }

        if (user.verifyOtpExpires < Date.now()){
            return res.json({success: false, message:'OTP Expired'});
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.json({success: true, message: 'Account Verified Successfully'});

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// Check if user is authenticated
export const isAuthenticated = async (req, res)=>{

    try {
        return res.json({success: true});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// Send Password reset otp
export const sendResetOtp = async (req, res)=>{
    const {email} = req.body;

    if (!email){
        return res.json({success: false, message: 'Email is required'});
    }

    try {
        const user = await userModel.findOne({email});
        if (!user){
            return res.json({success: false, message: 'User Not Found'});
        }

        const otp = String(Math.floor(100000 +  Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpires = Date.now() + 15 * 60 * 1000;

       await user.save();

       const mailOption = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: 'password Reset OTP',
        //text: `Your OTP for Password Reset is ${otp}. Reset your password using this OTP.`,
        html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
       }
       await transporter.sendMail(mailOption);
       return res.json({success: true, message: 'OTP Sent on Email'});

    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// Reset Password
export const resetPassword = async (req, res)=>{
    const {email, otp, newPassword} = req.body;

    if (!email || !otp || !newPassword){
        return res.json({success: false, message: 'Email, OTP and New Password arw required'});
    }

    try {

        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: 'User Not Found'});
        }

        if(user.resetOtp === '' || user.resetOtp !== otp){
            return res.json({success: false, message: 'Invalid OTP'});
        }

        if(user.resetOtpExpires < Date.now()){
            return res.json({success: false, message: 'OTP Expired'});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpires = 0;

        await user.save();

        return res.json({success: true, message: 'Password Reset Successfully'});
        
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}
    