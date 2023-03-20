const news = require("../controllers/news.controller");
const portfolioController = require("../controllers/portfolio.controller");
const partsController = require("../controllers/parts.controller");
const coins = require("../controllers/coins.controller");

const Router = require('express-promise-router')

const router = new Router();

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