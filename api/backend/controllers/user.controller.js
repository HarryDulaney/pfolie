const db = require('../db')
/* ------------------------------ App User ------------------------------ */

const getAppUserById = async (req, res) => {
    const { uid } = req.params;
    await db.query('SELECT * FROM app_users WHERE uid = $1', [uid], function (err, result) {
        if (err) {
            res.status(500).send(JSON.stringify(err));
        } else {
            res.status(200).send(JSON.stringify(result.rows));
        }
    });
}


module.exports = {
    getAppUserById
}