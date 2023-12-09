const mongoose = require("../common/configdb");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  avatar: String,
  role: {
    type: String,
    enum: ["admin", "salesperson"],
    default: "salesperson",
  },
  activationToken: String,
  activationExpires: Date,
  activated: { type: Boolean, default: false },
  firstLogin: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
