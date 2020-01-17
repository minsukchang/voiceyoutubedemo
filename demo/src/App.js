import React, { Component } from 'react';
import YouTube from 'react-youtube';
import SpeechRecognition from 'react-speech-recognition';
import { Header, Input, Form, Button, Progress, Dimmer, Loader } from 'semantic-ui-react';
import './App.css';
import subtitle from './subtitle.json';
import axios from 'axios';


// Helper Functions

function formatTime(time) {
  time = Math.round(time);

  var minutes = Math.floor(time / 60),
      seconds = time - minutes * 60;

  seconds = seconds < 10 ? '0' + seconds : seconds;

  return minutes + ":" + seconds;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoState: null,
      videoId: "6aVOjLuw-Qg",
      url: '',
      duration: 0,
      currentTime: 0,
      transcriptTime: 3,
      previousTranscript: '',
      videoTarget: null,
      bookmarks: [5, 80, 250],
    }
    this._onPlay = this._onPlay.bind(this);
    this._onPause = this._onPause.bind(this);
    this._onStateChange = this._onStateChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onClickHandler = this.onClickHandler.bind(this);
    this._onReady = this._onReady.bind(this);
    this.onListenHandler = this.onListenHandler.bind(this);

  }

  
  componentDidMount() {
    const { recognition, stopListening } = this.props;
    recognition.lang = 'en-US';
    console.log(subtitle)
    if (sessionStorage.getItem('sessionCreated') === null) {
      axios.post('http://127.0.0.1:8000/sessions/', {
        pauses: [],
        bookmarks: [],
        transcripts: [],
        transcript_times: []
      }).then((response) => {
        sessionStorage.setItem('sessionID', response.data.id)
        sessionStorage.setItem('sessionCreated', true)
        console.log('new session created' + sessionStorage.getItem('sessionID'))
      });
    }
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
  }

  _onPause(event) {
    const { updateInterval } = this.state;
    clearInterval(updateInterval);
    axios.post('http://127.0.0.1:8000/sessions/'+sessionStorage.getItem('sessionID')+'/add_pause/', {
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
      this.setState({previousTranscript: '', transcriptTime: 3});
      clearInterval(this.state.transcriptInterval);
      stopListening();
    }
    else {
      console.log('start listening')
      startListening();
      const transcriptInterval = setInterval(() => {
        const listening = this.props.listening
        if(listening && this.state.transcriptTime){
          this.setState({transcriptTime: this.state.transcriptTime - 1});
          console.log('waiting for transcription', this.state.transcriptTime);
        }
        else{
          const transcript = this.props.transcript
          this.onTranscriptHandler(transcript);
          this.setState({transcriptTime: 3});
          console.log('reset transcriptionTimer')
        }     
      }, 1000);
      this.setState({transcriptInterval: transcriptInterval});
    }
  }

  onTranscriptHandler(transcript) {
    const { resetTranscript } = this.props;
    console.log('transcript is: ', transcript, this.state.previousTranscript)
    //update previousTranscript and wait for more
    if(transcript !== this.state.previousTranscript){
      this.setState({previousTranscript: transcript});
    }
    //reset previousTranscript and Transcript and process
    else if(transcript !== ''){
      axios.post('http://127.0.0.1:8000/sessions/'+sessionStorage.getItem('sessionID')+'/add_transcript/', {
        time: formatTime(this.state.currentTime),
        transcript: transcript
      });
      console.log('save transcript', transcript)
      const arr = transcript.split(" ");
      if (['add', 'bookmark'].every(val => arr.includes(val))) {
        const { currentTime, bookmarks } = this.state;
        bookmarks.push(currentTime);
        bookmarks.sort();
        this.setState({bookmarks: bookmarks});
        axios.post('http://127.0.0.1:8000/sessions/'+sessionStorage.getItem('sessionID')+'/add_bookmark/', {
          time: formatTime(currentTime)
        });
        console.log('bookmark time is ', formatTime(currentTime))
      }
      else if (['go', 'bookmark'].every(val => arr.includes(val))) {
        console.log('go bookmark', arr)
        const { videoTarget, bookmarks, currentTime } = this.state;
        let idx = 0;
        while(bookmarks[++idx] < currentTime);
        idx--;
        if (idx===0 && bookmarks[0] > currentTime) idx=-1;
        console.log('next bookmark', idx, bookmarks, bookmarks[idx])
        if (arr.includes('next') && bookmarks.length>idx) {
          console.log('next bookmark', idx, bookmarks, bookmarks[idx])
          videoTarget.seekTo(bookmarks[idx+1]);
        }
        else if (arr.includes('previous') && bookmarks.length>0 && bookmarks[idx]<currentTime) {
          videoTarget.seekTo(bookmarks[idx]);
        }
      }
      else if (arr.includes('find')) {
        this.findWord(arr[1]);
      }
      resetTranscript();
      this.setState({previousTranscript: ''})
    }
    
  }

  onClickHandler() {
    const { videoTarget } = this.state;
    if ( videoTarget.getPlayerState() === 1 ) videoTarget.pauseVideo();
    else videoTarget.playVideo();
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit() {
    const videoId = this.getQueryVariable(this.state.url,'v');
    this.setState({videoId: videoId, url: '' })
  }

  findWord(word) {
    const { currentTime } = this.state;
    let previousTimeArray = []; // array to store timestamps in which word appeared before the current time
    let futureTimeArray = []; // array to store timestamps in which word appears ahead of the current time
    for (let i = 0; i<subtitle.length; i++) {
      let endTime = subtitle[i].end;
      let content = subtitle[i].content;
      if (content.includes(word)) {
        currentTime < endTime ? previousTimeArray.push(subtitle[i]) : futureTimeArray.push(subtitle[i]);
      }
    }
    console.log(previousTimeArray, futureTimeArray);
  }

  render() {
    const { transcript, listening } = this.props;
    const { videoId, url, duration, currentTime, videoTarget, bookmarks, videoState } = this.state;
    // if (videoState && videoState === 5 && videoTarget.getDuration() != duration) {
    //   this.setState({duration: videoTarget.getDuration()})
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
            <Input id="url" name="url" onChange={this.handleChange} action={{ icon: 'search' }} value={url} placeholder='Submit youtube URL' />
          </Form>
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
              <div className="side1">
                Hi
              </div>
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
            <p>{listening ? "The app is listening" : "Please pause the video to speak"}</p> 
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
