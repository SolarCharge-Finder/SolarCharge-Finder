import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    debug: true, // Show debug output
    logger: true  // Log activity
  });
};

// Generate email verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
export const sendVerificationEmail = async (user) => {
  try {
    // Use hardcoded credentials for now (in production, use .env)
    const emailUser = 'nadeesf23@gmail.com';
    const emailPass = 'nictbifwbraxhvcn';
    
    console.log('Attempting to send email to:', user.email);
    console.log('Email user:', emailUser);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      },
      debug: false,
      logger: false
    });
    
    // Verify transporter configuration
    await transporter.verify();
    console.log('Transporter verified successfully');

    const verificationToken = generateVerificationToken();
    const verificationUrl = `http://localhost:3000/verify-email/${verificationToken}`;

    // Update user with verification token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    console.log('Saved verification token:', verificationToken);
    console.log('User email:', user.email);

    const mailOptions = {
      from: `"SolarCharge Finder" <${emailUser}>`,
      to: user.email,
      subject: 'Email Verification - SolarCharge Finder',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Welcome to SolarCharge Finder!</h2>
          <p style="color: #666; font-size: 16px;">Thank you for signing up. Please verify your email address to complete your registration.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #007bff; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            This link will expire in 24 hours.<br>
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      `
    };

    console.log('Sending email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    console.error('Error details:', error.message);
    // Don't throw error, just log it - registration should continue
    return true;
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (user) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email credentials not configured. Skipping welcome email.');
      return true;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"SolarCharge Finder" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Welcome to SolarCharge Finder! 🎉',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #28a745; text-align: center;">Email Verified Successfully!</h2>
          <p style="color: #666; font-size: 16px;">Welcome to SolarCharge Finder! Your account has been successfully verified.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What's next?</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Search for solar charging stations near you</li>
              <li>Book charging slots in advance</li>
              <li>Track your charging history</li>
              <li>Manage your profile and preferences</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
               style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Thank you for choosing SolarCharge Finder!<br>
            If you have any questions, feel free to contact our support team.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error, just log it
    return true;
  }
};

// Generate 6-digit reset code
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send password reset email
export const sendPasswordResetEmail = async (user, resetCode) => {
  try {
    // Use hardcoded credentials for now (in production, use .env)
    const emailUser = 'nadeesf23@gmail.com';
    const emailPass = 'nictbifwbraxhvcn';
    
    console.log('Attempting to send password reset email to:', user.email);
    console.log('Email user:', emailUser);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      },
      debug: false,
      logger: false
    });

    const mailOptions = {
      from: `"SolarCharge Finder" <${emailUser}>`,
      to: user.email,
      subject: 'Password Reset Code - SolarCharge Finder',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #dc3545; text-align: center;">Password Reset Request</h2>
          <p style="color: #666; font-size: 16px;">You requested to reset your password for your SolarCharge Finder account.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <h3 style="color: #333; margin-top: 0;">Your Reset Code</h3>
            <div style="font-size: 32px; font-weight: bold; color: #dc3545; letter-spacing: 8px; margin: 20px 0;">
              ${resetCode}
            </div>
            <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
            </p>
          </div>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from SolarCharge Finder.<br>
            Please do not reply to this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${user.email} with code: ${resetCode}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    // Don't throw error, just log it
    return true;
  }
};
