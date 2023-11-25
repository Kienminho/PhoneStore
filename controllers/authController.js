const User = require("../models/Users");
const Common = require("../common/Common");
const Mail = require("../common/sendMail");

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
    Mail.sendMail(email, user.activationToken);

    res.json(Common.createSuccessResponseModel(user));
  } catch (error) {}
};

module.exports = {
  handleRegister: handleRegister,
};
