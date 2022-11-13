const { parse } = require('rss-to-json');

const parseRssFeed = async (req, res) => {
    if (!req.body.url) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    var feed = await parse(req.body.url);

    res.status(200).send(JSON.stringify(feed));
}


const parseRssFeeds = async (req, res) => {
    if (!req.body.urls) {
        res.status(400).send({
            message: "Content array can not be empty!"
        });
        return;
    }
    var feeds = [];

    for (var i = 0; i < urls.length; i++) {
        url = url[i];
        var feed = parseFeed(url);
        feeds.push(feed);
    }

    res.status(200).send(JSON.stringify(feeds));
}


async function parseFeed(url) {
    var feed = await parse(url);
    return feed;
}


exports.parseRssFeeds = parseRssFeeds;
exports.parseRssFeed = parseRssFeed;