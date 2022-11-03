const express = require('express');
const router = express.Router();

const centerOfOnboardingController = require('./controller');
const centerOfOnboardingValidator = require('./validator');
const validate = require('../../middleware/validate');

const verifyJwt = require("../../middleware/onboarderJWT");


router.post('/sendotp-onboarder', validate(centerOfOnboardingValidator.registerOnBoarder), centerOfOnboardingController.registerOnBoarder);

router.post('/register-onboarder', validate(centerOfOnboardingValidator.registerOn), centerOfOnboardingController.registerOn);

router.post('/send-otp-login', validate(centerOfOnboardingValidator.login), centerOfOnboardingController.login)

router.post('/verify-otp-login', validate(centerOfOnboardingValidator.verifyOtpLogin), centerOfOnboardingController.verifyOtpLogin)

router.post('/create-center', verifyJwt.verifyJwtToken, validate(centerOfOnboardingValidator.createCenter), centerOfOnboardingController.createCenter);

router.get('/get-center', verifyJwt.verifyJwtToken, validate(centerOfOnboardingValidator.getAllCenter), centerOfOnboardingController.getAllCenter)



module.exports = router;