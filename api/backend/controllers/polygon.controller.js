const API_KEY = process.env.POLYGON_API_KEY;
const { restClient } = require('@polygon.io/client-js');
const rest = restClient(API_KEY, "https://api.polygon.io");

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


const getNews = async (req, res) => {
    const { ticker } = req.params;
    await rest.reference.tickerNews(ticker).then((data) => {
        res.status(200).send(data);
    }).catch(e => {
        res.status(500).send(e.toString());
    });
}



module.exports = {
    getNews,
    getAggregate,
    getLastQuote
}