const Joi = require('joi');
const { objectId } = require('../../helpers/common');

exports.getCenterOnboarderObjectId = {
    query: Joi.object().keys({
        center_onboarder_id: Joi.string().required()
    })
}

exports.submitFeedback = {
    body: Joi.object().keys({
        token: Joi.string().required(),
        feedBackResponse: Joi.array().required(),
    })
}

exports.checkFeedbackLink = {
    query: Joi.object().keys({
        token: Joi.string().required(),
    })
}

exports.getAllCenterMatchingSkill = {
    query: Joi.object().keys({
        skills: Joi.string().custom(objectId).required(),
        pincode: Joi.string().required(),
    })
}

exports.getBroadcastedListTicket = {
    query : Joi.object().keys({
        ticketId: Joi.string().required(),
    })
}