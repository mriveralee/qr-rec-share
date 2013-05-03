
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , CONFIG = require('./config');
//  , mongoStore = require('connect-mongodb')
//  , request = require('request')
//  , async = require('async');


//Express App
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || CONFIG.server_port);
  app.set('views', __dirname + '/views');
  app.set('view engine', CONFIG.template_engine);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.favicon(__dirname + '/public/images/favicon.ico')); 
  
  //Session Management through mongo
  app.use(express.cookieParser()); 
  //app.use(express.session(DB.mongo_session));
  app.use(app.router);

});


app.configure('development', function(){
  app.use(express.errorHandler());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.favicon(__dirname + '/public/images/favicon.ico')); 

});


//Run the Server
var server = http.createServer(app);
server.listen(app.get('port'), function() {
  console.log('\n****\n* SERVER RUNNING ON PORT: ' + app.get('port') + ' *\n****\n');
});


//################ Socket IO ######################//
var io = require('socket.io').listen(server);
io.set('log level', 0);

io.sockets.on('connection', function (socket) {

  // Sends an event to a connected client with the tag 'my server event'
  // socket.emit('my server event', {hello: 'I was sent from the server!'});
  
  // Receives an event from the client with the tag 'my client event;'
  socket.on('my client event', function (data) {
       console.log('Client data received!', data);
       //io.sockets.emit('another-user', data);
  });


  //Set scope on socket functionality
  
});


//################ Routes ######################//



// //Route for uploading sounds to the db
var FU = require('./controllers/fileuploader');
var fileUpload = FU.fileUpload;
var fileUploadMiddleWare = FU.middleware;
var UPLOAD_LOCATION = FU.uploadLocation;
var TEST_FILE_LOC = '';


//Retrieve a sound file
//res.download(path,[filename], [fn]);
//res.sendFile(path, [options], [fn]);
app.get('/getSound', function(req,res) {
  //If we have file path from the DB
  res.sendfile(TEST_FILE_LOC, {root: UPLOAD_LOCATION}, function (err) {
    if(err) {
      console.log('File Send Error: ' + err);
    }
    else {
      console.log('File Sent!');
    }
  });
});

//Retrieve a sound file
app.get('/sound/:id?', function(req,res) {
  var nodeID = req.param('id');
  if (!nodeID) {
    //No id, then send to home page
    res.json(500, { error: 'No Such Sound Exists' });
    //res.redirect('/');
  }
  else {
    //Create callback function to act on the sound file URL
    var sendFileCallback = function(node, errDB) {
      if (errDB) {
        res.json(500, {error:'File Retrieve Error'});
      } 
      else if (node && node.sound_url) {
        //Get File and send it back
        var soundURL = node.sound_url;
        //console.log(node);
        if (soundURL) {
          res.sendfile(soundURL, {root: UPLOAD_LOCATION}, function (err) {
            if(err) {
              console.log('File Send Error: ' + err);
              res.json(404, {error:'File Does Not Exist'});
            }
            else {
              console.log('File Sent!');
            }
          });
        }
      } 
      else {
        res.json(500, {error: 'No Such Sound Exists!'});
      }
    }

    //Tell our DB we need the sound URL
    var shouldRetrieveURL = true;
    //Check database for our sound-node information and return it to our callback
    /// BLAH BLAH

}
});

//Upload a song
app.post('/upload/sound', fileUploadMiddleWare, function(req, res) { 
  console.log(req.body);
  //TODO: MAX FILE SIZE 16713000? If greater, we erase this file and res.send a failure
  var body = req.body;
  if (body) {
    console.log(req.body);
    var hasSound = body.soundFile && body.soundFile.length > 0 && body.soundFile[0].path && body.soundFile[0].basename;
    var hasSoundNode = body.soundNode;

    //Check for our upload components so that we can save this information in our DB
    //As a tree node for the next page refresh
    if (hasSound && hasSoundNode) {
      var soundNode = JSON.parse(body.soundNode);
      var soundFile = body.soundFile[0];
      console.log(soundNode);
      //Log the file path
      var fileName = soundFile.basename;

      var filePath = './' + soundFile.path + fileName;
      console.log('Uploaded File: ' + filePath);
      //Store File location for global access :)
      TEST_FILE_LOC = filePath;


      //Size of the uploaded file
      var fileSize = soundFile.size;
      //Type of the uploaded file
      var fileType = soundFile.type;
      var MAX_UPLOAD_SIZE = 5000000;
      var ALLOWED_FILE_TYPE = 'audio/wav';
      //TODO: if File Size is too large- delete it and return an error
      if (fileSize > MAX_UPLOAD_SIZE || fileType !== ALLOWED_FILE_TYPE || !filePath) {
        res.json(400, {result:'File is invalid!'});
      }
      else {
        //Do something with the sound
      }
    }
  }
  else {
    res.json(400, {result:"Invalid File Upload"});
  }
});






//Main route
app.get('/', function(req, res) {
    var templateVars = {
        //Add some template variables
        PAGE_TITLE: 'Node (Express 3.0.1) & Socket.io Bootstrap'
    };
    //Render the index.ejs file with any template variables
    res.render('index', templateVars);
});


