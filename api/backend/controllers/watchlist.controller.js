const db = require('../db')
/* ------------------------------------- Watchlist Controller -------------------------------------------- */

const findAllWatchListsInfoByUserId = async (req, res) => {
    const { uid } = req.params;
    await db.query('SELECT uid AS "uid", watch_list_id AS "watchListId", watch_list_name AS "watchListName", is_main_watch_list AS "isMain" ' +
        'FROM watch_lists WHERE uid = $1', [uid],
        function (err, result) {
            if (err) {
                const error = { error: err, message: 'Error retrieving watchlists info...' };
                res.status(500).send(JSON.stringify(error));
            } else {
                res.status(200).send(JSON.stringify(result.rows));
            }
        });
}


const findWatchList = async (req, res) => {
    const { uid, watchListId, watchListName, isMain } = req.body;
    await db.query('SELECT uid AS "uid", watch_list_id AS "watchListId", watch_list_name AS "watchListName", ' +
        'watch_list_data AS "watchListData", is_main_watch_list AS "isMain" ' +
        'FROM watch_lists WHERE watch_list_id = $1 AND uid = $2', [watchListId, uid], function (err, result) {
            if (err) {
                res.status(500).send(JSON.stringify(err));
            } else {
                res.status(200).send(JSON.stringify(result.rows));
            }
        });

}

const findNextWatchlistId = async (req, res) => {
    await db.query('SELECT MAX(watch_list_id) FROM watch_lists',
        [],
        function (err, result) {
            if (err) {
                res.status(500).send(JSON.stringify(err));
            } else {
                res.status(200).send({ 'watchListId': result.rows[0].max + 1 });
            }
        });

}


const createWatchList = async (req, res) => {
    const { uid, watchListId, watchListName, watchListData, isMain } = req.body;
    let data = JSON.stringify(watchListData);

    await db.query('INSERT INTO watch_lists (uid, watch_list_id, watch_list_name, watch_list_data, is_main_watch_list) ' +
        'VALUES($1, $2, $3, $4, $5) RETURNING uid AS "uid", watch_list_id AS "watchListId", ' +
        'watch_list_name AS "watchListName", watch_list_data AS "watchListData", ' +
        'is_main_watch_list AS "isMain"',
        [uid, watchListId, watchListName, data, isMain],
        function (err, results) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                res.status(200).json(results.rows);
            }

        });
}

const updateWatchList = async (req, res) => {
    const { uid, watchListId, watchListName, watchListData, isMain } = req.body;
    let data = JSON.stringify(watchListData);

    await db.query(
        'UPDATE watch_lists SET watch_list_data = $1, watch_list_name = $2, is_main_watch_list = $5 ' +
        'WHERE uid = $4 AND watch_list_id = $3 RETURNING uid AS "uid", watch_list_id AS "watchListId", ' +
        'watch_list_name AS "watchListName", watch_list_data AS "watchListData", ' +
        'is_main_watch_list AS "isMain"',
        [data, watchListName, watchListId, uid, isMain],
        (error, results) => {
            if (error) {
                res.status(500).send(error.toString());
            } else {
                res.status(200).json(results.rows);
            }
        }
    )
}


const deleteWatchlist = async (req, res) => {
    const { uid, watchListId, watchListName, watchListData, isMain } = req.body;
    await db.query('DELETE FROM watch_lists WHERE uid = $1 AND watch_list_id = $2',
        [uid, watchListId],
        (error, results) => {
            if (error) {
                res.status(500).send(error.toString());
            } else {
                res.status(200).send(JSON.stringify('Watchlist: ' + watchListName + ' was deleted.'));

            }
        })
}

const updateMainWatchList = async (req, res) => {
    const { uid, watchListId, watchListName, watchListData, isMain } = req.body;

    await db.query(
        'UPDATE watch_lists SET is_main_watch_list = false ' +
        'WHERE uid = $1',
        [uid])

    await db.query('UPDATE watch_lists SET is_main_watch_list = true ' +
        'WHERE uid = $1 AND watch_list_id = $2',
        [uid, watchListId],
        (error, results) => {
            if (error) {
                res.status(500).send(error.toString());
            } else {
                res.status(200).send(JSON.stringify('Watchlist: ' + watchListName + ' was set to Main.'));

            }
        })
}



module.exports = {
    findAllWatchListsInfoByUserId,
    findNextWatchlistId,
    findWatchList,
    createWatchList,
    updateWatchList,
    deleteWatchlist,
    updateMainWatchList
}
