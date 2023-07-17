//Define dependencies
const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const mysql = require('mysql');
const { timeLog } = require('console');
const { connection } = require('mongoose');
const crypto = require('crypto');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.set('view engine', 'ejs');
const public = path.join(__dirname, 'public');
const port = 5000;
let playlistNames = ["playlist1", "playlist2", "playlist3!", "Bingo", "Bongo", "Boop!", "shob", "chob", "bobb!", "at this point it dont think it matters but im gonna make this really long anyways"];
let playlistData = [
  {
    name: "playlist1ThisIsareallylongname",
    data: [
      {
        id: 0,
        index: 0,
        name: "Song0",
        artist: "Yeezy",
        image: "yeee.png",
        path: "italy.wav",
        ts: 4,
        te: 150
      }, {
        id: 1,
        index: 1,
        name: "Song1",
        artist: "Yeezy",
        image: "yeee.png",
        path: "Diamonds.wav",
        ts: 15,
        te: 260
      }, {
        id: 2,
        index: 2,
        name:  "Song2",
        artist: "Yeezy",
        image: "yeee.png",
        path: "italy.wav",
        ts: 4,
        te: 220
      }, {
        id: 3,
        index: 3,
        name: "Song3",
        artist: "Yeezy",
        image: "yeee.png",
        path: "Diamonds.wav",
        ts: 3,
        te: 260
      }, {
        id: 4,
        index: 4,
        name: "Song4",
        artist: "Yeezy",
        image: "yeee.png",
        path: "italy.wav",
        ts: 4,
        te: 220
      }, {
        id: 5,
        index: 5,
        name: "Song5",
        artist: "Yeezy",
        image: "yeee.png",
        path: "Diamonds.wav",
        ts: 3,
        te: 260
      }, {
        id: 6,
        index: 6,
        name: "Song6",
        artist: "Yeezy",
        image: "yeee.png",
        path: "italy.wav",
        ts: 4,
        te: 220
      }, {
        id: 7,
        index: 7,
        name: "Song7",
        artist: "Yeezy",
        image: "yeee.png",
        path: "Diamonds.wav",
        ts: 3,
        te: 260
      }, {
        id: 8,
        index: 8,
        name: "Song8",
        artist: "Yeezy",
        image: "yeee.png",
        path: "italy.wav",
        ts: 4,
        te: 220
      }, {
        id: 9,
        index: 9,
        name: "Song9",
        artist: "Yeezy",
        image: "yeee.png",
        path: "Diamonds.wav",
        ts: 3,
        te: 260
      }, {
        id: 10,
        index: 10,
        name: "Song10",
        artist: "Yeezy",
        image: "yeee.png",
        path: "italy.wav",
        ts: 4,
        te: 220
      }, {
        id: 11,
        index: 11,
        name: "Song11",
        artist: "Yeezy",
        image: "yeee.png",
        path: "Diamonds.wav",
        ts: 3,
        te: 260
      }, {
        id: 12,
        index: 12,
        name: "Song12",
        artist: "Yeezy",
        image: "yeee.png",
        path: "italy.wav",
        ts: 4,
        te: 220
      }, {
        id: 13,
        index: 13,
        name: "Song13",
        artist: "Yeezy",
        image: "yeee.png",
        path: "Diamonds.wav",
        ts: 3,
        te: 260
      }, {
        id: 14,
        index: 14,
        name: "Song14",
        artist: "Yeezy",
        image: "yeee.png",
        path: "italy.wav",
        ts: 4,
        te: 220
      }, {
        id: 15,
        index: 15,
        name: "Song15",
        artist: "Yeezy",
        image: "yeee.png",
        path: "Diamonds.wav",
        ts: 3,
        te: 260
      }, {
        id: 16,
        index: 16,
        name: "Song16",
        artist: "Yeezy",
        image: "yeee.png",
        path: "italy.wav",
        ts: 4,
        te: 220
      }, {
        id: 17,
        index: 17,
        name: "Song17",
        artist: "Yeezy",
        image: "yeee.png",
        path: "Diamonds.wav",
        ts: 3,
        te: 260
      }, {
        id: 18,
        index: 18,
        name: "Song18",
        artist: "Yeezy",
        image: "yeee.png",
        path: "italy.wav",
        ts: 4,
        te: 220
      }, {
        id: 19,
        index: 19,
        name: "Song19",
        artist: "Yeezy",
        image: "yeee.png",
        path: "Diamonds.wav",
        ts: 3,
        te: 260
      }, {
        id: 20,
        index: 20,
        name: "Song20",
        artist: "Yeezy",
        image: "yeee.png",
        path: "italy.wav",
        ts: 4,
        te: 220
      }, {
        id: 21,
        index: 21,
        name: "Song21",
        artist: "Yeezy",
        image: "yeee.png",
        path: "Diamonds.wav",
        ts: 3,
        te: 260
      }

    ]
}, {
  name: "playlist2",
  data: [
    {
      id: 0,
      index: 0,
      name: "Song0",
      artist: "Yeezy",
      image: "yeee.png",
      path: "italy.wav",
      ts: 4,
      te: 150
    }, {
      id: 1,
      index: 1,
      name: "Song1",
      artist: "Yeezy",
      image: "yeee.png",
      path: "Diamonds.wav",
      ts: 15,
      te: 260
    }, {
      id: 2,
      index: 2,
      name:  "Song2",
      artist: "Yeezy",
      image: "yeee.png",
      path: "italy.wav",
      ts: 4,
      te: 220
    }
  ]
}, {
  name: "playlist3!",
  data: [
    {
      id: 1,
      name: "Diamonds",
      artist: "Yeezy",
      image: "yeee.png",
      path: "Diamonds.wav",
      ts: 4,
      te: 220
    }, {
      id: 0,
      name: "Italy",
      artist: "Yeezy",
      image: "yeee.png",
      path: "italy.wav",
      ts: 3,
      te: 260
    }, {
      id: 2,
      name: "Believe What I Say",
      artist: "Yeezy",
      image: "yeee.png",
      path: "Believe.mp3",
      ts: 1,
      te: 30
    }
  ]
},  {
  name: "Bingo",
  data: [
    {
      id: 0,
      name: "Italy",
      artist: "Yeezy",
      image: "yeee.png",
      path: "italy.wav",
      ts: 4,
      te: 220
    }, {
      id: 1,
      name: "Diamonds",
      artist: "Yeezy",
      image: "yeee.png",
      path: "Diamonds.wav",
      ts: 3,
      te: 260
    }

  ]
}, {
name: "Bongo",
data: [
  {
    id: 2,
    name: "Believe What I Say",
    artist: "Yeezy",
    image: "yeee.png",
    path: "Believe.mp3",
    ts: 4,
    te: 300
  }, {
    id: 1,
    name: "Diamonds",
    artist: "Yeezy",
    image: "yeee.png",
    path: "Diamonds.wav",
    ts: 3,
    te: 260
  }
]
}, {
name: "Boop!",
data: [
  {
    id: 1,
    name: "Diamonds",
    artist: "Yeezy",
    image: "yeee.png",
    path: "Diamonds.wav",
    ts: 4,
    te: 220
  }, {
    id: 0,
    name: "Italy",
    artist: "Yeezy",
    image: "yeee.png",
    path: "italy.wav",
    ts: 3,
    te: 260
  }, {
    id: 2,
    name: "Believe What I Say",
    artist: "Yeezy",
    image: "yeee.png",
    path: "Believe.mp3",
    ts: 1,
    te: 30
  }
]
},  {
name: "shob",
data: [
  {
    id: 0,
    name: "Italy",
    artist: "Yeezy",
    image: "yeee.png",
    path: "italy.wav",
    ts: 4,
    te: 220
  }, {
    id: 1,
    name: "Diamonds",
    artist: "Yeezy",
    image: "yeee.png",
    path: "Diamonds.wav",
    ts: 3,
    te: 260
  }

]
}, {
name: "chob",
data: [
{
  id: 2,
  name: "Believe What I Say",
  artist: "Yeezy",
  image: "yeee.png",
  path: "Believe.mp3",
  ts: 4,
  te: 300
}, {
  id: 1,
  name: "Diamonds",
  artist: "Yeezy",
  image: "yeee.png",
  path: "Diamonds.wav",
  ts: 3,
  te: 260
}
]
}, {
name: "bobb!",
data: [
{
  id: 1,
  name: "Diamonds",
  artist: "Yeezy",
  image: "yeee.png",
  path: "Diamonds.wav",
  ts: 4,
  te: 220
}, {
  id: 0,
  name: "Italy",
  artist: "Yeezy",
  image: "yeee.png",
  path: "italy.wav",
  ts: 3,
  te: 260
}, {
  id: 2,
  name: "Believe What I Say",
  artist: "Yeezy",
  image: "yeee.png",
  path: "Believe.mp3",
  ts: 1,
  te: 30
}
]
}, {
name: "playlist1",
data: [
  {
    id: 0,
    name: "Italy",
    artist: "Yeezy",
    image: "yeee.png",
    path: "italy.wav",
    ts: 4,
    te: 220
  }, {
    id: 1,
    name: "Diamonds",
    artist: "Yeezy",
    image: "yeee.png",
    path: "Diamonds.wav",
    ts: 3,
    te: 260
  }

]
}, {
name: "playlist2",
data: [
{
  id: 2,
  name: "Believe What I Say",
  artist: "Yeezy",
  image: "yeee.png",
  path: "Believe.mp3",
  ts: 4,
  te: 300
}, {
  id: 1,
  name: "Diamonds",
  artist: "Yeezy",
  image: "yeee.png",
  path: "Diamonds.wav",
  ts: 3,
  te: 260
}
]
}, {
name: "playlist3!",
data: [
{
  id: 1,
  name: "Diamonds",
  artist: "Yeezy",
  image: "yeee.png",
  path: "Diamonds.wav",
  ts: 4,
  te: 220
}, {
  id: 0,
  name: "Italy",
  artist: "Yeezy",
  image: "yeee.png",
  path: "italy.wav",
  ts: 3,
  te: 260
}, {
  id: 2,
  name: "Believe What I Say",
  artist: "Yeezy",
  image: "yeee.png",
  path: "Believe.mp3",
  ts: 1,
  te: 30
}
]
},  {
name: "Bingo",
data: [
{
  id: 0,
  name: "Italy",
  artist: "Yeezy",
  image: "yeee.png",
  path: "italy.wav",
  ts: 4,
  te: 220
}, {
  id: 1,
  name: "Diamonds",
  artist: "Yeezy",
  image: "yeee.png",
  path: "Diamonds.wav",
  ts: 3,
  te: 260
}

]
}, {
name: "Bongo",
data: [
{
id: 2,
name: "Believe What I Say",
artist: "Yeezy",
image: "yeee.png",
path: "Believe.mp3",
ts: 4,
te: 300
}, {
id: 1,
name: "Diamonds",
artist: "Yeezy",
image: "yeee.png",
path: "Diamonds.wav",
ts: 3,
te: 260
}
]
}, {
name: "Boop!",
data: [
{
id: 1,
name: "Diamonds",
artist: "Yeezy",
image: "yeee.png",
path: "Diamonds.wav",
ts: 4,
te: 220
}, {
id: 0,
name: "Italy",
artist: "Yeezy",
image: "yeee.png",
path: "italy.wav",
ts: 3,
te: 260
}, {
id: 2,
name: "Believe What I Say",
artist: "Yeezy",
image: "yeee.png",
path: "Believe.mp3",
ts: 1,
te: 30
}
]
},  {
name: "shob",
data: [
{
id: 0,
name: "Italy",
artist: "Yeezy",
image: "yeee.png",
path: "italy.wav",
ts: 4,
te: 220
}, {
id: 1,
name: "Diamonds",
artist: "Yeezy",
image: "yeee.png",
path: "Diamonds.wav",
ts: 3,
te: 260
}

]
}, {
name: "chob",
data: [
{
id: 2,
name: "Believe What I Say",
artist: "Yeezy",
image: "yeee.png",
path: "Believe.mp3",
ts: 4,
te: 300
}, {
id: 1,
name: "Diamonds",
artist: "Yeezy",
image: "yeee.png",
path: "Diamonds.wav",
ts: 3,
te: 260
}
]
}, {
name: "bobb!",
data: [
{
id: 1,
name: "Diamonds",
artist: "Yeezy",
image: "yeee.png",
path: "Diamonds.wav",
ts: 4,
te: 220
}, {
id: 0,
name: "Italy",
artist: "Yeezy",
image: "yeee.png",
path: "italy.wav",
ts: 3,
te: 260
}, {
id: 2,
name: "Believe What I Say",
artist: "Yeezy",
image: "yeee.png",
path: "Believe.mp3",
ts: 1,
te: 30
}
]
}
];
let obj = {};
/*
const pool = mysql.createPool({
  host: "database-1.ceoemktliflj.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "Quatroquatro",
  database: "mydb",
  port: 3306
});

pool.getConnection(function(err, connection) {
  if(err) {
    console.error("Database connection failed" + err.stack);
    return;
  }
  connection.query("CREATE TABLE IF NOT EXISTS Users(uid VARCHAR(50), username VARCHAR(100), password VARCHAR(100)", function (err, result) {
    
});

  console.log("connected to db");
});

connection.release();
*/

let isLoggedin = false;
const uname = "mickey";
const pass = "mouse";
let salt = "";
let iterations = 10000;
let hash = "";
hashPassword(pass);

//use when i first collect password for storage
function hashPassword(password) {
  salt = crypto.randomBytes(128).toString('base64');
  crypto.pbkdf2(password, salt, iterations, 64, 'sha512', (err, derivedKey) => {
    if (err) throw err;
    hash = derivedKey.toString('hex'); 
  });
}

//use when validating login attempts
function isPasswordCorrect(savedHash, savedSalt, savedIterations, passwordAttempt) {
  newhash = "";
  return new Promise(resolve => {
    crypto.pbkdf2(passwordAttempt, savedSalt, savedIterations, 64, 'sha512', (err, derivedKey) => {
      if (err) throw err;
      newhash = derivedKey.toString('hex'); 
      resolve(hash == newhash);
    });
  });
  //return false;
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


app.get('/', (req, res) => {        
  console.log(isLoggedin);
  if (isLoggedin) {
    res.render('Homepage', {data: {json: playlistData}});  
  } else {
    res.render('Login', {root: __dirname});
  }   
});


app.post('/', (req, res) => {
  console.log(req.body);
    console.log('here');
    async function getPassCorrect() {
      isLoggedin = await isPasswordCorrect(hash, salt, iterations, req.body.pass);
      res.redirect('/');
    }
    getPassCorrect();
});


app.get('/Signup', (req, res) => {
  res.render('SignUp', {root: __dirname});
});

app.get('/Login', (req, res) => {
  res.render('Login', {root: __dirname});
});

app.get('/add_tracks', (req, res) => {     

    res.render('add_tracks', {data: {json: obj, playlistNames: playlistNames}});      
});

app.post('/ajaxpost', upload.none(), (req, res) => {
  if (JSON.parse(JSON.stringify(req.body)).new_playlist_name != undefined) {
    playlistNames.push(JSON.parse(JSON.stringify(req.body)).new_playlist_name);
    console.log(playlistNames);

  } else {
    console.log(req.body);
  }
  
});

app.post('/add_tracks', upload.single('file'), (req, res) => {
        console.log(req.file);
        console.log(req.body);
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
        
        res.render('add_tracks', {data: {json: obj, playlistNames: playlistNames}});
          
});


app.post('/Signup', (req, res) => {
  console.log(req.body);
  isLoggedin = true;
  res.redirect('/');
});
//server starts listening for any attempts from a client to connect at port: {port}
app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
});

