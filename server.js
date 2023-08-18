if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}

const app = require('./app');
const port = process.env.APP_PORT;
app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
});

