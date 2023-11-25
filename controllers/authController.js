const bcrypt = require("bcrypt");

const User = require("../models/Users");
const Common = require("../common/Common");
const Mail = require("../common/sendMail");

const renderLogin = (req, res) => {
  return res.render("login", { layout: "authLayout" });
};

// xử lý đăng ký
const handleRegister = async (req, res) => {
  const { fullName, email } = req.body;
  const existUser = await User.findOne({ email: email });
  if (existUser)
    res.json(
      Common.createResponseModel(
        Common.statusCode.ERROR,
        "User already exists.",
        false
      )
    );

  try {
    const activationExpires = new Date();
    activationExpires.setMinutes(activationExpires.getMinutes() + 1);
    const user = await User.create({
      username: Common.getUserNameByEmail(email),
      password: Common.getUserNameByEmail(email),
      fullName: fullName,
      email: email,
      activationToken: Common.generateRandomToken(100),
      activationExpires: activationExpires,
    });

    console.log(user);
    //send mail
    Mail.sendMail(email, user.activationToken, user.username);

    res.json(Common.createSuccessResponseModel(user));
  } catch (error) {}
};

//xử lý active tài khoản
const handleActive = async (req, res) => {
  const token = req.params.token;
  const user = await User.findOne({ activationToken: token });
  let message;
  let isSuccess;
  let id;
  if (!user) {
    message = "Invalid activation token!";
    res.render("active", { message: message, isSuccess: false });
  }
  id = user._id;
  const currentTime = new Date().getTime();
  const differenceInMinutes =
    (currentTime - user.activationExpires.getTime()) / (1000 * 60);

  if (differenceInMinutes <= 1) {
    await User.updateOne({ _id: user._id }, { $set: { activated: true } });
    message = "Kích hoạt thành công, bạn sẽ được chuyến hướng sau vài giây.";
    isSuccess = true;
  } else {
    message = "Hết thời gian kích hoạt, vui lòng liên hệ với admin để cấp lại.";
    isSuccess = false;
  }

  res.render("active", {
    message: message,
    isSuccess: isSuccess,
    id: token,
  });
};

const renderChangePassword = (req, res) => {
  return res.render("changePassword", { layout: "authLayout" });
};

// xử lý đổi mật khẩu
const handleChangePassword = async (req, res) => {
  const { id, password } = req.body;
  const user = await User.findOne({ activationToken: id });
  if (!user) {
    res.json(
      Common.createResponseModel(
        Common.statusCode.ERROR,
        Common.messageCode.NOTFOUND,
        false
      )
    );
  }
  // Tạo một salt ngẫu nhiên
  const salt = await bcrypt.genSalt(10);

  // Mã hóa password kết hợp với salt
  const hash = await bcrypt.hash(password, salt);
  await User.updateOne(
    { _id: user._id },
    { $set: { password: hash, firstLogin: false } }
  );

  res.json(Common.createSuccessResponseModel(true));
};

module.exports = {
  renderLogin: renderLogin,
  handleRegister: handleRegister,
  handleActive: handleActive,
  renderChangePassword: renderChangePassword,
  handleChangePassword: handleChangePassword,
};
