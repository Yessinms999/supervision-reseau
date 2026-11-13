const Log = require("../models/logs");

// 1. Save a log
async function addlog(req, res) {
  try {
    const log = await new Log(req.body).save();
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 2. Show all logs (with optional filters)
async function showalllogs(req, res) {
  try {
    const filter = {};
    if (req.query.service) filter.service = req.query.service;
    if (req.query.user) filter.user = req.query.user;
    if (req.query.method) filter.method = req.query.method;
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }
    const logs = await Log.find(filter).sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 3. Show one log
async function showlog(req, res) {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) return res.status(404).json({ error: "log not found" });
    res.status(200).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 4. Delete one log
async function deletelog(req, res) {
  try {
    const log = await Log.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ error: "log not found" });
    res.status(200).send("log deleted");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 5. Statistics: number of requests per service
async function statsbyservice(req, res) {
  try {
    const stats = await Log.aggregate([
      { $group: { _id: "$service", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 6. Statistics: number of errors (status 400 and above) per day
async function errorsperday(req, res) {
  try {
    const stats = await Log.aggregate([
      { $match: { statusCode: { $gte: 400 } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          errors: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 7. Statistics: the 5 most active users
async function topusers(req, res) {
  try {
    const stats = await Log.aggregate([
      { $group: { _id: "$user", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 8. Retention policy: delete logs older than X days
async function purgeoldlogs(req, res) {
  try {
    const days = parseInt(req.query.days);
    if (!days || days < 1) {
      return res.status(400).json({ error: "days must be a positive number" });
    }
    const limit = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await Log.deleteMany({ createdAt: { $lt: limit } });
    res.status(200).json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  addlog,
  showalllogs,
  showlog,
  deletelog,
  statsbyservice,
  errorsperday,
  topusers,
  purgeoldlogs,
};