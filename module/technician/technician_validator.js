const Joi = require('joi');
const { objectId } = require('../../helpers/common');

module.exports.sentotp = {
    body: Joi.object().keys({
        action: Joi.string(),
        country_code: Joi.string().required(),
        mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).required(),
    }),
}

module.exports.loginWithOtp = {
    body: Joi.object().keys({
        country_code: Joi.string().required(),
        mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).required(),
        otp: Joi.number().required(),
        device_id : Joi.string().required(),
    }),
}


module.exports.registerTechnician = {
    body: Joi.object().keys({
        personal_details: Joi.object().keys({
            phone: Joi.object().keys({
                country_code: Joi.string(),
                mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).required()
            }),
            email: Joi.string().allow('').email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
            name: Joi.string(),
            user_name: Joi.string(),
            about: Joi.string()
        }),
        primary_services: Joi.string().custom(objectId).required(),
        secondary_services: Joi.array().items(Joi.object({
            secondary_services_id: Joi.string().custom(objectId),
            priority: Joi.number()
        })).min(1).max(3).optional(),
        service_area_main_pincode: Joi.string().required(),
        service_area_secondary_pincode: Joi.array().min(1).max(3),
        address_details_permanent: Joi.object().keys({
            longitude: Joi.number().allow(""),
            latitude: Joi.number().allow(""),
            address_line: Joi.string().allow(''),
            city: Joi.string().allow(''),
            state: Joi.string().allow(''),
            pincode: Joi.string(),
            additional_pincode: Joi.string(),
            country: Joi.string(),
            short_code_for_place: Joi.string().optional(),
            google_geo_location: Joi.string().optional()

        }),
        address_details_temporary: Joi.object().keys({
            longitude: Joi.number().allow(""),
            latitude: Joi.number().allow(""),
            address_line: Joi.string().allow(''),
            city: Joi.string().allow(''),
            state: Joi.string().allow(''),
            pincode: Joi.string(),
            additional_pincode: Joi.string(),
            country: Joi.string(),
            short_code_for_place: Joi.string().optional(),
            google_geo_location: Joi.string().optional()

        }),
        engagement_type: Joi.string().required(),
        document_details: Joi.object().keys({
            aadhar_card_document: Joi.object().keys({
                front_side: Joi.string().optional().allow(""),
                back_side: Joi.string().optional().allow("")
            }),
            aadhar_number: Joi.string().pattern(/^[0-9]\d{11}$/).required(),
            pan_number: Joi.string().required(),
            pan_card_document: Joi.string().optional().allow("")
        }),
        referenceDetails: Joi.object().keys({
            reference_person_name: Joi.string().required(),
            reference_person_mobile: Joi.string().pattern(/^[1-9]\d{9}$/).required(),
        }),
        emergency_details: Joi.object().keys({
            emergency_person_name: Joi.string().required(),
            emergency_person_phone: Joi.string().pattern(/^[1-9]\d{9}$/).required(),
        }),
    }),
}

exports.verifyOtp = {
    body: Joi.object().keys({
        country_code: Joi.string().required(),
        mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).required(),
        otp: Joi.number().required()
    }),

}