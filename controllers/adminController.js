const renderProductManager = (req, res) => {
  return res.render("productManager", { layout: "mainLayout" });
};

module.exports = {
  renderProductManager: renderProductManager,
};
