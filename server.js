"use strict"; //For use with ES6

const express = require('express');
const app = express();
const fs = require('fs');

const options = {
    key: fs.readFileSync('./security/prescience-server.local-dummy.key'),
    cert: fs.readFileSync('./security/prescience-server.local.crt'),
    requestCert: false,
    rejectUnauthorized: false
};

var server = require('https').createServer(options, app);

const morgan = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');
// const mongoose = require('mongoose');

app.use(morgan('dev')); // log with Morgan

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(methodOverride());
app.use(cors()); //enable CORS

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Mount our route file that we have yet to create.   Note how we pass the instance of 'app' to the route.
const appRoutes = require('./routes/routes.js')(app)

server.listen(5000, () => {
    console.log('Server listening at port 5000');
});