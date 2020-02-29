import React, { Component } from 'react';
import YouTube from 'react-youtube';
import SpeechRecognition from 'react-speech-recognition';
import { Header, Input, Form, Button, Progress, Dimmer, Loader } from 'semantic-ui-react';
import './App.css';
import subtitle from './6aVOjLuw-Qg.json';
import axios from 'axios';
import {Link}  from 'react-router-dom';

// Helper Functions

function formatTime(time) {
  time = Math.round(time);

  var minutes = Math.floor(time / 60),
      seconds = time - minutes * 60;

  seconds = seconds < 10 ? '0' + seconds : seconds;

  return minutes + ":" + seconds;
}

function extract_description(transcript) {
  const arr = transcript.split(" ");
  const extra_words = ['I', 'want', 'to', 'umm','hmm', 'how', 'let', 'me', 'like', 'well', 'let\'s', 'from', 'for', 'can', 'may', 'when', 'where', 'she', 'he', 'the', 'an', 'a']
  return arr.filter(function(item) { 
    return extra_words.indexOf(item) < 0; // Returns true for items not found in extra_words.
 });
}

function common_elem(transcript, variants) {
  var common = transcript.filter(value => variants.includes(value));

  console.log('tr is ', transcript, 'vars is ', variants);
  if (common.length){
    console.log('common is ', common);
    return common;
  }
  else{
    return false;
  }
}

//can be given alone; 
var play_variants = ['play', 'go', 'show', 'resume', 'begin', 'watch', 'start'];
//can be given alone; if followed by time, pause for that duration. Otherrwise, pause infinitely.
var pause_variants = ['pause', 'stop', 'hold', 'wait' ];

//if followed by bookmark or descriptive words, go to that part. 
var jump_variants = ['jump', 'find', 'see', 'search', 'look'].concat(play_variants);

//if followed by time, go that much. Otherwise, default is 30 secs.
var future_variants = ['future', 'skip', 'forward', 'next', 'later'];
var past_varaints = ['past', 'before', 'ago', 'previous', 'back', 'backward', 'rewind'];

//if followed by a word from bookmark_variants, add bookmark
var add_variants = ['add', 'create', 'new', 'mark', 'save', 'remember'];
var bookmark_variants = ['bookmark', 'now', 'this', 'that', 'here', 'current'];

//if there was recent navigate action, repeat that. else, go back 30 sec.
var again_variants = ['again', 'replay', 'repeat'];

var this_variants = ['this', 'that', 'here', 'it'];


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
  'thousand': 1000,
  'million': 1000000,
  'billion': 1000000000,
  'trillion': 1000000000000,
  'quadrillion': 1000000000000000,
  'quintillion': 1000000000000000000,
  'sextillion': 1000000000000000000000,
  'septillion': 1000000000000000000000000,
  'octillion': 1000000000000000000000000000,
  'nonillion': 1000000000000000000000000000000,
  'decillion': 1000000000000000000000000000000000,
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
  else if (w === "hundred") {
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

function extract_time(transcript) {
  var idx, nnumber;
  var flag = 0;
  if (transcript.indexOf("minutes") !== -1) {
    flag = 1;
    idx = transcript.indexOf("minutes") - 1;
  } 
  else if (transcript.indexOf("minute")!== -1) {
    flag = 1;
    idx = transcript.indexOf("minute") - 1;
  } 
  else if (transcript.indexOf("seconds")!== -1) {
    idx = transcript.indexOf("seconds") - 1;
  } 
  else if (transcript.indexOf("second")!== -1) {
    idx = transcript.indexOf("second") - 1;
  } 
  else {
    return false;
  }
  
  if (isNumeric(transcript[idx]) === false){
    nnumber = text2num(transcript[idx]);    
  } 
  else{
    nnumber = parseInt(transcript[idx]);
  }

  if (flag === 1){
    nnumber *= 60;
  }
  console.log("number of seconds: " + nnumber);
  return nnumber;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoState: null,
      // videoId: "6aVOjLuw-Qg",
      url: '',
      duration: 0,
      currentTime: 0,
      transcriptTime: 2,
      previousTranscript: '',
      videoTarget: null,
      bookmarks: [],
      returnpoints: [],
      showInstruction: false,
    }
    this.downloadSubtitles = this.downloadSubtitles.bind(this);
    this._onPlay = this._onPlay.bind(this);
    this._onPause = this._onPause.bind(this);
    this._onStateChange = this._onStateChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onClickHandler = this.onClickHandler.bind(this);
    this._onReady = this._onReady.bind(this);
    this.onListenHandler = this.onListenHandler.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.onJumpHandler = this.onJumpHandler.bind(this);

  }

  
  componentDidMount() {
    const { recognition, stopListening } = this.props;
    recognition.lang = 'en-US';
    const grammar = '#JSGF V1.0; grammar colors; public <action> = pause | play | jump | add;'
    const SpeechGrammarList =
        window.SpeechGrammarList ||
        window.webkitSpeechGrammarList ||
        window.mozSpeechGrammarList ||
        window.msSpeechGrammarList ||
        window.oSpeechGrammarList;
    if (SpeechGrammarList) {
      const speechRecognitionList = new SpeechGrammarList();
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;
      console.log(speechRecognitionList);
      // Use speechRecognitionList
    } else {
      // SpeechGrammarList not supported by the user's browser; show this in the UI
      console.log("cannot find the matching grammarList")
    }

    if (sessionStorage.getItem('sessionCreated') === null) {
      axios.post('https://rubyslippers.kixlab.org/backend/sessions/', {
        pauses: [],
        bookmarks: [],
        transcripts: [],
        transcript_times: [],
        returnpoints: []
      }).then((response) => {
        sessionStorage.setItem('sessionID', response.data.id)
        sessionStorage.setItem('sessionCreated', true)
        console.log('new session created' + sessionStorage.getItem('sessionID'))
      });
    }
  }

  async downloadSubtitles(){
    const videoId = this.getQueryVariable(this.state.url,'v');
    axios.post('https://rubyslippers.kixlab.org/download_subtitles/', {
      video_id: videoId,
    }).then((response) => {
      console.log(response)
    });
  }

  getQueryVariable(url, variable) {
    const parameters = url.split('?')[1]
    const vars = parameters.split('&');
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) === variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
  }

  handleShow() {
    this.setState({
      showInstruction: true
    })
  }
  _onReady(event) {
    this.setState({
      duration: event.target.getDuration(), 
      currentTime: event.target.getCurrentTime(),
      videoTarget: event.target,
    })
  }

  _onPlay(event) {
    const updateInterval = setInterval(() => this.setState({currentTime: event.target.getCurrentTime()}), 100);
    this.setState({
      updateInterval: updateInterval
    })
    console.log('play the video')
  }

  _onPause(event) {
    const { updateInterval } = this.state;
    clearInterval(updateInterval);
    axios.post('https://rubyslippers.kixlab.org/backend/sessions/'+sessionStorage.getItem('sessionID')+'/add_pause/', {
      time: formatTime(event.target.getCurrentTime())
    });
    console.log('pause time is ', formatTime(event.target.getCurrentTime()))
  }

  _onStateChange(event) {
    const { duration } = this.state;
    this.setState({
      videoState: event.target.getPlayerState(),
    })
    if (duration != event.target.getDuration())
      this.setState({
        duration: event.target.getDuration(),
        videoTarget: event.target,
        currentTime: 0,
      })
  }

  onListenHandler() {
    console.log('listen handler called')
    const { listening, startListening, stopListening, resetTranscript } = this.props;
    
    if (listening) {
      console.log('stop listening')
      resetTranscript();
      this.setState({previousTranscript: '', transcriptTime: 2});
      clearInterval(this.state.transcriptInterval);
      stopListening();
    }
    else {
      console.log('start listening')
      startListening();
      const transcriptInterval = setInterval(() => {
        const { listening, transcript} = this.props;
        this.onTranscriptHandler(transcript);
        if(listening && this.state.transcriptTime){
          this.setState({transcriptTime: this.state.transcriptTime - 1});
          console.log('waiting for transcription', this.state.transcriptTime);
        }
        else{
          this.setState({transcriptTime: 2});
        }     
      }, 1000);
      this.setState({transcriptInterval: transcriptInterval});
    }
  }

  onJumpHandler(time) {
    const {currentTime, returnpoints } = this.state;
    axios.post('https://rubyslippers.kixlab.org/backend/sessions/'+sessionStorage.getItem('sessionID')+'/add_returnpoint/', {
      time: formatTime(currentTime)
    });
    returnpoints.push(currentTime);
    this.state.videoTarget.seekTo(time);
  }

  onTranscriptHandler(transcript) {
    var time, common;
    const { resetTranscript } = this.props;
    const {previousTranscript, transcriptTime, videoTarget, currentTime} = this.state;
    console.log('transcript is: ', transcript, this.state.previousTranscript)
    //update previousTranscript and wait for more
    if(transcript !== previousTranscript){
      this.setState({previousTranscript: transcript});
      this.setState({transcriptTime: 2});
    }
    //reset previousTranscript and Transcript and process
    else if(transcript !== '' && !transcriptTime){
      axios.post('https://rubyslippers.kixlab.org/backend/sessions/'+sessionStorage.getItem('sessionID')+'/add_transcript/', {
        time: formatTime(currentTime),
        transcript: transcript
      });
      console.log('save transcript', transcript)

      transcript = transcript.toLowerCase()
      const arr = extract_description(transcript);
      console.log('arr is ', arr);
      if(!arr.length){ 
        // TODO: show alert
        console.log('Please be more descriptive1');
      }

      else if (common_elem(arr, bookmark_variants)) {
        const { bookmarks, currentTime, returnpoints } = this.state;
        if (common_elem(arr, add_variants)) {
          const { currentTime, bookmarks } = this.state;
          bookmarks.push(currentTime);
          bookmarks.sort();
          this.setState({bookmarks: bookmarks});
          axios.post('https://rubyslippers.kixlab.org/backend/sessions/'+sessionStorage.getItem('sessionID')+'/add_bookmark/', {
            time: formatTime(currentTime)
          });
          console.log('bookmark time is ', formatTime(currentTime))
        }
        let idx = 0;
        while(bookmarks[++idx] < currentTime);
        idx--;
        if (idx===0 && bookmarks[0] > currentTime) idx=-1;
        console.log('next bookmark', idx, bookmarks, bookmarks[idx])
        if (arr.includes('next') && bookmarks.length>idx) {
          console.log('next bookmark', idx, bookmarks, bookmarks[idx])
          this.onJumpHandler(bookmarks[idx+1]);
        }
        else if (arr.includes('previous') && bookmarks.length>0 && bookmarks[idx]<currentTime) {
          this.onJumpHandler(bookmarks[idx]);
        }
      }
      else if(common_elem(arr, future_variants)) {
        if (arr.length === 1){
          this.onJumpHandler(currentTime + 30);
        }
        else if (time = extract_time(arr)){
          this.onJumpHandler(currentTime + time);
        }
        else{
          console.log('Please provide time');
        }
      }
      else if(common_elem(arr, past_varaints)) {
        if (arr.length === 1){
          this.onJumpHandler(currentTime - 30);
        }
        else if (time = extract_time(arr)){
          this.onJumpHandler(currentTime - time);
        }
        else{
          console.log('Please provide time');
        }
      }
      else if (common_elem(arr, pause_variants)){
        if (arr.length === 1){
          videoTarget.pauseVideo();
        }
        else if (time = extract_time(arr)){
          //TODO: pause for that long and play again
        }
      }
      else if (common = common_elem(arr, jump_variants)){
        if (arr.length === 1){
          if(common_elem(arr, play_variants)) {
            console.log('here play is called');
            videoTarget.playVideo();
          }
          else{
            console.log('Please be more descriptive2')
          }
        }
        else{
          this.findWord(arr.filter(value => !common.includes(value)));
        }
      }
      else if (common_elem(arr, again_variants)) {
        // TODO: if there was recent navigate action, repeat that. else, go back 30 sec.
        this.onJumpHandler(currentTime - 30);
      }
      else if (arr.includes('return')){
        const {returnpoints, currentTime } = this.state;
        console.log('here return is called', returnpoints);
        this.onJumpHandler(returnpoints[returnpoints.length-1]);
      }
      else{
        console.log('Please be more descriptive4');
      }
      
      resetTranscript();
      this.setState({previousTranscript: ''})
    }
    
  }

  onClickHandler() {
    if ( this.state.videoTarget.getPlayerState() === 1 ) this.state.videoTarget.pauseVideo();
    else this.state.videoTarget.playVideo();
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit() {
    const videoId = this.getQueryVariable(this.state.url,'v');
    this.setState({videoId: videoId, url: '' });
    console.log('new video id is: ', this.state.videoId);
  }

  findWord(words) {
    console.log(words);
    const { currentTime,returnpoints } = this.state;
    //keyword matching
    if(words.length === 1){
      let keyword = words[0]
      let previousTimeArray = []; // array to store timestamps in which word appeared before the current time
      let futureTimeArray = []; // array to store timestamps in which word appears ahead of the current time
      for (let i = 0; i<subtitle.length; i++) {
        let endTime = subtitle[i].end;
        let content = subtitle[i].content;
        if (content.includes(keyword)) {
          currentTime >= endTime ? previousTimeArray.push(subtitle[i]) : futureTimeArray.push(subtitle[i]);
        }
      }
      console.log('prev array: ', previousTimeArray);
      console.log('future array: ', futureTimeArray);
      if(previousTimeArray.length){
        this.onJumpHandler(previousTimeArray[previousTimeArray.length-1].start);
        this.state.videoTarget.playVideo();
      }
      else if (futureTimeArray.length){
        this.onJumpHandler(futureTimeArray[futureTimeArray.length-1].start);
        this.state.videoTarget.playVideo();
      }
      else{
        console.log('cannot find the keyword');
      }
    }
    //sentence similarity
    else{
      axios.post('https://rubyslippers.kixlab.org/find_sentence/', {
        transcript: words
      }).then((response) => {
        if(response.data.found){
          this.onJumpHandler(response.data.time)
          this.state.videoTarget.playVideo();
        }
        else{
          console.log("no similar conent");
        }
      });
    }
    
  }

  render() {
    const { transcript, listening } = this.props;
    const { videoId, url, duration, currentTime, videoTarget, bookmarks, videoState } = this.state;
    // if (videoState && videoState === 5 && this.state.videoTarget.getDuration() != duration) {
    //   this.setState({duration: this.state.videoTarget.getDuration()})
    // }
    return (
      <div className="App">
        <div className="header-title">
          <Header as="h2">
            VoiceYoutubeDemo
          </Header>
        </div>
        <div className="input-url">
          <Form onSubmit={this.handleSubmit}>
            <Input id="url" name="url" onChange={this.handleChange, this.downloadSubtitles} action={{ icon: 'search' }} value={url} placeholder='Submit youtube URL' />
          </Form>
          <a href='https://rubyslippers.kixlab.org' target="_blank" id="instruction" className="readme">README</a>
        </div>
        <div className="container-wrapper">
          <div className="container-video">
            <YouTube
              className="youtube-video"
              videoId={videoId}
              onPause={this._onPause}
              onPlay={this._onPlay}
              onReady={this._onReady}
              onStateChange={this._onStateChange}
              opts={{playerVars: {autoplay: 1, start:0}}}
            />
            <div className="overflow" style={{zIndex: videoState === 1 || videoState === '-1' || !videoState ? '-1' : '100'}}>
            </div>
          </div>
        </div>
        {videoTarget ?
        <div className="container-wrapper">
          <div className="container-buttons">
            <Button onClick={this.onClickHandler} primary>{videoState === 1 ? "Pause" : "Play"}</Button>
            <Button onClick={this.onListenHandler} secondary>{listening ? "Stop Listening" : "Start Listening"}</Button>
          </div>
          <div className="progressBar">
            {bookmarks.map((value) => <div className="bookmark-tip" key={value} style={{left: value/duration*100+"%"}}/>)}
            <Progress percent={Math.floor(currentTime/duration*100)} progress color='blue' />
          </div>
          <div className="container-transcript">
            <Header as="h4">Transcript</Header>
            <p>{listening ? "The app is listening" : "Please click Start Listening"}</p> 
            {transcript}
          </div>
        </div>
        :
        <Dimmer active>
          <Loader content='loading' />
        </Dimmer>
        }
      </div>
    );
  }
}

const options = {
  autoStart: false // true?

}

export default SpeechRecognition(options)(App);
