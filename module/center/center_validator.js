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
        otp: Joi.number().required()

    }),
}

exports.acceptBroadcastUnPaidTicket = {
    body: Joi.object().keys({
        broadcast_obj_id: Joi.string().custom(objectId).required(),
    })
}

exports.getAllTicketsCreatedNotAssigned = {
    query: Joi.object().keys({
        skip: Joi.string().optional(),
        limit: Joi.number().optional(),
    })
}

exports.acceptTicketAfterPayment = {
    body: Joi.object().keys({
        razorpay_payment_id: Joi.string().required(),
        razorpay_order_id: Joi.string().required(),
        razorpay_signature: Joi.string().required(),
    })
}

exports.getAllOrders = {
    query: Joi.object().keys({
        skip: Joi.string().optional(),
        limit: Joi.number().optional(),

    })
}

exports.closeTicket = {
    body: Joi.object().keys({
        ticket_obj_id: Joi.string().custom(objectId).required(),
        remarks: Joi.object().keys({
            close_ticket_remarks: Joi.string().required()
        }),
        amount: Joi.number().optional(),
    })
}

exports.addTicketRemarks = {
    body: Joi.object().keys({
        ticket_obj_id: Joi.string().custom(objectId).required(),
        remarks: Joi.string().required(),
        date: Joi.string().required(),

    })
}

exports.assignTicketTechnician = {
    body: Joi.object().keys({
        ticket_obj_id: Joi.string().custom(objectId).required(),
        technician_obj_id: Joi.string().custom(objectId).required(),
    })

}

exports.changeTicketTechnician = {
    body: Joi.object().keys({
        ticket_obj_id: Joi.string().custom(objectId).required(),
        technician_obj_id: Joi.string().custom(objectId).required(),
    })

}

exports.acceptBroadCastRequest = {
    body: Joi.object().keys({
        broadcast_obj_id: Joi.string().custom(objectId).required(),
    })
}

exports.getAllAvailableBroadcastTicket = {
    query: Joi.object().keys({
        skip: Joi.string().optional(),
        limit: Joi.number().optional(),
        status: Joi.string().optional(),
    })
}

exports.rejectBroadCastTicket = {
    body: Joi.object().keys({
        broadcast_obj_id: Joi.string().custom(objectId).required(),
    })

}

exports.updateProfileCenter = {
    body: Joi.object().keys({
        personal_details: Joi.object().keys({
            phone: Joi.object().keys({
                country_code: Joi.string().optional(),
                mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).required()
            }),
            email: Joi.string().optional().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
            name: Joi.string().optional(),
            user_name: Joi.string().optional(),
            about: Joi.string().optional()
        }),
        center_name: Joi.string().optional(),
        primary_services: Joi.string().custom(objectId).optional(),
        secondary_services: Joi.array().items(Joi.object({
            secondary_services_id: Joi.string().custom(objectId).required(),
            priority: Joi.number().required()
        })).min(1).max(3).optional(),
        address_details: Joi.object().keys({
            longitude: Joi.number().allow(""),
            latitude: Joi.number().allow(""),
            address_line: Joi.string().optional(),
            city: Joi.string().optional(),
            state: Joi.string().optional(),
            pincode: Joi.string().optional(),
            additional_pincode: Joi.string().optional(),
            country: Joi.string().optional(),
            short_code_for_place: Joi.string().optional(),
            google_geo_location: Joi.string().optional()
        }),
    }),

}

exports.updateTechnician = {
    body: Joi.object().keys({
        technician_obj_id: Joi.string().custom(objectId).required(),
        center_obj_id: Joi.string().custom(objectId).optional(),
        personal_details: Joi.object().keys({
            phone: Joi.object().keys({
                country_code: Joi.string().optional(),
                mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).optional()
            }),
            email: Joi.string().optional().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
            name: Joi.string().optional(),
            user_name: Joi.string().optional(),
            about: Joi.string().optional()
        }),
        primary_services: Joi.string().custom(objectId).optional(),
        secondary_services: Joi.array().items(Joi.object({
            secondary_services_id: Joi.string().custom(objectId).required(),
            priority: Joi.number().required()
        })).min(1).max(3).optional(),
        service_area_main_pincode: Joi.string().optional(),
        service_area_secondary_pincode: Joi.array().min(1).max(3).optional(),
        address_details_permanent: Joi.object().keys({
            longitude: Joi.number().allow(""),
            latitude: Joi.number().allow(""),
            address_line: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            pincode: Joi.string().optional(),
            additional_pincode: Joi.string(),
            country: Joi.string(),
            short_code_for_place: Joi.string().optional(),
            google_geo_location: Joi.string().optional()

        }),
        address_details_temporary: Joi.object().keys({
            longitude: Joi.number().allow(""),
            latitude: Joi.number().allow(""),
            address_line: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            pincode: Joi.string().optional(),
            additional_pincode: Joi.string(),
            country: Joi.string(),
            short_code_for_place: Joi.string().optional(),
            google_geo_location: Joi.string().optional()

        }),
        engagement_type: Joi.string().optional(),
        document_details: Joi.object().keys({
            aadhar_card_document: Joi.object().keys({
                front_side: Joi.string().optional().allow(''),
                back_side: Joi.string().optional().allow('')
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
        })
    })
}

exports.getAllTechnician = {
    query: Joi.object().keys({
        technician_obj_id: Joi.string().optional(),
        skip: Joi.string().optional(),
        limit: Joi.string().optional(),
    })
}

exports.getAllTickets = {
    query: Joi.object().keys({
        skip: Joi.string().optional(),
        limit: Joi.string().optional(),
    })

}

exports.createTicket = {
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


exports.createTechnician = {
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

module.exports.registerCenter = {
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
        onboarded_by: Joi.string().custom(objectId).optional(),
    })
}

module.exports.registerCenterViaApp = {
    body: Joi.object().keys({
        center_name: Joi.string().required(),
        personal_details: Joi.object().keys({
            phone: Joi.object().keys({
                country_code: Joi.string(),
                mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).required()
            }),
        }),
        primary_services: Joi.string().custom(objectId).required(),
        address_details: Joi.object().keys({
            pincode: Joi.string().required(),
        }),
        no_of_technicians: Joi.number().required(),
        device_id: Joi.string().optional(),
    })
}

exports.verifyOtp = {
    body: Joi.object().keys({
        country_code: Joi.string().required(),
        mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).required(),
        otp: Joi.number().required()
    }),

}

exports.verifyOtpViaApp = {
    body: Joi.object().keys({
        country_code: Joi.string().required(),
        mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).required(),
        otp: Joi.number().required()
    }),

}

exports.PublicTicketBookingPay = {
    body: Joi.object().keys({
        razorpay_payment_id: Joi.string().required(),
        razorpay_order_id: Joi.string().required(),
        razorpay_signature: Joi.string().required(),

    })
}

exports.PublicTicketBooking = {
    body: Joi.object().keys({
        center_obj_id: Joi.string().custom(objectId).optional(),
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