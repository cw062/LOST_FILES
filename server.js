if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}
//Define dependencies
const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { timeLog } = require('console');
const { connection } = require('mongoose');
const crypto = require('crypto');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
const IN_PROD = process.env.NODE_ENV === 'production';
const TWO_HOURS = 1000 * 60 * 60 * 2;
const options = {
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.MYSQL_DB,
  createDatabaseTable: true
};
const sessionStore = new MySQLStore(options);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: TWO_HOURS,
      sameSite: true,
      secure: IN_PROD
    }
  })
);
app.set('view engine', 'ejs');
const public = path.join(__dirname, 'public');
const port = 5000;
let playlistNames = [];
let playlistData = [];
let obj = {};
let songid = {
  id: null
};

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.MYSQL_DB,
  port: process.env.DB_PORT
});

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
/*
function queryUserData(uid) {
  return new Promise (resolve => {
    resolve()
  })
}
*/

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

function insertTrackIntoDbHelper(dataobj, activeUid) {
  let song_index = 0;
  let sid = -1;
  async function insertTrackOnce() {
    sid = await insertTrackData(dataobj.name, dataobj.artist, dataobj.path, dataobj.duration, activeUid); //insert metadata, need to return SELECT LAST_INSERT_ID()
    songid.id = sid;
  }
  insertTrackOnce();

  dataobj.playlists.forEach(element => {
    async function doWork() {
      let pid = await findPlaylistInDb(element, activeUid); //returns pid
      let findIndexResult = await findIndex(pid, activeUid);  //returns row with highest song_index RowDataPacket { pid: 18,sid: 1, uid: 28, song_index: 1, ts: 0,te: 0 }
      console.log(findIndexResult);
      if (findIndexResult != 0)
        song_index = Number(findIndexResult[0].song_index) + 1;
      console.log(element + " , pid: "+pid+" index: "+song_index);
      let result = await insertIntoPlaylistDataDb(pid, sid, activeUid, song_index, 0, dataobj.duration);
    }
    doWork();
  });
}

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



let iterations = 10000;
let isLoggedin = false;
//takes a password and returns a hash and salt
function hashPassword(password) {
  let returnobj = {
    hash: "",
    salt: ""
  };
  return new Promise(resolve => {
    returnobj.salt = crypto.randomBytes(128).toString('base64');
    crypto.pbkdf2(password, returnobj.salt, iterations, 64, 'sha512', (err, derivedKey) => {
      if (err) throw err;
      returnobj.hash = derivedKey.toString('hex'); 
      resolve(returnobj);
    });
});
}

function isPasswordCorrect(savedHash, savedSalt, savedIterations, passwordAttempt) {
  //retreive row from db --probably rename these parameters
  let newhash = "";
  return new Promise(resolve => {
    crypto.pbkdf2(passwordAttempt, savedSalt, savedIterations, 64, 'sha512', (err, derivedKey) => {
      if (err) throw err;
      newhash = derivedKey.toString('hex'); 
      resolve(savedHash == newhash);
    });
  });
}



let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  });
  
  const upload = multer({ storage: storage });

//add all static files to the app
app.use('/', express.static(public));
app.use(express.static(path.join(__dirname)));

//after signup is successful, we will have no data to give to client
//after login is successful, need to query all data that has the same uid and pass it here and to the addtracks path
app.get('/', (req, res) => {      
  playlistData = [];
  playlistNames = [];
  if (req.session.user != null) {
    async function loginHelper() {
      await getDataFromDbHelper(req.session.user);
      res.render('Homepage', {data: {json: playlistData}});  
    }
    loginHelper();
  } else {
    res.render('Login', {data: false});
  }   
});

app.get('/sendSongId', (req, res) => {
  console.log(songid.id + 'in.get');
  res.send(songid);
});

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


app.get('/Login', (req, res) => {
  res.render('Login', {data: false});
  console.log(req.session);
});

app.get('/Signup', (req, res) => {
  res.render('Signup', {root: __dirname});
});


app.get('/add_tracks', (req, res) => {     

    res.render('add_tracks', {data: {json: obj, playlistNames: playlistNames}});      
});

app.post('/ajaxpost', upload.none(), (req, res) => {
  if (JSON.parse(JSON.stringify(req.body)).new_playlist_name != undefined) {
    playlistNames.push(JSON.parse(JSON.stringify(req.body)).new_playlist_name);
    async function insertPlaylist() {
      insertPlaylistIntoDB(req.session.user, JSON.parse(JSON.stringify(req.body)).new_playlist_name);
    }
    insertPlaylist();

  } else {
    //access the database and update the ts and te fields
    insertTimeValuesIntoDbHelper(req.body);
  }
  
});

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

function insertTimeValuesIntoDbHelper(formobj) {
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

app.post('/usernamePost', upload.none(), (req, res) => {
  async function checkUsername() {
    let result = await checkDatabaseForUsername(JSON.parse(JSON.stringify(req.body)).username);    //true for succcess, false for fail
    if (result == 0)
      res.json({status: false});
    else
      res.json({status: true});
  }
  checkUsername();
});

app.post('/postNewTrackList', upload.none(), (req, res) => {
  reorderTrackListHelper(req.session.user, JSON.parse(JSON.stringify(req.body)).id, JSON.parse(JSON.stringify(req.body)).index, JSON.parse(JSON.stringify(req.body)).playlistIdentifier);   
});

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

function updateOrderInDB(id, index, pid) {
  return new Promise(resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      console.log('UPDATE Playlist_Data SET song_index = '+index+' WHERE sid = ' + id+ ' and pid = '+pid);
      connection.query('UPDATE Playlist_Data SET song_index = '+index+' WHERE sid = ' + id+ ' and pid = '+pid+';', function (err, result) {
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

app.post('/add_tracks', upload.single('file'), (req, res) => {
        let track = req.body.nameData;
        const artist = req.body.artistData;                           //add sending a list of playlist names in the render
        const playlistArray = req.body.checkbox;
        const pathToFile = req.file.path;
        const extension = path.extname(req.file.originalname);
        const duration = req.body.duration;
        track = track + extension;
        const obj = {
          name: track,
          artist: artist,
          path: pathToFile,
          duration: duration,
          playlists: playlistArray
        };
        //might need to wrap this in async
        insertTrackIntoDbHelper(obj, req.session.user); //inserts track into database after submitting add_tracks
      
        
        res.render('add_tracks', {data: {json: obj, playlistNames: playlistNames}});
          
});

app.post('/Login', (req, res) => {
    async function getPassCorrect() {
      //get row from db that matches username
      let dbrow = await checkDatabaseForUsername(req.body.username);
      if (dbrow == 0)
        res.render('Login', {data: true});
      else {
        let result = await isPasswordCorrect(dbrow[0].password, dbrow[0].salt, iterations, req.body.pass);
        //isLoggedin = result;
        if (result == false)
          res.render('Login', {data: true});
        else {
          console.log('here');
          req.session.user = dbrow[0].uid;
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
      res.redirect('/');
    } else {
      res.render('Signup', {root: __dirname});
    }
  }
  createHashandSalt();

});
//server starts listening for any attempts from a client to connect at port: {port}
app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
});

