const express = require("express");
const router = express.Router();
const validate = require('../../middleware/validate');

const commonValidator = require('./common.validator')
const commonController = require('./common.controller')

const storageUrl = require("../../middleware/storageImg");

router.post('/upload-image/:file_identifier_name', storageUrl.single("aadhar"), commonController.uploadFile);

router.post('/submit-feedback', validate(commonValidator.submitFeedback), commonController.submitFeedback)

router.get('/check-feedback-link-valid', validate(commonValidator.checkFeedbackLink), commonController.checkFeedbackLink)

router.get('/get-all-center-matching-skill', validate(commonValidator.getAllCenterMatchingSkill), commonController.getAllCenterMatchingSkill)

router.get('/get-center-onboarder-objectId', validate(commonValidator.getCenterOnboarderObjectId), commonController.getCenterOnboarderObjectId)

router.get('/get-broadcastedlist-based-on-ticketId', validate(commonValidator.getBroadcastedListTicket), commonController.getBroadcastedListTicket)

module.exports = router;