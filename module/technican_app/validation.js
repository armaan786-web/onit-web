
const Joi = require('joi');
const { objectId } = require('../../helpers/common');

exports.getAllTechnicianRequests = {
    query: Joi.object().keys({
        skip: Joi.string().optional(),
        limit: Joi.string().optional(),
    })
}

module.exports.checkRequestLink = {
    query: Joi.object().keys({
        token: Joi.string().required(),
    })
}

module.exports.getAllTechnicianTicketCount = {
    query: Joi.object().keys({
        ticket_obj_id: Joi.string().custom(objectId).required(),
    })
}

exports.getAllTicketsCreatedNotAssigned = {
    query: Joi.object().keys({
        skip: Joi.string().optional(),
        limit: Joi.number().optional(),
    })
}

module.exports.getOrderDetails = {
    query: Joi.object().keys({
        skip: Joi.string().optional(),
        limit: Joi.string().optional(),
    })
}

module.exports.acceptRequestTechnicianForSalaried = {
    body: Joi.object().keys({
        request_status: Joi.string().required(),
        request_id: Joi.string().required()
    })
}

module.exports.acceptRequestTechnician = {
    body: Joi.object().keys({
        request_status: Joi.string().required(),
        request_id: Joi.string().required()
    })
}

module.exports.acceptBroadcastUnPaidTicket = {
    body: Joi.object().keys({
        broadcast_obj_id: Joi.string().custom(objectId).required(),
    })
}

exports.acceptBroadCastRequest = {
    body: Joi.object().keys({
        broadcast_obj_id: Joi.string().custom(objectId).required(),
    })
}


exports.afterPayingOnBoarding = {
    body: Joi.object().keys({
        razorpay_payment_id: Joi.string().required(),
        razorpay_order_id: Joi.string().required(),
        razorpay_signature: Joi.string().required(),
    })
}

exports.acceptTicketAfterPayment = {
    body: Joi.object().keys({
        razorpay_payment_id: Joi.string().required(),
        razorpay_order_id: Joi.string().required(),
        razorpay_signature: Joi.string().required(),
    })
}

exports.getAllTechniciansCenter = {
    query: Joi.object().keys({
        skip: Joi.string().optional(),
        limit: Joi.string().optional(),
    })
}


exports.assignTechnician = {
    body: Joi.object().keys({
        ticket_obj_id: Joi.string().custom(objectId).required(),
        techncian_obj_id: Joi.string().custom(objectId).required()
    })
}

exports.createNewTicket = {
    body: Joi.object().keys({
        personal_details: Joi.object().keys({
            primary_phone: Joi.object().keys({
                country_code: Joi.string().required(),
                mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).required()
            }).required(),
            alternate_phone: Joi.object().keys({
                country_code: Joi.string().allow(''),
                mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).allow('')
            }),
            name: Joi.string(),
        }),
        specific_requirement: Joi.string().optional(),
        service_provided_for: Joi.string().custom(objectId).required(),
        address_details: Joi.object().keys({
            longitude: Joi.number().allow(""),
            latitude: Joi.number().allow(""),
            house_number: Joi.string(),
            locality: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            pincode: Joi.string().required(),
            additional_pincode: Joi.string(),
            country: Joi.string(),
            short_code_for_place: Joi.string().optional(),
            google_geo_location: Joi.string().optional()

        }),
        time_preference: Joi.object().keys({
            time_preference_type: Joi.string(),
            specific_date_time: Joi.string(),
        }),
        offers_applied: Joi.object().keys({
            offer_code: Joi.string()
        }),
    })
}

exports.createNewTechnician = {
    body: Joi.object().keys({
        personal_details: Joi.object().keys({
            phone: Joi.object().keys({
                country_code: Joi.string(),
                mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).required()
            }),
            email: Joi.string().allow('').email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
            name: Joi.string(),
            user_name: Joi.string(),
            about: Joi.string(),
            profile_picture: Joi.string()
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
        is_salaried: Joi.string().optional(),
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
            reference_person_name: Joi.string().optional(),
            reference_person_mobile: Joi.string().pattern(/^[1-9]\d{9}$/).optional(),
        }),
        emergency_details: Joi.object().keys({
            emergency_person_name: Joi.string().optional(),
            emergency_person_phone: Joi.string().pattern(/^[1-9]\d{9}$/).optional(),
        }),
    }),
}

exports.getBookingDetails = {
    query: Joi.object().keys({
        ticket_object_id: Joi.string().custom(objectId).required()
    })
}

exports.updateTicketDetails = {
    body: Joi.object().keys({
        ticket_obj_id: Joi.string().custom(objectId).required(),
        personal_details: Joi.object().keys({
            primary_phone: Joi.object().keys({
                country_code: Joi.string().optional(),
                mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).optional()
            }).optional(),
            alternate_phone: Joi.object().keys({
                country_code: Joi.string().optional().allow(""),
                mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).optional().allow(""),
            }),
            name: Joi.string().optional(),
        }),
        specific_requirement: Joi.string().optional(),
        service_provided_for: Joi.string().custom(objectId).optional(),
        address_details: Joi.object().keys({
            longitude: Joi.number().allow(""),
            latitude: Joi.number().allow(""),
            house_number: Joi.string(),
            locality: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            pincode: Joi.string().optional(),
            additional_pincode: Joi.string(),
            country: Joi.string(),
            short_code_for_place: Joi.string().optional(),
            google_geo_location: Joi.string().optional()

        }),
        closing_ticket_price: Joi.string().optional().allow(""),
        time_preference: Joi.object().keys({
            time_preference_type: Joi.string().optional(),
            specific_date_time: Joi.string().optional(),
        }),
        technician_remarks: Joi.string().optional().allow(""),
        assigned_ids: Joi.object().keys({
            assigned_technician_id: Joi.string().custom(objectId).optional(),
            assigned_center_id: Joi.string().custom(objectId).optional(),
        }),
        offers_applied: Joi.object().keys({
            offer_code: Joi.string().optional()
        }),
        messages: Joi.object().keys({
            customer_message: Joi.string().optional(),
            center_message: Joi.string().optional()
        }),
        start_job: Joi.object().keys({
            pic: Joi.string().optional(),
            start_time: Joi.string().optional()
        }),

        onsite_pictures: Joi.array().optional(),
        take_time: Joi.string().optional(),
        ticket_status: Joi.string().optional()
    })
}