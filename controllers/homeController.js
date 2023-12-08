const renderHome = (req, res) => {
	return res.render("index", { layout: "mainLayout" });

	// return res.render("login", { layout: "authLayout" });
};

const renderIndex = (req, res) => {
	return res.render("index", { layout: "mainLayout" });
};

const renderCheckout = (_, res) => {
	return res.render("checkout", { layout: "mainLayout" });
};

module.exports = {
	renderHome: renderHome,
	renderIndex: renderIndex,
	renderCheckout,
};
