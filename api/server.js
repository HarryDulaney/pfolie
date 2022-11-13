const express = require("express"), env = process.env.NODE_ENV || 'development';
const cors = require("cors");
const path = require('path');
const bodyParser = require('body-parser');

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


app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', routes);

app.use(express.static(root + '/dist/pfolie'));

app.get('/*', function (req, res) {
  res.sendFile(path.join(root + '/dist/pfolie/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Pfolie server is running on port ${PORT}.`);
});