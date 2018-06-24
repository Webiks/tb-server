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
        .catch((error) => {
            console.error(`getLayers ERROR! ${urlGetLayers}: ${error.response}`);
            res.status(404).send(`world ${req.params.worldName}'s layers can't be found!`);
        });

});

// get the layer type & resource info ("layer" field - type ILayerDetails)
router.get('/layer/:worldName/:layerName', (req, res) => {
    const urlGetLayer = `${config.baseUrlGeoserverRest}/workspaces/${req.params.worldName}/layers/${req.params.layerName}.json`;
    console.log("TB SERVER: start getLayerInfo url = " + urlGetLayer);
    axios.get(urlGetLayer, { headers: { authorization } })
        .then((response) => res.send(response.data))
        .catch((error) => {
            console.error(`getLayerInfo ERROR! ${urlGetLayer}: ${error.response}`);
            res.status(404).send(`layer ${req.params.layerName} can't be found!`);
        });
});

// get layer's details ("data" field - type ILayerDetails)
// using the resource href that we got from the "layer's info" request
router.get('/details/:worldName/:layerName', (req, res) => {
    // get the resource URL
    axios.get(`${config.baseUrlAppGetLayer}/${req.params.worldName}/${req.params.layerName}`)
        .then(response => {
            // get the resource URL
            return axios.get(response.data.layer.resource.href, { headers: { authorization } })
        })
        .then((response) => res.send(response.data))
        .catch((error) => {
            console.error(`getLayerDetails ERROR!: ${error.response}`);
            res.status(404).send(`layer ${req.params.layerName}'s details can't be found!`);
        });

});

// get the layer's store data ("store" field - type ILayerDetails)
router.get('/store/:worldName/:storeName/:layerType', (req, res) => {
    let storeType = (getTypeData(req.params.layerType)).storeType;
    const urlGetStore = `${config.baseUrlGeoserverRest}/workspaces/${req.params.worldName}/${storeType}/${req.params.storeName}.json`;
    console.log("TB SERVER: start getStoreData url = " + urlGetStore);
    axios.get(urlGetStore, { headers: { authorization } })
        .then((response) => res.send(response.data))
        .catch((error) => {
            console.error(`getStoreData ERROR! ${urlGetStore}: ${error.response}`);
            res.status(404).send(`layer ${req.params.storeName}'s store can't be found!`);
        });
});

// get Capabilities XML file - WMTS Request for display the selected layer
router.get('/wmts/:worldName/:layerName', (req, res) => {
    const capabilitiesUrl = `${config.baseUrlGeoserver}/${req.params.worldName}/${req.params.layerName}/${config.wmtsServiceUrl}`;
    console.log("TB SERVER: start getCapabilities url = " + capabilitiesUrl);
    axios.get(capabilitiesUrl, { headers: { authorization } })
        .then((response) => res.send(response.data))
        .catch((error) => {
            console.error(`getCapabilities ERROR! ${capabilitiesUrl}: ${error.response}`);
            res.status(404).send(`Capabilities XML file of ${req.params.layerName} can't be found!`);
        });
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
        .catch((error) => {
            console.error(`deleteLayer ERROR!: ${error.response}`);
            res.status(404).send(`layer ${req.params.layerName} can't be found in the layers list!`);
        });
});

// delete layer from geoserver store - using the resource URL
router.delete('/:worldName/:layerName', (req, res) => {
    // get the resource URL
    axios.get(`${config.baseUrlAppGetLayer}/${req.params.worldName}/${req.params.layerName}`)
        .then(response => {
            console.log("TB SERVER: DELETE LAYER from STORE = " + response.data.layer.resource.href);
            // delete the layer from the store
            axios.delete(`${response.data.layer.resource.href}?recurse=true`, { headers: { authorization } })
                .then( response => {
                    console.log("success delete layer from Store: " + response);
                    res.send(response);
                })
                .catch((error) => {
                    console.error(`deleteLayerFromStore ERROR!: ${error.response}`);
                    res.status(404).send(`layer ${req.params.layerName} can't be found in the store!`);
                });
        })
        .catch((error) => {
            console.error(`deleteLayer: getUrl ERROR!: ${error.response}`);
            res.status(404).send(`can't found the resource Href of ${req.params.layerName} layer!`);
        });
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
        `${config.baseUrlGeoserverRest}/workspaces/${req.params.worldName}/${storeType}/${req.params.storeName}.json?recurse=true`;
    console.log("TB SERVER: DELETE STORE = " + storeUrl);
    axios.delete(storeUrl, { headers: { authorization } })
        .then( response => {
            console.log("success delete store: " + JSON.stringify(response));
            res.send(response);
        })
        // .catch((error) => res.send(`deleteStore ERROR!: ${error.message}`));
        .catch((error) => {
            console.error(`deleteStore ERROR!: ${error.response}`);
            res.status(404).send(`store ${req.params.storeName} can't be found!`);
        });
});

module.exports = router;



