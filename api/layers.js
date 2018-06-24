const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config/configJson');

const authorization = config.authorization;

// ==============
//  GET Requests
// ==============
// get all layers of the world
router.get('/:worldName', (req, res) => {
    const urlGetLayers = `${config.baseUrlGeoserverRest}/workspaces/${req.params.worldName}/layers.json`;
    console.log("TB SERVER: start getLayers url = " + urlGetLayers);
    axios.get(urlGetLayers, { headers: { authorization } })
        .then((response) => res.send(response.data))
        .catch((error) => res.send(`getLayers ERROR! ${urlGetLayers}: ${error.message}`));

});

// get the layer type & resource info ("layer" field - type ILayerDetails)
router.get('/layer/:worldName/:layerName', (req, res) => {
    const urlGetLayer = `${config.baseUrlGeoserverRest}/workspaces/${req.params.worldName}/layers/${req.params.layerName}.json`;
    console.log("TB SERVER: start getLayerInfo url = " + urlGetLayer);
    axios.get(urlGetLayer, { headers: { authorization } })
        .then((response) => res.send(response.data))
        .catch((error) => res.send(`getLayerInfo ERROR! ${urlGetLayer}: ${error.message}`));
});

// get layer's details ("data" field - type ILayerDetails)
// using the resource href that we got from the "layer's info" request
router.get('/details/:worldName/:layerName', (req, res) => {
    // get the resource URL
    axios.get(`${config.baseUrlApiLayers}/layer/${req.params.worldName}/${req.params.layerName}`)
        .then(response => {
            // get the resource URL
            return axios.get(response.data.layer.resource.href, { headers: { authorization } })
        })
        .then((response) => res.send(response.data))
        .catch((error) => res.send(`getLayerDetails ERROR!: ${error.message}`));
});

// get the layer's store data ("store" field - type ILayerDetails)
router.get('/store/:worldName/:storeName/:layerType', (req, res) => {
    console.log("TB SERVER: STORE NAME = " + req.params.storeName);
    let storeType = (getTypeData(req.params.layerType)).storeType;
    const urlGetStore = `${config.baseUrlGeoserverRest}/workspaces/${req.params.worldName}/${storeType}/${req.params.storeName}.json`;
    console.log("TB SERVER: start getStoreData url = " + urlGetStore);
    axios.get(urlGetStore, { headers: { authorization } })
        .then((response) => res.send(response.data))
        .catch((error) => res.send(`getStoreData ERROR! ${urlGetStore}: ${error.message}`));
});

// get Capabilities XML file - WMTS Request for display the selected layer
router.get('/wmts/:worldName/:layerName', (req, res) => {
    const capabilitiesUrl = `${config.baseUrlGeoserver}/${req.params.worldName}/${req.params.layerName}/${config.wmtsServiceUrl}`;
    axios.get(capabilitiesUrl, { headers: { authorization } })
        .then((response) => res.send(response.data))
        .catch((error) => res.send(`getCapabilities ERROR! ${capabilitiesUrl}: ${error.message}`));
});

// ===============
// DELETE Requests
// ===============
// delete layer from the geoserver layers's list
router.delete('/:layerId', (req, res) => {
    console.log("TB SERVER: DELETE LAYER = " + req.params.layerId);
    axios.delete(`${config.baseUrlGeoserverRest}/layers/${req.params.layerId}.json?recurse=true`,
        { headers: { authorization } })
        .then( response => {
            console.log("success delete layer: " + response);
            res.send(response);
        })
        .catch((error) => res.send(`deleteLayer ERROR!: ${error.message}`));
});

// delete layer from geoserver store - using the resource URL
router.delete('/:worldName/:layerName', (req, res) => {
    // get the resource URL
    axios.get(`${config.baseUrlApiLayers}/layer/${req.params.worldName}/${req.params.layerName}`)
        .then(response => {
            console.log("TB SERVER: DELETE LAYER from STORE = " + response.data.layer.resource.href);
            // delete the layer from the store
            axios.delete(`${response.data.layer.resource.href}?recurse=true`, { headers: { authorization } })
                .then( response => {
                    console.log("success delete layer from Store: " + response);
                    res.send(response);
                })
                .catch((error) => res.send(`deleteLayerFromStore ERROR!: ${error.message}`));
        })
        .catch((error) => res.send(`deleteLayer: getUrl ERROR!: ${error.message}`));
});

router.delete('/store/:worldName/:storeName/:storeType', (req, res) => {
    let storeType;
    let layerDetailsType;
    switch (req.params.storeType) {
        case ('RASTER'):
            storeType = 'coveragestores';
            layerDetailsType = 'coverages';
            break;
        case ('VECTOR'):
            storeType = 'datastores';
            layerDetailsType = 'featuretypes';
            break;
    }
    const storeUrl =
        `${config.baseUrlGeoserverRest}/workspaces/${req.params.worldName}/${storeType}/${req.params.storeName}.json?recurse=true`
    console.log("TB SERVER: DELETE STORE = " + storeUrl);
    axios.delete(storeUrl, { headers: { authorization } })
        .then( response => {
            console.log("success delete store: " + JSON.stringify(response));
            res.send(response);
        })
        .catch((error) => res.send(`deleteStore ERROR!: ${error.message}`));
});

// ========================================  F U N C T I O N S ===========================================
// get the layer info: type + the url for the layer details data
function getResourceUrl(worldName, layerName){
    const layerUrl = `${config.baseUrlGeoserverRest}/workspaces/${worldName}/layers/${layerName}.json`;
    console.log("TB SERVER: start getResourceUrl url = " + layerUrl);
    axios.get(layerUrl, { headers: { authorization } })
        .then((response) => {
            console.error(`getResourceUrl response:`, response.data);
            return response.data;
        })
        .catch((error) => {
            console.error(`getResourceUrl ERROR! ${layerUrl}`, error);
            return error;
        });
}

function getTypeData(layerType){
    const typeData = {};
    switch (layerType) {
        case ('RASTER'):
            typeData.storeType = 'coveragestores';
            typeData.layerDetailsType = 'coverages';
            break;
        case ('VECTOR'):
            typeData.storeType = 'datastores';
            typeData.layerDetailsType = 'featuretypes';
            break;
    }
    return typeData;
}

module.exports = router;



