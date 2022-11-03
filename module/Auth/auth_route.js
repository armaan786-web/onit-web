const express = require('express');
const router = express.Router();

const authController = require('./auth_controller');
const authValidator = require('./auth_validator');
const validate = require('../../middleware/validate');

const verifyJwt = require("../../middleware/jwt");


router.post('/sent-otp', validate(authValidator.sentotp), authController.sentotp);


module.exports = router;