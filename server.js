if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}

let iterations = 10000;
let isLoggedin = false;
let loggedInUsers = [45];

//Define dependencies
const app = require('./app');
const fs = require('fs');
const mysql = require('mysql');

const { timeLog } = require('console');
//const { connection } = require('mongoose');
//const helmet = require("helmet");
//const RateLimit = require("express-rate-limit");
const { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = new S3Client({ region: process.env.S3_REGION });
const bucket = process.env.S3_BUCKET_NAME;


/*const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});*/
async function uploadS3(file, name) {
  //const filestream = fs.createReadStream(file);
  const uploadParams = {
    Bucket: bucket,
    Body: file,
    Key: name
  };
  const command = new PutObjectCommand(uploadParams);
  return await s3Client.send(command);
}

async function dowloadS3(path) {
  const downloadParams = {
    Key: path,
    Bucket: bucket
  };

  const command = new GetObjectCommand(downloadParams);
  return await s3Client.send(command);
}

async function deleteS3(path) {
  const deleteParams = {
    Key: path,
    Bucket: bucket
  };

  const command = new DeleteObjectCommand(deleteParams);
  return await s3Client.send(command);

}


const port = process.env.APP_PORT;
let playlistNames = [];
let playlistData = [];
let obj = {};
let songid = {
  id: null
};


//app.use(limiter);
/*app.use(helmet.contentSecurityPolicy({
  directives: {
    scriptSrc: ["'self'"],
    mediaSrc: ["'self'", "blob:"] // Add the correct path to your public directory
  },
}));*/


const pool = mysql.createPool({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.MYSQL_DB,
  port: process.env.RDS_PORT
});



//sql queries---------------------------------------------------------------------------------------------------sql queries---------------------------------------------
//stores a users info in db after sign up, returns true on success, false on fail
function storeUserInfo(username, hash, salt) {
  return new Promise( resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let sqlstring = 'INSERT INTO Users (username, password, salt) VALUES (?)';
      let values = [username, hash, salt];
      connection.query(sqlstring, [values], function (err, result) {
        if(err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    connection.release();
    });
  });
}
//inserts a playlist into the database, returns true on success, false on fail
function insertPlaylistIntoDB(uid, name) {
  return new Promise( resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let sqlstring = 'INSERT INTO Playlist (name, uid) VALUES (?)';
      let values = [name, uid];
      connection.query(sqlstring, [values], function (err, result) {
        if(err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    connection.release();
    });
  });
}
//inserts a the playlist metadata into the database, true on success, false on fail
function insertIntoPlaylistDataDb(pid, sid, uid, index, ts, te) {
  return new Promise( resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let sqlstring = 'INSERT INTO Playlist_Data (pid, sid, uid, song_index, ts, te) VALUES (?)';
      let values = [pid, sid, uid, index, ts, te];
      connection.query(sqlstring, [values], function (err, result) {
        if(err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    connection.release();
    });
  });
}

//inserts song data into track table and returns the unique song id
function insertTrackData(name, artist, path, duration, activeUid) {
  return new Promise(resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let sqlstring = 'INSERT INTO Tracks (title, artist, path, fk_tracks_users, duration) VALUES (?)';
      let values = [name, artist, path, activeUid, duration];
      connection.query(sqlstring, [values], function (err, result) {
        if(err) {
          console.log(err);
          resolve(-1);
        } else {
          console.log('insertId: ' + result.insertId);
          resolve(result.insertId);
        }
      });
    connection.release();
    });
  });
}
//finds how many tracks are in the passed in playlist
function findIndex(pid, uid) {
  return new Promise( resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let values = [pid, uid];
      connection.query('SELECT * FROM Playlist_Data WHERE (pid, uid) = (?) ORDER BY song_index DESC LIMIT 1;', [values], function (err, result) {
        if(err) {
          console.log(err);
        } else {
          resolve(result);
        }
      });
    connection.release();
    });
  });
}
//looks up the entered username on login, returns hashed password and salt if successful, nothing if fail
function checkDatabaseForUsername(username) {
  return new Promise( resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let values = [username];
      connection.query('SELECT * FROM Users WHERE username = ?', [values], function (err, result) {
        if(err) {
          console.log(err);
        } else {
          resolve(result);
        }
      });
    connection.release();
    });
  });
}
//finds playlist id in db based on name and userid, returns playlist id on success, nothing on fail
function findPlaylistInDb(name, uid) {
  return new Promise( resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let values = [name, uid];
      connection.query('SELECT * FROM Playlist WHERE (name, uid) = (?)', [values], function (err, result) {
        if(err) {
          console.log(err);
        } else {
          resolve(result[0].pid);
        }
      });
    connection.release();
    });
  });
}
//gets the name, path from track table, returns the row on success, nothing on fail
function selectFromTracks(track_id) {
  return new Promise( resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let values = [track_id];
      connection.query('SELECT * FROM Tracks WHERE track_id = ?', [values], function (err, result) {
        if(err) {
          console.log(err);
        } else {
          resolve(result);
        }
      });
    connection.release();
    });
  });
}
//returns the list of tracks for the passed in playlist, containing song id, ts, and te
function getPlaylistSongList(pid, uid) {
  return new Promise( resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let values = [pid, uid];
      connection.query('SELECT * FROM Playlist_Data WHERE (pid, uid) = (?)', [values], function (err, result) {
        if(err) {
          console.log(err);
        } else {
          resolve(result);
        }
      });
    connection.release();
    });
  });
}

function selectFromPlaylistData(sid) {
  return new Promise( resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let values = [sid];
      connection.query('SELECT * FROM Playlist_Data WHERE sid = ?', [values], function (err, result) {
        if(err) {
          console.log(err);
        } else {
          resolve(result);
        }
      });
    connection.release();
    });
  });
}
//gets all of the playlist names for the active user
function getPlaylistListFromDb(uid) {
  return new Promise( resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let values = [uid];
      connection.query('SELECT * FROM Playlist WHERE uid = ?', [values], function (err, result) {
        if(err) {
          console.log(err);
        } else {
          resolve(result);
        }
      });
    connection.release();
    });
  });
}
//updates the time start and time end for each track in the passed in playlist
function updateTimeValues(ts, te, song_index, pid) {
  return new Promise(resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      connection.query('UPDATE Playlist_Data SET ts = '+ts+', te = '+te+' WHERE song_index = ' + song_index+ ' and pid = ' + pid + ';', function (err, result) {
        if(err) {
          console.log(err);
        } else {
          console.log(result);
          resolve(result);
        }
      });
    connection.release();
    });
  });
}
//updates the song_index of a track 
function updateOrderInDB(id, index, pid) {
  return new Promise(resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      connection.query('UPDATE Playlist_Data SET song_index = '+index+' WHERE sid = ' + id + ' and pid = '+pid+';', function (err, result) {
        if(err) {
          console.log(err);
        } else {
          console.log(result);
          resolve(result);
        }
      });
    connection.release();
    });
  });
}

function updateSongIndex(uid, pid, song_index) {
  newSongIndex = song_index-1;
  return new Promise(resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      connection.query('UPDATE Playlist_Data SET song_index = '+newSongIndex+' WHERE song_index = ' + song_index + ' and uid = ' + uid + ' and pid = '+pid+';', function (err, result) {
        if(err) {
          console.log(err);
        } else {
          console.log(result);
          resolve(result);
        }
      });
    connection.release();
    });
  });
}

function findSongInPlaylistData(activeUid, songid, pid) {
  return new Promise( resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let values = [pid, activeUid, songid];
      connection.query('SELECT * FROM Playlist_Data WHERE (pid, uid, sid) = (?) ORDER BY song_index DESC LIMIT 1;', [values], function (err, result) {
        if(err) {
          console.log(err);
        } else {
          resolve(result);
        }
      });
    connection.release();
    });
  });
}

function deleteSongfromPlaylistData(activeUid, songid, pid) {
  return new Promise( resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let values = [pid, activeUid, songid];
      console.log(values);
      connection.query('DELETE FROM Playlist_Data WHERE (pid, uid, sid) = (?);', [values], function (err, result) {
        if(err) {
          console.log(err);
        } else {
          console.log(result);
          resolve(result);
        }
      });
    connection.release();
    });
  });
}

function deleteSongFromTracks(track_id) {
  return new Promise( resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let values = [track_id];
      console.log(values);
      connection.query('DELETE FROM Tracks WHERE track_id = ?;', [values], function (err, result) {
        if(err) {
          console.log(err);
        } else {
          console.log(result);
          resolve(result);
        }
      });
    connection.release();
    });
  });
}

function deletePlaylistFromPlaylistData(pid, uid) {
  return new Promise( resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let values = [pid, uid];
      console.log(values);
      connection.query('DELETE FROM Playlist_Data WHERE (pid, uid) = (?);', [values], function (err, result) {
        if(err) {
          console.log(err);
        } else {
          console.log(result);
          resolve(result);
        }
      });
    connection.release();
    });
  });
}

function deletePlaylistFromPlaylist(pid, uid) {
  return new Promise( resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let values = [pid, uid];
      connection.query('DELETE FROM Playlist WHERE (pid, uid) = (?);', [values], function (err, result) {
        if(err) {
          console.log(err);
        } else {
          console.log(result);
          resolve(result);
        }
      });
    connection.release();
    });
  });
}

//sql helpers----------------------------------------------------------------------------------------------------sql helpers--------------------------------------------------
async function insertTrackIntoDbHelper(dataobj, activeUid) {
  let sid = -1;
    sid = await insertTrackData(dataobj.name, dataobj.artist, dataobj.path, dataobj.duration, activeUid); //insert metadata, need to return SELECT LAST_INSERT_ID()
    songid.id = sid;
  if(Array.isArray(dataobj.playlists)) {
    dataobj.playlists.forEach(element => {
      console.log(element);
      async function doWork() {
        let pid = await findPlaylistInDb(element, activeUid); //returns pid
        let findIndexResult = await findIndex(pid, activeUid);  //returns row with highest song_index RowDataPacket { pid: 18,sid: 1, uid: 28, song_index: 1, ts: 0,te: 0 }
        let song_index = 0;
        if (findIndexResult != 0) {
          console.log(findIndexResult[0].song_index);
          song_index = Number(findIndexResult[0].song_index) + 1;
        }
        await insertIntoPlaylistDataDb(pid, sid, activeUid, song_index, 0, dataobj.duration);
      }
      doWork();
    });
  } else {
      let pid = await findPlaylistInDb(dataobj.playlists, activeUid); //returns pid
      let findIndexResult = await findIndex(pid, activeUid);  //returns row with highest song_index RowDataPacket { pid: 18,sid: 1, uid: 28, song_index: 1, ts: 0,te: 0 }
      if (findIndexResult != 0)
        song_index = Number(findIndexResult[0].song_index) + 1;
      await insertIntoPlaylistDataDb(pid, sid, activeUid, song_index, 0, dataobj.duration);
  }
}

function getDataFromDbHelper(uid) {
  return new Promise(resolve => {
  async function helper() {

    let obj = await getPlaylistListFromDb(uid);   //list of all playlists for user (gets the name of playlist)
    for(let i = 0; i < obj.length; i++) {
      playlistNames.push(obj[i].name);
      playlistData.push({
        name: obj[i].name,
        data: []
      });
      let playlist_dataobj = await getPlaylistSongList(obj[i].pid, uid);   //list of songs for a single playlist from playlist_data
      for (let j = 0; j < playlist_dataobj.length; j++) {
        let trackRow = await selectFromTracks(playlist_dataobj[j].sid);     //song data from Tracks
        playlistData[i].data.push({
          id: trackRow[0].track_id,
          index: playlist_dataobj[j].song_index,      //why did i do this
          name: trackRow[0].title,
          artist: trackRow[0].artist,
          path: trackRow[0].path,
          ts: playlist_dataobj[j].ts,
          te: playlist_dataobj[j].te,
          duration: trackRow[0].duration
        });

      }
    }
    resolve(true);
  }
  helper();
  });
}

function insertTimeValuesIntoDbHelper(formobj, activeUid) {
  for (let i = 0; i < (Object.keys(formobj).length-1);) {
    let tsmin = formatNumber(Object.values(formobj)[i]);
    let tssec = formatNumber(Object.values(formobj)[++i]);
    let temin = formatNumber(Object.values(formobj)[++i]);
    let tesec = formatNumber(Object.values(formobj)[++i]);
    i++;
    let song_index = i / 4 -1;
    let timestart = (tsmin * 60) + tssec;
    let timeend = (temin * 60 ) + tesec;
    async function callUpdateDb() {
      let pid = await findPlaylistInDb(formobj.playlistIdentifier, activeUid);
      let result = await updateTimeValues(timestart, timeend, song_index, pid);
    }
    callUpdateDb();
  }
}

function reorderTrackListHelper(activeUid, idArray, indexArray, playlistName) {
  console.log(idArray);
  console.log(indexArray);
  async function doSomething() {
    let pid = await findPlaylistInDb(playlistName, activeUid);
    for(let i = 0; i < idArray.length; i++) {    
      await updateOrderInDB(idArray[i], indexArray[i], pid);
    }
  }
  doSomething();
}

function deleteSongHelper(activeUid, songid, playlistName, playlistLength, path) {
  async function doStuff() {
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
      console.log("here");
      await updateSongIndex(activeUid, pid, i);
    }

  }
  doStuff();
}

function deletePlaylistHelper(activeUid, name) {
  async function dplh() {
    console.log(name);
    let pid = await findPlaylistInDb(name, activeUid);
    console.log(pid);
    let rows = await getPlaylistSongList(pid, activeUid);
    console.log(rows);
    console.log("aboveisrows");
    await deletePlaylistFromPlaylistData(pid, activeUid);
    await deletePlaylistFromPlaylist(pid, activeUid);
    for (let i = 0; i < rows.length; i++) {
        console.log(rows[i].sid + " element.sid");
        let songExist = await selectFromPlaylistData(rows[i].sid);
        console.log(songExist);
        console.log("aboveis songexist");
        if (songExist == 0) {
          //delete from tracks        
          console.log("indph");
          let row = await selectFromTracks(rows[i].sid);
          console.log(row);
          console.log("above is row");
          deleteSongFromTracks(rows[i].sid);
          deleteS3(row[0].path);
        }
    }
  }
  dplh();
}

//post and get------------------------------------------------------------------------------------------------------------post/get-----------------------------
//after signup is successful, we will have no data to give to client
//after login is successful, need to query all data that has the same uid and pass it here and to the addtracks path
app.get('/', (req, res) => {      
  playlistData = [];
  playlistNames = [];
  if (loggedInUsers.includes(req.session.user)) {
    async function loginHelper() {
      await getDataFromDbHelper(req.session.user);
      res.render('Homepage', {data: {json: playlistData}});  
    }
    loginHelper();
  } else {
    res.redirect('/Login');
  }   
});

app.get('/sendSongId', (req, res) => {
  res.send(songid);
});

app.get('/sendDJ', (req, res) => {
  res.send(playlistData);
});


app.post('/ajaxpost', (req, res) => {
  if (JSON.parse(JSON.stringify(req.body)).new_playlist_name != undefined) {
    playlistNames.push(JSON.parse(JSON.stringify(req.body)).new_playlist_name);
    async function insertPlaylist() {
      insertPlaylistIntoDB(req.session.user, JSON.parse(JSON.stringify(req.body)).new_playlist_name);
    }
    insertPlaylist();

  } else {
    //access the database and update the ts and te fields
    insertTimeValuesIntoDbHelper(req.body, req.session.user);
  }
  const responseData = { message: 'Request received successfully!' };
  res.json(responseData);
  
});


app.post('/usernamePost', (req, res) => {
  async function checkUsername() {
    let result = await checkDatabaseForUsername(JSON.parse(JSON.stringify(req.body)).username);    //true for succcess, false for fail
    if (result == 0)
      res.json({status: false});
    else
      res.json({status: true});
  }
  checkUsername();
});

app.post('/postNewTrackList', (req, res) => {
  console.log(JSON.parse(JSON.stringify(req.body)).id + "this");
  reorderTrackListHelper(req.session.user, JSON.parse(JSON.stringify(req.body)).id, JSON.parse(JSON.stringify(req.body)).index, JSON.parse(JSON.stringify(req.body)).playlistIdentifier);   
  const responseData = { message: 'Request received successfully!' };
  res.json(responseData);
});

app.post('/add_tracks', async (req, res) => {
        let data = JSON.parse(JSON.stringify(req.body));
        console.log(path.extname(req.files.file.name));
        const obj = {
          name: data.nameData,
          artist: data.artistData,                                   
          path: req.session.user + "/" + data.nameData + data.artistData + Date.now() + path.extname(req.files.file.name),
          duration: Math.floor(data.duration),
          playlists: data['checkbox[]']
        };
        console.log(obj.path);
        //might need to wrap this in async
        let x = await uploadS3(req.files.file.data, obj.path);
        console.log(x);
        await insertTrackIntoDbHelper(obj, req.session.user); //inserts track into database after submitting add_tracks 
      
        res.json({pathFromServer: obj.path});        
});

/*app.post('/Login', (req, res) => {
    async function getPassCorrect() {
      //get row from db that matches username
      let dbrow = await checkDatabaseForUsername(req.body.username);
      if (dbrow == 0)
        res.render('Login', {data: "Username Incorrect"});
      else {
        let result = await isPasswordCorrect(dbrow[0].password, dbrow[0].salt, iterations, req.body.pass);
        //isLoggedin = result;
        if (result == false)
          res.render('Login', {data: "Password Incorect"});
        else {
          if(loggedInUsers.includes(dbrow[0].uid)) {
            res.render('Login', {data: "Account already logged in on another device"});
          } else {
            req.session.user = dbrow[0].uid;
            loggedInUsers.push(req.session.user);
            req.session.save(function (err) {
              if (err)
                return next(err)
            });
            //might need to use another async/promise
            //playlistData = await queryUserData(dbrow[0].uid);
            res.redirect('/');
        }
        }
      }

    }
    getPassCorrect();
});


app.post('/Signup', (req, res) => {
  async function createHashandSalt () {
    let returnedobj = await hashPassword(req.body.pass);
    let result = await storeUserInfo(req.body.username, returnedobj.hash, returnedobj.salt);    //true for succcess, false for fail
    if (result) {
      isLoggedin = result;
      //need to get created uid and assign it to activeuid
      let dbrow = await checkDatabaseForUsername(req.body.username);
      req.session.user = dbrow[0].uid;
      loggedInUsers.push(req.session.user);
      fs.mkdir(process.cwd() + '/public/uploads/' + req.session.user, (error) => {
        if (error) {
          console.log(error);
        } else {
          console.log("New Directory created successfully !!");
        }
      });
      res.redirect('/');
    } else {
      res.render('Signup', {root: __dirname});
    }
  }
  createHashandSalt();

}); */

app.post('/getSong', (req, res) => {
  async function dothisthing() {
    console.log(JSON.parse(JSON.stringify(req.body)).path);
    let song = await dowloadS3(JSON.parse(JSON.stringify(req.body)).path);
    const fileBuffer = await new Response(song.Body).arrayBuffer();
    fs.writeFile(process.cwd() + '/public/uploads/' + JSON.parse(JSON.stringify(req.body)).path, new Uint8Array(fileBuffer), (err) => {
      if (err)
        console.log(err);
      else {
        console.log("File written successfully\n");
        console.log("The written has the following contents:");
        res.json({"success": true});
      }
    });
  }
  dothisthing();
});

app.post('/postDeleteSong', (req, res) => {
  deleteSongHelper(req.session.user, JSON.parse(JSON.stringify(req.body)).songid, JSON.parse(JSON.stringify(req.body)).playlistIdentifier, JSON.parse(JSON.stringify(req.body)).playlistLength, JSON.parse(JSON.stringify(req.body)).path);
  const responseData = { message: 'Request received successfully!' };
  res.json(responseData);
});

app.post('/postDeletePlaylist', (req, res) => {
  deletePlaylistHelper(req.session.user, JSON.parse(JSON.stringify(req.body)).name);
  console.log(req.session.user +"user");
  const responseData = { message: 'Request received successfully!' };
  res.json(responseData);
});

app.post('/logoutRequest', (req, res) => {
  loggedInUsers.splice(loggedInUsers.indexOf(req.session.user), 1);
  req.session.user = null;
  req.session.save(function (err) {
    if (err) next(err)

    // regenerate the session, which is good practice to help
    // guard against forms of session fixation
    req.session.regenerate(function (err) {
      if (err) next(err)
      res.redirect('/Login')
    })
  })
});

//crypto functions---------------------------------------------------------------------------------crypto functions-----------------------------------------------
//takes a password and returns a hash and salt

//generic functions-------------------------------------------------------------------------------------------generic functions-------------------------------
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

//server starts listening for any attempts from a client to connect at port: {port}
//app.set("port", port);
//const server = http.createServer(app);
//server.listen(port);
app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
});

