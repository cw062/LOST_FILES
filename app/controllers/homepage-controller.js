const express = require('express');
const path = require('path');
const { uploadS3,
        downloadS3,
        deletePlaylistHelper,
        deleteSongHelper,
        reorderTrackListHelper,
        insertTimeValuesIntoDbHelper,
        getDataFromDbHelper,
        insertTrackIntoDbHelper, 
        writeSongToTempStorage,
        deleteSongFromTempStorage } = require('../services/homepage-service');
const { insertPlaylistIntoDB, updateFadeDb } = require('../database/access-database'); 
const { createLocalFolder } = require('../services/signup-services');

const renderHomepage = async (req, res) => {
    console.log("hello from render homepage");
    if (req.session.isLoggedIn) {
        res.render('Homepage');
        createLocalFolder(req.session.user);
    }
    else {
        console.log("ere");
        res.redirect('/Login');
    }
}

const addTrack = async (req, res) => {
    let data = JSON.parse(JSON.stringify(req.body));
    const obj = {
        name: data.nameData,
        artist: data.artistData,                                   
        path: req.session.user + "/" + data.nameData + data.artistData + Date.now() + path.extname(req.files.file.name),
        duration: Math.floor(data.duration),
        playlists: data['checkbox[]']
    };
    await uploadS3(req.files.file.data, obj.path);
    let sid = await insertTrackIntoDbHelper(obj, req.session.user); //inserts track into database after submitting add_tracks 
    
    res.json({pathFromServer: obj.path, songid: sid});  
}

const getAllData = async (req, res) => {
    const userData = await getDataFromDbHelper(req.session.user);
    res.send(userData);
}

const newPlaylist = (req, res) => {
    insertPlaylistIntoDB(req.session.user, JSON.parse(JSON.stringify(req.body)).new_playlist_name);
    res.json({success: true});
}

const updateTimeValues = (req, res) => {
    insertTimeValuesIntoDbHelper(req.body, req.session.user);
    res.json({success: true});
}

const getSong = async (req, res) => {
    const newPath = JSON.parse(JSON.stringify(req.body)).path;
    let response;
    console.log(req.session.path);
    console.log(newPath);
    if (newPath != req.session.path) {
        if(req.session.path != undefined)
            deleteSongFromTempStorage(req.session.path);
        req.session.path = newPath;
        const song = await downloadS3(newPath);
        response = await writeSongToTempStorage(JSON.parse(JSON.stringify(req.body)).path, song.Body);
        console.log(response);
    }
    res.json({response: response});
}

const newTrackOrder = (req, res) => {
    reorderTrackListHelper(req.session.user, JSON.parse(JSON.stringify(req.body)).id, JSON.parse(JSON.stringify(req.body)).index, JSON.parse(JSON.stringify(req.body)).playlistIdentifier);   
    res.json({success: true});
}

const deleteSong = (req, res) => {
    deleteSongHelper(req.session.user, JSON.parse(JSON.stringify(req.body)).songid, JSON.parse(JSON.stringify(req.body)).playlistIdentifier, JSON.parse(JSON.stringify(req.body)).playlistLength, JSON.parse(JSON.stringify(req.body)).path);
    res.json({success: true});
}

const deletePlaylist = (req, res) => {
    deletePlaylistHelper(req.session.user, JSON.parse(JSON.stringify(req.body)).name);
    res.json({success: true});
}

const updateFade = (req, res) => {
    updateFadeDb(JSON.stringify(JSON.parse(req.body.id)), JSON.stringify(JSON.parse(req.body.value)));
    res.send({success: true});
}

module.exports = {
    addTrack,
    getAllData,
    newPlaylist,
    updateTimeValues,
    getSong,
    newTrackOrder,
    deleteSong,
    deletePlaylist,
    renderHomepage,
    updateFade

};

