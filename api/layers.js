const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Authorization } = require('../config/config');

router.get('/:worldName', (req, res) => {
    axios.get(`http://localhost:8080/geoserver/rest/workspaces/${req.params.worldName}/layers.json`, { headers: { Authorization } }).then((response) => {
        res.send(response.data);
        return response.data;
    }).catch((error) => {
        console.log("error!", error.message);
        res.send('error');
    });
});

router.get('/:worldName/:layerName', (req, res) => {
    return getLayerResource (req, res, req.params.worldName, req.params.layerName);
});

router.get('/:worldName/:layerName/details', (req, res) => {
    axios.get(`http://localhost:4000/api/layers/${req.params.worldName}/${req.params.layerName}`)
         .then(res => {
             // console.log("res data href: " + JSON.stringify(res.data.layer.resource.href));
             axios.get(res.data.layer.resource.href, { headers: { Authorization } })
                     .then((response) => {
                         console.log("get Layer Details: " + JSON.stringify(response.data));
                         return response.data;
                    }).catch((error) => {
                         console.log("error!", error.message);
                         res.send('error');
                    });
         });
});

function getLayerResource (req, res, worldName, layerName){
    axios.get(`http://localhost:8080/geoserver/rest/workspaces/${worldName}/layers/${layerName}.json`, { headers: { Authorization } })
        .then((response) => {
            res.send(response.data);
            return response.data;
        }).catch((error) => {
            console.log("error!", error.message);
            res.send('error');
        });
}

module.exports = router;



