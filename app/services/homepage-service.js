const express = require('express');
const fs = require('fs');
const AudioContext = require("web-audio-api").AudioContext;
const MusicTempo = require("music-tempo");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = new S3Client({ region: process.env.S3_REGION });
const bucket = process.env.S3_BUCKET_NAME;
const { insertTrackData,
        insertIntoPlaylistDataDb,
        selectFromPlaylistData,
        selectFromTracks,
        findPlaylistInDb,
        findIndex,
        findSongInPlaylistData,
        getPlaylistListFromDb,
        getPlaylistSongList,
        deletePlaylistFromPlaylist,
        deletePlaylistFromPlaylistData,
        deleteSongFromTracks,
        deleteSongfromPlaylistData,
        updateOrderInDB,
        updateSongIndex,
        updateTimeValues } = require('../database/access-database');
const TRIMMED_FILE = "trimmed-output.mp3";

const uploadS3 =  async (file, name) => {
    const uploadParams = {
        Bucket: bucket,
        Body: file,
        Key: name
    };
    const command = new PutObjectCommand(uploadParams);
    return await s3Client.send(command);
}

const downloadS3 = async (path) => {
    const downloadParams = {
        Key: path,
        Bucket: bucket
    };

    const command = new GetObjectCommand(downloadParams);
    return await s3Client.send(command);
}

const deleteS3 = async (path) => {
    const deleteParams = {
        Key: path,
        Bucket: bucket
    };

    const command = new DeleteObjectCommand(deleteParams);
    return await s3Client.send(command);

}

const insertTrackIntoDbHelper = async (dataobj, activeUid) => {
    let sid = -1;
    let song_index = 0;
    sid = await insertTrackData(dataobj.name, dataobj.artist, dataobj.path, dataobj.duration, activeUid); //insert metadata, need to return SELECT LAST_INSERT_ID()

    if(Array.isArray(dataobj.playlists)) {
        for (const element of dataobj.playlists) {
            let pid = await findPlaylistInDb(element, activeUid); //returns pid
            let findIndexResult = await findIndex(pid, activeUid);  //returns row with highest song_index RowDataPacket { pid: 18,sid: 1, uid: 28, song_index: 1, ts: 0,te: 0 }
            if (findIndexResult != 0) {
                song_index = Number(findIndexResult[0].song_index) + 1;
            }
            await insertIntoPlaylistDataDb(pid, sid, activeUid, song_index, 0, dataobj.duration);
      }

    } else {
        let pid = await findPlaylistInDb(dataobj.playlists, activeUid); //returns pid
        let findIndexResult = await findIndex(pid, activeUid);  //returns row with highest song_index RowDataPacket { pid: 18,sid: 1, uid: 28, song_index: 1, ts: 0,te: 0 }
        if (findIndexResult != 0)
          song_index = Number(findIndexResult[0].song_index) + 1;
        await insertIntoPlaylistDataDb(pid, sid, activeUid, song_index, 0, dataobj.duration);
    }
    return sid;
}
  
const getDataFromDbHelper = async (uid) => {  
    let playlistData = [];
    let obj = await getPlaylistListFromDb(uid);   //list of all playlists for user (gets the name of playlist)
    for(let i = 0; i < obj.length; i++) {
        playlistData.push({
            name: obj[i].name,
            data: []
        });
        let playlist_dataobj = await getPlaylistSongList(obj[i].pid, uid);   //list of songs for a single playlist from playlist_data
        for (element of playlist_dataobj) {
            let trackRow = await selectFromTracks(element.sid);     //song data from Tracks
            playlistData[i].data.push({
                id: trackRow[0].track_id,
                index: element.song_index,      
                name: trackRow[0].title,
                artist: trackRow[0].artist,
                path: trackRow[0].path,
                ts: element.ts,
                te: element.te,
                duration: trackRow[0].duration,
                fade: element.fade
            });

        }
    }
    return playlistData;
}
  
const insertTimeValuesIntoDbHelper = async (formobj, activeUid) => {
    for (let i = 0; i < (Object.keys(formobj).length-1);) {
        let tsmin = formatNumber(Object.values(formobj)[i]);
        let tssec = formatNumber(Object.values(formobj)[++i]);
        let temin = formatNumber(Object.values(formobj)[++i]);
        let tesec = formatNumber(Object.values(formobj)[++i]);
        let song_index = ++i / 4 - 1;
        let timestart = (tsmin * 60) + tssec;
        let timeend = (temin * 60 ) + tesec;
        let pid = await findPlaylistInDb(formobj.playlistIdentifier, activeUid);
        await updateTimeValues(timestart, timeend, song_index, pid);
    }
}
  
const reorderTrackListHelper = async (activeUid, idArray, indexArray, playlistName) => {
    let pid = await findPlaylistInDb(playlistName, activeUid);
    for(let i = 0; i < idArray.length; i++) {    
        await updateOrderInDB(idArray[i], indexArray[i], pid);
    }
}
  
const deleteSongHelper = async (activeUid, songid, playlistName, playlistLength, path) => {
    let pid = await findPlaylistInDb(playlistName, activeUid);
    let rowData = await findSongInPlaylistData(activeUid, songid, pid);
    let song_index = rowData[0].song_index;
    await deleteSongfromPlaylistData(activeUid, songid, pid);
    let songExist = await selectFromPlaylistData(songid);
    if (songExist == 0) {
        //delete from tracks
        deleteSongFromTracks(songid);
        deleteS3(path);
    }
    for (let i = song_index + 1; i < playlistLength; i++) {
        await updateSongIndex(activeUid, pid, i);
    }
}
  
const deletePlaylistHelper = async (activeUid, name) => {
    let pid = await findPlaylistInDb(name, activeUid);
    let rows = await getPlaylistSongList(pid, activeUid);
    await deletePlaylistFromPlaylistData(pid, activeUid);
    await deletePlaylistFromPlaylist(pid, activeUid);
    for (element of rows) {
        let songExist = await selectFromPlaylistData(element.sid);
        if (songExist == 0) {
            //delete from tracks        
            let row = await selectFromTracks(element.sid);
            deleteSongFromTracks(element.sid);
            deleteS3(row[0].path);
        }
    }
}

const writeSongToTempStorage = async (path, song) => {
    const fileBuffer = await new Response(song).arrayBuffer();
    fs.writeFile(process.cwd() + '/public/uploads/' + path, new Uint8Array(fileBuffer), (err) => {
        return !(err);
    });
}

const deleteSongFromTempStorage = (path) => {
    fs.unlink(process.cwd() + '/public/uploads/' + path, function (err) {
        return !(err)
      });
}

function formatNumber(x) {
    if (x.length == 1) {
        return Number(x);
    } else {
        if (x[0] == '0') 
            return Number(x[1]);
        else
            return Number(x);
    }
}

async function trim(inputFile) {
    return new Promise((resolve, reject) => {
    ffmpeg('public/uploads/'+inputFile)
      .inputOptions(['-t 10',
                    '-ss 30']) // 2s
      .output(TRIMMED_FILE)
      .on('end', async () => {
        resolve();
      })
      .on('error', (err) => {
        console.error('Error:', err);
        reject(err);
      })
      .run()
    });
  }
  const calcTempo = async function (buffer) {
    console.log(buffer);
      let audioData = [];
    // Take the average of the two channels
    if (buffer.numberOfChannels == 2) {
      const channel1Data = buffer.getChannelData(0);
      const channel2Data = buffer.getChannelData(1);
      const length = channel1Data.length;
      for (let i = 0; i < length; i++) {
        audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
      }
    } else {
      audioData = buffer.getChannelData(0);
    }
    const mt = new MusicTempo(audioData);
   
    return mt.tempo;
  }
   
  async function runBPM() {
    return new Promise((resolve, reject) => {
        const data = fs.readFileSync(TRIMMED_FILE);
        const context = new AudioContext();
        context.decodeAudioData(data, async function(decodeData) {
            resolve(await calcTempo(decodeData));
        });
    });
  }

async function getBPM(inputFile) {
    await trim(inputFile);
    return await runBPM();
}






module.exports = {
    uploadS3,
    downloadS3,
    deleteS3,
    deletePlaylistHelper,
    deleteSongHelper,
    reorderTrackListHelper,
    insertTimeValuesIntoDbHelper,
    getDataFromDbHelper,
    insertTrackIntoDbHelper,
    writeSongToTempStorage,
    deleteSongFromTempStorage,
    getBPM
};