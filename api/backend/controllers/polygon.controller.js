const options = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.POLYGON_API_KEY}`
    }
}

const BASE_API = 'https://api.polygon.io'
const NEWS = '/v2/reference/news'
const TICKER = '/v3/reference/tickers'



const getAllStockTickers = async (req, res) => {
    await fetch(BASE_API + TICKER, options).then(response => {
        res.status(200).send(response.json());
    }).catch(err => {
        res.status(500).send(err.toString());
    });
}

const getStockTicker = async (req, res) => {
    const { ticker } = req.params;
    await fetch(`${BASE_API}${TICKER}/${ticker}`, options).then(response => {
        res.status(200).send(response.json());
    }).catch(err => {
        res.status(500).send(err.toString());
    });
}


const getNews = async (req, res) => {
    await fetch(BASE_API + NEWS, options).then(response => {
        res.status(200).send(response.json());
    }).catch(err => {
        res.status(500).send(err.toString());
    });
}

const getNewsTicker = async (req, res) => {
    const { ticker } = req.params;
    await fetch(`${BASE_API}${NEWS}?ticker=${ticker}`, options).then(response => {
        res.status(200).send(response.json());
    }).catch(err => {
        res.status(500).send(err.toString());
    });
}



module.exports = {
    getAllStockTickers,
    getStockTicker,
    getNews,
    getNewsTicker
}