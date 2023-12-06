const renderHome = (req, res) => {
  return res.render("login", { layout: "authLayout" });
};

module.exports = {
  renderHome: renderHome,
};
