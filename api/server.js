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


const allowedOrigins = env === 'production' ? process.env.CORS_CONFIG.split(',') : process.env.CORS_CONFIG_LOCAL.split(',');


var corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, false);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not ' +
        'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}

if (env === 'production') {
  /**
 * If ENV is prod, enable trust proxy and enable http -> https forwarding
 * and set prod origins for CORS
 * app.get('X-Forwarded-Proto')
 */
  app.enable('trust proxy');
  var enforceSsl = function (req, res, next) {
    // The 'x-forwarded-proto' check is for Heroku
    if (req.headers['x-forwarded-proto'] !== 'https' || !req.secure) {
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    } else {
      return next();
    }
  }

  app.use(enforceSsl);
}

app.use(require('cookie-parser')());

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('*', cors(corsOptions));
app.use('/api', cors(corsOptions), routes);

app.use(express.static(root + '/dist/pfolie'));

app.get('/*', function (req, res) {
  res.sendFile(path.join(root + '/dist/pfolie/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Pfolie server is running on port ${PORT}.`);
});