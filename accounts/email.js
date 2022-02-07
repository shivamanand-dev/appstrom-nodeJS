const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "ShivamAnand@appstrom.app",
    subject: "Thanks for joining!",
    text: `Welcome to the app, ${name}. Let me know how it work.`,
  });
};

const contactmail = (name, email, message) => {
  sgMail.send({
    to: "ShivamAnand@appstrom.app",
    from: "ShivamAnand@appstrom.app",
    subject: "Contact mail from user",
    text: `message from: ${name} ${"\n"}Email:- ${email}${"\n"} Message:- ${message}`,
  });
};

module.exports = {
  sendWelcomeEmail,
  contactmail,
};
