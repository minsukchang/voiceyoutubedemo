try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
  recognition.start();
}
catch(e) {
  //console.error(e);
}

var noteContent = '';
var instructions = $('#recording-instructions');
var noteTextarea = $('#note-textarea');
var command = "";

recognition.continuous = true;
//onYouTubeIframeAPIReady();

recognition.onresult = function(event) {

  //console.log(recognition)

  var current = event.resultIndex;

  var transcript = event.results[current][0].transcript;

  var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

  if(!mobileRepeatBug) {
    noteContent += transcript;
    noteTextarea.val(noteContent);
  }

  command = transcript;


  noteTextarea.text(transcript);
  if (transcript.indexOf("play") != -1 ) {
    //console.log("PLaying..")
    document.getElementById('play').click();
    refresh()
  }

  if (transcript.indexOf("pause") != -1 || transcript.indexOf("stop") != -1 ) {
    //console.log("Pausing..")
    document.getElementById('pause').click();
    refresh()
  }

  if (transcript.indexOf("mute") != -1  || transcript.indexOf("volume of") != -1 ) {
    //console.log("Muting..")
    document.getElementById('mute-toggle').click();
    refresh()
  }

  if (transcript.indexOf("volume up") != -1 ||  transcript.indexOf("increase") != -1 || transcript.indexOf("up") != -1) {
    //console.log("Volume up..")
    document.getElementById('volume-input-up').click();
    refresh()
  }

  if (transcript.indexOf("volume down") != -1 ||  transcript.indexOf("decrease") != -1 || transcript.indexOf("down") != -1 ) {
    //console.log("Volume down..")
    document.getElementById('volume-input-down').click();
    refresh()
  }

  if (transcript.indexOf("next") != -1 ) {
    //console.log("Next Vid..")
    document.getElementById('next').click();
    refresh()
  }

  if (transcript.indexOf("prev") != -1) {
    //console.log("Prev Vid..")
    document.getElementById('prev').click();
    refresh()
  }


};


recognition.onstart = function() {
  instructions.text('Voice recognition activated. Try speaking into the microphone.');
  instructions.css('color', 'lightgreen');
}

recognition.onspeechend = function() {
  instructions.text('You were quiet for a while so voice recognition turned itself off.');
  instructions.css('color', 'red');
}

recognition.onerror = function(event) {
  if(event.error == 'no-speech') {
    instructions.text('No speech was detected. Try again.');
    instructions.css('color', 'yellow');
  };
}

function refresh(){
  recognition.abort();
  setInterval(function() {
    //console.log('Refresh...');

    try {
      recognition.start();
    } catch (e) {
      //console.log(e)
    }

  }, 5000);
  //console.log('Restarted...');


}

$('#start-btn').on('click', function(e) {

  if (noteContent.length) {
    noteContent += ' ';
  }
  recognition.start();

});

noteTextarea.on('input', function() {
  noteContent = $(this).val();
})

$('#pause-btn').on('click', function(e) {
  recognition.stop();
  //console.log('Voice recognition paused.');
});
