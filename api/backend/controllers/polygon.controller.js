const API_KEY = process.env.POLYGON_API_KEY;
const { restClient } = require('@polygon.io/client-js');
const rest = restClient(API_KEY, "https://api.polygon.io");

/* ------------------------------------- Polygon.io Controller -------------------------------------------- */

const getAggregate = async (req, res) => {
    const { ticker, mulitplier, timespan, startdate, enddate } = req.body;
    await rest.stocks.aggregates(ticker, mulitplier, timespan, startdate, enddate)
        .then((data) => {
            res.status(200).send(data);
        }).catch(e => {
            res.status(500).send(e.toString());
        });

}

const getLastQuote = async (req, res) => {
    const { ticker } = req.params;
    await rest.stocks.quotes(ticker).then((data) => {
        res.status(200).send(data);
    }).catch(e => {
        res.status(500).send(e.toString());
    });

}


const getNewsByTicker = async (req, res) => {
    const { ticker } = req.params;
    await rest.reference.tickerNews(ticker).then((data) => {
        res.status(200).send(data);
    }).catch(e => {
        res.status(500).send(e.toString());
    });
}


const getRecentNews = async (req, res) => {
    const { limit } = req.params;
    await rest.reference.tickerNews({ sort: 'published_utc', limit: limit, order: 'desc' }).then((data) => {
        res.status(200).send(data);
    }).catch(e => {
        res.status(500).send(e.toString());
    });

}

module.exports = {
    getNewsByTicker,
    getRecentNews,
    getAggregate,
    getLastQuote
}