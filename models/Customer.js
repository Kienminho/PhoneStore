const mongoose = require("../common/configdb");

const customerSchema = new mongoose.Schema({
	phoneNumber: { type: String, required: true },
	fullName: { type: String, required: true },
	address: { type: String, required: true },
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = { Customer };
