//Route for uploading sounds to the db
var fs = require('fs');  //File system 
var format = require('util').format;
var UPLOAD_LOCATION = 'uploads/sounds';
var fileUpload = require('fileupload').createFileUpload(UPLOAD_LOCATION);
var fileUploadMiddleWare = fileUpload.middleware;



exports.fileUpload = fileUpload;
exports.middleware = fileUploadMiddleWare;
exports.uploadLocation = UPLOAD_LOCATION;