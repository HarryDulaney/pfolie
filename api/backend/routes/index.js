const news = require("../controllers/rss.controller"); // RSS Feeds
const portfolioController = require("../controllers/portfolio.controller"); // Portfolio
const partsController = require("../controllers/parts.controller"); // Portfolio Parts
const polygon = require("../controllers/polygon.controller");   // Polygon API

const Router = require('express-promise-router')

const router = new Router();


/* ---------------------- Poloygon.io ----------------------- */
router.get('/polygon/stocks', polygon.getAggregate);
router.get('/polygon/stocks/quote/:ticker', polygon.getLastQuote);
router.get('/polygon/news/:ticker', polygon.getNewsByTicker);
router.get('/polygon/news/recent/:limit', polygon.getRecentNews);
/* ---------------------- Portfolios ----------------------- */
router.get('/portfolio/:uid', portfolioController.findAllPortfoliosByUserId);
router.get('/portfolio/ids/:uid', portfolioController.findAllPortfolioIdsByUserId);
router.get('/portfolio/:pid', portfolioController.findPortfolioByPortfolioId);
router.put('/portfolio', portfolioController.createPortfolio);
router.post('/portfolio', portfolioController.updatePortfolio);
router.delete('/portfolio', portfolioController.deletePortfolio);

/* ---------------------- Portfolio Parts ----------------------- */
router.get('/portfolio/part/:cid', partsController.findPartByComponentId);
router.post('/portfolio/part', partsController.updatePart);
router.put('/portfolio/part', partsController.createPart);


/* ---------------------- News/RSS Feeds ----------------------- */
router.post('/news/fetch-feed', news.parseRssFeed);

module.exports = router;