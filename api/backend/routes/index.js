const news = require("../controllers/rss.controller"); // RSS Feeds
const portfolioController = require("../controllers/portfolio.controller"); // Portfolio
const watchListController = require("../controllers/watchlist.controller"); // Watch List
const userController = require("../controllers/user.controller"); // Preferences
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
router.get('/portfolio/info/:uid', portfolioController.findAllPortfoliosInfoByUserId)
router.post('/portfolio/find-one', portfolioController.findPortfolioByPortfolioId);
router.get('/portfolio/next-id', portfolioController.findNextPortfolioId);

router.post('/portfolio/create', portfolioController.createPortfolio);
router.post('/portfolio/update', portfolioController.updatePortfolio);
router.post('/portfolio/delete', portfolioController.deletePortfolio);
router.post('/portfolio/set-main', portfolioController.updateMainPortfolio);


/* ---------------------- Watchlist/ Tracked Assets ----------------------- */
router.get('/watch-list/info/:uid', watchListController.findAllWatchListsInfoByUserId);
router.get('/watch-list/next-id', watchListController.findNextWatchlistId);
router.post('/watch-list/find-one', watchListController.findWatchList);
router.post('/watch-list/create', watchListController.createWatchList);
router.post('/watch-list/update', watchListController.updateWatchList);
router.post('/watch-list/delete', watchListController.deleteWatchlist);
router.post('/watch-list/set-main', watchListController.updateMainWatchList);


/* ---------------------- Portfolio Parts ----------------------- */
router.get('/portfolio/part/:cid', partsController.findPartByComponentId);
router.post('/portfolio/part', partsController.updatePart);
router.put('/portfolio/part', partsController.createPart);

/* ---------------------- User ----------------------- */
router.get('/user/:uid', userController.getAppUserById);

/* ---------------------- News/RSS Feeds ----------------------- */
router.post('/news/fetch-feed', news.parseRssFeed);

module.exports = router;