const express = require('express');
const mysql = require('mysql');
const pool = mysql.createPool({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.MYSQL_DB,
    port: process.env.RDS_PORT
  });

const checkDatabaseForUsername = (username) => {
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

const storeUserInfo = (username, hash, salt) => {
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

const insertTrackData = (name, artist, path, duration, activeUid) => {
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
          resolve(result.insertId);
        }
      });
    connection.release();
    });
  });
}
//finds how many tracks are in the passed in playlist
const findIndex = (pid, uid) => {
  return new Promise(resolve => {
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

//finds playlist id in db based on name and userid, returns playlist id on success, nothing on fail
const findPlaylistInDb = (name, uid) => {
  return new Promise(resolve => {
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
const selectFromTracks = (track_id) => {
  return new Promise(resolve => {
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
const getPlaylistSongList = (pid, uid) => {  
  return new Promise(resolve => {
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

const selectFromPlaylistData = (sid) => {
  return new Promise(resolve => {
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
const getPlaylistListFromDb = (uid) => {
  return new Promise(resolve => {
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
const updateTimeValues = (ts, te, song_index, pid) => {
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
          resolve(result);
        }
      });
    connection.release();
    });
  });
}
//updates the song_index of a track 
const updateOrderInDB = (id, index, pid) => {
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
          resolve(result);
        }
      });
    connection.release();
    });
  });
}

const updateSongIndex = (uid, pid, song_index) => {
  return new Promise(resolve => {
    const newSongIndex = song_index-1;
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      connection.query('UPDATE Playlist_Data SET song_index = '+newSongIndex+' WHERE song_index = ' + song_index + ' and uid = ' + uid + ' and pid = '+pid+';', function (err, result) {
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

const findSongInPlaylistData = (activeUid, songid, pid) => {
  return new Promise(resolve => {
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

const deleteSongfromPlaylistData = (activeUid, songid, pid) => {
  return new Promise(resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let values = [pid, activeUid, songid];
      connection.query('DELETE FROM Playlist_Data WHERE (pid, uid, sid) = (?);', [values], function (err, result) {
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

const deleteSongFromTracks = (track_id) => {
  return new Promise(resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let values = [track_id];
      connection.query('DELETE FROM Tracks WHERE track_id = ?;', [values], function (err, result) {
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

const deletePlaylistFromPlaylistData = (pid, uid) => {
  return new Promise(resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let values = [pid, uid];
      connection.query('DELETE FROM Playlist_Data WHERE (pid, uid) = (?);', [values], function (err, result) {
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

const deletePlaylistFromPlaylist = (pid, uid) => {
  return new Promise(resolve => {
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
          resolve(result);
        }
      });
    connection.release();
    });
  });
}

//inserts a playlist into the database, returns true on success, false on fail
const insertPlaylistIntoDB = (uid, name) => {
  return new Promise(resolve => {  
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
const insertIntoPlaylistDataDb = (pid, sid, uid, index, ts, te) => {
  const fade = 5;
  return new Promise(resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let sqlstring = 'INSERT INTO Playlist_Data (pid, sid, uid, song_index, ts, te, fade) VALUES (?)';
      let values = [pid, sid, uid, index, ts, te, fade];
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


module.exports = {
    checkDatabaseForUsername,
    storeUserInfo,
    insertTrackData,
    insertIntoPlaylistDataDb,
    insertPlaylistIntoDB,
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
    updateTimeValues

};