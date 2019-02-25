import React, { Component } from 'react';
import YouTube from 'react-youtube';
import SpeechRecognition from 'react-speech-recognition';
import { Header, Input, Form } from 'semantic-ui-react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoState: null,
      videoId: "2g811Eo7K8U",
      url: '',
    }
    this._onPlay = this._onPlay.bind(this);
    this._onPause = this._onPause.bind(this);
    this._onStateChange = this._onStateChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount() {
    console.log(this.props);
    const { recognition } = this.props;
    recognition.lang = 'en-US';
  }

  getQueryVariable(url, variable) {
    const parameters = url.split('?')[1]
    const vars = parameters.split('&');
    for (const i = 0; i < vars.length; i++) {
        const pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

  _onPlay(event) {
    const { resetTranscript, stopListening } = this.props;
    resetTranscript();
    stopListening();
  }

  _onPause(event) {
    const { startListening } = this.props; 
    startListening();
  }

  _onStateChange(event) {
    // access to player in all event handlers via event.target
    this.setState({videoState: event.target.getPlayerState()})
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = () => this.setState({ videoId: this.getQueryVariable(this.state.url,'v'), url: '' })

  render() {
    const { transcript, listening } = this.props;
    const { videoState, videoId, url } = this.state;
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
              onStateChange={this._onStateChange}
            />
            <div className="overflow" style={{zIndex: videoState === 1 || videoState === '-1' || !videoState ? '-1' : '100'}}>
              <div className="side1">
                Hi
              </div>
            </div>
          </div>
        </div>
        <div className="container-transcript">
          <Header as="h4">Transcript</Header>
          <p>{listening ? "The app is listening" : "Please pause the video to speak"}</p>
          {transcript}
          { videoState }
        </div>
      </div>
    );
  }
}

export default SpeechRecognition(App);
