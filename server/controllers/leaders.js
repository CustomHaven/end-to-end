const Leader = require("../models/Leader");

async function index(req, res) {
    try {
        const leaders = await Leader.getAll();
        res.status(200).json(leaders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


async function show(req, res) {
  try {
      const name = req.params.name;
      const leader = await Leader.getOneByleaderName(name);
      res.status(200).json(leader);
  } catch (error) {
      res.status(404).json({ error: error.message });
  }
}

async function create(req, res) {
  try {
      const data = req.body;
      const newLeader = await Leader.create(data);
      res.status(201).send(newLeader);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
}

async function update(req, res) {
  try {
      const name = req.params.name;
      const data = req.body;
      const leader = await Leader.getOneByleaderName(name);
      const result = await leader.update(data);
      res.status(200).json(result);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
}

async function destroy(req, res) {
  try {
      const name = req.params.name;
      const leader = await Leader.getOneByleaderName(name);
      const result = await leader.destroy();
      res.sendStatus(204);
  } catch (error) {
      res.status(404).json({ error: error.message });
  }
}



module.exports = {
  index,
  show,
  create,
  destroy,
  update
}