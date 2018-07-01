const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config/configJson');
const { execSync } = require('child_process');          // for using the cURL command line
require('./curlMethods')();

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
            console.error("error!", error.response);
            res.status(404).send(`there are no worlds!`);
        });
});

// get world from geoserver
router.get('/:worldName', (req, res) => {
    axios.get(`${urlGetWorkspaces}/${req.params.worldName}.json`, { headers: {authorization} })
        .then((response) => {
            res.send(response.data);
        })
        .catch((error) => {
            console.error("error!", error.response);
            res.status(404).send(`world ${req.params.worldName} can't be found!`);
        });
});

// ==================================
//  CREATE new Workspace in GeoServer
// ==================================

// create a new world (workspace) in geoserver using the cURL command line
router.get('/:worldName/new', (req, res) => {

    // 1. create the JSON file with the desire workspace
    let workspaceJSON = JSON.stringify(createWorkspaceObject(req.params.worldName));
    console.log(workspaceJSON);

    // 2. send the POST request with cURL command line
    createNewWorkspaceInGeoserver(workspaceJSON);

});

// ================
//  DELETE Request
// ================
// delete a world (workspace) from geoserver using the cURL command line
router.get('/:worldName/delete', (req, res) => deleteWorkspaceFromGeoserver(req.params.worldName));


module.exports = router;