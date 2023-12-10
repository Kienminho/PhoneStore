const mongoose = require("../common/configdb");

const invoiceItemSchema = new mongoose.Schema(
  {
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "invoices",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceCode: { type: String, required: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    salesStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiveMoney: { type: Number, required: true },
    excessMoney: { type: Number, required: true },
    totalMoney: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
const InvoiceItem = mongoose.model("invoice_items", invoiceItemSchema);

module.exports = { Invoice, InvoiceItem };
