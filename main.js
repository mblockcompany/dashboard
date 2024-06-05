const {getCache} = require("./database/cache");

const crawling = async () => {
    await getCache();
}

setInterval(crawling, 1800000);