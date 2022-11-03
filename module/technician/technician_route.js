const express = require('express');
const router = express.Router();

const technicianController = require('./technician_controller');
const technicianValidator = require('./technician_validator');
const validate = require('../../middleware/validate');

const verifyJwt = require("../../middleware/jwt");

router.post('/register-technician', validate(technicianValidator.registerTechnician), technicianController.registerTechnician);

router.post('/sent-otp', validate(technicianValidator.sentotp), technicianController.sentotp);

router.post('/verify-otp', validate(technicianValidator.verifyOtp), technicianController.verifyOtp);

router.post('/login-with-otp', validate(technicianValidator.loginWithOtp), technicianController.loginWithOtp)



module.exports = router;