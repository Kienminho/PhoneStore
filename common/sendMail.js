const nodemailer = require("nodemailer");

const sendMail = (email, activationToken, username) => {
  const html = `<h1>Chào bạn!</h1>
  <p>Tài khoản và mật khẩu của bạn: ${username}</p>
  <p> Nhấp vào liên kết sau để kích hoạt tài khoản của bạn: http://localhost:3000/auth/active/${activationToken}`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "Hopkien1609@gmail.com", // Email người gửi
      pass: "vptxiuwznddhfzdl", // Mật khẩu email người gửi
    },
  });
  // Cấu hình nội dung email
  const mailOptions = {
    from: "Hopkien1609@gmail.com", // Email người gửi
    to: email, // Email người nhận
    subject: "Xác thực người dùng", // Tiêu đề email
    html: html, // Nội dung email
  };
  // Gửi email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return false;
    } else {
      return true;
    }
  });
};

module.exports = {
  sendMail: sendMail,
};
