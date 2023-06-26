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
        }, {
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
        }, {
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
        }, {
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
        }, {
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
        }, {
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
        }, {
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
        }, {
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
        }, {
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
        }, {
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
        }, {
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

