//Phase Change Namespace
PC = {
    Constants: {
      HOVER_VIEW_ID: '#node-hover-view'
    },
    Config: {
        SHOULD_UPLOAD: false,
        SAVE_RECORDED_FILES: false,
        IS_SLIDER_HIDDEN: true,
        HAS_FILE_FOR_UPLOAD: false,
		IS_EQ_ON: true
    },
    TREES: {
      '0': []
    },
    NODE_DATA: {

    },
    NEEDS_FIRST_SOUND: false,
    PLAY_TIMER: null,
    RECORDING_COLORS: [
      0x106587,
    ],
    RAND_PATH_LIST: {},
    RAND_PATH_COUNT: 0,
};



var THE_TREE_MODEL;


$(document).ready(function() {

  //##################################################################//
  //############################## DEMO ##############################//
  //##################################################################//

  /* 
   * Initializes demo functionality 
   */
  var initDemo = function() {

      // //grab tree ID from URL
      // var currentTreeID = getCurrentTreeID();
      // if (currentTreeID !== "") {
      //   THE_TREE_MODEL = new PC.SoundTreeModel({id: currentTreeID});
      // }

  }

  //Start Demo
  initDemo();

  //##################################################################//
  //######################### DOM LISTENERS ##########################//
  //##################################################################//
  //Hover for upload button
  $('#upload-control-button-container').click(showUploadFields);
  // $('#upload-control-button-container').hover(
  //   function() {
  //     //Hover in
  //     //console.log('hovered!');
  //     //$('#upload-arrow-block').css({'background-color': 'rgb(97,97,97)'});
  //     //$('#upload-arrow').css({'border-bottom': '15px solid rgb(97,97,97)'});

  // }, function() {
  //     //Hover Out
  //     $('#upload-arrow-block').css({'background-color': 'rgb(65, 65, 65)'});
  //     $('#upload-arrow').css({'border-bottom': '15px solid rgb(65, 65, 65)'});
  // });
  ///Upload Window buttons
  $('#submit-upload').click(submitUpload);
  $('#cancel-upload').click(cancelUpload);




  // User Data View listeners
  $('#user-img-container').click(showUserDataView);
  $('#modal-overlay').click(
      function() {
        hideUserDataView();
        cancelUpload()
        cancelCreateTree();
  });


  //Recording Control Panel Buttons
  $('#record-button-container').click(function() { 
   if (isRecording) {
      stopRecorder();
    }
    else {
      startRecorder();
    }
    toggleIsRecording();
  });

  PC.isPlaying = false;
  $('#play-button-container').click(function() { 
     console.log('play button!');
     togglePlayAllSounds(nodeListForDrawing, true);
  });


}); //End Document.ready
/////////////////////////////////////////////////////////////////////
/////////////////// END DOCUMENT READY FOR LISTENERS ////////////////
/////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////
//------------------------ BEGIN APP FUNCTIONS --------------------//
/////////////////////////////////////////////////////////////////////

///Toggle playback of songs
var togglePlayAllSounds = function(nodePathList, shouldPlayRecording) {
    if (PC.PLAY_TIMER) {
        window.clearTimeout(PC.PLAY_TIMER);
    }
    nodeListForDrawing = (nodePathList) ? nodePathList : nodeListForDrawing;
    if (PC.isPlaying) {
      stopPreviousPathSounds();
      $('#stop-container').css({display: 'none'});
      $('#play-arrow-right').css({display: 'block'});
      PC.isPlaying = false;
    }
    else {
      PC.isPlaying = true;
      playSoundsForPath(nodeListForDrawing);
      
      if (shouldPlayRecording) {
        playSelectedRecording();
      }
      $('#stop-container').css({display: 'block'});
      $('#play-arrow-right').css({display: 'none'});
      
      //console.log(MAX_DURATION);
      PC.PLAY_TIMER = setTimeout(function() {
          console.log('playback finished');
          stopPreviousPathSounds();
          $('#stop-container').css({display: 'none'});
          $('#play-arrow-right').css({display: 'block'});
          }, MAX_DURATION * 1000);
    } 
  }

//Check if a sound is playing
var checkIsPlaying = function() {
  return PC.isPlaying;
};


// Upload audio field functions moved out from uploadhover.js
var showUploadFields = function(){
  if (PC.Config.HAS_FILE_FOR_UPLOAD) {
    if (!getFBUser()) {
      FB_API.login(showUploadFields);
      return;
    }
    //console.log("upload window shown");

    var user = getFBUser();
    var name = user.name;
    var picture = user.picture;
    var currDate = getDateString(new Date().getTime());
  
    $('#upload-text-window').css("display", "block");
    $('#upload-text-window').animate({top: '20%'}, 0);
    $('#upload-prof-pic').attr({src: picture});
    $('#upload-username').html(name);
    $('#upload-date').html(currDate);
    $('#modal-overlay').css('display', 'block');
  }
};

var hideUploadFields = function() {
  $('#upload-text-window').animate({top: '-1000px'}, 0);
  $('#modal-overlay').css('display', 'none');
};

var clearUploadFields = function() {
  $('#upload-title').val('');
  $('#upload-artist').val('');
};



var submitUpload = function(){
  //console.log('upload submitted');
 // $('#upload-text-window').css("display", "none");
  hideUploadFields();
  //Save File to the desktop and upload to the server!
  saveAs(masterRecording, "sound.wav");

};

var cancelUpload = function(){
  //console.log('upload canceled');
 // $('#upload-text-window').css("display", "none");
  hideUploadFields();
};



var showUserDataView = function() {
  if (!getFBUser()) {
      FB_API.login(showUserDataView);
      return;
  }

  var user = getFBUser();
  var name = user.name;
  var picture = user.picture;
  $('#user-data-window').css("display", "block");
  $('#user-data-window').animate({top: '11%'}, 0);
  $('#modal-overlay').css('display', 'block');
  $('#user-data-prof-pic').attr({src: picture});
  $('#user-data-username').text(name);


  //TODO: Get the user trees
  $.ajax({
    type: 'GET',
    url: '/nodes/'+user.id,
    success: function(data, status, req) {
      //console.log(data);
      for (var i = 0; i < data.length; i++) {
        var node = data[i]; 
        var title = removeHTMLTags(node.title);
        var date = getDateString(node.date_created);
        var nodeID = node.node_id;
        var treeID = node.tree_id;
        insertUserNodeListItem(title, date, nodeID, treeID);
      }
    },
    error: function(req, status, error){
      console.log(error);
      //TODO: error uploading the tree
    },
  });

  //TODO: Get the User 
  $.ajax({
    type: 'GET',
    url: '/trees/'+user.id,
    success: function(data, status, req) {
      //console.log(data);
      for (var i = 0; i < data.length; i++) {
        var tree = data[i];
        var title = removeHTMLTags(tree.title);
        var date = getDateString(tree.date_created);
        var treeID = tree.tree_id;
        insertUserTreeListItem(title, date, treeID);
      }
    },
    error: function(req, status, error){
      console.log(error);

      //TODO: error uploading the tree
    },
  });

  //console.log('Show User Data Fields!');
};

var hideUserDataView = function() {
  $('#user-data-nodes-list').html('');
  $('#user-data-trees-list').html('');
  $('#user-data-window').animate({top: '-1000px'}, 0);
  $('#modal-overlay').css('display', 'none');
};



//Inserts a list item for user's tree (for showing which trees a user has made)
var insertUserNodeListItem = function(title, date, nodeID, treeID) {
  //console.log(nodeShareID);
  var nodeShareID = 'node-share-' + nodeID;
  var treeShareID = 'tree-share-' + treeID;
  var linkURL = window.location.origin + '/' + '?tree=' + treeID + '&selected=' + nodeID;
  //console.log(linkURL);
  var listItem = '<span class="user-data-list-item">' +
    '<span class="v-mid">'+ '<a href="' + linkURL + '" target="_blank"><em>' + title + '</em>, ' + date + '</a></span>' +
    '<img id="' + nodeShareID + '" class="user-data-share-icon v-mid" src="/images/fb.png"></span>';
  
  $('#user-data-nodes-list').append(listItem);
  //console.log(nodeID);
  addShareNodeListener(title, nodeID, treeID, nodeShareID);
};

//Adds a listener for the fb link in the user's nodes section
var addShareNodeListener = function(title, nodeID, treeID, divID) {
  $('#' + divID).click(function() {
    postNodeToFeed(title, nodeID, treeID);
  });
};

//Inserts a list item for user's nodes (for showing which trees a user has made)
var insertUserTreeListItem = function(title, date, treeID) {
  var treeShareID = 'tree-share-' + treeID;
  var linkURL = window.location.origin + '/' + '?tree=' + treeID;
  //console.log(linkURL);
  var listItem = '<span class="user-data-list-item">' +
    '<span class="v-mid">'+ '<a href="'+ linkURL + '" target="_blank"><em>' + title + '</em>, ' + date + '</a></span>' +
    '<img id="' + treeShareID + '" class="user-data-share-icon v-mid" src="/images/fb.png"></span>';
  
  $('#user-data-trees-list').append(listItem);
  addShareTreeListener(title, treeID, treeShareID);
};

var postNodeToFeed = function(title, nodeID, treeID) {
  var name = getFBUser().name;
  var currentDomain = (window.location.host !== 'localhost:8000') ? window.location.host : 'mriveralee.phase-change.jit.su';
  var picURL = 'http://'+currentDomain+'/images/logo_48.png';
  //console.log(currentDomain);
  // calling the API ...
  var obj = {
    method: 'feed',
    link: currentDomain + '/?tree=' + treeID+'&selected='+nodeID,
    picture: picURL,
    name: 'Listen to my awesome sound, ' + title + '!',
    caption: 'Phase Change',
    description: name + ' collaborated on a sound. Have a listen!'
  };

  // push user data window behind modal overlay when fb pop comes up
  $('#user-data-window').css('z-index', 10000);
  function callback(response) {
    //console.log( "Post ID: " + response['post_id']); // post id of fb post if posted
    //console.log('posters gonna post' + treeID);
    // push user data window back onto of modal overlay when fb popup closes
    $('#user-data-window').css('z-index', 11000);
  }
  FB.ui(obj, callback);
};












//##################################################################//
//######################### Audio Processing #######################//
//##################################################################//

////Dave's Audio Recording variables / Web Audio variables
var recorder;
var mediaStreamSource;
var context = new webkitAudioContext();
var jsn = context.createScriptProcessor(4096, 2, 2);
var isRecording = false;
var selectedRecording;
var recordingSource;
var MIC_ALLOWED = false;

//Visualization variables
var processor = context.createScriptProcessor(2048, 2, 2);
processor.connect(context.destination);
//Connection play all to processor

var analyser = context.createAnalyser();
analyser.smoothingTimeConstant = 0.3;
analyser.fftSize = 1024;
analyser.connect(processor);

var analyserL = context.createAnalyser();
analyserL.smoothingTimeConstant = 0.3;
analyserL.fftSize = 1024;
//Is this connection necessary? check API
analyserL.connect(processor);

var analyserR = context.createAnalyser();
analyserR.smoothingTimeConstant = 0.3;
analyserR.fftSize = 1024;
//Is this connection necessary? check API
analyserR.connect(processor);

var splitter = context.createChannelSplitter();
splitter.connect(analyserL, 0, 0);
splitter.connect(analyserR, 1, 0);

//Chanfed max sample length to 30 seconds
var MAX_LENGTH = 30*44100;
var MAX_DURATION = 30;
var PLAY_START_TIME = 0;
var amps = [];
var max = 1;
var recordingMonitorOn = false;
var nodeListForDrawing = [];
var FREQUENCY_BANDS = [];
var grd;
var RECORDING_TIMER;
var RECORDING_IS_HOVERED = false;

var RW_WHEN = 0;
var RW_OFFSET = 0;
var RW_DURATION = -1;
var RP_WHEN = 0;
var RP_OFFSET = 0;
var RP_DURATION = -1;

var SELECTED_RECORDING_DURATION = 0; //this is set when the rec. draws?
var RECORDING_WOD_VALS = [];
var MOUSEDOWN_X = 0;
var MOUSEDOWN = false;
var FRONT_TRIM_X = 0;
var BACK_TRIM_X = 0;
var AREA_GRABBED = "";

//Audio housekeeping
var numRecordings = 0;
var BUFFERS = [];
var DECODED_BUFFERS = [];
var RECORDING_BLOBS = [];
var isAudioStopped = true;
var masterRecording = null;
var downloadedRecording = null;

var colortest = 1;

window.URL = window.URL || window.webkitURL;
navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

$(document).ready(function() {
  // var r = document.getElementById("recording-canvas");
  // r.addEventListener("mousedown", doMouseDown, false);
  // r.addEventListener("mouseup", doMouseUp, false);
  // r.addEventListener("mousemove", doMouseMove, false);
  // r.addEventListener("mouseout", doMouseOut, false);
  // r.addEventListener("mouseover", doMouseOver, false);
});

function toggleIsRecording() {
  if (isRecording) {
    $('#record-button-color-on').css({display:'none'});
    $('#record-button-color-off').css({display:'block'});
    $('#record-button-text').text('Record'); 
    isRecording = false;
  }
  else {
      //$('#record-button').text("STOP");
    $('#record-button-color-on').css({display:'block'});
    $('#record-button-color-off').css({display:'none'});
    $('#record-button-text').text('Stop');
    isRecording = true;
  }
}

function toggleRecordingMonitorOn() {
  if (recordingMonitorOn) {
      $('#monitor-off').css({display: 'block'});
      recordingMonitorOn = false;

  }
  else {
      $('#monitor-off').css({display: 'none'});
      recordingMonitorOn = true;
  }
}

function recordingTimeoutCallback() {
  //console.log("Timer done");
  stopRecorder();
  toggleIsRecording();
}

function startRecorder() {
  setupCanvases();
  stopPreviousPathSounds();
  $('#stop-container').css({display: 'none'});
  $('#play-arrow-right').css({display: 'block'});
  PC.isPlaying = false;
  if (selectedRecording) {
    stopSelectedRecording();
  }
  if (MIC_ALLOWED) {
    //Stop recording automagically after 30 seconds
    RECORDING_TIMER = setTimeout(recordingTimeoutCallback, 30000);
    recorder = new Recorder(mediaStreamSource);
    recorder.record();
    if (recordingMonitorOn) {
      //playAllSounds();
      playSoundsForPath(nodeListForDrawing);
      playSelectedRecording();
    }
  }
  else {
    if (navigator.getUserMedia) {
      navigator.getUserMedia({audio: true}, onSuccess, onFail);
    } else {
      console.log("failed");
      console.log('navigator.getUserMedia not present');
    }
  }
  isAudioStopped = false;
}

//Hashmap for should play
var SHOULD_PLAY = {}
//Adds a contribution 
var isFirstRecording = true;
var addRecordedItem = function() {
    //Remove no recordings
    if (isFirstRecording) {
      $('#user-contrib-list').html("");
      isFirstRecording = false;
    }
    //Generate random ID
    var id = (numRecordings-1);
    var soundID = 'sound-'+ id;
    var currDate = getDateString(new Date().getTime());
    //Update hashmap with the id
    SHOULD_PLAY[id] = 1;
    //Append the check box
    //Add a change listener to the checkbox to update the hashmap value for playing
    var user = getFBUser();
    var userName =  (user) ? user.name : 'Anonymous';
    var colorCircle = "<div class='contrib-circle' style='background-color:"+getRecordingColorAsHexString()+"'></div>";
    var listItem = '<li class="user-contrib-list-item">'
                        + '<label for="' + soundID + '">'
                          //+ colorCircle
                          + '<input checked type="checkbox" id="' + soundID + '" class="float-left marg-top-sm">'
                          + '<span class="contrib-item-desc">'
                            + '<span class="contrib-node-title">' 
                              + 'Sound #'+id+', '
                            + '</span>'
                            + '<span class="contrib-node-artist">' 
                              + userName + ' - '
                            + '</span>'
                            + '<span class="contrib-node-date">' 
                              + currDate
                            + '</span>'
                          + '</span>'
                        + '</label>'
                    + '</li>';

    var el = "#user-contrib-list";
    $(el).append(listItem);
    //Remove all checked sound recordings
    for (var i = 0; i < numRecordings-1; i++) {
      $('#sound-'+i).removeAttr('checked');
    }

    //Make a click listener
    $('#'+soundID).change(function() {
       // alert(soundID+ 'Item changed');
        if (SHOULD_PLAY[id] == 1) {
          SHOULD_PLAY[id] = 0;
          selectedRecording = id + 1;
          //#AUD
          resetWODVals();
          stopSelectedRecording();
          stopPreviousPathSounds();
          //Commented out as a result of the 30 seconds thing
          //recalculateMaxLength(true);
          drawWaveforms();
          drawRecordingWaveform(RW_OFFSET);
          //recalculateMaxLength(true);
          for (var i = 0; i < numRecordings; i++) {
            if (i !== id) {
              $('#sound-'+i).removeAttr('checked');
            }
          }
          drawWaveforms();
          drawRecordingWaveform();
        }
        else {
          SHOULD_PLAY[id] = 1;
          selectedRecording = id + 1;
          resetWODVals();
          stopSelectedRecording();
          stopPreviousPathSounds();
          //Commented out as a result of the 30 seconds thing
          //recalculateMaxLength(true);
          drawWaveforms();
          drawRecordingWaveform(RW_OFFSET);
          //recalculateMaxLength(true);
          for (var i = 0; i < numRecordings; i++) {
            if (i !== id) {
              $('#sound-'+i).removeAttr('checked');
            }
          }
          drawWaveforms();
          drawRecordingWaveform();
        }
    });
    //Draw the new wave forms after we record a new sound
    drawWaveforms();
    drawRecordingWaveform();
}


function stopRecorder() {
    if (!isAudioStopped) {
        clearTimeout(RECORDING_TIMER);
        recorder.stop();
        var context1 = new webkitAudioContext();
        recorder.exportWAV(function(s) {
            numRecordings++;
            //console.log("Posted from Worker: " + s.blob + ", and buffer: " + s.buffer);
            PC.Config.SHOULD_UPLOAD = true;
            masterRecording = s.blob;
            //TODO: This will be 1-indexed... is that alright?
            RECORDING_BLOBS[numRecordings] = s.blob;
            //if(PC.Constants.SAVE_RECORDED_FILES) saveAs(s.blob, "wavtest.wav");
            BUFFERS.push(s.buffer);
            context1.decodeAudioData(BUFFERS[numRecordings-1], function(buffer) {
                //Commented out as a result of the 30 seconds thing
                // if (buffer.getChannelData(0).length > MAX_LENGTH) {
                //   MAX_LENGTH = buffer.getChannelData(0).length;
                // }
                //console.log(buffer);
                DECODED_BUFFERS.push(buffer);
                selectedRecording = numRecordings;
                //RECORDING_WOD_VALS[selectedRecording] = [0, 0, null];
                DECODED_SOUND_NODES["rec-"+numRecordings] = buffer;
                resetWODVals();
                //Add an item to the contribution's list
                addRecordedItem();

                //console.log("Decoding... " + (numRecordings-1));
            },function(err) { 
            console.log("err(decodeAudioData): "+err); 

            });
            //Fixed Audio updating of tag
            // audio =  document.querySelector('audio');
            // audio.src = window.URL.createObjectURL(s.blob);
            // hasAudio = true;
        });
        //recorder
        isAudioStopped = true;
        //Allow us to upload
        PC.Config.HAS_FILE_FOR_UPLOAD = true;
    }
}
//masterRecording = "TEST";

function uploadRecording(file) {
  var fbUser = getFBUser();
  var hasFBUser = fbUser && fbUser.id && fbUser.name;
  if (!hasFBUser) {
    //TODO: FAILED TO UPLOAD FILE - INVALID LOG IN TOAST
    //show error message
    //console.log('Not Logged In!');
    //Show Upload window again!
    return;
  }
  if (PC.Config.SHOULD_UPLOAD && hasFBUser) {   
    //This is where we should POST
    if (masterRecording) {
      //console.log("Posters gonna post");
      //console.log("Blob: " + masterRecording);
      //console.log("Buffer: " + masterRecording.buffer);
      //Upload Data
      var soundTitle = $('#upload-title').val() ? $('#upload-title').val() : 'Untitled',
          soundArtist = fbUser.name ? fbUser.name  : 'Anonymous',
          userID = (fbUser.id) ? fbUser.id : -1,
          userName = (fbUser.username) ? fbUser.username : 'Anonymous';
          //soundArtist = $('#upload-artist').val() ? $('#upload-artist').val()  : 'Anonymous',
      var parentNodeID = (getCurrentParentNodeID) ? getCurrentParentNodeID() : getCurrentRootNodeID();
          parentNodeID = (parentNodeID) ? parentNodeID : 'ROOT';

      var treeID = getCurrentTreeID();
      clearUploadFields();
      if (treeID) {
        //Create the upload form data
        var formData = new FormData();
        var soundNode = {
          'title': removeHTMLTags(soundTitle),
          'artist': removeHTMLTags(soundArtist),
          'fb_id': userID,
          'fb_username': userName,
          'tree_id': treeID,
          'parent_node_id': parentNodeID,
          'delay_time': (RP_WHEN) ? RP_WHEN : 0,
          'duration': (RP_DURATION) ? RP_DURATION : -1,
          'offset_time': (RP_OFFSET) ? RP_OFFSET : 0
        };
        var fileName = ("s"+userID+soundTitle+ (Math.round(Math.random()*134365967)+29)) + ".wav";
        //console.log("File Upload Name: " + fileName);
        
        //Stringify our JSON and add the sound file & soundNode to the form data
        formData.append('soundNode', JSON.stringify(soundNode));
        formData.append('soundFile', masterRecording, fileName);
        //Start the upload process
        //console.log("Posting!");
        $.ajax({
            type: 'POST',
            url: '/upload/sound',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data, status, req) {
              //console.log(data);
              //TODO USE SOCKETS TO UPDATE TREE
              //window.location.href = window.location.href;
              PC.NEEDS_FIRST_SOUND = false;
              THE_TREE_MODEL.refreshData();
            },
            error: function(req, status, error){
              console.log(error);
            }
        });
        //PC.Config.SHOULD_UPLOAD = false;
      }
    }
  }
}


function getRecording() {
  
  $.ajax({
    url: "/getSound",
    processData: false,
    contentType: false
    }).done(function(data) {
      downloadedRecording = data;
      // //if(PC.Constants.SAVE_RECORDED_FILES) saveAs(data, "downloadtest.wav");
      // console.log("Sample of data:", data.buffer.slice(0, 100));
      // numRecordings++;
      // BUFFERS.push(data.buffer);
      // console.log("Decoding... " + (numRecordings-1));
      // context.decodeAudioData(BUFFERS[numRecordings-1], function(buffer) {
      //   console.log(buffer);
      //   DECODED_BUFFERS.push(buffer);
      //   },function(err) { 
      //   console.log("err(decodeAudioData): "+err); 
      // });
      // playAllSounds();
  });
}

function saveRecordingByID(recID) {
  saveAs(RECORDING_BLOBS[recID], "Phase Change Recording.wav");
}

function previewRecorded() {
    document.querySelector('#record-player').play();
    audio.play();
}


function playAllSounds() {
  for (var i = 0; i < DECODED_BUFFERS.length; i++) {
    if (SHOULD_PLAY[i] == 1){
        var source = context.createBufferSource();
        source.buffer = DECODED_BUFFERS[i];
        source.connect(context.destination);
        source.connect(analyser);
        source.connect(processor);
        source.start(0);
        //console.log("Playing sample " + i);
    }
  }
}


function playSelectedRecording() {
  if (!selectedRecording) {
    return;
  }
  //Commented out as a result of the 30 seconds thing
  // if (DECODED_SOUND_NODES["rec-" + selectedRecording].getChannelData(0).length > MAX_LENGTH) {
  //   MAX_LENGTH = DECODED_SOUND_NODES["rec-" + selectedRecording].getChannelData(0).length;
  // }
  // if (DECODED_SOUND_NODES["rec-" + selectedRecording].duration > MAX_DURATION) {
  //     MAX_DURATION = DECODED_SOUND_NODES["rec-" + selectedRecording].duration;
  // }
  recordingSource = context.createBufferSource();
  recordingSource.buffer = DECODED_SOUND_NODES["rec-" + selectedRecording];
  recordingSource.connect(context.destination);
  recordingSource.connect(analyser);
  recordingSource.start(context.currentTime + RP_WHEN, RP_OFFSET, RP_DURATION);
  drawWaveforms();
  drawRecordingWaveform(RW_WHEN, RW_OFFSET, RW_DURATION);
  //console.log("RWO: " + RW_OFFSET + ", RPW: " + RP_WHEN + ", RPO: " + RP_OFFSET + ", RPD: " + RP_DURATION);
  //console.log("Playing sample " + i);
}

function stopSelectedRecording() {
  if (!recordingSource) {
    return;
  }
  recordingSource.stop(0);
}


function playAllRecordings() {
  for (var i = 0; i < numRecordings; i++) {
    var source = context.createBufferSource();
    source.buffer = DECODED_SOUND_NODES["rec-"+i];
    source.connect(context.destination);
    source.connect(analyser);
    source.start(0);
  }




}

function onSuccess (s) {
  //Stop recording automagically after 30 seconds
  RECORDING_TIMER = setTimeout(recordingTimeoutCallback, 30000);
  //var ctx = new webkitAudioContext();
  mediaStreamSource = context.createMediaStreamSource(s);
  //For spectrum
  mediaStreamSource.connect(analyser);
  //For VU meter
  mediaStreamSource.connect(splitter);
  recorder = new Recorder(mediaStreamSource);
  recorder.record();
  if (recordingMonitorOn) {
    //playAllSounds();
    playSoundsForPath(nodeListForDrawing);
  }
  MIC_ALLOWED = true;
}

function decodeSuccess(b) {
  //console.log(b);
  buffs.push(b);
}

function onError() {
  console.log("oops");
}

var onFail = function(e) {
  toggleIsRecording();
  console.log('Rejected!', e);
};


//DRAWING FUNCTIONS
function drawWaveforms() {
  var c = document.getElementById("waveform-canvas");
  var ctx = c.getContext("2d");
  c.width = $('#waveform-view-container').get(0).clientWidth;
  c.height = $('#waveform-view-container').get(0).clientHeight;
  var s = document.getElementById("playhead-canvas");
  s.width = $('#waveform-view-container').get(0).clientWidth;
  s.height = $('#waveform-view-container').get(0).clientHeight;
  var r = document.getElementById("recording-canvas");
  r.width = $('#waveform-view-container').get(0).clientWidth;
  r.height = $('#waveform-view-container').get(0).clientHeight;
  //console.log($('#waveform-view-container').get(0).clientWidth);
  var colors = ["rgba(0, 255, 255,", "rgba(255, 255, 0,", "rgba(255, 0, 255,", "rgba(255, 0, 0,", "rgba(0, 255, 0,", "rgba(0, 0, 255,"];
  //ctx.fillStyle="#353535";
  ctx.clearRect(0, 0, c.width, c.height);
  for (var i = 0; i < nodeListForDrawing.length; i++) {
    var node = getNodeData(nodeListForDrawing[i]);
    //console.log("Node: " + nodeListForDrawing[i] + " Playable?: " + node.get('isPlayable'));
    if (node.get('isPlayable') && node.get('isDecoded')) {
      var color = getWaveformRGBColor(i);
      if (node.get('duration') != -1) {
        //console.log("Node delay: " + node.get('delay_time'));
        //console.log("It passed");
        var canvas = document.getElementById("waveform-canvas");
        drawWaveformForNode(nodeListForDrawing[i], color, c, secondsToPixels(node.get('delay_time'), c), secondsToPixels(node.get('offset_time'), c), (secondsToPixels(node.get('duration'), c)));
      }
      else {
        //Duration was unassigned so we have to calculate it from the length of the buffer
        //console.log("Duration was unassigned")
        var canvas = document.getElementById("waveform-canvas");
        var n = nodeListForDrawing[i];
        drawWaveformForNode(nodeListForDrawing[i], color, c, node.get('delay_time'), node.get('offset_time'), (DECODED_SOUND_NODES[n].duration/MAX_DURATION)*c.width);
      }
    }
  }
}

function recalculateMaxLength(withRecording) {
  MAX_LENGTH = 0;
  for (var i = 0; i < nodeListForDrawing.length; i++) {
    var nodeID = nodeListForDrawing[i];
    var node = getNodeData(nodeID);
    if (node.get('isDecoded') && node.get('isPlayable')) {
      if (DECODED_SOUND_NODES[nodeID].getChannelData(0).length > MAX_LENGTH) {
        MAX_LENGTH = DECODED_SOUND_NODES[nodeID].getChannelData(0).length;
      }
    }
  }
  //console.log("Gonna check withRecording now: " + withRecording);
  if (withRecording) {
    //console.log("Checking recording");
    if (DECODED_SOUND_NODES["rec-"+selectedRecording].getChannelData(0).length > MAX_LENGTH) {
      //console.log("Recording was longer");
      MAX_LENGTH = DECODED_SOUND_NODES["rec-"+selectedRecording].getChannelData(0).length;
    }
  }
}

//#AUD
function drawRecordingWaveform(when, offset, duration) {
  //console.log("Duration: " + duration);
  var c = document.getElementById("recording-canvas");
  c.width = c.width;
  if (numRecordings > 0 && selectedRecording > 0) {
    //console.log("Drawing WF");
    var color = getRecordingWaveformColor();
    drawWaveformForNode("rec-"+selectedRecording, color, c, when, offset, duration);
    if (RECORDING_IS_HOVERED) {
      var ctx = c.getContext("2d");
      ctx.strokeStyle = "rgba(0, 50, 0, 0.5)";
      ctx.beginPath();
      ctx.moveTo(when, 0);
      ctx.lineTo(when, c.height);
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.moveTo(when + duration, 0);
      ctx.lineTo(when + duration, c.height);
      ctx.stroke();
      ctx.closePath();
      //console.log("Drew starting line");
    }
  }
  if (selectedRecording > 0) {
    SELECTED_RECORDING_DURATION = DECODED_SOUND_NODES["rec-"+selectedRecording].duration;
  }
}

function drawWaveformForNode(nodeID, color, c, when, offset, duration) {
  //console.log("Drawing waveform for: " + nodeID + "W: " + when + ", O: " + offset + ", D: " + duration);
  //return;
  //var c = document.getElementById("waveform-canvas");
  //console.log("Canvas Width: " + c.width);
  var ctx = c.getContext("2d");
  if (DECODED_SOUND_NODES[nodeID]) {
    var left = DECODED_SOUND_NODES[nodeID].getChannelData(0);
    var bufferlength = left.length;
    var segment = MAX_LENGTH/c.width;
    var ampsarr = new Array(c.width);
    var peak = 0;
    for(var i = 0; i < c.width; i++) {
      var sum = 0;
      for(var j = Math.round(i*segment); j < Math.round((i+1)*segment); j++) {
        if (j >= bufferlength) {
          continue;
        }
        sum+=(Math.abs(left[j]));
        if (Math.abs(left[j]) > peak) {
          peak = Math.abs(left[j]);
        }
      }
      ampsarr[i] = Math.abs(sum/segment);
      if (ampsarr[i]>1) {
        ampsarr[i] = 1;
      }
    }
    amps = ampsarr;
    max = _.max(amps)+0.1;

    //#AUD
    for(var i = 0; i < duration; i++) {
      //console.log(i + when);
      //ctx.fillRect(0, 0, 50, 50);
      var val = (amps[i + offset]*1.2)/max;
      ctx.lineWidth = 1;
      ctx.beginPath();
      var midline = c.height/2;
      ctx.moveTo(i + when, c.height - c.height*val);
      ctx.lineTo(i + when, c.height);
      // ctx.moveTo(i, val);
      // ctx.lineTo(i, c.height);
      ctx.strokeStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + 0.8 + ")";
      //ctx.strokeStyle = "rgba(" + 50 + "," + 50 + "," + 50 + "," + 0.8 + ")";
      ctx.stroke();
    }
  }
}

//#AUD
function secondsToPixels(val, c) {
  return (val/(MAX_DURATION))*c.width;
}

function resetWODVals () {
  var r = document.getElementById("recording-canvas");

  RP_WHEN = 0;
  RP_OFFSET = 0;
  RP_DURATION = (DECODED_SOUND_NODES["rec-"+selectedRecording].duration);

  RW_WHEN = 0;
  RW_OFFSET = 0;
  var r = document.getElementById("recording-canvas");
  r.width = $('#waveform-view-container').get(0).clientWidth;
  r.height = $('#waveform-view-container').get(0).clientHeight;
  RW_DURATION = secondsToPixels(RP_DURATION, r);
  //console.log("New RPD: " + RP_DURATION + ", and RWD: " + RW_DURATION);
}

var tri_w = 10;
var tri_h = 10;
function draw() {
  if (context.activeSourceCount > 0) {
    var c = document.getElementById("playhead-canvas");
    var ctx = c.getContext("2d");

    var percentplayed = (new Date() - PLAY_START_TIME)/(1000*MAX_DURATION);
    //ctx.clearRect(0, 0, c.width, c.height);
    //ctx.clearRect(Math.max(0, Math.floor(c.width*percentplayed - 20)), 0, 20, c.height); 
    c.width = c.width;
    ctx.beginPath();
    ctx.moveTo(Math.floor(c.width*percentplayed), tri_h);
    ctx.lineTo(Math.floor(c.width*percentplayed)-(tri_w/2), 0);
    ctx.lineTo(Math.floor(c.width*percentplayed)+(tri_w/2), 0);
    ctx.lineTo(Math.floor(c.width*percentplayed), tri_h);
    //ctx.lineTo(Math.floor(c.width*percentplayed), c.height);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  webkitRequestAnimationFrame(draw);
}

function setupCanvases() {
  var vcanvas = document.getElementById("volume-canvas");
  var vcontext = vcanvas.getContext("2d");
  grd = vcontext.createLinearGradient(0, 0, 0, vcanvas.height);
  // light blue
  // grd.addColorStop(0, '#FF0000');
  // grd.addColorStop(0.5, '#FFFF00')
  // grd.addColorStop(1, '#00FF00');

  grd.addColorStop(0, '#E66617');
  grd.addColorStop(0.5, '#E6DF17');
  grd.addColorStop(1, '#A4E617');
}


//This is for the fourier analysis, don't delete it!
var hasSetUpCanvas = false
processor.onaudioprocess = function() {
  //FREQUENCY_BANDS = [1];
  if (context.activeSourceCount > 0 || isRecording) {
    
    if(!hasSetUpCanvas) {
      setupCanvases();
      hasSetUpCanvas = true;
    }

    var scanvas = document.getElementById("spectrum-canvas");
    var scontext = scanvas.getContext("2d");
    var vcanvas = document.getElementById("volume-canvas");
    var vcontext = vcanvas.getContext("2d");

    // when the javascript node is called
    // we use information from the analyzer node
    // to draw the volume
    var array =  new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);

    // clear the current state
    scontext.clearRect(0, 0, scanvas.width, scanvas.height);

    var arraysegment = array.length/8;
    var canvassegment = scanvas.width/8;
    for (var i = 0; i < 8; i++){
      //console.log("Drawing bar " + i);
      scontext.fillStyle = "#ffffff";

      var sum = 0;
      var maxval = 0;
      for (var j = i*arraysegment; j < (i+1)*arraysegment-1; j++){
        sum += array[j];
        if (array[j] > maxval) {
          maxval = array[j];
        }
      }
      avg = sum/arraysegment;
      FREQUENCY_BANDS[i] = avg/maxval;
      //console.log(avg/maxval);

      //If we're just playing audio, don't draw the bars. If we're recording, draw.
      //if (isRecording || context.activeSourceCount > 0 ) {
        var arrayL =  new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(arrayL);

        var arrayR =  new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(arrayR);

        avgL = getAverageVolume(arrayL);
        avgR = getAverageVolume(arrayR);
        
        //Volume fix to prevent it from maxing the volume scale
        // avgL *= 0.7;
        // avgR *= 0.7;
        if (avgL > vcanvas.height) {
          avgL = vcanvas.height;
        }
        if (avgR > vcanvas.height) {
          avgR = vcanvas.height;
        }
        vcontext.clearRect(0, 0, vcanvas.width, vcanvas.height);
        vcontext.fillStyle = grd;
        vcontext.fillRect(0, vcanvas.height-avgL, (vcanvas.width/2) - 3, vcanvas.height);
        vcontext.fillRect((vcanvas.width/2) + 3, vcanvas.height-avgR, (vcanvas.width/2) - 3, vcanvas.height);

        scontext.beginPath();
        scontext.moveTo(i*canvassegment + 5, scanvas.height);
        scontext.lineTo((i+1)*canvassegment, scanvas.height);
        scontext.strokeStyle = "#ffffff";
        scontext.lineWidth = 1;
        scontext.stroke();
        scontext.closePath();
        scontext.fillRect(i*canvassegment + 5, 200 - (avg/maxval)*200, canvassegment - 5, scanvas.height);
      //}
    }
  }
}



context.oncomplete = function() {
    stopPreviousPathSounds();
    PC.isPlaying = false;
}

function averageValueOverRange(array, range) {
  var sum = 0;
  var max = 0;
  for (var i = 0; i < (array.length); i++){
    sum += array[i];
  }
  return sum/range;
}

function getAverageVolume(array) {
  var values = 0;
  var average;

  var length = array.length;

  // get all the frequency amplitudes
  for (var i = 0; i < length; i++) {
      values += array[i];
  }

  average = values / length;
  return average;
}







//##################################################################//
//####################### LIBRARY FUNCTIONS ########################//
//##################################################################//

//Returns a date string in the form MM/DD/YYYY
var getDateString = function(timestamp) {
  var date = new Date(timestamp);
  var year = date.getFullYear();
  var month = date.getMonth()+1;
  var day = date.getDate();
  var hours = date.getHours();
  var mins = date.getMinutes();
  var secs = date.getSeconds();

  //Format Time
  var isNight = hours > 12
  hours = hours%12; //append zero
  mins = (mins < 10 ? '0' : '') + mins;
  //secs = (secs < 10 ? '0' : '') + secs;

  var dayTime = isNight ? "pm" : "am";

  var dateString = month + "/" + day + "/" + year 
                   + ' - ' + hours + ":" + mins 
                   + dayTime;
  //console.log(dateString);
  return dateString;
};

//Accessor for getting a recording color by an index
var getRecordingColor = function(index) {
  if (!index || index > 0) index = 0;
  return PC.RECORDING_COLORS[index];
}

//Used for setting recording color circle div
var getRecordingColorAsHexString = function(index) {
  return getColorAsHexString(index, 'RECORDING');
}

//Returns the recording color as an RGB color
var getRecordingWaveformColor = function() {
  var hexColor = getRecordingColorAsHexString();
  var rgbColor = hexToRgb(hexColor);
  return rgbColor;
}

//Returns a color as a hexString based on its index
var getColorAsHexString = function(index, type) {
  var color;
  if (type === 'RECORDING') {
    color = getRecordingColor(index);
  }
  else {
    color = getRecordingColor(index);
  }

  //Convert to hex string
  hexColor = color.toString(16);

  //Append 0's if needed
  while (hexColor.length < 6) {
    hexColor = '0'+hexColor;
  }
  //Dat hex color string
  return '#'+hexColor;
}


//Converts a hex string to RGB object
var hexToRgb = function(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

//Gets a query string url parameter by name
var getURLParameterByName = function(name)
{
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.search);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}


//Gets the FBUser Information
var getFBUser = function() {
  return PC.Config.FB_USER;
}

//Sets the title of the pages (after tree load)
var setDocumentTitle = function(treeArtist, treeTitle) {
  //Remove Tag
  treeArtist = removeHTMLTags(treeArtist);
  treeTitle = removeHTMLTags(treeTitle);
  //Set up new Title
  var newTitle =  '<span>'
                    + '<em>' + treeTitle+ '</em> rooted by ' + treeArtist//treeArtist +' - ' + '<em>' + treeTitle+ '</em>';
                + '</span>';
  $('#tree-title').html(newTitle);
  document.title = treeTitle + ' rooted by ' + treeArtist + ' | SoundShare';
}



//Removes HTML Tags from a string
var removeHTMLTags = function(input) {
  var regex = /(<([^>]+)>)/ig;
  var result = input.replace(regex, "");
  return result;
};



//
var SOUND_BLOBS = {};
var DECODED_SOUND_NODES = {};
//var TREE_PATH_CONTEXT = new webkitAudioContext();
var TREE_PATH_CONTEXT = context;
var TREE_PLAYING_NODES = [];


//Plays all of the sounds for the nodes in a clicked Node's path
var playSoundsForPath = function(nodePathList) {
  //Stop all previous node path sounds
  nodeListForDrawing = nodePathList;
  stopPreviousPathSounds();
  //Commented out as a result of the 30 seconds thing
  //MAX_LENGTH = 0;
  //MAX_DURATION = 0;
  PLAY_START_TIME = new Date();
  for (var i = 0; i < nodePathList.length; i++) {
    //TODO: UUUUUUUGLY
    //Get node id in path
    var currentNodeID = nodePathList[i];
    //Play the sound for that node 
    playSoundNode(currentNodeID);
  }
  drawWaveforms();
  draw();

};

/* Tells all currently playing path nodes to stop playing 
 * and clears them from the TREE_PLAYING_NODES Array
 */
var stopPreviousPathSounds = function() {
  if (recordingSource != null) {
    recordingSource.stop(0);
  }
  for (var i = 0; i < TREE_PLAYING_NODES.length; i++){
    //Get the playing sounds
    var playingSound = TREE_PLAYING_NODES[i];
    //Stop playing the current sound node by giving a <when> param of 0
    playingSound.stop(0);
  }
  //Clear out the P
  TREE_PLAYING_NODES.length = 0;
};


//Retrieve a sound from the server based on node id
var retrieveSoundFromServer = function(nodeID) {
  var currentNode = getNodeData(nodeID);
  if (currentNode) {
    var reqURL = '/sound/'+nodeID;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', reqURL, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
      //console.log('Received sound file!');
      //console.log(data);
      data = xhr.response;
      SOUND_BLOBS[nodeID] = data;

      //Set the raw audio on the model
      var nodeData = getNodeData(nodeID);
      nodeData.set({raw_audio: data});
      //Decode the sound node
      decodeSoundNode(nodeID);
      //console.log(xhr);
      // context.decodeAudioData(xhr.response, function(buffer) {
      //   console.log(buffer);

      // }, function(err) { console.log(err); });
    };
    xhr.send();
  }
};

//Decode a sond that is returned for the XHR request
var decodeSoundNode = function(nodeID) {
  var ctx = new webkitAudioContext();
    //Decode the audio and store in teh buffer
    var soundBlob = SOUND_BLOBS[nodeID];
     ctx.decodeAudioData(soundBlob, 
        function(buffer) {
          //console.log("Decoded the sound for node: "+nodeID);
          var nodeData = getNodeData(nodeID);
          nodeData.set({'isDecoded': true, 'isPlayable': true, 'buffer': buffer});
          
          DECODED_SOUND_NODES[nodeID] = buffer;
          //console.log(buffer);
        }, function(err) { 
          //console.log("err(decodeAudioData): "+err); 
        }
     );
};


//Gets a profile pic URL for a user
var getFBProfilePic = function(userID) {
  //userID = 854635012;
  //console.log(userID);
  var picURL = (userID >= 0) ? ("https://graph.facebook.com/" + userID + "/picture") :  './images/logo_48.png';  //'images/person_32.png';
  return picURL;
};







