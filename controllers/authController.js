const bcrypt = require("bcrypt");
const multer = require("multer");
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
  console.log(req.body);
  const existUser = await User.findOne({
    username: username,
    isDeleted: false,
  });
  console.log(existUser);
  if (!existUser || existUser === null || existUser.activated === false) {
    return res.json(
      Common.createResponseModel(
        404,
        "Nhân viên chưa đăng kí hoặc chưa được kích hoạt, vui lòng thông báo lại với admin.",
        false
      )
    );
  }

  //check firstlogin
  if (existUser.firstLogin) {
    if (password === existUser.password) {
      return res.json(
        Common.createResponseModel(
          304,
          "Lần đăng nhập đầu tiên, vui lòng đổi mật khẩu để tiếp tục truy cập hệ thống",
          {
            urlRedirect: `/auth/change_password/${existUser._id}`,
            token: existUser.activationToken,
          }
        )
      );
    }
  }

  // so sánh mật khẩu
  const match = await bcrypt.compare(password, existUser.password);
  if (match) {
    // khởi tạo session và cookie
    req.session.fullName = existUser.fullName;
    req.session.idUser = existUser._id;
    res.cookie("fullname", existUser.fullName);
    res.cookie("permission", existUser.role);
    req.session.isLogin = true;
    req.session.permission = existUser.role;

    //trả thông tin về clients
    return res.json(
      Common.createSuccessResponseModel(0, { urlRedirect: "/home" })
    );
  }
  return res.json(
    Common.createResponseModel(404, "Mật khẩu sai, vui lòng thử lại.", false)
  );
};

// xử lý đăng ký
const handleRegister = async (req, res) => {
  const { fullName, email, address, phoneNumber } = req.body;
  const existUser = await User.findOne({ email: email, isDeleted: false });
  if (existUser)
    return res.json(
      Common.createResponseModel(
        Common.statusCode.ERROR,
        "Nhân viên đã tồn tại.",
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
      address: address,
      phoneNumber: phoneNumber,
      activationToken: Common.generateRandomToken(100),
      activationExpires: activationExpires,
      isDeleted: false,
    });

    console.log(user);
    //send mail
    Mail.sendMail(email, user.activationToken, user.username);

    return res.json(Common.createSuccessResponseModel(user));
  } catch (error) {
    console.log("authController-Line 102: " + error.message);
    return res.json(Common.createResponseModel(400, error, false));
  }
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
  const user = await User.findOne({
    $or: [{ activationToken: id }, { _id: id }],
  });
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

const handleLogout = async (req, res) => {
  req.session.destroy();
  // Clear cookies
  res.clearCookie("fullname");
  res.clearCookie("permission");

  return res.redirect("/auth/login");
};

const checkLoggedIn = (req, res, next) => {
  if (!req.session || !req.session.isLogin) {
    return res.redirect("/auth/login");
  }

  next();
};

module.exports = {
  renderLogin: renderLogin,
  handleLogin: handleLogin,
  handleRegister: handleRegister,
  handleActive: handleActive,
  renderChangePassword: renderChangePassword,
  handleChangePassword: handleChangePassword,
  checkPermission: checkPermission,
  handleLogout: handleLogout,
  checkLoggedIn: checkLoggedIn,
};
