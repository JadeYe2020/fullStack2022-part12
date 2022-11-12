const express = require("express");
const router = express.Router();

const redis = require("../redis");

const configs = require("../util/config");

let visits = 0;

/* GET index data. */
router.get("/", async (req, res) => {
  visits++;

  res.send({
    ...configs,
    visits,
  });
});

// GET statistics
router.get("/statistics", async (_, res) => {
  const added = await redis.getAsync("todoAdded");
  res.send({ added_todos: Number(added) });
});

module.exports = router;
