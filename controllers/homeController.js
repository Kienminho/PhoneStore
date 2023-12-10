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

const renderPayment = async (req, res) => {
  return res.render("payment", { layout: "mainLayout" });
};

const successPayment = (req, res) => {
  return res.render("successPay", {
    layout: "mainLayout",
    downloadLink: `http://localhost:3000/${req.params.id}.pdf`,
    id: req.params.id,
  });
};

module.exports = {
  renderHome: renderHome,
  renderIndex: renderIndex,
  renderCheckout,
  renderInfo: renderInfo,
  renderPayment: renderPayment,
  successPayment: successPayment,
};
