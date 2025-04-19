const index = require("../controllers/index.server.controller");

// Define the routes module' method
module.exports = function (app) {
  app.post("/predictRisk", index.predictRisk);
};
