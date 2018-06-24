const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config/configJson');

const urlGetWorkspaces = `${config.baseUrlGeoserverRest}/workspaces`;
const authorization = config.authorization;

// =============
//  GET Request
// =============

// get all the worlds from geoserver
router.get('/', (req, res) => {
    console.log("TB SERVER: start getWorlds url = " + urlGetWorkspaces);
    axios.get(`${urlGetWorkspaces}.json`, { headers: {authorization} })
        .then((response) => {
            res.send(response.data);
            return response.data;
        })
        .catch((error) => {
            console.log("error!", error.response);
            res.send('error');
        });
});

// get all the worlds from geoserver
router.get('/:worldName', (req, res) => {
    axios.get(`${urlGetWorkspaces}/${req.params.worldName}.json`, { headers: {authorization} })
        .then((response) => {
            res.send(response.data);
        })
        .catch((error) => {
            console.log("error!", error.response);
            res.status(404).send(`world ${req.params.worldName} not found`);
        });
});

module.exports = router;