const db = require('../db').client;

/* ---------------------------- Portfolio Component Parts ------------------------------ */

const findPartByComponentId = async (req, res) => {
    const { cid } = req.params;
    await db.query('SELECT * FROM portfolio_components WHERE component_id = $1', [cid], function (err, result) {
        if (err) {
            res.status(500).send(JSON.stringify(err));
        } else {
            res.status(200).send(JSON.stringify(result.rows));
        }
    });
}


const createPart = async (req, res) => {
    const { componentName, creatorName, assetIds, uiParts } = req.body;
    let ids = JSON.stringify(assetIds);
    let parts = JSON.stringify(uiParts);

    await db.query('INSERT INTO portfolio_components (component_name, creator_name, asset_ids, ui_parts) ' +
        'VALUES($1, $2, $3, $4) RETURNING component_id, component_name, creator_name, asset_ids, ui_parts',
        [componentName, creatorName, ids, parts],
        (err, results) => {
            if (err) {
                res.status(500).send(err.toString());
            }

            res.status(201).json(results.rows);
        });
}

const updatePart = async (req, res) => {
    const { componentId, componentName, creatorName, assetIds, uiParts } = req.body;
    let ids = JSON.stringify(assetIds);
    let parts = JSON.stringify(uiParts);

    await db.query(
        'UPDATE portfolio_components SET component_name = $1, creator_name = $2, asset_ids = $3,' +
        ' ui_parts = $4 WHERE component_id = $5',
        [componentName, creatorName, ids, parts, componentId],
        (error, results) => {
            if (error) {
                res.status(500).send(error.toString());
            }
            res.status(200).send(JSON.stringify(results));
        }
    );
}

module.exports = {
    findPartByComponentId,
    createPart,
    updatePart
}