const { Router } = require("express");

const countryController = require("../controllers/countries");

const countryRouter = Router();

countryRouter.get("/", countryController.index);
countryRouter.get("/:name", countryController.show);

module.exports = countryRouter;