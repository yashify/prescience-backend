"use strict";

const natural = require('natural');
const q = require('q');
const mysql = require('mysql'); 
const mysql_conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "maximess",
    database: "prescience"
});

mysql_conn.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});
// let stemmer = natural.PorterStemmer;
let tokenizer = new natural.WordTokenizer();
// const fs = require('fs');

let processTokens = function (tokens) {

    let dept = ["hr", "sales", "finance"];
    let tenure = ["january", "february", "march", "april", "may", "june", "july", 
                    "august", "september", "october", "november", "december",
                    "q1", "q2", "q3", "q4"];

    let queryParams = [];    
    
    let filtered_dept = tokens.filter(element => dept.includes(element) ? element : "");
    filtered_dept = filtered_dept != "" ? filtered_dept[0] : "";

    let filtered_tenure = tokens.filter(element => tenure.includes(element) ? element : "");
    filtered_tenure = filtered_tenure != "" ? filtered_tenure[0] : "";

    console.log(filtered_dept, filtered_tenure);

    queryParams['dept'] = filtered_dept;
    queryParams['tenure'] = filtered_tenure;

    
    let res = processQueryFromToken(queryParams);
    
    console.log("processQueryFromToken", res);
    return res;
    
}

let processQueryFromToken = function (queryParams) {
    let res = [];
    let queryToRun = "";
    // console.log(queryParams['dept']);
    if (queryParams['dept'] && queryParams['tenure']) {
        switch (queryParams['dept']) {
            case "sales":
                queryToRun = "SELECT client, value as onboard FROM `sales` where month = ?";
                executeQuery(queryToRun, queryParams['tenure'], function(data, err){
                    if (!err){
                        return data;
                    } else {
                        console.log(err);
                    }
                });
                break;

            case "hr":
                queryToRun = "SELECT domain, COUNT(id) as total_placed FROM `hr` where value = 1 AND month = '" + queryParams['tenure'] + "' GROUP BY domain";
                executeQuery(queryToRun);
                break;

            case "finance":
                queryToRun = "SELECT asset, value as total_expend FROM `finance` where month = '" + queryParams['tenure'] + "'";
                executeQuery(queryToRun);
                break;
        
            default:
                break;
        }
    }

    console.log("response", res);
    
    return res;
}

let executeQuery = function (queryToRun, tenure, callback) {    
    console.log(queryToRun);
    mysql_conn.query(queryToRun, function (err, rows, fields) {
        if (!err){
            console.log('The solution is: ', rows);            
            callback(null, rows);
        } else{
            console.log('Error while performing Query.');
            callback(err, null);
        }
    });
}


let controller = {
    getResult: function (req, res) {

        let reqData = req.body;
        
        let stemRes = tokenizer.tokenize(reqData.text);
        stemRes = stemRes.map(v => v.toLowerCase());

        console.log(stemRes);

        let processRes = processTokens(stemRes);

        res.json(processRes);

        
        // let s3 = new AWS.S3();
        // let params = {
        //     Bucket: 'myBucket',
        //     Key: req.body.key
        // };
        // let doc = fs.createWriteStream(req.body.filepath);
        // s3.getObject(params, (err, data) => {
        //         if (err) {
        //             return res.status(401).send(err);
        //         }
        //     })
        //     .createReadStream()
        //     .pipe(res);


    },
    uploadObjectS3: function(req, res) {

        // let body = fs.createReadStream(req.body.filepath);
        // var s3obj = new AWS.S3({
        //     params: {
        //         Bucket: 'myBucket',
        //         Key: req.body.key
        //     }
        // });
        // s3obj.upload({
        //         Body: body
        //     })
        //     .send(function(err, data) {
        //         if (err) {
        //             res.status(401).send(err);
        //         }
        //         res.status(200).send(data);
        //     });

    }
};
module.exports = controller;