const Joi = require('joi');
const { objectId } = require('../../helpers/common');


module.exports.sentotp = {
    body: Joi.object().keys({
        country_code: Joi.string().required(),
        mobile_number: Joi.string().required(),
    }),
}



