const renderHome = (req, res) => {
  return res.render("login", { layout: "authLayout" });

  // return res.render("login", { layout: "authLayout" });
};

const renderIndex = (req, res) => {
  return res.render("index", { layout: "mainLayout" });
};

const renderCheckout = (req, res) => {
  return res.render("checkout", { layout: "mainLayout" });
};

const renderInfo = (req, res) => {
  return res.render("accountSetting", { layout: "mainLayout" });
};

module.exports = {
  renderHome: renderHome,
  renderIndex: renderIndex,
  renderCheckout,
  renderInfo: renderInfo,
};
