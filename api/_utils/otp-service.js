// OTP service for secure email verification
import nodemailer from 'nodemailer';
import { generateOTP, hashOTP, verifyOTP, hashEmail } from './privacy.js';
import { getFirestoreDb } from './firebase.js';

/**
 * Email transporter configuration
 */
function createEmailTransporter() {
  // Use environment variables for email configuration
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    }
  };

  return nodemailer.createTransporter(emailConfig);
}

/**
 * Send OTP via email
 * @param {string} email - Recipient email address
 * @param {string} otp - The OTP to send
 * @param {string} purpose - Purpose of OTP (login, register, etc.)
 * @returns {Promise<boolean>} - Success status
 */
export async function sendOTPEmail(email, otp, purpose = 'verification') {
  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: {
        name: 'Study Nova',
        address: process.env.SMTP_USER || 'noreply@studynova.com'
      },
      to: email,
      subject: `Your Study Nova Verification Code - ${otp}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Study Nova - Verification Code</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Study Nova</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your AI-Powered Learning Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #667eea;">
            <h2 style="color: #333; margin-top: 0;">Verification Code</h2>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hello! Here's your verification code for ${purpose}:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px dashed #667eea;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </span>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
              ⏰ This code will expire in <strong>10 minutes</strong> for your security.
            </p>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #1976d2;">
                🔒 <strong>Privacy First:</strong> We only use your email for verification. 
                No personal data is stored or shared.
              </p>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #f1f3f4; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0; font-size: 18px;">🛡️ Your Privacy Matters</h3>
            <ul style="color: #666; font-size: 14px; padding-left: 20px;">
              <li>Your email is hashed and encrypted for security</li>
              <li>We never store personal browsing data</li>
              <li>No third-party tracking or advertising</li>
              <li>You can delete your account anytime</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              If you didn't request this code, please ignore this email.<br>
              This is an automated message from Study Nova.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
Study Nova - Verification Code

Hello! Here's your verification code for ${purpose}: ${otp}

This code will expire in 10 minutes for your security.

Privacy First: We only use your email for verification. No personal data is stored or shared.

If you didn't request this code, please ignore this email.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', info.messageId);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    return false;
  }
}

/**
 * Store OTP in database with expiry
 * @param {string} email - User email
 * @param {string} otp - Generated OTP
 * @param {string} purpose - Purpose of OTP
 * @returns {Promise<boolean>} - Success status
 */
export async function storeOTP(email, otp, purpose = 'verification') {
  try {
    const db = getFirestoreDb();
    const emailHash = hashEmail(email);
    const otpHash = hashOTP(otp, email);
    
    // OTP expires in 10 minutes
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10);
    
    const otpData = {
      emailHash,
      otpHash,
      purpose,
      createdAt: new Date(),
      expiresAt: expiryTime,
      attempts: 0,
      verified: false
    };
    
    // Store with auto-generated ID
    await db.collection('otp_verifications').add(otpData);
    
    console.log('✅ OTP stored successfully for email hash:', emailHash);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to store OTP:', error);
    return false;
  }
}

/**
 * Verify OTP from database
 * @param {string} email - User email
 * @param {string} otp - OTP to verify
 * @param {string} purpose - Purpose of OTP
 * @returns {Promise<Object>} - Verification result
 */
export async function verifyOTPFromDB(email, otp, purpose = 'verification') {
  try {
    const db = getFirestoreDb();
    const emailHash = hashEmail(email);
    
    // Find matching OTP record
    const otpQuery = await db.collection('otp_verifications')
      .where('emailHash', '==', emailHash)
      .where('purpose', '==', purpose)
      .where('verified', '==', false)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (otpQuery.empty) {
      return { 
        success: false, 
        error: 'No valid OTP found. Please request a new one.' 
      };
    }
    
    const otpDoc = otpQuery.docs[0];
    const otpData = otpDoc.data();
    
    // Check if OTP has expired
    if (new Date() > otpData.expiresAt.toDate()) {
      return { 
        success: false, 
        error: 'OTP has expired. Please request a new one.' 
      };
    }
    
    // Check attempt limit (max 3 attempts)
    if (otpData.attempts >= 3) {
      return { 
        success: false, 
        error: 'Too many failed attempts. Please request a new OTP.' 
      };
    }
    
    // Verify OTP
    const isValid = verifyOTP(otp, email, otpData.otpHash);
    
    if (isValid) {
      // Mark as verified
      await otpDoc.ref.update({
        verified: true,
        verifiedAt: new Date()
      });
      
      return { 
        success: true, 
        message: 'OTP verified successfully!' 
      };
    } else {
      // Increment attempt count
      await otpDoc.ref.update({
        attempts: otpData.attempts + 1
      });
      
      return { 
        success: false, 
        error: 'Invalid OTP. Please try again.' 
      };
    }
    
  } catch (error) {
    console.error('❌ Failed to verify OTP:', error);
    return { 
      success: false, 
      error: 'Verification failed. Please try again.' 
    };
  }
}

/**
 * Clean up expired OTPs (run periodically)
 * @returns {Promise<number>} - Number of deleted records
 */
export async function cleanupExpiredOTPs() {
  try {
    const db = getFirestoreDb();
    const now = new Date();
    
    const expiredQuery = await db.collection('otp_verifications')
      .where('expiresAt', '<', now)
      .get();
    
    const batch = db.batch();
    let deleteCount = 0;
    
    expiredQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    
    if (deleteCount > 0) {
      await batch.commit();
      console.log(`✅ Cleaned up ${deleteCount} expired OTP records`);
    }
    
    return deleteCount;
    
  } catch (error) {
    console.error('❌ Failed to cleanup expired OTPs:', error);
    return 0;
  }
}
