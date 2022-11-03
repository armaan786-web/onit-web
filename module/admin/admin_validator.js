const Joi = require('joi');
const { objectId } = require('../../helpers/common');

module.exports.createAdmin = {
    body: Joi.object().keys({
        user_name: Joi.string().required(),
        password: Joi.string().required(),
        phone: Joi.object().keys({
            country_code: Joi.string(),
            mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/)
        }).required(),
    })
}

exports.removeUsers = {
    body: Joi.object().keys({
        user_object_id: Joi.string().custom(objectId).required(),
    })
}

exports.updateCenterOnBoarder = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        phone_details: Joi.object().keys({
            country_code: Joi.string().required(),
            mobile_number: Joi.string().required(),
        }),
        // primary_services: Joi.string().custom(objectId).required(),
        // secondary_services: Joi.array().items(Joi.object({
        //     secondary_services_id: Joi.string().custom(objectId).optional(),
        //     priority: Joi.number().optional()
        // })).min(1).max(3).optional(),
        // allowed_states: Joi.array().required(),
        // allowed_cities: Joi.array().required(),
        center_onboarder_id : Joi.string().custom(objectId).required(),
    })
}

exports.createCenterOnBoarder = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        phone_details: Joi.object().keys({
            country_code: Joi.string().required(),
            mobile_number: Joi.string().required(),
        }),
        // primary_services: Joi.string().custom(objectId).required(),
        // secondary_services: Joi.array().items(Joi.object({
        //     secondary_services_id: Joi.string().custom(objectId).optional(),
        //     priority: Joi.number().optional()
        // })).min(1).max(3).optional(),
        // allowed_states: Joi.array().required(),
        // allowed_cities: Joi.array().required(),
    })

}

exports.getAllCenterOnBoarder = {
    query: Joi.object().keys({
        skip: Joi.string().optional(),
        limit: Joi.number().optional(),
        center_onboarder_id: Joi.string().optional()
    })
}

exports.getAllUsers = {
    query: Joi.object().keys({
        skip: Joi.string().optional(),
        limit: Joi.number().optional(),
        user_obj_id: Joi.string().optional()
    })
}

exports.createUsers = {
    body: Joi.object().keys({
        user_name: Joi.string().required(),
        password: Joi.string().required(),
        country_code: Joi.string().required(),
        phone_number: Joi.string().pattern(/^[1-9]\d{9}$/).required(),
        role_id: Joi.string().custom(objectId).required(),

    })
}

exports.login = {
    body: Joi.object().keys({
        user_name: Joi.string().required(),
        password: Joi.string().required()
    })
}

exports.adminGetAllBroadCastedTicket = {
    query: Joi.object().keys({
        skip: Joi.string().optional(),
        limit: Joi.number().optional()
    })

}

exports.adminBroadCast = {
    body: Joi.object().keys({
        ticket_obj_id: Joi.string().custom(objectId).required(),
    })

}

exports.adminGetServices = {
    query: Joi.object().keys({
        skip: Joi.string().optional(),
        limit: Joi.number().optional()
    })
}

exports.adminGetActiveServices = {
    query: Joi.object().keys({
        skip: Joi.string().optional(),
        limit: Joi.number().optional()
    })
}

exports.adminGetClients = {
    query: Joi.object().keys({
        skip: Joi.string().optional(),
        limit: Joi.number().optional()
    })
}

exports.adminCreateServices = {
    body: Joi.object().keys({
        service_name: Joi.string().required(),
        pin_code: Joi.string().optional()
    })

}

exports.adminDeleteService = {
    body: Joi.object().keys({
        serviceId: Joi.string().required(),
    })
}

exports.adminDeleteClient = {
    body: Joi.object().keys({
        clientId: Joi.string().required(),
    })
}

module.exports.adminCreateCenter = {
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


exports.adminUpdateCenter = {
    body: Joi.object().keys({
        center_obj_id: Joi.string().custom(objectId).required(),
        center_name: Joi.string().optional(),
        personal_details: Joi.object().keys({
            phone: Joi.object().keys({
                country_code: Joi.string().optional(),
                mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).optional(),
            }),
            email: Joi.string().optional().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).allow("").allow(null),
            name: Joi.string().optional(),
            user_name: Joi.string().optional().allow("").allow(null),
            about: Joi.string().optional().allow("").allow(null),
        }).optional(),
        primary_services: Joi.string().custom(objectId).optional(),
        secondary_services: Joi.array().items(Joi.object({
            secondary_services_id: Joi.string().custom(objectId),
            priority: Joi.number()
        })).min(1).max(3).optional(),
        address_details: Joi.object().keys({
            longitude: Joi.number().allow(""),
            latitude: Joi.number().allow(""),
            address_line: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            pincode: Joi.string(),
            additional_pincode: Joi.string(),
            country: Joi.string(),
            short_code_for_place: Joi.string().optional(),
            google_geo_location: Joi.string().optional()
        }).optional(),
        no_of_technicians: Joi.number().optional(),
        clients_ids_list: Joi.array().items(Joi.string()).optional(),
        login_into_application: Joi.boolean().optional().allow("", null),
        accepting_broadcast_ticket: Joi.boolean().optional().allow("", null),
        upi_id: Joi.string().optional().allow("", null)
    })
}

exports.adminUpdateTechnician = {
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
                front_side: Joi.string().optional(),
                back_side: Joi.string().optional()
            })

        }),
        referenceDetails: Joi.object().keys({
            reference_person_name: Joi.string().optional(),
            reference_person_mobile: Joi.string().pattern(/^[1-9]\d{9}$/).optional(),
        }),
        emergency_details: Joi.object().keys({
            emergency_person_name: Joi.string().optional(),
            emergency_person_phone: Joi.string().pattern(/^[1-9]\d{9}$/).optional(),
        }),
        clients_ids_list: Joi.array().items(Joi.string())
    }),
}

exports.adminUpdateTicket = {
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
        admin_remarks: Joi.string().optional().allow(""),
        assigned_ids: Joi.object().keys({
            assigned_technician_id: Joi.string().custom(objectId).optional(),
            assigned_center_id: Joi.string().custom(objectId).optional(),
        }),
        offers_applied: Joi.object().keys({
            offer_code: Joi.string().optional()
        }),
    })
}

exports.adminCreateTechnician = {
    body: Joi.object().keys({
        center_obj_id: Joi.string().custom(objectId).required(),
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
        service_area_main_pincode: Joi.string().required(),
        service_area_secondary_pincode: Joi.array().min(1).max(3).required(),
        address_details_permanent: Joi.object().keys({
            longitude: Joi.number().allow(""),
            latitude: Joi.number().allow(""),
            address_line: Joi.string().allow(''),
            city: Joi.string().allow(''),
            state: Joi.string().allow(''),
            pincode: Joi.string().required(),
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
            pincode: Joi.string().required(),
            additional_pincode: Joi.string(),
            country: Joi.string(),
            short_code_for_place: Joi.string().optional(),
            google_geo_location: Joi.string().optional()

        }),
        engagement_type: Joi.string().required(),
        document_details: Joi.object().keys({
            aadhar_card_document: Joi.object().keys({
                front_side: Joi.string().required(),
                back_side: Joi.string().required()
            })

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

exports.adminCreateTicket = {
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
        is_paid: Joi.boolean().optional(),
        time_preference: Joi.object().keys({
            time_preference_type: Joi.string(),
            specific_date_time: Joi.string(),
        }),
        authorized_client_id: Joi.string().custom(objectId),
        offers_applied: Joi.object().keys({
            offer_code: Joi.string()
        }),
    })
}

exports.adminGetAllCenter = {
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

exports.adminGetAllTechnician = {
    query: Joi.object().keys({
        skip: Joi.string().optional(),
        limit: Joi.string().optional(),
        primary_services: Joi.string().custom(objectId).optional(),
        secondary_services: Joi.string().custom(objectId).optional(),
        service_area_main_pincode: Joi.string().optional(),
        is_active: Joi.string().optional(),
        engagement_type: Joi.string().optional(),
        center_id: Joi.string().custom(objectId).optional(),
        start_date: Joi.string().optional().allow(""),
        end_date: Joi.string().optional().allow(""),

    })
}

exports.adminGetSingleTickets = {
    query: Joi.object().keys({
        ticket_obj_id: Joi.string().required(),
    })
}

exports.adminGetAllTickets = {
    query: Joi.object().keys({
        skip: Joi.string().optional(),
        limit: Joi.string().optional(),
        is_active: Joi.string().optional(),
        ticket_status: Joi.string().optional(),
        broadcast_status: Joi.string().optional(),
        time_preference_type: Joi.string().optional(),
        pincode: Joi.string().optional(),
        service_provided_for: Joi.string().optional(),
        assigned_technician_id: Joi.string().custom(objectId).optional(),
        assigned_center_id: Joi.string().custom(objectId).optional(),
        assign_type: Joi.string().optional(),
        start_date: Joi.string().optional().allow(""),
        ticket_obj_id: Joi.string().optional().allow(""),
        end_date: Joi.string().optional().allow(""),
    })

}

module.exports.adminAddClient = {
    body: Joi.object().keys({
        client_name: Joi.string().required(),
        official_email: Joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
        client_poc: Joi.object().keys({
            person_name: Joi.string(),
            person_designation: Joi.string(),
            phone: Joi.object().keys({
                country_code: Joi.string(),
                mobile_number: Joi.string().pattern(/^[1-9]\d{9}$/).required()
            }),
        }),
        short_code : Joi.string().optional().allow(""),
        address_details: Joi.object().keys({
            longitude: Joi.number().allow(""),
            latitude: Joi.number().allow(""),
            address_line: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            pincode: Joi.string().required(),
            additional_pincode: Joi.string(),
            country: Joi.string(),
            short_code_for_place: Joi.string().optional(),
            google_geo_location: Joi.string().optional()
        }),
        gst_number: Joi.string().optional(),
    })
}

exports.adminUpdateService = {
    body: Joi.object().keys({
        service_object_id: Joi.string().required(),
        service_name: Joi.string().required(),
        pin_code: Joi.string().optional()
    })
}

exports.adminUpdateServiceStatus = {
    body: Joi.object().keys({
        service_object_id: Joi.string().required(),
        is_active: Joi.number().required(),
    })
}