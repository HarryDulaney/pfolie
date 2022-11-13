const db = require('../db')
/* ------------------------------ Portfolio ------------------------------ */

const findAllPortfoliosByUserId = async (req, res) => {
    const { uid } = req.params;
    await db.query('SELECT * FROM portfolios WHERE uid = $1', [uid], function (err, result) {
        if (err) {
            res.status(500).send(JSON.stringify(err));
        } else {
            res.status(200).send(JSON.stringify(result.rows));
        }
    });
}

const findAllPortfolioIdsByUserId = async (req, res) => {
    const { uid } = req.params;
    await db.query('SELECT array_to_string( array(SELECT portfolio_id FROM portfolios WHERE uid = $1), ', ' )', [uid],
        function (err, result) {
            if (err) {
                res.status(500).send(JSON.stringify(err));
            } else {
                res.status(200).send(JSON.stringify(result));
            }
        });
}

const findPortfolioByPortfolioId = async (req, res) => {
    const { portfolioId } = req.params;
    await db.query('SELECT * FROM portfolios WHERE portfolio_id = $1', [portfolioId], function (err, result) {
        if (err) {
            res.status(500).send(JSON.stringify(err));
        } else {
            res.status(200).send(JSON.stringify(result.rows));
        }
    });
}


const createPortfolio = async (req, res) => {
    const { uid, portfolioName, localization, portfolioData, preferences } = req.body;
    let prefs = JSON.stringify(preferences);
    let pData = JSON.stringify(portfolioData);

    await db.query('SELECT * FROM portfolios WHERE uid = $1', [uid], function (err, result) {
        if (err) {
            res.status(500).send(JSON.stringify(err));
        } else {
            if (result.rows.length > 0) {
                res.status(200).json(result.rows);
            } else {

                db.query('INSERT INTO portfolios (uid, portfolio_name, localization, portfolio_data, preferences) ' +
                    'VALUES($1, $2, $3, $4, $5) RETURNING uid, portfolio_id, portfolio_name, localization, portfolio_data, preferences',
                    [uid, portfolioName, localization, pData, prefs],
                    (err, results) => {
                        if (err) {
                            res.status(500).send(err.toString());
                        }

                        res.status(201).json(results.rows);
                    })

            }
        }
    });
}

const updatePortfolio = async (req, res) => {
    const { uid, portfolioId, portfolioName, localization, portfolioData, preferences } = req.body;
    let data = JSON.stringify(portfolioData);
    let prefs = JSON.stringify(preferences);

    await db.query(
        'UPDATE portfolios SET portfolio_data = $1, preferences = $2, portfolio_name = $3,' +
        ' localization = $4 WHERE uid = $5 AND portfolio_id = $6',
        [data, prefs, portfolioName, localization, uid, portfolioId],
        (error, results) => {
            if (error) {
                res.status(500).send(error.toString());
            }
            res.status(200).send(JSON.stringify(results));
        }
    )
}

const deletePortfolio = async (req, res) => {
    const { uid, portfolioId, portfolioName, localization, portfolioData, preferences } = req.body;
    await db.query('DELETE FROM portfolios WHERE uid = $1 AND portfolio_id = $2',
        [uid, portfolioId],
        (error, results) => {
            if (error) {
                res.status(500).send(error.toString());
            }
            res.status(200).send('Portfolio: ' + portfolioName + ' was deleted.');
        })
}



/* ------------------------------ Owned Portfolio Assets ------------------------------ */
const updateAssets = async (req, res) => {
    const { portfolioId, assetId } = req.body;
    let data = JSON.stringify(portfolioData);
    let prefs = JSON.stringify(preferences);

    await db.query(
        'UPDATE portfolio_assets SET portfolio_data = $1, preferences = $2, portfolio_name = $3,' +
        ' localization = $4 WHERE uid = $5 AND portfolio_id = $6',
        [data, prefs, portfolioName, localization, uid, portfolioId],
        (error, results) => {
            if (error) {
                res.status(500).send(error.toString());
            }
            res.status(200).send(JSON.stringify(results));
        }
    )
}


module.exports = {
    findAllPortfoliosByUserId,
    findPortfolioByPortfolioId,
    findAllPortfolioIdsByUserId,
    createPortfolio,
    updatePortfolio,
    deletePortfolio
}
