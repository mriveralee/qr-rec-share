console.log("Beginning audioManager script");
var onFail = function(e) {
  console.log('Rejected!', e);
};

var clips = [];
var numrecordings = 0;
var hasAudio = false;
var BUFFERS = [];
var DECODEDBUFFERS = [];
var context = new webkitAudioContext();
var jsn = context.createJavaScriptNode(4096, 2, 2);

var onSuccess = function(s) {
  //var ctx = new webkitAudioContext();
  var mediaStreamSource = context.createMediaStreamSource(s);
  recorder = new Recorder(mediaStreamSource);
  recorder.record();
  /*if (hasAudio) {
    play();
  }*/

  // audio loopback
  // mediaStreamSource.connect(context.destination);
}

window.URL = window.URL || window.webkitURL;

navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
var recorder;
var audio = document.querySelector('audio');

function startRecording() {
	console.log("Trying gUM");
  if (navigator.getUserMedia) {
    navigator.getUserMedia({audio: true}, onSuccess, onFail);
  } else {
    console.log("failed");
    console.log('navigator.getUserMedia not present');
  }
}

function stopRecording() {
  recorder.stop();
  var context = new webkitAudioContext();
  recorder.exportWAV(function(s) {
    numrecordings++;
    console.log("Posted from Worker: " + s.blob + ", and buffer: " + s.buffer);
    clips.push(s.blob);
    saveAs(s.blob, "wavtest.wav");
    BUFFERS.push(s.buffer);
    context.decodeAudioData(BUFFERS[numrecordings-1], function(buffer) {
      console.log(buffer);
      /*var b = buffer;
      var stringed = JSON.stringify(buffer.getChannelData(0));
      console.log("Stringify'd: " + stringed);
      var parsed = JSON.parse(stringed);
      console.log("Parsed: " + parsed)
      console.log("GBD Left: " + buffer.getChannelData(0));
      var chan = buffer.numberOfChannels;
      var samp = buffer.sampleRate;
      var length = buffer.length;
      var newbuffer = context.createBuffer(chan, length, samp);
      newbuffer.getChannelData(0).set(buffer.getChannelData(0));
      newbuffer.getChannelData(1).set(buffer.getChannelData(1));
      DECODEDBUFFERS.push(newbuffer);
      */
      DECODEDBUFFERS.push(buffer);
      
      console.log("Decoding... " + (numrecordings-1));
    },function(err) { 
      console.log("err(decodeAudioData): "+err); 
    });
    audio.src = window.URL.createObjectURL(s.blob);
    hasAudio = true;
  });
  //recorder
}

function checkClips() {
  for (var i = 0; i < clips.length; i++) {
    console.log("DECODEDBUFFERS[" + i + "]: " + DECODEDBUFFERS[i] + ", Buffer: " + clips[i].buffer);
  }
}

function decodeSuccess(b) {
  console.log(b);
  buffs.push(b);
}

function play() {
  console.log("Number of clips: " + clips.length + ", Number of BUFFERS: " + BUFFERS.length);
  for (var i = 0; i < DECODEDBUFFERS.length; i++) {
    var source = context.createBufferSource();
    source.buffer = DECODEDBUFFERS[i];
    source.connect(context.destination);
    source.noteOn(0);
    console.log("Playing sample " + i);
  }
}
  
  //the previously working code: decode all buffers every time you play
  //var buffs = [];
  /*for (var i = 0; i < BUFFERS.length; i++) {
    //console.log("Clips["+i+"]: " + clips[i].buffer + ", Size: " + clips[i].length);
    context.decodeAudioData(BUFFERS[i], function(buffer) {
      buffs.push(buffer);
      console.log("Decoding... " + count);
      var source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.noteOn(0);
      console.log("Playing sample " + i);
    },function(err) { 
      console.log("err(decodeAudioData): "+err); 
    });
  }*/
  
  /*for (var i = 0; i < buffs.length; i++) {
    var source = context.createBufferSource();
    source.buffer = buffs[i];
    source.connect(context.destination);
    source.noteOn(0);
    console.log("Playing sample " + i);
  }*/


  // for (var i = 0; i < clips.length; i++) {
  //   console.log("Clips["+i+"]: " + clips[i].buffer + ", Size: " + clips[i].length);
  //   context.decodeAudioData(clips[i], function(buffer) {
  //     buffs.push(buffer);
  //   },function(err) { 
  //     console.log("err(decodeAudioData): "+err); 
  //   });
    /*context.decodeAudioData(clips[i],
      function(buffer) {
        console.log(buffer);
        buffs.push(buffer);
      }, 
      function(err) { 
        console.log("err(decodeAudioData): "+err); 
      });*/
  //}
  /*console.log("Buffs length: " + buffs.length);
  for (var i = 0; i < buffs.length; i++) {
    var source = context.createBufferSource();
    source.buffer = buffs[i];
    source.connect(context.destination);
    source.noteOn(0);
  }
}*/

function onError() {
  console.log("oops");
}