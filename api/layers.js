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
    axios.get(urlGetLayers, { headers: { authorization } })
        .then((response) => {
            res.send(response.data);
            return response.data;
        })
        .catch((error) => {
            console.log("error!", error);
            res.send('error');
        });
});

// get layer's more data (filed "layer" - type ILayer)
router.get('/:worldName/:layerName', (req, res) => {
    const urlGetLayer = `${config.baseUrlGeoserverRest}/workspaces/${req.params.worldName}/layers/${req.params.layerName}.json`;
    axios.get(urlGetLayer, { headers: { authorization } })
        .then((response) => {
            res.send(response.data);
            return response.data;
        })
        .catch((error) => {
            console.log("error!", error);
            res.send('error');
        });
});

// get layer's details (field "data" - type ILayerDetails)
// using the resource href that we got from the "layer's mor data" request
router.get('/:worldName/:layerName/details', (req, res) => {
    axios.get(`${config.baseUrlApiLayers}/${req.params.worldName}/${req.params.layerName}`)
         .then(res => axios.get(res.data.layer.resource.href, { headers: { authorization } }))
         .then((response) => {
             res.send(response.data);
             return response.data;
         })
         .catch((error) => {
             console.log("error!", error);
             res.send('error');
         });

});
// ===============
// DELETE Requests
// ===============
// router.delete('/:worldName/:layerName', (req, res) => {
router.delete('/:layerId', (req, res) => {
    const layerId = (req.params.layerId).split(':');
    let worldName = layerId[0];
    let layerName = layerId[1];

    axios.get(`${config.baseUrlApiLayers}/${worldName}/${layerName}`)
        .then( res => {
            console.log("response: " + JSON.stringify(res.data));
            axios.delete(`${config.baseUrlGeoserverRest}/layers/${req.params.layerId}?recurse=true`,
                { headers: { authorization } })
                .then( success => {
                    console.log("delete LayerHref: " + res.data.layer.resource.href);
                    axios.delete(`${res.data.layer.resource.href}?recurse=true`, { headers: { authorization } })
                        .then((response) => {
                            console.log("delete Layer Details: " + JSON.stringify(response.data));
                            res.send(response.data);
                            return response.data;
                        })
                        .catch((error) => {
                            console.log("error!", error.response);
                            res.send('error');
                        });
                })
                .catch((error) => {
                    console.log("error!", error);
                    res.send('error');
                });
        })
});

router.delete('/:layerId/raster', (req, res) => {
    const layerId = (req.params.layerId).split(':');
    let worldName = layerId[0];
    let layerName = layerId[1];
    // 1. delete the layer
    axios.delete(`${config.baseUrlGeoserverRest}/workspaces/${worldName}/coverages/${layerName}.json?recurse=true`,
        { headers: { authorization } })
        .then( res => {
            console.log("delete Layer: " + res.data);
            // 2. delete the store
            axios.delete(`${config.baseUrlGeoserverRest}/layers/${req.params.layerId}.json?recurse=true`,
                { headers: { authorization } })
                .then((response) => {
                    console.log("delete store: " + JSON.stringify(response.data));
                    res.send(response.data);
                    return response.data;
                })
                .catch((error) => {
                    console.log("error!", error);
                    res.send('error');
                });
        })
        .catch((error) => {
            console.log("error!", error);
            res.send('error');
        });

});

router.delete('/:layerId/vector', (req, res) => {
    const layerId = (req.params.layerId).split(':');
    let worldName = layerId[0];
    let layerName = layerId[1];
    // 1. delete the layer
    axios.delete(`${config.baseUrlGeoserverRest}/layers/${req.params.layerId}.json?recurse=true`,
                { headers: { authorization } })
        .then( res => {
            console.log("delete Layer: " + res.data);
            // 2. delete the store
            axios.delete(`${config.baseUrlGeoserverRest}/workspaces/${worldName}/datastores/${layerName}.json?recurse=true`,
                { headers: { authorization } })
                .then((response) => {
                    console.log("delete store: " + JSON.stringify(response.data));
                    res.send(response.data);
                    return response.data;
                })
                .catch((error) => {
                    console.log("error!", error);
                    res.send('error');
                });
        })
        .catch((error) => {
            console.log("error!", error);
            res.send('error');
        });
});

module.exports = router;



