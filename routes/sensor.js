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
 * Executes query from HTTP GET request on database table SENSOR
 * @param connection - The mysql connection to the database
 * @param req - The request
 * @param req.params.limit - The maximum rows to fetch from the database
 * @param res - The result containing a json array with data matching request parameters
 */
function handleGet(connection,req,res) {
    // Fetch parameter to limit result set rows
    var limit = ('undefined' === typeof req.params.limit) ? 20: req.params.limit;

    // Limit result set to maximum 1000 rows
    if (limit > 1000){limit = 1000;}

    // Construct query
    var query = 'SELECT SENS_Ruid,SENS_Item,SENS_Desc,SENS_Rcre,SENS_Rcha,SENS_Unit,SENS_Prec,SENS_Eid1,SENS_Type FROM SENSOR' +
    ' ORDER BY SENS_Ruid ASC' +
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
 * Executes query from HTTP GET request on database table SENSOR with provided id
 * @param connection - The mysql connection to the database
 * @param req - The request
 * @param res - The result containing a json array of one row with data matching request parameters
 */
function handleFind(connection,req,res) {
    var find = function find(id){
        // Construct query
        var query = 'SELECT SENS_Ruid,SENS_Item,SENS_Desc,SENS_Rcre,SENS_Rcha,SENS_Unit,SENS_Prec,SENS_Eid1,SENS_Type FROM SENSOR' +
            ' WHERE SENS_Ruid=' + connection.escape(id) + ';';

        // Execute query
        connection.query(query, function handleSql(err, rows) {
            if (err){ logAndRespond(err,res); return; }
            if (rows.length === 0){ res.send(204); return; }
            res.send({
                result: 'success',
                err:    '',
                id:     id,
                json:   rows[0],
                length: 1
            });
            connection.release();
        });
    };
    var cacheFind = req.cache(find, { async: true, maxAge: 1000*60, preFetch: true });
    cacheFind(req.params.id);
}

/**
 * Executes query from HTTP POST request on database table SENSOR
 * @param connection - The mysql connection to the database
 * @param req - The request
 * @param res - The result
 */
function handleIns(connection,req,res) {
    // Construct query
    var query = 'INSERT INTO SENSOR SET ' +
        'SENS_Item=' + connection.escape(req.body.SENS_Item) + ',' +
        'SENS_Desc=' + connection.escape(req.body.SENS_Desc) + ',' +
        'SENS_Unit=' + connection.escape(req.body.SENS_Unit) + ',' +
        'SENS_Prec=' + connection.escape(req.body.SENS_Prec) + ',' +
        'SENS_Eid1=' + connection.escape(req.body.SENS_Eid1) + ',' +
        'SENS_Type=' + connection.escape(req.body.SENS_Type);

    // Execute query
    connection.query(query, function handleSql(err, result) {
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