const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "admin@appstrom.app",
    subject: "Thanks for joining!",
    text: `Welcome to the app, ${name}. Let me know how it work.`,
  });
};

module.exports = {
  sendWelcomeEmail,
};
