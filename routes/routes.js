"use strict";
const ctrl = require('../controllers/nlp.controller.js');
module.exports = function(app) {
    app.post('/api/get-result', ctrl.getResult); //Automatically passes req/res.
    // app.post('api/v1/s3/uploadfile', ctrl.uploadObjectS3); //Automatically passes req/res.
};