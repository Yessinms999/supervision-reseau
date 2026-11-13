var express = require("express");
var http = require("http");
const mongo = require("mongoose");

const dbconnect = require("./config/dbconnection.json");

mongo
  .connect(dbconnect.url)
  .then(() => console.log("database connected!!"))
  .catch((err) => console.log(err));

var logRouter = require("./routes/logs");

var app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Audit Service is alive!");
});

app.use("/logs", logRouter);

// route not found
app.use((req, res) => {
  res.status(404).json({ error: "route not found" });
});

const server = http.createServer(app);
server.listen(3005, () => console.log("Audit Service running on port 3005"));

module.exports = app;