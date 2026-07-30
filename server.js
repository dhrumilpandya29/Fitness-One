require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Transporter configuration for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP configuration error:', error);
  } else {
    console.log('🚀 SMTP Server is ready to send emails.');
  }
});

// Endpoint for Enquiry Form submission
app.post('/api/enquiry', async (req, res) => {
  const { name, phone, email, plan, goal, message } = req.body;

  // Simple validation
  if (!name || !phone || !email || !plan) {
    return res.status(400).json({ error: 'Please provide name, phone, email, and plan.' });
  }

  // Map option values to user friendly text
  const planMap = {
    '1month': '1 Month – ₹999',
    '3month': '3 Months – ₹2,699',
    '6month': '6 Months – ₹4,999 (Most Popular)',
    '1year': '1 Year – ₹8,999 (Best Value)'
  };
  const planText = planMap[plan] || plan;

  // 1. Email to the Owner (Dhrumil Pandya)
  const ownerMailOptions = {
    from: `"Fitness One Backend" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `🔥 New Gym Enquiry: ${name} (${planText})`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ff6b00; border-radius: 12px; background-color: #12121a; color: #ffffff;">
        <h2 style="color: #ff6b00; border-bottom: 2px solid #ff6b00; padding-bottom: 10px; margin-top: 0;">New Enquiry Received</h2>
        <p style="font-size: 16px; line-height: 1.5;">A new user has submitted the enquiry form on <strong>Fitness One</strong> website.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr style="border-bottom: 1px solid #222;">
            <td style="padding: 10px 0; color: #ff6b00; font-weight: bold; width: 130px;">Name:</td>
            <td style="padding: 10px 0; color: #ffffff;">${name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #222;">
            <td style="padding: 10px 0; color: #ff6b00; font-weight: bold;">Phone:</td>
            <td style="padding: 10px 0; color: #ffffff;"><a href="tel:${phone}" style="color: #ffffff; text-decoration: none;">${phone}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #222;">
            <td style="padding: 10px 0; color: #ff6b00; font-weight: bold;">Email:</td>
            <td style="padding: 10px 0; color: #ffffff;"><a href="mailto:${email}" style="color: #ffffff; text-decoration: none;">${email}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #222;">
            <td style="padding: 10px 0; color: #ff6b00; font-weight: bold;">Selected Plan:</td>
            <td style="padding: 10px 0; color: #ffffff;">${planText}</td>
          </tr>
          <tr style="border-bottom: 1px solid #222;">
            <td style="padding: 10px 0; color: #ff6b00; font-weight: bold;">Fitness Goal:</td>
            <td style="padding: 10px 0; color: #ffffff;">${goal || 'Not specified'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #222;">
            <td style="padding: 10px 0; color: #ff6b00; font-weight: bold; vertical-align: top;">Message:</td>
            <td style="padding: 10px 0; color: #c0c0d0; line-height: 1.4;">${message ? message.replace(/\n/g, '<br>') : 'No extra message'}</td>
          </tr>
        </table>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #1a1a26; border-radius: 8px; font-size: 14px; color: #888;">
          Note: This notification was sent automatically from Fitness One server. Please follow up with the lead within 24 hours.
        </div>
      </div>
    `
  };

  // 2. Automated Reply to the Client (User)
  const clientMailOptions = {
    from: `"Fitness One" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `💪 Thank you for your enquiry, ${name}! - Fitness One`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255, 107, 0, 0.2); border-radius: 16px; background-color: #0a0a0f; color: #ffffff; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ff6b00, #ff2d55); padding: 35px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            FITNESS ONE
          </h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 3px; color: #ffcc00; font-weight: bold;">
            TRANSFORM YOUR LIFE
          </p>
        </div>

        <!-- Body Content -->
        <div style="padding: 30px 25px; background-color: #12121a;">
          <h2 style="color: #ff6b00; font-size: 22px; margin-top: 0; font-weight: 700;">Hi ${name},</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #c0c0d0;">
            Thank you for reaching out to <strong>Fitness One</strong>, Vadodara's premier fitness destination! We're excited to help you start your fitness journey and crush your goals.
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #c0c0d0;">
            We have successfully received your enquiry. A fitness consultant from our Makarpura branch will contact you shortly at <strong>${phone}</strong> to guide you further.
          </p>

          <!-- Plan Confirmation Box -->
          <div style="margin: 25px 0; padding: 20px; border-left: 4px solid #ff6b00; background-color: #1a1a26; border-radius: 0 8px 8px 0;">
            <h3 style="margin-top: 0; color: #ff6b00; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Selected Plan Details</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #7070a0; width: 110px;">Membership:</td>
                <td style="padding: 4px 0; color: #ffffff; font-weight: bold;">${planText}</td>
              </tr>
              ${goal ? `
              <tr>
                <td style="padding: 4px 0; color: #7070a0;">Fitness Goal:</td>
                <td style="padding: 4px 0; color: #ffffff;">${goal}</td>
              </tr>` : ''}
            </table>
          </div>

          <p style="font-size: 15px; line-height: 1.6; color: #c0c0d0; margin-bottom: 25px;">
            In the meantime, feel free to drop by our gym for a free tour and session. We can't wait to see you at the gym!
          </p>

          <!-- Contact & Location Box -->
          <table style="width: 100%; border-top: 1px solid rgba(255, 107, 0, 0.15); padding-top: 20px; font-size: 13px; color: #7070a0;">
            <tr>
              <td style="vertical-align: top; width: 50%;">
                <strong style="color: #ffffff; font-size: 14px;">📍 Gym Address</strong><br>
                Fitness One Gym,<br>
                Opp. Bhavans School, Makarpura,<br>
                Vadodara, Gujarat - 390014
              </td>
              <td style="vertical-align: top; width: 50%; padding-left: 20px;">
                <strong style="color: #ffffff; font-size: 14px;">📞 Contact Us</strong><br>
                Phone: +91 9106725591<br>
                Email: dhrumilpandya09@gmail.com
              </td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="background-color: #0a0a0f; padding: 20px; text-align: center; border-top: 1px solid rgba(255, 107, 0, 0.1); font-size: 12px; color: #505070;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Fitness One. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">You received this email because you submitted an enquiry on our website.</p>
        </div>
      </div>
    `
  };

  try {
    // Send both emails in parallel
    await Promise.all([
      transporter.sendMail(ownerMailOptions),
      transporter.sendMail(clientMailOptions)
    ]);

    console.log(`✅ Success: Enquiry emails sent for ${name} (${email})`);
    return res.status(200).json({ message: 'Enquiry submitted successfully! Confirmation emails sent.' });
  } catch (error) {
    console.error('❌ Error sending enquiry emails:', error);
    return res.status(500).json({ error: 'Failed to send enquiry emails. Please try again later.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});
