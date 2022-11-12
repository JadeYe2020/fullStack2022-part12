const express = require("express");
const { Todo } = require("../mongo");
const router = express.Router();

const redis = require("../redis");

const counter = async () => {
  let val = await redis.getAsync("todoAdded");
  let updated = Number(val) + 1;
  console.log("updated", updated);
  await redis.setAsync("todoAdded", updated);
};

// GET statistics
router.get("/statistics", async (_, res) => {
  const added = await redis.getAsync("todoAdded");
  res.send({ added_todos: Number(added) });
});

/* GET todos listing. */
router.get("/", async (_, res) => {
  const todos = await Todo.find({});
  res.send(todos);
});

/* POST todo to listing. */
router.post("/", async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false,
  });
  counter();
  res.send(todo);
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params;
  req.todo = await Todo.findById(id);
  if (!req.todo) return res.sendStatus(404);

  next();
};

/* DELETE todo. */
singleRouter.delete("/", async (req, res) => {
  await req.todo.delete();
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get("/", async (req, res) => {
  if (req.todo) {
    res.json(req.todo);
  } else {
    res.sendStatus(404); // Implement this
  }
});

/* PUT todo. */
singleRouter.put("/", async (req, res) => {
  // res.sendStatus(405); // Implement this
  const body = req.body;
  const todo = { text: body.text, done: body.done };
  const updated = await Todo.findByIdAndUpdate(req.todo._id, todo, {
    new: true,
  });
  res.json(updated);
});

router.use("/:id", findByIdMiddleware, singleRouter);

module.exports = router;
