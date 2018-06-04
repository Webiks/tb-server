const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Authorization } = require('../config/config');

router.get('/', (req, res) => {
    axios.get('http://localhost:8080/geoserver/rest/workspaces/tb/layers.json', { headers: { Authorization } }).then((response) => {
        res.send(response.data);
    }).catch((error) => {
        console.log("error!", error.message);
        res.send('error');
    });
});

module.exports = router;



