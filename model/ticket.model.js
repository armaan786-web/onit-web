const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ticketCreated, activeStatus, availableTimePreference, availableBroadCastStatus, ticketStatus, availableTicketStatus, availableTicketAssignTypes } = require('../common/const')

const ticketModel = mongoose.Schema({

    service_provided_for: {
        type: mongoose.Types.ObjectId,
        ref: 'primaryservices'
    },

    specific_requirement: {
        type: String
    },

    ticket_id: {
        type: String
    },

    client_ticket_id: {
        type: String
    },

    personal_details: {
        primary_phone: {
            country_code: {
                type: String,
                default: "+91"
            },
            mobile_number: {
                type: String,
            }
        },
        alternate_phone: {
            country_code: {
                type: String,
                default: "+91"
            },
            mobile_number: {
                type: String,
            }
        },
        name: {
            type: String,
        },
    },

    address_details: {
        longitude: {
            type: Number
        },
        latitude: {
            type: Number
        },
        house_number: {
            type: String
        },
        locality: {
            type: String
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        pincode: {
            type: String,
        },
        additional_pincode: {
            type: String,
        },
        short_code_for_place: {
            type: String,
        },
        country: {
            type: String,
            default: "INDIA"
        },
        google_geo_location: {
            type: String,
        }
    },

    time_preference: {
        time_preference_type: {
            type: String,
            enum: availableTimePreference
        },
        specific_date_time: {
            type: Date
        },
        specific_date_time_time_stamp: {
            type: Number
        }
    },

    is_technician_assigned: {
        type: Boolean,
        default: false
    },

    assigned_ids: {
        assigned_technician_id: {
            type: mongoose.Types.ObjectId,
            ref: 'technician'
        },
        assigned_center_id: {
            type: mongoose.Types.ObjectId,
            ref: 'center'
        },
        // assign_type: {
        //     type: String,
        //     enum: availableTicketAssignTypes
        // }
    },

    is_paid_by_public: {
        type: Boolean,
        default: false
    },

    broadcast_status: {
        type: String,
        enum: availableBroadCastStatus
    },

    ticket_status: {
        type: String,
        enum: availableTicketStatus,
        default: ticketStatus.PENDING

    },

    ticket_price: {
        type: Number,
        default: 99
    },

    ticket_created_by: {
        type: String,
        enum: ticketCreated
    },

    offers_applied: {
        offer_code: { type: String }
    },

    closing_ticket_price: {
        type: String,
    },

    admin_setting: {
        is_paid: {
            type: Boolean,
            default: true
        }

    },

    remarks: {
        additional_remarks: [{
            remarks: {
                type: String
            },
            date: {
                type: Date
            }
        }],
        close_ticket_remarks: {
            type: String
        },
        admin_remarks: {
            type: String
        },
        technician_remarks: {
            type: String
        },
    },

    messages: {
        customer_message: { type: String },
        center_message: { type: String }
    },

    onsite_pictures: [{
        type: String
    }],

    authorized_client_id: {
        type: mongoose.Types.ObjectId,
        ref: 'client'
    },
    created_by: {
        type: mongoose.Types.ObjectId,
        ref: 'center'
    },

    take_time: {
        type: Date
    },

    start_job: {
        pic: {
            type: String
        },
        start_time: {
            type: Date,
        },
    },

    is_active: {
        type: Number,
        default: activeStatus.ACTIVE
    }
},
    {
        timestamps: true
    });

const ticketModelSchema = mongoose.model('ticket', ticketModel);
module.exports = ticketModelSchema;