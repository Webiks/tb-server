const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config/configJson');

const urlGetWorkspaces = `${config.baseUrlGeoserverRest}/workspaces.json`;
const authorization = config.authorization;

// =============
//  GET Request
// =============

// get all the worlds from geoserver
router.get('/', (req, res) => {
    axios.get(urlGetWorkspaces, { headers: {authorization} })
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