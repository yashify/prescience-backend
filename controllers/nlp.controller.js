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

let processTokens = function (tokens, callback) {

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
    
    processQueryFromToken(queryParams, function(data){
        callback(data);
    });    
}

let processQueryFromToken = function (queryParams, callback) { 
    let res = {};
    let queryToRun = "";
    // console.log(queryParams['dept']);
    if (queryParams['dept']) {
        switch (queryParams['dept']) {
            case "sales":
                queryToRun = "SELECT client, SUM(value) as revenue FROM `sales` GROUP BY client";
                executeQuery(queryToRun, queryParams['tenure'], function(data, err){
                    if (!err){
                        if (data.length > 0){
                            res.code = 200;

                            let categories = [];
                            let cat_data = [];
                            data.forEach(function (element) {
                                categories.push(element.client);
                                cat_data.push(element.revenue);
                            });

                            res.data = {
                                "categories": categories,
                                "data": cat_data
                            };
                            res.title = "Overall Sales report of Clients";
                            res.xAxis = "Revenue";
                            res.viz_type = "bar"
                        } else {
                            res.code = 400;
                        }
                        callback(res);
                    } else {
                        console.log(err);
                    }
                });
                break;

            case "hr":
                if (queryParams['tenure']){
                    queryToRun = "SELECT domain, COUNT(id) as total_placed FROM `hr` where value = 1 AND month = ? GROUP BY domain";
                    // executeQuery(queryToRun);
                    executeQuery(queryToRun, queryParams['tenure'], function (data, err) {
                        if (!err) {
                            if (data.length > 0) {
                                res.code = 200;
                                let graphData = [];
                                data.forEach(function (element) {
                                    graphData.push({
                                        "name": element.domain,
                                        "y": element.total_placed
                                    });
                                })
                                res.data = graphData;
                                res.dataset_name = "Domain";
                                res.viz_type = "pie"
                            } else {
                                res.code = 400;
                            }
                            callback(res);
                        } else {
                            console.log(err);
                        }
                    });
                }
                break;

            case "finance":
                if (queryParams['tenure']) {
                    queryToRun = "SELECT asset, value as total_expend FROM `finance` where month = '" + queryParams['tenure'] + "'";
                    // executeQuery(queryToRun);
                    executeQuery(queryToRun, queryParams['tenure'], function (data, err) {
                        if (!err) {
                            if (data.length > 0) {                            
                                res.code = 200;
                                let categories = [];
                                let cat_data = [];
                                data.forEach(function(element){
                                    categories.push(element.asset);
                                    cat_data.push(element.total_expend);
                                });
                                res.data = {
                                    "categories": categories,
                                    "data": cat_data
                                };
                                res.title = "Finance report for the month of " + queryParams['tenure'];
                                res.yAxis = "Assets";
                                res.viz_type = "column"
                            } else {
                                res.code = 400;
                            }
                            callback(res);
                        } else {
                            console.log(err);
                        }
                    });
                }
                break;
        
            default:
                res.code = 400;
                callback(res);
                break;
        }
    }
}

let executeQuery = function (queryToRun, tenure, callback) {    
    console.log(queryToRun);
    mysql_conn.query(queryToRun, [tenure], function (err, rows, fields) {
        if (!err){       
            callback(rows, null);
        } else{
            console.log('Error while performing Query.');
            callback(null, err);
        }
    });
}

let controller = {
    getResult: function (req, res) {

        let reqData = req.body;
        
        let stemRes = tokenizer.tokenize(reqData.text);
        stemRes = stemRes.map(v => v.toLowerCase());

        console.log(stemRes);

        processTokens(stemRes, function(data){
            res.json(data);
        });
    }
};

module.exports = controller;
