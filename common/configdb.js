const mongoose = require("mongoose");
//kết nối đến MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/phone_store")
  .then(() => {
    console.log("Mongoose Connected");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = mongoose;
