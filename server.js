//Define dependencies
const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const mysql = require('mysql');
const { timeLog } = require('console');
const { connection } = require('mongoose');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.set('view engine', 'ejs');
const public = path.join(__dirname, 'public');
const port = 5000;   

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
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  const upload = multer({ storage: storage });

//add all static files to the app
app.use('/', express.static(public));
app.use(express.static(path.join(__dirname)));


app.get('/', (req, res) => {        

  const playlistData =[
    {
      name: "playlist1",
      data: [
        {
          id: 0,
          index: 0,
          prev: 21,
          next: 1,
          name: "0",
          artist: "Yeezy",
          image: "yeee.png",
          path: "italy.wav",
          ts: 4,
          te: 220
        }, {
          id: 1,
          index: 1,
          prev: 0,
          next: 2,
          name: "1",
          artist: "Yeezy",
          image: "yeee.png",
          path: "Diamonds.wav",
          ts: 3,
          te: 260
        }, {
          id: 2,
          index: 2,
          prev: 1,
          next: 3,
          name:  "2",
          artist: "Yeezy",
          image: "yeee.png",
          path: "italy.wav",
          ts: 4,
          te: 220
        }, {
          id: 3,
          index: 3,
          prev: 2,
          next: 4,
          name: "3",
          artist: "Yeezy",
          image: "yeee.png",
          path: "Diamonds.wav",
          ts: 3,
          te: 260
        }, {
          id: 4,
          index: 4,
          prev: 3,
          next: 5,
          name: "4",
          artist: "Yeezy",
          image: "yeee.png",
          path: "italy.wav",
          ts: 4,
          te: 220
        }, {
          id: 5,
          index: 5,
          prev: 4,
          next: 6,
          name: "5",
          artist: "Yeezy",
          image: "yeee.png",
          path: "Diamonds.wav",
          ts: 3,
          te: 260
        }, {
          id: 6,
          index: 6,
          prev: 5,
          next: 7,
          name: "6",
          artist: "Yeezy",
          image: "yeee.png",
          path: "italy.wav",
          ts: 4,
          te: 220
        }, {
          id: 7,
          index: 7,
          prev: 6,
          next: 8,
          name: "7",
          artist: "Yeezy",
          image: "yeee.png",
          path: "Diamonds.wav",
          ts: 3,
          te: 260
        }, {
          id: 8,
          index: 8,
          prev: 7,
          next: 9,
          name: "8",
          artist: "Yeezy",
          image: "yeee.png",
          path: "italy.wav",
          ts: 4,
          te: 220
        }, {
          id: 9,
          index: 9,
          prev: 8,
          next: 10,
          name: "9",
          artist: "Yeezy",
          image: "yeee.png",
          path: "Diamonds.wav",
          ts: 3,
          te: 260
        }, {
          id: 10,
          index: 10,
          prev: 9,
          next: 11,
          name: "10",
          artist: "Yeezy",
          image: "yeee.png",
          path: "italy.wav",
          ts: 4,
          te: 220
        }, {
          id: 11,
          index: 11,
          prev: 10,
          next: 12,
          name: "11",
          artist: "Yeezy",
          image: "yeee.png",
          path: "Diamonds.wav",
          ts: 3,
          te: 260
        }, {
          id: 12,
          index: 12,
          prev: 11,
          next: 13,
          name: "12",
          artist: "Yeezy",
          image: "yeee.png",
          path: "italy.wav",
          ts: 4,
          te: 220
        }, {
          id: 13,
          index: 13,
          prev: 12,
          next: 14,
          name: "13",
          artist: "Yeezy",
          image: "yeee.png",
          path: "Diamonds.wav",
          ts: 3,
          te: 260
        }, {
          id: 14,
          index: 14,
          prev: 13,
          next: 15,
          name: "14",
          artist: "Yeezy",
          image: "yeee.png",
          path: "italy.wav",
          ts: 4,
          te: 220
        }, {
          id: 15,
          index: 15,
          prev: 14,
          next: 16,
          name: "15",
          artist: "Yeezy",
          image: "yeee.png",
          path: "Diamonds.wav",
          ts: 3,
          te: 260
        }, {
          id: 16,
          index: 16,
          prev: 15,
          next: 17,
          name: "16",
          artist: "Yeezy",
          image: "yeee.png",
          path: "italy.wav",
          ts: 4,
          te: 220
        }, {
          id: 17,
          index: 17,
          prev: 16,
          next: 18,
          name: "17",
          artist: "Yeezy",
          image: "yeee.png",
          path: "Diamonds.wav",
          ts: 3,
          te: 260
        }, {
          id: 18,
          index: 18,
          prev: 17,
          next: 19,
          name: "18",
          artist: "Yeezy",
          image: "yeee.png",
          path: "italy.wav",
          ts: 4,
          te: 220
        }, {
          id: 19,
          index: 19,
          prev: 18,
          next: 20,
          name: "19",
          artist: "Yeezy",
          image: "yeee.png",
          path: "Diamonds.wav",
          ts: 3,
          te: 260
        }, {
          id: 20,
          index: 20,
          prev: 19,
          next: 21,
          name: "20",
          artist: "Yeezy",
          image: "yeee.png",
          path: "italy.wav",
          ts: 4,
          te: 220
        }, {
          id: 21,
          index: 21,
          prev: 20,
          next: 0,
          name: "21",
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
  res.render('Homepage', {data: {json: playlistData}});     
});


app.get('/default_page', (req, res) => {
  res.render('default_page', {root: __dirname});
});

app.get('/add_tracks', (req, res) => {     
    res.render('add_tracks', {root: __dirname});      
});

app.post('/add_tracks', upload.single('file'), (req, res) => {
        console.log(req.file);
        console.log(req.body.nameData);
        console.log(path.extname(req.file.originalname));
        res.render('add_tracks');
});
//server starts listening for any attempts from a client to connect at port: {port}
app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
});

