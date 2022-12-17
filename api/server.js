const express = require("express"), env = process.env.NODE_ENV || 'development';
const cors = require("cors");
const path = require('path');
const bodyParser = require('body-parser');
const news = require("../controllers/news.controller");
const config = require("../controllers/config.controller");
const portfolioController = require("../controllers/portfolio.controller");
const partsController = require("../controllers/parts.controller");

var root = path.dirname(__dirname);

if (env !== 'production') {
  require('dotenv').config({ path: root + '/api/.env' });
}

const routes = require("./backend/routes");
const app = express();
var corsOptions = {
  origin: ""
};

const allowedOrigins = process.env.CORS_CONFIG.split(',');

var enforceSsl = function (req, res, next) {
  // The 'x-forwarded-proto' check is for Heroku
  if (req.headers['x-forwarded-proto'] !== 'https' || !req.secure) {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  } else {
    return next();
  }
}


/**
 * If ENV is prod, enable trust proxy and enable http -> https forwarding
 * and set prod origins for CORS
 * app.get('X-Forwarded-Proto')
 */
if (env === 'production') {
  app.enable('trust proxy');
  app.use(enforceSsl);
  corsOptions['origin'] = allowedOrigins;
} else {
  // local
  corsOptions['origin'] = process.env.CORS_CONFIG_LOCAL;
}

app.options('*', cors(corsOptions)) // include before other routes
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
// app.use('/api', routes);




/* ---------------------- Configuration ----------------------- */
app.get('/api/config', cors(corsOptions), config.envConfig);

/* ---------------------- Portfolios ----------------------- */
app.get('/api/portfolio/:uid',cors(corsOptions), portfolioController.findAllPortfoliosByUserId);
app.get('/api/portfolio/ids/:uid',cors(corsOptions), portfolioController.findAllPortfolioIdsByUserId);
app.get('/api/portfolio/:pid',cors(corsOptions), portfolioController.findPortfolioByPortfolioId);
app.put('/api/portfolio',cors(corsOptions), portfolioController.createPortfolio);
app.post('/api/portfolio',cors(corsOptions), portfolioController.updatePortfolio);
app.delete('/portfolio',cors(corsOptions), portfolioController.deletePortfolio);

/* ---------------------- Portfolio Parts ----------------------- */
app.get('/api/portfolio/part/:cid',cors(corsOptions), partsController.findPartByComponentId);
app.post('/api/portfolio/part',cors(corsOptions), partsController.updatePart);
app.put('/api/portfolio/part',cors(corsOptions), partsController.createPart);


/* ---------------------- News/RSS Feeds ----------------------- */
app.post('/api/news/fetch-feed',cors(corsOptions), news.parseRssFeed);

app.use(express.static(root + '/dist/pfolie'));

app.get('/*', function (req, res) {
  res.sendFile(path.join(root + '/dist/pfolie/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Pfolie server is running on port ${PORT}.`);
});