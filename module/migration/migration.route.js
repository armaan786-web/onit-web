const express = require("express");
const router = express.Router();

const commonValidator = require('./migration.validator')
const commonController = require('./migration.controller')

const storageUrl = require("../../middleware/fileupload");

router.post('/migrate-centers', storageUrl.single("imgUrl"), commonController.migrateCenter);


module.exports = router;