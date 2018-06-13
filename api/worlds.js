const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config/configJson');

const urlGeoserverRest = `http://${config.ipAddress}${config.geoserverPort}/geoserver/rest/workspaces.json`;
const urlAppServer = `http://${config.ipAddress}${config.serverPort}/api/worlds`;
const authorization = config.authorization;

// =============
//  GET Request
// =============

// get all the worlds from geoserver
router.get('/', (req, res) => {
    axios.get(urlGeoserverRest, { headers: {authorization} })
        .then((response) => {
            res.send(response.data);
            return response.data;
        })
        .catch((error) => {
            console.log("error!", error.response);
            res.send('error');
        });
});

module.exports = router;