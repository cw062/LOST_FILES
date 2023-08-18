if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}

//Define dependencies
const app = require('./app');
const { timeLog } = require('console');
//const helmet = require("helmet");
//const RateLimit = require("express-rate-limit");
/*const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});*/



const port = process.env.APP_PORT;

//server starts listening for any attempts from a client to connect at port: {port}
//app.set("port", port);
//const server = http.createServer(app);
//server.listen(port);
app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
});

