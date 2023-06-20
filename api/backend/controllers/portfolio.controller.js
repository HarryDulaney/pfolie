const db = require('../db')
/* ------------------------------ Portfolio Controller ------------------------------ */
const findAllPortfoliosInfoByUserId = async (req, res) => {
    const { uid } = req.params;
    await db.query('SELECT uid AS "uid", portfolio_id AS "portfolioId", portfolio_name as "portfolioName", is_main_portfolio AS "isMain" ' +
        'FROM portfolios WHERE uid = $1'
        , [uid],
        function (err, result) {
            if (err) {
                const error = { error: err, message: 'Error retrieving portfolios info...' };
                res.status(500).send(JSON.stringify(error));
            } else {
                res.status(200).send(JSON.stringify(result.rows));
            }
        });
}


const findPortfolioByPortfolioId = async (req, res) => {
    const { uid, portfolioId, portfolioName, isMain } = req.body;
    await db.query('SELECT uid AS "uid", portfolio_id AS "portfolioId", portfolio_name AS "portfolioName", ' +
        'portfolio_data AS "portfolioData", is_main_portfolio AS "isMain"' +
        'FROM portfolios WHERE uid = $1 AND portfolio_id = $2 ',
        [uid, portfolioId],
        function (err, result) {
            if (err) {
                res.status(500).send(JSON.stringify(err));
            } else {
                res.status(200).send(JSON.stringify(result.rows));
            }
        });

}


const findNextPortfolioId = async (req, res) => {
    await db.query('SELECT MAX(portfolio_id) FROM portfolios',
        [],
        function (err, result) {
            if (err) {
                res.status(500).send(JSON.stringify(err));
            } else {
                res.status(200).send({ 'portfolioId': result.rows[0].max + 1 });
            }
        });

}


const createPortfolio = async (req, res) => {
    const { uid, portfolioId, portfolioName, portfolioData, isMain } = req.body;
    let data = JSON.stringify(portfolioData);

    await db.query('INSERT INTO portfolios (uid, portfolio_id, portfolio_name, portfolio_data, is_main_portfolio) ' +
        'VALUES($1, $2, $3, $4, $5) RETURNING uid AS "uid", portfolio_id AS "portfolioId", ' +
        'portfolio_name AS "portfolioName", portfolio_data AS "portfolioData", ' +
        'is_main_portfolio AS "isMain"',
        [uid, portfolioId, portfolioName, data, isMain],
        function (err, results) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                res.status(200).json(results.rows);
            }

        });
}

const updatePortfolio = async (req, res) => {
    const { uid, portfolioId, portfolioName, portfolioData, isMain } = req.body;
    let data = JSON.stringify(portfolioData);

    await db.query(
        'UPDATE portfolios SET portfolio_data = $1, portfolio_name = $2, is_main_portfolio = $5 ' +
        'WHERE uid = $4 AND portfolio_id = $3 RETURNING uid AS "uid", portfolio_id AS "portfolioId", ' +
        'portfolio_name AS "portfolioName", portfolio_data AS "portfolioData", ' +
        'is_main_portfolio AS "isMain"',
        [data, portfolioName, portfolioId, uid, isMain],
        (error, results) => {
            if (error) {
                res.status(500).send(error.toString());
            } else {
                res.status(200).json(results.rows);
            }
        }
    )
}

const deletePortfolio = async (req, res) => {
    const { uid, portfolioId, portfolioName, portfolioData, isMain } = req.body;
    await db.query('DELETE FROM portfolios WHERE uid = $1 AND portfolio_id = $2',
        [uid, portfolioId],
        (error, results) => {
            if (error) {
                res.status(500).send(error.toString());
            } else {
                res.status(200).send(JSON.stringify('Portfolio: ' + portfolioName + ' was deleted.'));

            }
        })
}


const updateMainPortfolio = async (req, res) => {
    const { uid, portfolioId, portfolioName, portfolioData, isMain } = req.body;

    await db.query(
        'UPDATE portfolios SET is_main_portfolio = false ' +
        'WHERE uid = $1',
        [uid])

    await db.query('UPDATE portfolios SET is_main_portfolio = true ' +
        'WHERE uid = $1 AND portfolio_id = $2',
        [uid, portfolioId],
        (error, results) => {
            if (error) {
                res.status(500).send(error.toString());
            } else {
                res.status(200).send(JSON.stringify('Portfolio: ' + portfolioName + ' was set to Main.'));

            }
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
    findPortfolioByPortfolioId,
    findAllPortfoliosInfoByUserId,
    findNextPortfolioId,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    updateMainPortfolio
}
