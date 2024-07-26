const { Router } = require("express");

const leaderController = require("../controllers/leaders");

const leaderRouter = Router();

leaderRouter.get("/", leaderController.index);
leaderRouter.get("/:name", leaderController.show);
leaderRouter.post("/", leaderController.create);
leaderRouter.patch("/:name", leaderController.update);
leaderRouter.delete("/:name", leaderController.destroy);


module.exports = leaderRouter;