const transporter = require("../emails/transporter");

const emailService = {
  /**
   * Generic OTP or short message sender
   */
  sendMail: async (to, subject, otp) => {
    try {
      await transporter.sendMail({
        to,
        subject,
        html: `
          <p>Hello,</p>
          <p>Your OTP is: <strong>${otp}</strong></p>
          <p>This OTP is valid for 5 minutes.</p>
          <hr>
          <p>Best Regards,</p>
          <p><strong>Max Battle</strong></p>
          <p>Contact us: maxbattlehelp@gmail.com</p>
        `,
      });
    } catch (err) {
      console.error(`❌ Failed to send OTP email to ${to}:`, err.message);
    }
  },

  /**
   * Custom HTML broadcast / announcement sender
   */
  sendAll: async (to, subject, message) => {
    try {
      await transporter.sendMail({
        to,
        subject,
        html: `
          ${message}
          <hr>
          <p><strong>Best Regards,</strong></p>
          <p><strong>Max Battle Team</strong></p>
          <p>Contact us: maxbattlehelp@gmail.com</p>
        `,
      });
    } catch (err) {
      console.error(`❌ Failed to send broadcast email to ${to}:`, err.message);
    }
  },

  /**
   * Wallet deposit confirmation email
   */
  sendDeposit: async (to, subject, amount) => {
    try {
      await transporter.sendMail({
        to,
        subject,
        html: `
          <p>Hello Player 👋,</p>
          <p>We’re happy to inform you that <strong>₹${amount}</strong> has been successfully added to your <strong>Max Battle Wallet</strong>.</p>
          <p>You can now use your wallet balance to join exciting tournaments and compete for rewards 🏆</p>
          <p>If you did not authorize this transaction, please contact our support team immediately.</p>
          <hr>
          <p><strong>Best Regards,</strong></p>
          <p><strong>Max Battle Team</strong></p>
          <p>Contact us: maxbattlehelp@gmail.com</p>
        `,
      });
    } catch (err) {
      console.error(`❌ Failed to send deposit email to ${to}:`, err.message);
    }
  },

  /**
   * Tournament cancellation / refund notification
   */
  sendRefund: async (to, subject, message) => {
    try {
      await transporter.sendMail({
        to,
        subject,
        html: `
          <p>Hello Player,</p>
          <p>${message}</p>
          <p>We understand this can be disappointing, and we appreciate your support.</p>
          <hr>
          <p><strong>Max Battle Team</strong></p>
          <p>Contact us: maxbattlehelp@gmail.com</p>
        `,
      });
    } catch (err) {
      console.error(`❌ Failed to send refund email to ${to}:`, err.message);
    }
  },

  /**
   * Tournament Room ID & Password dispatch
   */
  sendIdPass: async (to, subject, roomId, roomPassword) => {
    try {
      await transporter.sendMail({
        to,
        subject,
        html: `
          <p>Hello,</p>
          <p>Your Room id is: <strong>${roomId}</strong></p>
          <p>Your Room password is: <strong>${roomPassword}</strong></p>
          <p>Join fast⏩⏩</p>
          <hr>
          <p>Best Regards,</p>
          <p><strong>Max Battle</strong></p>
          <p>Contact us: maxbattlehelp@gmail.com</p>
        `,
      });
    } catch (err) {
      console.error(`❌ Failed to send Room credentials to ${to}:`, err.message);
    }
  },

  /**
   * Successful payout / withdrawal notification
   */
  sendSuccess: async (to, subject, amount) => {
    try {
      await transporter.sendMail({
        to,
        subject,
        html: `
          <p>👋 Hello Player,</p>
          <p>Your <strong>withdrawal of ₹${amount} has been successfully completed</strong> from the Max Battle platform!</p>
          <p>The amount has been transferred to your linked UPI. Check your payment app for confirmation.</p>
          <p>Keep playing and winning more battles! 🏆 New tournaments are live — don't miss out!</p>
          <hr>
          <p><strong>Best of luck,</strong></p>
          <p><strong>Team Max Battle</strong></p>
          <p>Contact us: maxbattlehelp@gmail.com</p>
        `,
      });
    } catch (err) {
      console.error(`❌ Failed to send withdrawal success email to ${to}:`, err.message);
    }
  },

  /**
   * Admin notification for new withdrawal request
   */
  sendRequest: async (to, subject, detail) => {
    try {
      await transporter.sendMail({
        to,
        subject,
        html: `
          <p>🔔 <strong>New Withdrawal Request Received</strong></p>
          <p><strong>User Name:</strong> ${detail.username}</p>
          <p><strong>Requested Amount:</strong> ₹${detail.amount}</p>
          <p><strong>UPI ID:</strong> ${detail.upi}</p>
          <p><strong>Email ID:</strong> ${detail.email}</p>
          <hr>
          <p>Please review and process the withdrawal as soon as possible.</p>
          <p><strong>Max Battle Admin Panel</strong></p>
        `,
      });
    } catch (err) {
      console.error(`❌ Failed to send withdrawal request email to admin:`, err.message);
    }
  },

  /**
   * Morning alert for new tournaments
   */
  sendAlert: async (to, subject) => {
    try {
      await transporter.sendMail({
        to,
        subject,
        html: `
          <p>Good Morning Player 👋,</p>
          <p>We're excited to inform you that <strong>new tournaments are now live</strong> on the Max Battle platform!</p>
          <p>Don't miss your chance to show your skills and rise to the top of the leaderboard 🏆</p>
          <hr>
          <p><strong>Best of luck,</strong></p>
          <p><strong>Team Max Battle</strong></p>
          <p>Contact us: maxbattlehelp@gmail.com</p>
        `,
      });
    } catch (err) {
      console.error(`❌ Failed to send tournament alert to ${to}:`, err.message);
    }
  },
};

module.exports = emailService;
