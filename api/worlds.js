const express = require('express');
const router = express.Router();
const axios = require('axios');
const { ipAddress, serverPort, geoserverPort, Authorization } = require('../config/config');

const urlGeoserverRest = `http://${ipAddress}${geoserverPort}/geoserver/rest/workspaces.json`;
const urlAppServer = `http://${ipAddress}${serverPort}/api/worlds`;

// =============
//  GET Request
// =============

// get all the worlds from geoserver
router.get('/', (req, res) => {
    axios.get(urlGeoserverRest, { headers: { Authorization } })
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