const express = require("express");
const app = express();
const port = 3001;
const {
  liveCache,
  txHistoryCache,
  liveListingCache,
  prevAvgCache,
} = require("./database/cache");
const cors = require("cors");

app.use(cors());

app.get("/", async (req, res) => {
  const liveData = await liveCache();
  res.json(liveData);
});

app.get("/txhistory", async (req, res) => {
  const data = await txHistoryCache();
  res.json(data);
});

app.get("/api/livelisting", async (req, res) => {
  const data = await liveListingCache();
  res.json(data);
});
app.get("/api/prevAvg", async (req, res) => {
  const data = await prevAvgCache();
  res.json(data);
});

app.listen(port, () => {
  console.log(`Example app port ${port}`);
});
