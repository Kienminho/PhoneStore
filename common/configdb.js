const mongoose = require("mongoose");
//kết nối đến MongoDB
mongoose
  .connect(process.env.URL_DB)
  .then(() => {
    console.log("Mongoose Connected");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = mongoose;
