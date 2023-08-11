//const { data } = require("jquery");

//initialize variables
let playlist_songs = [];
let currentPlaylist = 0;
let datajson = [];
let track_list = [];
let now_playing = document.querySelector(".now-playing");
let track_art = document.querySelector(".track-art");
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");
let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");
let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");
let playlistData = document.querySelector(".list");
const popup = document.querySelector(".popup"); 
let playlist_list = document.querySelector(".playlist-list");
let list_items = document.querySelectorAll(".playlist-songs-item");
const list_container = document.querySelector(".playlist-songs-container");
let edit_playlist_button = document.querySelector(".edit-playlist-button");
let settings_container = document.querySelector(".playlist-songs-settings-container");
let settings_list = document.querySelector(".song-settings-list");
let settings_title = document.querySelector(".settings-title");
let settings_form = document.querySelector(".settings_form");
let top_div = document.querySelector(".top-div");
let edit_list = document.querySelector(".edit-list");
let edit_list_items = document.querySelectorAll(".edit-songs-item");
let edit_container = document.querySelector(".edit-playlist-songs-container");
let slider_container = document.querySelector(".slider_container");
let add_playlist = document.querySelector(".plus-button");
let playlist_list_container = document.querySelector(".playlist-list-container");
let new_playlist = document.querySelector(".new-playlist-form");
let bvl = document.querySelector(".button-vertical-line");
let bhl = document.querySelector(".button-horizontal-line");
let question_button = document.querySelector(".question-button");
let checkboxes_container = document.querySelector(".checkboxes-container");
let songLength = document.getElementById("duration");
let submit_buttom = document.querySelector(".submit-button");
let artist_data = document.querySelector(".artist-input-field");
let trackName_data = document.querySelector(".track-input-field");
let top_button = document.querySelector(".top-button");
let bottom_button = document.querySelector(".bottom-button");
let dropZoneElement = document.querySelector(".drop-zone");
let inputElement = document.querySelector(".drop-zone__input");
let playlistDisplaying = false;
let track_index = 0;
let isPlaying = false;    //keeps track of if any audio is playing 
let currentAudio = true;                      //keeps track of which audio element is playing or paused true = current, false = other
let bothPlaying = false;  //keeps track of when to play both tracks or just 1
let next_track_index = 0;
let faderLength = 5;
let fading = false;
let fadingTrackTe = 0;
let updateTimer;
let iWindow = null;
let viewPlaylistIndex = 0;
let add_button_clicked = false;
let assignFadingTrack = true;
let preLoadFlag = true;
let dur = 0;
let currentView = 'Play';
let canUpload = true;


let playlistIdentifier = document.createElement('input');
playlistIdentifier.type = "hidden";
playlistIdentifier.value = "";
playlistIdentifier.name = "playlistIdentifier";
document.getElementById("settings_form").appendChild(playlistIdentifier);
let curr_track = document.createElement('audio');
let other_track = document.createElement('audio');    
//slider_container.style.top = (82 + window.scrollY / window.innerHeight * 27) + 'vh';
let playlistPlayingIndex = 0;



//event listeners----------------------------------------------------------------------------------------------------------------------event listeners
window.addEventListener("DOMContentLoaded", function () {
    assignDJ();
    console.log(datajson);
   /* if(datajson.length > 0) {
        console.log("in here");
        track_list = datajson[currentPlaylist].data; 
        track_name.textContent = track_list[track_index].name;
        track_artist.textContent = track_list[track_index].artist;
        now_playing.textContent = datajson[currentPlaylist].name;
        createCheckboxes();
    }*/

});

/*window.addEventListener("scroll", function () {
    slider_container.style.top = (82 + window.scrollY / window.innerHeight * 18) + 'vh';
});*/

document.querySelector(".signout-container").addEventListener("click", () => {
    //sendLogOutRequest();
});


top_button.addEventListener("click", () => {
    let temp = top_button.textContent;
    changeView(temp, currentView);
    top_button.textContent = currentView;
    currentView = temp;
});
bottom_button.addEventListener("click", () => {
    let temp = bottom_button.textContent;
    changeView(temp, currentView);
    bottom_button.textContent = currentView;
    currentView = temp;
});

add_playlist.addEventListener("click", function () {
    if (!add_button_clicked) {
        add_playlist.style.transform = 'rotate(45deg)';
        new_playlist.focus();
        add_button_clicked = true
        bvl.style.backgroundColor = '#ff9494';
        bhl.style.backgroundColor = '#ff9494';
        document.querySelector(".top-grid-left").style.gridTemplateRows = '1fr 0.5fr 5.5fr 1fr';
        new_playlist.style.display = 'flex';
        playlist_list_container.style.gridRowStart = "3";
        
    } else {
        add_button_clicked = false;
        add_playlist.style.transform = 'rotate(90deg)';
        bvl.style.backgroundColor = 'white';
        bhl.style.backgroundColor = 'white';
        document.querySelector(".top-grid-left").style.gridTemplateRows = '1fr 6fr 1fr';
        new_playlist.style.display = 'none';
        playlist_list_container.style.gridRowStart = "2";
    }
});

playlistData.addEventListener('click', function () { handleSongClick(); }, true);        

document.getElementById("new-playlist-form").addEventListener('submit', function(e) {
    e.preventDefault();
    let ajax = new XMLHttpRequest();
    let form_data = new FormData(document.getElementById("new-playlist-form"));
    ajax.open("POST", "/ajaxpost", true);
    ajax.send(form_data);
    document.querySelector('.new-playlist').value = "";
    add_button_clicked = false;
    playlist_list_container.style.top = '8vh';
    add_playlist.style.transform = 'rotate(90deg)';
    bvl.style.backgroundColor = 'white';
    bhl.style.backgroundColor = 'white';
    
    datajson.push({
    name: form_data.get("new_playlist_name"),
    data: []
    });
    
    let li = document.createElement("li");
    let x = datajson.length-1;
    li.className = "playlist-list-item" + x;
    li.onclick = function () { handleListClick(x); };
    li.textContent = form_data.get("new_playlist_name");
    playlist_list.appendChild(li);
    createCheckboxes();
});

let submitPlayAndRemove = async () => {
    let y = document.querySelectorAll(".checkboxes:checked")
    let checkedArray = [];
    y.forEach(element => {
        checkedArray.push(element.value);
    });
    if (inputElement.value != "" && checkedArray != 0 && artist_data.value != "" && trackName_data != "") {
        canUpload = false;
        submit_buttom.removeEventListener("click", submitPlayAndRemove);
        await addTracksData();
        submit_buttom.addEventListener("click", submitPlayAndRemove);
        canUpload = true;
    }
}
submit_buttom.addEventListener("click", submitPlayAndRemove);

dropZoneElement.addEventListener("click", (e) => {
    if (canUpload)
        inputElement.click();
});

edit_list.addEventListener("drop", (event) => {
    async function reorder() {
        await reorderPlaylist();
     }
    reorder();
    sendNewPlaylistOrder(datajson[viewPlaylistIndex].data);

    recolorPlaylist();
    //displaySettings();
    
    
});


async function addTracksData() {
    let y = document.querySelectorAll(".checkboxes:checked")
    let checkedArray = [];
    y.forEach(element => {
        checkedArray.push(element.value);
    });
    console.log(checkedArray);
    console.log(artist_data.value);
    console.log(trackName_data.value); 
    console.log(document.getElementById("file").files[0]);
    console.log(dur);
    let form_data = new FormData(document.getElementById("add_tracks_form"));
    let newPath = await sendTrackData(form_data);
    console.log(newPath.pathFromServer);
   let songid = await getSidFromServer();
   
    checkedArray.forEach(element => {
        let tempIndex = datajson.findIndex(o => o.name == element);
        const reformattedDataObj = {                                   //reformats data from add_tracks to add to page and data structure
        id: songid,
        index: datajson[tempIndex].data.length,                      //NEEEDS TO BE CHANGED IM PRETTY SURE
        name: trackName_data.value,
        artist: artist_data.value,
        image: "yeee.png",
        path: newPath.pathFromServer,
        ts: 0,
        te: Math.floor(dur)
        };
        
        datajson[tempIndex].data.push(reformattedDataObj);
        if (tempIndex == viewPlaylistIndex) {
        displaySongs(tempIndex);
        changeListTextColor(tempIndex);
        addDrag();
        createSettingsFields(tempIndex);
        }
    });
    document.getElementById("add_tracks_form").reset();
    document.querySelector(".drop-zone__prompt").textContent = "Drop file here or click to upload";
    document.querySelector(".drop-zone__prompt").style.fontSize = "1em";
}

//ajax functions

function sendTrackData(formData) {
    return new Promise(resolve => {
        let ajax = new XMLHttpRequest();
        ajax.contentType = 'application/json';
        ajax.onreadystatechange = function() {
            if (ajax.readyState == 4 && ajax.status == 200) {
              console.log(ajax.responseText);
              resolve(JSON.parse(ajax.responseText));
             }
           };
        ajax.open("POST", "/add_tracks", true);
        ajax.send(formData);
    });
}

function postFunction() {
    let ajax = new XMLHttpRequest();
    let form_data = new FormData(document.getElementById("settings_form"));
    ajax.open("POST", "/ajaxpost", true);
    ajax.send(form_data);

}

function getSidFromServer() {
    return new Promise(resolve => {
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // if it worked, parse that string, make it back into an object
                resolve (JSON.parse(this.responseText).id);
            }
        };
        xmlhttp.open("GET", "/sendSongId", true);
        xmlhttp.send();
    });
}

function sendDeleteSongRequest(songid, playlistName, playlistLength, path) {
    let ajax = new XMLHttpRequest();
    ajax.open("POST", "/postDeleteSong", true);
    ajax.contentType = 'application/json'
    const formData = new FormData();
    formData.append('songid', songid);
    formData.append('playlistIdentifier', playlistName);
    formData.append('playlistLength', playlistLength);
    formData.append('path', path);
    ajax.send(formData);
}

function getDJFromServer() {
    return new Promise(resolve => {
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // if it worked, parse that string, make it back into an object
                resolve (JSON.parse(this.responseText));
            }
        };
        xmlhttp.open("GET", "/sendDJ", true);
        xmlhttp.send();
    });
}

function sendNewPlaylistOrder(track_listing) {
    //return new Promise(resolve => {
    let ajax = new XMLHttpRequest();
    ajax.open("POST", "/postNewTrackList", true);    
    const formData = new FormData();
    track_listing.forEach((object) => {
        Object.entries(object).forEach(([key, value]) => {
        formData.append(key, value);
        });
    });
    formData.append('playlistIdentifier', datajson[viewPlaylistIndex].name);
    //ajax.addEventListener("load", (event) => {
      //  console.log(event);
    //});
      ajax.send(formData);
    //});
}

function sendDeletePlaylistRequest(name) {
    let ajax = new XMLHttpRequest();
    ajax.open("POST", "/postDeletePlaylist", true);
    ajax.contentType = 'application/json'
    const formData = new FormData();
    formData.append('name', name);
    ajax.send(formData);
}

function sendLogOutRequest() {
    let ajax = new XMLHttpRequest();
    ajax.open("POST", "/logoutRequest", true);
    ajax.contentType = 'application/json'
    const formData = new FormData();
    formData.append('logout', true);
    ajax.send(formData);
}

//Functions---------------------------------------------------------------------------------------------------------------------------------------------Functions

function changeView(nextView, prevView) {
    if (nextView === 'Add') {
        popup.style.display = 'grid';       
    } else if (nextView === 'Edit') {
        edit_container.style.display = 'block';
    } else {
        list_container.style.display = 'block';
    }
    if (prevView === 'Add') {
        popup.style.display = 'none';       
    } else if (prevView === 'Edit') {
        edit_container.style.display = 'none';
    } else {
        list_container.style.display = 'none';
    }
    
}

async function assignDJ() {
    datajson = await getDJFromServer();
    if(datajson.length > 0)
        //track_list = datajson[currentPlaylist].data; 
        console.log("in here");
        //track_name.textContent = track_list[track_index].name;
        //track_artist.textContent = track_list[track_index].artist;
        //now_playing.textContent = datajson[currentPlaylist].name;
        createCheckboxes();
}

async function getSong(path) {
    return new Promise(resolve => {
        let ajax = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('path', path);
        ajax.onreadystatechange = function() {
            if (ajax.readyState == 4 && ajax.status == 200) {
              console.log(ajax.responseText);
              resolve(true);
             }
           };
        ajax.open("POST", "/getSong", true);
        ajax.send(formData);
    });
}

async function preLoadTrack(track_index) {
    await getSong(track_list[track_index].path);
}

async function loadTrack(track_index, track) {
    // Clear the previous seek timer
    console.log(track_list[track_index].name);
    clearInterval(updateTimer);
    resetValues();
    // Load a new track
    track.src = 'public/uploads/' + track_list[track_index].path;
    track.load();
    let playAndRemove = () => {
        console.log("playandremove triggered!");
        playTrack(track);
        track.removeEventListener("canplaythrough", playAndRemove);

    }
    track.addEventListener("canplaythrough", playAndRemove);
    
    // Update details of the track
    track_name.textContent = track_list[track_index].name;
    track_artist.textContent = track_list[track_index].artist;
    now_playing.textContent = datajson[currentPlaylist].name;
    
    // Set an interval of 1000 milliseconds
    // for updating the seek slider
    updateTimer = setInterval(handleTime, 1000);
    track.currentTime = track_list[track_index].ts;
    
    //random_bg_color();
    //top_div.style.backgroundImage = "url(" + track_list[track_index].image + ")";
    //getFadingTrack().src = track_list[getNextTrack()].path;
    assignFadingTrack = true;
}



function getFadingTrack() {
    if (currentAudio)
    return other_track;
    else
    return curr_track;
}

function getTrackNotInUse() {
    if(currentAudio)
    return other_track;
    else
    return curr_track;
}
function handleTime() {
    seekUpdate(getCurrentTrack());   
    console.log(fading);
    if (fading) {
        getFadingTrack().volume = Math.max(getFadingTrack().volume*0.7, .1);
        getCurrentTrack().volume = Math.min(getCurrentTrack().volume * 1.5, 1);
        console.log("3");
        if (fading && getFadingTrack().currentTime >= fadingTrackTe - 0.6) {
            console.log("2");
            console.log(getFadingTrack().src);
            getFadingTrack().pause();
            getFadingTrack().currentTime = 0;
            fading = false;
            getCurrentTrack().volume = 1;
            preLoadFlag = true;
        }
    } else if (getCurrentTrack().currentTime >= track_list[track_index].te - faderLength) {
        console.log("1");
        fading = true;
        fadingTrackTe = track_list[track_index].te;
        currentAudio = !currentAudio;  //switches which track will be used
        getFadingTrack().volume *= 0.7;
        nextTrack(false);
        getCurrentTrack().volume = 0.2;
    }

    if(getCurrentTrack().currentTime > track_list[track_index].te - 20 && preLoadFlag) {
        preLoadTrack(getNextTrack());
        preLoadFlag = false;
    }
}

function getNextTrack() {
    let track_index_helper = track_list[track_index].index;
    if (track_index_helper < track_list.length - 1)
        track_index_helper += 1;
    else 
        track_index_helper = 0;
    //console.log(track_list[track_id_finder(track_index_helper)]);
    console.log(track_id_finder(track_index_helper));
    return track_id_finder(track_index_helper);
}

function seekUpdate(track) {
    let seekPosition = 0;
    // Check if the current track duration is a legible number
    if (!isNaN(curr_track.duration)) {
        seekPosition = track.currentTime * (100 /  track_list[track_index].te); //track.duration);
        seek_slider.value = seekPosition;
    
        // Calculate the time left and the total duration
        let currentMinutes = Math.floor(track.currentTime / 60);
        let currentSeconds = Math.floor(track.currentTime - currentMinutes * 60);
        let durationMinutes = Math.floor(track_list[track_index].te / 60);   //track.duration / 60);
        let durationSeconds = Math.floor(track_list[track_index].te - durationMinutes * 60);
    
        // Add a zero to the single digit time values
        if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
        if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
        if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
        if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }
    
        // Display the updated duration
        curr_time.textContent = currentMinutes + ":" + currentSeconds;
        total_duration.textContent = durationMinutes + ":" + durationSeconds;
    }
}
    
function getCurrentTrack() {
    if (currentAudio)
        return curr_track;
    else
        return other_track;
}

// Function to reset all values to their default
function resetValues() {
    curr_time.textContent = "00:00";
    total_duration.textContent = "00:00";
    seek_slider.value = 0;
}

function playpauseTrack() {
    // Switch between playing and pausing
    // depending on the current state
    if (!isPlaying) 
        playTrack(getCurrentTrack());
    else 
        pauseTrack();
}
    
function playTrack(trackToUse) {
    // Play the loaded track
        console.log(trackToUse.src);
        trackToUse.curr_time = 0;
        trackToUse.play();
        console.log("belowplay");
        isPlaying = true;        
        // Replace icon with the pause icon
        playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
        
}
    
function pauseTrack() {
    // Pause the loaded track
    getCurrentTrack().pause();
    isPlaying = false;
    
    // Replace icon with the play icon
    playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
}
    
async function nextTrack(resetFade) {
    let trackToUse = getCurrentTrack();          
    let track_index_helper = track_list[track_index].index;
    console.log(trackToUse);
    if (track_index_helper < track_list.length - 1)
        track_index_helper += 1;
    else track_index_helper = 0;
    
    track_index = track_id_finder(track_index_helper);
    // Load and play the new track
    if (resetFade) {
        fading = false;
        await preLoadTrack(track_index);

    } 
    loadTrack(track_index, trackToUse);
    console.log("between");
    //playTrack(trackToUse); 
    console.log("bottomofnexttrack");  
}
    
async function prevTrack(resetFade) {
    // Go back to the last track if the
    // current one is the first in the track list                        
    let track_index_helper = track_list[track_index].index; 
    if (track_index_helper > 0)
        track_index_helper -= 1;
    else 
        track_index_helper = track_list.length - 1;

    track_index = track_id_finder(track_index_helper);
    // Load and play the new track
    getCurrentTrack().pause();
    if (resetFade) {
        fading = false;
    }
    await preLoadTrack(track_index);
    loadTrack(track_index, getCurrentTrack());
    //playTrack(getCurrentTrack());
    console.log("bot of prev");
}

function seekTo() {
    let track = getCurrentTrack();
    let seekto = track_list[track_index].te * (seek_slider.value / 100);  
    // Set the current track position to the calculated seek position
    track.currentTime = seekto;
}
    
function handleListClick(index) {
    if (index != undefined) {
        displaySongs(index);
        changeListTextColor(index);
        playlistDisplaying = true;
        addDrag();
        createSettingsFields(index);
        settings_title.textContent = datajson[index].name;
        viewPlaylistIndex = index;
    }
}

function random_bg_color() {
    let red = Math.floor(Math.random() * 256) + 64;
    let green = Math.floor(Math.random() * 256) + 64;
    let blue = Math.floor(Math.random() * 256) + 64;
    let red2 = Math.floor(Math.random() * 256) + 64;
    let green2 = Math.floor(Math.random() * 256) + 64;
    let blue2 = Math.floor(Math.random() * 256) + 64;

    // Construct a color withe the given values
    let bgColor = "rgb(" + red + ", " + green + ", " + blue + ")";
    let bgColor2 = "rgb(" + red2 + ", " + green2 + ", " + blue2 + ")";

    // Set the background to the new color
    document.body.style.background = "linear-gradient("+bgColor+","+bgColor2+")";
}

const initSortableList = (e) => {
    e.preventDefault();
    const draggingItem = document.querySelector(".dragging");
    // Getting all items except currently dragging and making array of them
    let siblings = [...edit_list.querySelectorAll(".edit-songs-item:not(.dragging)")];
    let nextSibling = siblings.find(sibling => {
        //Logic for scrolling
        if ((e.clientY > (edit_container.offsetHeight + edit_container.offsetTop) * 0.8)) {
            if (edit_container.scrollTop < edit_list.clientHeight - edit_container.offsetHeight) {
                edit_container.scrollTop += 1;
            }
        } 
        if ((e.clientY < (edit_container.offsetHeight + edit_container.offsetTop) / 3)) {
            if (edit_container.scrollTop >= 0) {
                edit_container.scrollTop -= .5;
            }

        }  
        return e.clientY + edit_container.scrollTop <= sibling.offsetTop + sibling.offsetHeight + window.innerHeight / 100 * 1;
    });
    // Inserting the dragging item before the found sibling
    edit_list.insertBefore(draggingItem, nextSibling);
}
edit_list.addEventListener("dragover", initSortableList);
edit_list.addEventListener("dragenter", e => e.preventDefault());

function handleSaveButton(playlistIndex) {
    postFunction();
    let formobj = new FormData(document.getElementById("settings_form"));
    for (let i = 0; i < datajson[playlistIndex].data.length; i++) {
        let tsmin = formatNumber(formobj.get('tsmin' + datajson[playlistIndex].data[i].id));
        let tssec = formatNumber(formobj.get('tssec' + datajson[playlistIndex].data[i].id));
        let temin = formatNumber(formobj.get('temin' + datajson[playlistIndex].data[i].id));
        let tesec = formatNumber(formobj.get('tesec' + datajson[playlistIndex].data[i].id));
        let timestart = (tsmin * 60) + tssec;
        let timeend = (temin * 60 ) + tesec;
        datajson[playlistIndex].data[i].ts = timestart;
        datajson[playlistIndex].data[i].te = timeend;
    }
}



function recolorPlaylist() {
    //recolor playlist so it is always alternating
    for(i = 0; i < edit_list.childNodes.length; i++) {
        if (i %2 == 0)
            edit_list.childNodes[i].style.backgroundColor = 'black';
        else {
            edit_list.childNodes[i].style.backgroundColor = '#1e1e1e';
        }
    }
}

//updates track_list[i].index to new values after element is dropped
function reorderPlaylist() {        
    return new Promise(resolve => {
    while(playlistData.firstChild) {
        playlistData.removeChild(playlistData.lastChild);
    }
    for (let i = 0; i < datajson[viewPlaylistIndex].data.length; i++) {
        const elem = datajson[viewPlaylistIndex].data.find(o => o.id == edit_list.childNodes[i].id);
        datajson[viewPlaylistIndex].data[datajson[viewPlaylistIndex].data.findIndex(o => o.id == edit_list.childNodes[i].id)].index = i;
        let li = document.createElement('li');
        li.className = "playlist-songs-item";
        li.innerText = elem.name;
        li.name = elem.id;
        let list_span = document.createElement("span");
        list_span.textContent = elem.artist;
        list_span.className = "artist-name-span";
        list_span.name = elem.id;
        li.appendChild(list_span);
        if (i %2 == 0) {                                                                     
            li.style.color = 'white';
            li.style.background = '#1e1e1e';
        }
        playlistData.appendChild(li);
    }
    resolve(true);
    })
}

function addDrag() {
    edit_list_items = document.querySelectorAll(".edit-songs-item");
    edit_list_items.forEach(item => {
        item.addEventListener("dragstart", () => {
            setTimeout( () => item.classList.add("dragging"), 0);              
            item.style.color = "pink";
        });
        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");
            item.style.color ="white";
        });
    });
}

function changeListTextColor(index) {
    let active = document.querySelector(".playlist-list-item"+index);
    let prev = document.querySelector(".playlist-list-item"+viewPlaylistIndex);
    prev.style.color = '#F072A9';
    active.style.color = 'white';
    prev.style.backgroundColor = 'black';
    active.style.backgroundColor = '#F072A9';
    prev.style.border = "none";
    active.style.borderTop = "10px solid #F072A9";          
    active.style.borderBottom = "10px solid #F072A9";
}

let handleSongClick = async function(event) {     
    if (event != undefined && event.target.name >= 0) {
        fading = false;
        other_track.pause();
        curr_track.pause();
        track_list = datajson[viewPlaylistIndex].data;
        currentPlaylist = viewPlaylistIndex;          
        track_index = track_index_finder(event.target.name);
        //curr_track.pause();
        //other_track.pause();
        await preLoadTrack(track_index);
        loadTrack(track_index, getCurrentTrack());
        //playTrack(getCurrentTrack());
    }
}

function displaySongs(index) {
    while(playlistData.firstChild) {
        edit_list.removeChild(edit_list.lastChild);
        playlistData.removeChild(playlistData.lastChild);
    }
    let displayingList = datajson[index].data;
    console.log(displayingList);
    for (let i = 0; i < displayingList.length; i++) {
        const elem = displayingList.find(o => o.index === i);
        let li = document.createElement('li');
        li.className = "playlist-songs-item";
        li.innerText = elem.name;
        li.name = elem.id;
        let list_span = document.createElement("span");
        list_span.textContent = elem.artist;
        list_span.className = "artist-name-span";
        list_span.name = elem.id;
        li.appendChild(list_span);
        let editli = document.createElement("li");
        let trackArtist = document.createElement("div");
        trackArtist.className = "settingsInfo";
        editli.className = "edit-songs-item";
        editli.draggable = true;
        editli.id = elem.id; 
        let track_span = document.createElement("span");
        track_span.textContent = elem.name;
        track_span.className = "track-name-span";
        trackArtist.appendChild(track_span);
        let artist_span = document.createElement("span");
        artist_span.textContent = elem.artist;
        artist_span.className = "artist-name-span";
        trackArtist.appendChild(artist_span);
        editli.appendChild(trackArtist);
        if (i %2 == 0) {                                                                     
            li.style.color = 'white';
            li.style.background = '#1e1e1e';
            editli.style.backgroundColor = '#1e1e1e';
        }
        edit_list.appendChild(editli);
        playlistData.appendChild(li);
    }
    playlistData.addEventListener('click', handleSongClick, true);
}

function track_id_finder(track_index_number) {
    return track_list.findIndex(o => o.index == track_index_number);
}

function track_index_finder(track_id_number) {
    return track_list.findIndex(o => o.id == track_id_number);
}

function displaySettings() {          
    for (let i = 0; i < list_items.length; i++) {
        list_items[i].childNodes[1].style.visibility = "visible";
        list_items[i].childNodes[2].style.visibility = "visible";
        list_container.style.left = "77vw";
        list_container.style.width = "21vw";
    }
}

function createSettingsFields(index) {

for (let i = 0; i < edit_list_items.length; i++) {
    console.log(datajson);
    console.log(index);
    console.log(i);
    let songobj = datajson[index].data.find(o => o.index == i);
    let timestart = songobj.ts;
    let timeend = songobj.te;
    let songid = songobj.id;

    const tsInputMin = document.createElement('input');
    tsInputMin.type = "text";
    tsInputMin.classList ="tsmin";
    tsInputMin.value = Math.floor(timestart / 60);
    if (tsInputMin.value < 10)
        tsInputMin.value = "0" + tsInputMin.value;
    tsInputMin.name = "tsmin" + songid;
    tsInputMin.setAttribute("Form", "settings_form");        //this one
    tsInputMin.maxLength = 2;
    const tsInputSec = document.createElement('input');
    tsInputSec.type = "text";
    tsInputSec.classList ="tssec";
    tsInputSec.value = Math.floor(timestart % 60);
    if (tsInputSec.value < 10)
        tsInputSec.value = "0" + tsInputSec.value;
    tsInputSec.name = "tssec" + songid;
    tsInputSec.setAttribute("Form", "settings_form");        //this one
    tsInputSec.maxLength = 2;
    const teInputMin = document.createElement('input');
    teInputMin.type = "text";
    teInputMin.name = "temin" + songid;
    teInputMin.setAttribute("Form", "settings_form");
    teInputMin.classList = "temin";
    teInputMin.maxLength = 2; 
    teInputMin.value = Math.floor(timeend / 60);
    if (teInputMin.value < 10)
        teInputMin.value = "0" + teInputMin.value;
    const teInputSec = document.createElement('input');
    teInputSec.type = "text";
    teInputSec.name = "tesec" + songid;
    teInputSec.setAttribute("Form", "settings_form");
    teInputSec.classList = "tesec";
    teInputSec.maxLength = 2;
    
    const colon = document.createElement("span");
    colon.textContent = ":";
    colon.classList = "tscolon";

    const colon2 = document.createElement("span");
    colon2.textContent = ":";
    colon2.classList = "tecolon";
    const hyphen = document.createElement("span");
    hyphen.textContent = "-";
    hyphen.classList = "hyphen";
    let deleteIcon = document.createElement("i");
    deleteIcon.classList = "fas fa-minus-circle";
    deleteIcon.style.color = "#F072A9";
    deleteIcon.id = "delete-song-" + songid;
    let listSpan = document.createElement("span");
    listSpan.classList = "list-span";
    teInputSec.value = Math.floor(timeend % 60);
    if (teInputSec.value < 10)
        teInputSec.value = "0" + teInputSec.value;
 
    listSpan.appendChild(tsInputMin);
    listSpan.appendChild(colon);
    listSpan.appendChild(tsInputSec);
    listSpan.appendChild(hyphen);
    listSpan.appendChild(teInputMin);
    listSpan.appendChild(colon2);
    listSpan.appendChild(teInputSec);
    edit_list_items[i].appendChild(deleteIcon);
    edit_list_items[i].appendChild(listSpan);
    const regex = new RegExp("^[0-9]*$");

    deleteIcon.addEventListener("click", (event) => {       
        let obj = datajson[viewPlaylistIndex].data[dataJsonIndexFinder(viewPlaylistIndex, Number(event.target.id.substring(12)))];                                             //change
        let result = confirm("Are you sure you want to delete " + obj.name + " from " + datajson[viewPlaylistIndex].name + "? If it does not belong to any other playlist, it will be deleted from the database entirely.");
        if (result) {
            sendDeleteSongRequest(Number(event.target.id.substring(12)), datajson[viewPlaylistIndex].name, datajson[viewPlaylistIndex].data.length, obj.path);
            deleteSongFromPlaylist(Number(event.target.id.substring(12)), viewPlaylistIndex);

        }
    });
    
    tsInputMin.addEventListener("beforeinput", (event) => {
        if (event.data != null && !regex.test(event.data)) 
            event.preventDefault();
    });

    tsInputSec.addEventListener("beforeinput", (event) => {
        if (event.data != null && !regex.test(event.data)) 
            event.preventDefault();
    });

    teInputMin.addEventListener("beforeinput", (event) => {
        if (event.data != null && !regex.test(event.data)) 
            event.preventDefault();
    });

    teInputSec.addEventListener("beforeinput", (event) => {
        if (event.data != null && !regex.test(event.data)) 
            event.preventDefault();
    });

    tsInputMin.addEventListener('focusout', function(e) {       
        let start = convertToSeconds(formatNumber(tsInputMin.value), formatNumber(tsInputSec.value));
        let end = convertToSeconds(formatNumber(teInputMin.value), formatNumber(teInputSec.value));
        if (start + faderLength >= end || start) {
            tsInputMin.value = "00";
            tsInputSec.value = "00";
        }
        handleSaveButton(viewPlaylistIndex);
    });

    tsInputSec.addEventListener('focusout', function(e) {
        let start = convertToSeconds(formatNumber(tsInputMin.value), formatNumber(tsInputSec.value));
        let end = convertToSeconds(formatNumber(teInputMin.value), formatNumber(teInputSec.value));
        if (start + faderLength >= end || formatNumber(tsInputSec.value) > 59) {
            tsInputMin.value = "00";
            tsInputSec.value = "00";
        }
        handleSaveButton(viewPlaylistIndex);
    });
    teInputMin.addEventListener('focusout', function() {   
        let start = convertToSeconds(formatNumber(tsInputMin.value), formatNumber(tsInputSec.value));
        let end = convertToSeconds(formatNumber(teInputMin.value), formatNumber(teInputSec.value));
        if (start + faderLength >= end || end > songobj.duration) {
            teInputMin.value = reverseFormatNumber(Math.floor(songobj.duration / 60));
            teInputSec.value = reverseFormatNumber(Math.floor(songobj.duration % 60));
        } 
        handleSaveButton(viewPlaylistIndex);
    });
    teInputSec.addEventListener('focusout', function() {    
        let start = convertToSeconds(formatNumber(tsInputMin.value), formatNumber(tsInputSec.value));
        let end = convertToSeconds(formatNumber(teInputMin.value), formatNumber(teInputSec.value));
        if (start + faderLength >= end || end > songobj.duration || formatNumber(teInputSec.value) > 59) {
            teInputMin.value = reverseFormatNumber(Math.floor(songobj.duration / 60));
            teInputSec.value = reverseFormatNumber(Math.floor(songobj.duration % 60));
        }
        handleSaveButton(viewPlaylistIndex);
    });
}
    playlistIdentifier.value = datajson[index].name;
}

function dataJsonIndexFinder(index, id) {
    return datajson[index].data.findIndex(o => o.id == id);
}

function deleteSongFromPlaylist(id, djIndex) {
    let removeIndex = datajson[djIndex].data[dataJsonIndexFinder(djIndex, id)].index;
    let array = datajson[djIndex].data;
    let replacementArray = [];
    for (let i = 0; i < array.length; i++) {
        if (array[i].index != removeIndex) {
            if(array[i].index > removeIndex) {
                array[i].index -= 1;
            }
            replacementArray.push(array[i]);
        }
        
    }
    datajson[djIndex].data = replacementArray;
    console.log(datajson[djIndex].data);
    displaySongs(viewPlaylistIndex);
    changeListTextColor(viewPlaylistIndex);
    addDrag();
    createSettingsFields(viewPlaylistIndex);
}

function deletePlaylist() {
    let index = viewPlaylistIndex;
    let confirmResult = confirm("Are you sure you want to delete playlist " + datajson[index].name + "? Any tracks that dont belong to other playlists will be completely deleted from the database.");
    if (confirmResult) {
        sendDeletePlaylistRequest(document.querySelector(".playlist-list-item" + index).textContent);
        deletePlaylistHelper(index);        
    }
}

function deletePlaylistHelper(index) {
    let newArray = [];
    for (let i = 0; i < datajson.length; i++) {
        if (i != index) {
            newArray.push(datajson[i]);
        }
    }
    datajson = newArray;
    console.log(newArray);
    viewPlaylistIndex = 0;
    handleListClick(0); //this neeed to change
    if (index === currentPlaylist) {
        currentPlaylist = 0;
        track_list = datajson[0].data;
        curr_track.pause();
        other_track.pause();
    }
    console.log(index);
    playlist_list.removeChild(document.querySelector(".playlist-list-item" + index));
    console.log(datajson.length);
    for (let i = index + 1; i < datajson.length+1; i++) {
        let num = i - 1;
        let element = document.querySelector(".playlist-list-item" + i);
        element.removeAttribute("onclick");
        element.addEventListener("click", () => {
            handleListClick(num);
        });
        element.className = "playlist-list-item" + num;
    }
    createCheckboxes();
    
    
}

function repaintPlaylistList() {
    while(playlist_list.firstChild) {
        playlist_list.removeChild()
    }
    datajson.forEach(function callback (element,index) {
        
    });
}

function formatNumber(x) {
    if (x.length == 1) {
        return Number(x);
    } else {
        if (x[0] == '0') {
        return Number(x[1]);
        }
        else
        return Number(x);
    }
}

function reverseFormatNumber(x) {
    let y = x.toString();
    if (y.length == 1)
        return "0" + y;
    else
        return y;
}

function convertToSeconds(min, sec) {
    return min * 60 + sec;
}




	/*window.addEventListener("resize", (event) => {
		let nameList = document.querySelectorAll(".container");
		nameList.forEach((element, index) => {
			console.log(element.textContent);
			if (playlist_names[index].length * 15 > window.innerWidth) {
				element.textContent = playlist_names[index].substring(0, Math.floor(window.innerWidth / 14));
			} else {
				element.textContent = playlist_names[index];
			}
		});
	});*/

    function computeLength(file) {
        console.log(file);
		return new Promise((resolve) => {
			let objectURL = URL.createObjectURL(file);
            let mySound = new Audio();
            mySound.src = objectURL;
            mySound.load();
			mySound.addEventListener(
			"canplay",
			() => {
				URL.revokeObjectURL(objectURL);
				console.log(mySound.duration + "duration");
				resolve({
				file,
				duration: mySound.duration
				});
			},
			false,
			);
            console.log("bottom");
            

		});  
	}

	function createCheckboxes() {
        while(checkboxes_container.firstChild) {
            checkboxes_container.removeChild(checkboxes_container.lastChild);
        }

		datajson.forEach((element, index) => {
			const label = document.createElement('label');
			label.classList = "container"
			if (element.name.length * 15 > window.innerWidth) {
				label.textContent = element.name.substring(0, Math.floor(window.innerWidth / 14));
			} else {
				label.textContent = element.name;
			}
			const check_box = document.createElement("input");
			check_box.type = "checkbox";
            check_box.className = "checkboxes";
			check_box.name = "checkbox[]";
			check_box.value = element.name;
            check_box.setAttribute("form", "add_tracks_form");
			check_box.onclick = "toggleCheckValue(index)";
			const spanCheckmark = document.createElement("span");
			spanCheckmark.classList = "checkmark";
			label.appendChild(check_box);
			label.appendChild(spanCheckmark);
			checkboxes_container.appendChild(label);
			
		});
	}

	
	

	inputElement.addEventListener("change", (e) => {
        if (inputElement.files[0].type == 'audio/wav' || inputElement.files[0].type == 'audio/mpeg') {
            if (inputElement.files.length) {
                updateThumbnail(dropZoneElement, inputElement.files[0]);
            }
            computeLength(inputElement.files[0])
                .then((result) => {
                    console.log("in res");
                    dur = result.duration;
                    songLength.value = result.duration;					//-----duration of each track
                })
                .catch ((error) => {
                    console.log(error);
                });
        } else {
            document.querySelector(".drop-zone__prompt").textContent = "Drop file here or click to upload";
            document.querySelector(".drop-zone__prompt").style.fontSize = "1em";
            inputElement.value ="";
        }
		
	});
    

	dropZoneElement.addEventListener("dragover", (e) => {
		e.preventDefault();
		dropZoneElement.classList.add("drop-zone--over");
	});

	["dragleave", "dragend"].forEach((type) => {
		dropZoneElement.addEventListener(type, (e) => {
			dropZoneElement.classList.remove("drop-zone--over");
		});
	});

	dropZoneElement.addEventListener("drop", (e) => {
		e.preventDefault();
        if (inputElement.files[0].type == 'audio/wav' || inputElement.files[0].type == 'audio/mpeg') {
            if (e.dataTransfer.files.length) {
                inputElement.files = e.dataTransfer.files;
                updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
            }

            dropZoneElement.classList.remove("drop-zone--over");
            computeLength(inputElement.files[0])
                .then((result) => {
                    dur = result.duration;
                    songLength.value = result.duration;					//-----duration of each track
                })
                .catch ((error) => {
                    console.log(error);
                });
        } else {
            inputElement.value = "";
            document.querySelector(".drop-zone__prompt").textContent = "Drop file here or click to upload";
            document.querySelector(".drop-zone__prompt").style.fontSize = "1em";
        }

	});


/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */
function updateThumbnail(dropZoneElement, file) {
    dropZoneElement.querySelector(".drop-zone__prompt").textContent = file.name;
    dropZoneElement.querySelector(".drop-zone__prompt").style.fontSize = "0.8em";
}