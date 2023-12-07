const bcrypt = require("bcrypt");

const User = require("../models/Users");
const Common = require("../common/Common");
const Mail = require("../common/sendMail");

const checkPermission = (req, res, next) => {
  if (req.session.permission !== "admin") {
    return res.json(
      Common.createResponseModel(
        403,
        "Bạn không có quyền truy cập hệ thống này",
        false
      )
    );
  }
};

const renderLogin = (req, res) => {
  return res.render("login", { layout: "authLayout" });
};

//xử lý login
const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  const existUser = await User.findOne({ username: username });
  if (!existUser || existUser === null || existUser.activated === false) {
    return res.json(
      Common.createResponseModel(
        404,
        "Nhân viên chưa đăng kí hoặc chưa được kích hoạt, vui lòng thông báo lại với admin.",
        false
      )
    );
  }

  // so sánh mật khẩu
  const match = await bcrypt.compare(password, existUser.password);
  if (match) {
    if (existUser.firstLogin) {
      return res.json(
        Common.createResponseModel(
          304,
          "Lần đăng nhập đầu tiên, vui lòng đổi mật khẩu để tiếp tục truy cập hệ thống",
          {
            urlRedirect: "/auth/change_password",
            token: existUser.activationToken,
          }
        )
      );
    }

    // khởi tạo session và cookie
    req.session.fullName = existUser.fullName;
    res.cookie("fullname", existUser.fullName);
    res.cookie("permission", existUser.role);
    req.session.isLogin = true;
    req.session.permission = existUser.role;

    //trả thông tin về clients
    return res.json(
      Common.createSuccessResponseModel(0, { urlRedirect: "/home" })
    );
  }
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
  handleLogin: handleLogin,
  handleRegister: handleRegister,
  handleActive: handleActive,
  renderChangePassword: renderChangePassword,
  handleChangePassword: handleChangePassword,
  checkPermission: checkPermission,
};
