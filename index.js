const express = require('express');
const cors = require('cors');
const api = require('./api');
const config = require('./config/config');
const app = express();

app.use(cors());
app.use('/api', api);

app.listen(config.port, () => console.log('listen to ', config.port));
