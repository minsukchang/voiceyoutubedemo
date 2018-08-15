var player,
    time_update_interval = 0;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('video-placeholder', {
        width: 600,
        height: 400,
        videoId: '6I58j3YIlxI',
        events: {
            onReady: initialize,
            onStateChange: onPlayerStateChange
        }
    });
    ytLoaded = true;
}

function initialize(){

    // Update the controls on load
    updateTimerDisplay();
    updateProgressBar();

    // Clear any old interval.
    clearInterval(time_update_interval);

    // Start interval to update elapsed time display and
    // the elapsed part of the progress bar every second.
    time_update_interval = setInterval(function () {
        updateTimerDisplay();
        updateProgressBar();
    }, 1000);


    $('#volume-input').val(Math.round(player.getVolume()));
}

$('.playlist').on('click', function () {
  //console.log(this.value)
  player.loadPlaylist({list: this.value, listType:"playlist"});
});

// This function is called by initialize()
function updateTimerDisplay(){
    // Update current time text display.
    $('#current-time').text(formatTime( player.getCurrentTime() ));
    $('#duration').text(formatTime( player.getDuration() ));
}


// This function is called by initialize()
function updateProgressBar(){
    // Update the value of our progress bar accordingly.
    $('#progress-bar').val((player.getCurrentTime() / player.getDuration()) * 100);
}

// Change video

//document.getElementById('pause').click();
//refresh()

$('#change-btn').on('click', function () {
    var url = document.getElementById("channel").value;
    //url = url.replace("watch?v=", "embed/");
    //document.getElementById("video-placeholder").src = url;
    var id=url.substring(url.indexOf('=')+1);
    //var x = new String(id)
    player.loadVideoById(id);
    player.playVideo();

});

// Progress bar

$('#progress-bar').on('mouseup touchend', function (e) {

    // Calculate the new time for the video.
    // new time in seconds = total duration in seconds * ( value of range input / 100 )
    var newTime = player.getDuration() * (e.target.value / 100);

    // Skip video to new time.
    player.seekTo(newTime);

});


// Playback

$('#play').on('click', function () {
    player.playVideo();
});


$('#pause').on('click', function () {
    player.pauseVideo();
});



// Sound volume


$('#mute-toggle').on('click', function() {
    var mute_toggle = $(this);

    if(player.isMuted()){
        player.unMute();
        mute_toggle.text('volume_up');
    }
    else{
        player.mute();
        mute_toggle.text('volume_off');
    }
});

$('#volume-input-up').on('click', function () {
    player.setVolume(player.getVolume() + 35);
});

$('#volume-input-down').on('click', function () {
    player.setVolume(player.getVolume() - 35);
});


// Other options

$('#speed').on('change', function () {
    player.setPlaybackRate($(this).val());
});

$('#quality').on('change', function () {
    player.setPlaybackQuality($(this).val());
});


//skip to other places in the video
$('#skip-btn').on('click', function () {
    player.seekTo(player.getCurrentTime() + parseInt($("#skip-btn").val()), true);
});

$('#back-btn').on('click', function () {
    player.seekTo(player.getCurrentTime() + parseInt($("#back-btn").val()), true);
});


// Playlist

$('#next').on('click', function () {
    player.nextVideo()
});

$('#prev').on('click', function () {
    player.previousVideo()
});


// Load video

$('.thumbnail').on('click', function () {

    var url = $(this).attr('data-video-id');

    player.cueVideoById(url);

});


// Helper Functions

function formatTime(time){
    time = Math.round(time);

    var minutes = Math.floor(time / 60),
        seconds = time - minutes * 60;

    seconds = seconds < 10 ? '0' + seconds : seconds;

    return minutes + ":" + seconds;
}

function onPlayerStateChange(event) {

}


$('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
});
