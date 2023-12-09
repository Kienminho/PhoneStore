const renderProductManager = (req, res) => {
  return res.render("productManager", { layout: "mainLayout" });
};

const renderEmployeeManager = (req, res) => {
  return res.render("employeeManager", { layout: "mainLayout" });
};

module.exports = {
  renderProductManager: renderProductManager,
  renderEmployeeManager: renderEmployeeManager,
};
