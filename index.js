const express = require('express');
const cors = require('cors');
const api = require('./api');
const { serverPort } = require('./config/configJson');

const app = express();

app.use(cors());
app.use('/api', api);

app.listen(serverPort, () => console.log('listen to ', serverPort));
