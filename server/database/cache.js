const cache = require("memory-cache");
const getHistory = require("./getHistoryDB");
const getStatus = require("./getStatusDB");
const getListing = require("./getListingDB");
const getPrevAvg = require("./getPrevAvgDB");
const insertAsset = require("./insertAsset");
const insertHistory = require("./insertHistory");

const getCache = () => {
  cache.put("txHistory", getHistory(), 28800000);
  cache.put("assetStatus", getStatus(), 28800000);
  cache.put("liveListing", getListing(), 28800000);
  cache.put("prevAvg", getPrevAvg(), 28800000);
  insertAsset();
  insertHistory();
};
getCache();
setInterval(getCache, 28800000);
// setInterval(getCache, 10000);

const liveCache = async () => {
  const liveData = await cache.get("assetStatus");
  if (liveData) {
    console.log("라이브데이터 캐싱");
  } else {
    console.log(new Date(), "캐시만료");
  }
  return liveData;
};

const txHistoryCache = async () => {
  const data = await cache.get("txHistory");
  if (data) {
    console.log("데이터 캐싱");
  } else {
    console.log(new Date(), "캐시만료");
    // getHistory();
  }
  return data;
};

const liveListingCache = async () => {
  const data = await cache.get("liveListing");
  if (data) {
    console.log("liveLising Cache");
  } else {
    console.log(new Date(), "liveListing cache done");
  }
  return data;
};

const prevAvgCache = async () => {
  const data = await cache.get("prevAvg");
  if (data) {
    console.log("prevAvg Cache");
  } else {
    console.log(new Date(), "prevAvg cache done");
  }
  return data;
};

module.exports = { txHistoryCache, liveCache, liveListingCache, prevAvgCache };
