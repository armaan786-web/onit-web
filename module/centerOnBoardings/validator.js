
const Joi = require('joi');
const { objectId } = require('../../helpers/common');

exports.registerOnBoarder = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        country_code: Joi.string().required(),
        mobile_number: Joi.string().required(),
        allowed_cities: Joi.array().required(),
        allowed_states: Joi.array().required(),
        primary_services: Joi.string().custom(objectId).required(),
        secondary_services: Joi.array().items(Joi.object({
            secondary_services_id: Joi.string().custom(objectId).optional(),
            priority: Joi.number().optional()
        })).min(1).max(3).optional(),
    })
}

exports.login = {
    body: Joi.object().keys({
        country_code: Joi.string().required(),
        mobile_number: Joi.string().required(),
    })
}

exports.verifyOtpLogin = {
    body: Joi.object().keys({
        country_code: Joi.string().required(),
        mobile_number: Joi.string().required(),
        otp: Joi.number().required(),
    })
}

exports.getAllCenter = {
    query: Joi.object().keys({
        skip: Joi.string().optional(),
        limit: Joi.string().optional(),
        is_active: Joi.string().optional(),
        profile_created_by: Joi.string().optional(),
        role_based_on_no_of_technicians: Joi.string().optional(),
        pincode: Joi.string().optional(),
        primary_services: Joi.string().custom(objectId).optional(),
        secondary_services: Joi.string().custom(objectId).optional(),
        center_name: Joi.string().optional(),
        start_date: Joi.string().optional().allow(""),
        end_date: Joi.string().optional().allow(""),
        center_obj_id: Joi.string().optional().allow(""),
    })

}

exports.createCenter = {
    body: Joi.object().keys({
        center_name: Joi.string().required(),
        personal_details: Joi.object().keys({
            phone: Joi.object().keys({
                country_code: Joi.string(),
                mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).required()
            }),
            email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
            name: Joi.string(),
            user_name: Joi.string(),
            about: Joi.string()
        }),
        automate_qr_code: Joi.boolean().required(),
        qr_code: Joi.string().optional().allow("", null),
        primary_services: Joi.string().custom(objectId).required(),
        secondary_services: Joi.array().items(Joi.object({
            secondary_services_id: Joi.string().custom(objectId).required(),
            priority: Joi.number().required()
        })).min(1).max(3).optional(),
        address_details: Joi.object().keys({
            longitude: Joi.number().allow(""),
            latitude: Joi.number().allow(""),
            address_line: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            pincode: Joi.string().required(),
            additional_pincode: Joi.string(),
            country: Joi.string(),
            short_code_for_place: Joi.string().optional().allow(""),
            google_geo_location: Joi.string().optional().allow(""),
        }),
        no_of_technicians: Joi.number().required(),
        clients_ids_list: Joi.array().items(Joi.string()),
        upi_id: Joi.string().optional('', null)
    })
}

exports.registerOn = {
    body: Joi.object().keys({
        uniqueId: Joi.string().custom(objectId).required(),
        otp: Joi.number().required(),
    })
}