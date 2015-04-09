var logAndRespond = function logAndRespond(err,res,status){
    console.error(err);
    res.statusCode = ('undefined' === typeof status ? 500 : status);
    res.send({
        result: 'error',
        err:    err.code
    });
};
var handleConnection = function handleConnection(callback,req,res){
    req.mysql.getConnection(function(err,connection){
        if (err){ logAndRespond(err,res); return; }
        callback(connection,req,res);
    });
};

/**
 * Executes query from HTTP GET request on database table SENSORDATA
 * @param connection - The mysql connection to the database
 * @param req - The request
 * @param req.params.limit - The maximum rows to fetch from the database
 * @param req.params.sens_ruid - The sensor ruid to fetch data for
 * @param res - The result containing a json array with data matching request parameters
 */
function handleGet(connection,req,res) {
    // Fetch parameter to limit result set rows
    var limit = ('undefined' === typeof req.params.limit) ? 20: req.params.limit;

    // Fetch sensor to get data for
    var sens_ruid = ('undefined' === typeof req.params.sens_ruid) ? 0: req.params.sens_ruid;

    // Limit result set to maximum 1000 rows
    if (limit > 1000){limit = 1000;}

    // Construct query
    var query = 'SELECT SEDA_Ruid,SEDA_Eid1,SEDA_Eid2,SEDA_Valu,SEDA_Rcre FROM SENSORDATA';
    if (sens_ruid != 0){
        query = query + ' WHERE SEDA_Eid1=' + connection.escape(sens_ruid);
    }
    query = query + ' ORDER BY SEDA_Rcre DESC' +
    ' LIMIT ' + connection.escape(limit) + ';';

    // Execute query
    connection.query(query, function handleSql(err, rows) {
        if (err){ logAndRespond(err,res); return; }
        if (rows.length === 0){ res.send(204); return; }
        res.send({
            result: 'success',
            err:    '',
            json:   rows,
            length: rows.length
        });
        connection.release();
    });
}

/**
 * Executes query from HTTP GET request on database table SENSORDATA with provided id
 * @param connection - The mysql connection to the database
 * @param req - The request
 * @param req.params.limit - The maximum rows to fetch from the database
 * @param req.params.from_datetime - From datetime
 * @param req.params.to_datetime - To datetime
 * @param res - The result containing a json array with data matching request parameters
 */
function handleFind(connection,req,res) {
    var find = function find(id){
        // Fetch parameter to limit result set rows
        var limit = ('undefined' === typeof req.params.limit) ? 1: req.params.limit;

        // Fetch parameter to query from a specific datetime
        var from = ('undefined' === typeof req.params.from_datetime) ? 'DATE_SUB(NOW(), INTERVAL 1 DAY)': req.params.from_datetime;

        // Fetch parameter to query to a specific datetime
        var to = ('undefined' === typeof req.params.to_datetime) ? 'NOW()': req.params.to_datetime;

        // Limit result set to maximum 1000 rows
        if (limit > 1000){limit = 1000;}

        // Construct query
        var query = 'SELECT SEDA_Ruid,SEDA_Eid1,SEDA_Eid2,SEDA_Valu,SEDA_Rcre FROM SENSORDATA' +
            ' WHERE SEDA_Eid1=' + connection.escape(id) +
            ' AND SEDA_Rcre>=' + connection.escape(from) +
            ' AND SEDA_Rcre<=' + connection.escape(to) +
            ' ORDER BY SEDA_Rcre DESC' +
            ' LIMIT ' + connection.escape(limit) + ';';

        // Execute query
        connection.query(query, function handleSql(err, rows) {
            if (err){ logAndRespond(err,res); return; }
            if (rows.length === 0){ res.send(204); return; }
            res.send({
                result: 'success',
                err:    '',
                id:     id,
                json:   rows,
                length: rows.length
            });
            connection.release();
        });
    };
    var cacheFind = req.cache(find, { async: true, maxAge: 1000*60, preFetch: true });
    cacheFind(req.params.id);
}
function handleIns(connection,req,res) {
    connection.query('INSERT INTO x SET ?', req.body, function handleSql(err, result) {
        if (err){ logAndRespond(err,res); return; }
        res.statusCode = 201;
        res.send({
            result: 'success',
            err:    '',
            id:     result.insertId
        });
        connection.release();
    });
}
function handleUpd(connection,req,res) {
    connection.query('UPDATE x SET ? WHERE SENS_Ruid='+req.params.id, req.query, function handleSql(err) {
        if (err){ logAndRespond(err,res); return; }
        handleFind(connection,req,res)
    });
}
function handleDel(connection,req,res) {
    connection.query('DELETE FROM x WHERE SENS_Ruid = ?', req.params.id, function handleSql(err) {
        if (err){ logAndRespond(err,res); return; }
        res.send({
            result: 'success',
            err:    '',
            id:     req.params.id
        });
        connection.release();
    });
}
exports.get = function(req,res){
    handleConnection(handleGet,req,res);
};
exports.find = function(req,res){
    handleConnection(handleFind,req,res);
};
exports.ins = function(req,res){
    handleConnection(handleIns,req,res);
};
exports.upd = function(req,res){
    handleConnection(handleUpd,req,res);
};
exports.del = function(req,res){
    handleConnection(handleDel,req,res);
};