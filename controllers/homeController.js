const renderHome = (req, res) => {
  return res.render("changePassword", { layout: "authLayout" });
};

module.exports = {
  renderHome: renderHome,
};
