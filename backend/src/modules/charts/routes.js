const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/wb/gdp', controller.gdpSeries);

module.exports = router;
