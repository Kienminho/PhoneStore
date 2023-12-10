const mongoose = require("../common/configdb");

const cartSchema = new mongoose.Schema({
  idSalePeople: {
    type: String,
    required: true,
  },
  idProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true,
  },
  name: { type: String, required: true },
  imageLink: { type: String, required: true },
  salePrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalMoney: { type: Number, required: true },
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
