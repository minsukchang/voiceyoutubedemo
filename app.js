try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
  recognition.start();
}
catch(e) {
  //console.error(e);
  refresh()
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

  transcript=transcript.toLowerCase();
  command = transcript;
  //^[0-5]?[0-9]$
  //command.substring(command.indexOf('seconds') - 3, command.indexOf('seconds')-1) --> extract the seconds number

  noteTextarea.text(transcript);
  if (transcript.indexOf("change video") != -1) {
    //console.log("PLaying..")
    document.getElementById('change-btn').click();
    refresh()
  }


  if (transcript.indexOf("play") != -1 || transcript.indexOf("resume") != -1 ) {
    //console.log("PLaying..")
    document.getElementById('play').click();
    refresh()
  }

  if (transcript.indexOf("pause") != -1 || transcript.indexOf("stop") != -1 || transcript.indexOf("wait") != -1 || transcript.indexOf("hold on") != -1 )  {
    //console.log("Pausing..")
    document.getElementById('pause').click();
    refresh()
  }

  if (transcript.indexOf("mute") != -1  || transcript.indexOf("volume of") != -1 || transcript.indexOf("volume off") != -1 ) {
    //console.log("Muting..")
    document.getElementById('mute-toggle').click();
    refresh()
  }

  if (transcript.indexOf("louder") != -1 || transcript.indexOf("volume up") != -1 ||  transcript.indexOf("increase") != -1 || transcript.indexOf("up") != -1) {
    //console.log("Volume up..")
    document.getElementById('volume-input-up').click();
    refresh()
  }

  if (transcript.indexOf("quieter") != -1 || transcript.indexOf("volume down") != -1 ||  transcript.indexOf("decrease") != -1 || transcript.indexOf("down") != -1 ) {
    //console.log("Volume down..")
    document.getElementById('volume-input-down').click();
    refresh()
  }

  if (transcript.indexOf("skip") != -1 && transcript.indexOf("seconds") != -1 ) {
    //console.log("skipping ahead..")
    var seconds = command.split(" ")[1];
    if (Number.isInteger(seconds) == false ){
      seconds=text2num(seconds);
    }   
    document.getElementById('skip-btn').value = seconds;
    

    //console.log(document.querySelector('skip').value);
    document.getElementById('skip-btn').click();
    refresh()
  }

  if (transcript.indexOf("skip") != -1 && transcript.indexOf("minutes") != -1 ) {
    //console.log("Volume down..")
    var minutes = command.split(" ")[1];
    if (Number.isInteger(minutes) == false){
      minutes = text2num(minutes);
    }
    document.getElementById('skip-btn').value = minutes * 60;


    //console.log(document.querySelector('skip').value);
    document.getElementById('skip-btn').click();
    refresh()
  }

  if (transcript.indexOf("go back") != -1 && transcript.indexOf("seconds") != -1 ) {
    //console.log("Volume down..")
    var seconds = command.substring(command.indexOf('seconds') - 3, command.indexOf('seconds')-1)
    document.getElementById('back-btn').value = seconds;
    //console.log(document.querySelector('skip').value);
    document.getElementById('back-btn').click();
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
  instructions.text('You were quiet for a while so voice recognition turned itself off. \n We will restart the recognition or you can press the button below');
  instructions.css('color', 'red');
  refresh();
}

recognition.onerror = function(event) {
  if(event.error == 'no-speech') {
    instructions.text('No speech was detected. Try again.');
    instructions.css('color', 'yellow');
  };
  refresh();
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

  }, 1000);
  //console.log('Restarted...');


}

$('#start-btn').on('click', function(e) {
  recognition.abort();
  if (noteContent.length) {
    noteContent += ' ';
  }
  recognition.start();

});

noteTextarea.on('input', function() {
  noteContent = $(this).val();
})

$('#pause-btn').on('click', function(e) {
  recognition.abort();
  //console.log('Voice recognition paused.');
});


//chars to numbers
var Small = {
  'zero': 0,
  'one': 1,
  'two': 2,
  'three': 3,
  'four': 4,
  'five': 5,
  'six': 6,
  'seven': 7,
  'eight': 8,
  'nine': 9,
  'ten': 10,
  'eleven': 11,
  'twelve': 12,
  'thirteen': 13,
  'fourteen': 14,
  'fifteen': 15,
  'sixteen': 16,
  'seventeen': 17,
  'eighteen': 18,
  'nineteen': 19,
  'twenty': 20,
  'thirty': 30,
  'forty': 40,
  'fifty': 50,
  'sixty': 60,
  'seventy': 70,
  'eighty': 80,
  'ninety': 90
};

var Magnitude = {
  'thousand':     1000,
  'million':      1000000,
  'billion':      1000000000,
  'trillion':     1000000000000,
  'quadrillion':  1000000000000000,
  'quintillion':  1000000000000000000,
  'sextillion':   1000000000000000000000,
  'septillion':   1000000000000000000000000,
  'octillion':    1000000000000000000000000000,
  'nonillion':    1000000000000000000000000000000,
  'decillion':    1000000000000000000000000000000000,
};

var a, n, g;

function text2num(s) {
  a = s.toString().split(/[\s-]+/);
  n = 0;
  g = 0;
  a.forEach(feach);
  return n + g;
}

function feach(w) {
  var x = Small[w];
  if (x != null) {
      g = g + x;
  }
  else if (w == "hundred") {
      g = g * 100;
  }
  else {
      x = Magnitude[w];
      if (x != null) {
          n = n + g * x
          g = 0;
      }
  }
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}