const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { activeStatus, profileCreated, engagementTypeArray } = require('../common/const')

const technicianModel = mongoose.Schema({

    personal_details: {
        phone: {
            country_code: {
                type: String,
                default: "91"
            },
            mobile_number: {
                type: String,
            }
        },
        email: {
            type: String,
        },
        name: {
            type: String,
        },
        user_name: {
            type: String,
        },
        about: {
            type: String,
        },
        dob: {
            type: Date
        },
        profile_picture: {
            type: String
        },
        company_worked_with: {
            type: String
        }
    },
    //freelancer can be part of multiple center
    center_id: [{
        type: mongoose.Types.ObjectId,
        ref: 'center'
    }],
    services: {
        primary_services: {
            type: mongoose.Types.ObjectId,
            ref: 'primaryservices'
        },
        secondary_services: [{
            secondary_services_id: {
                type: mongoose.Types.ObjectId,
                ref: 'primaryservices'
            },
            priority: {
                type: Number
            }
        }],
    },

    has_technician_joined_platform: {
        type: Boolean,
        default: false
    },

    service_area_main_pincode: {
        type: String,
        index: true,
    },

    service_area_secondary_pincode: [{
        type: String,
    }],

    address_details_permanent: {
        longitude: {
            type: Number
        },
        latitude: {
            type: Number
        },
        address_line: {
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
    address_details_temporary: {
        longitude: {
            type: Number
        },
        latitude: {
            type: Number
        },
        address_line: {
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

    profile_created_by: {
        type: String,
        enum: profileCreated
    },

    engagement_type: {
        type: String,
        enum: engagementTypeArray
    },

    is_salaried: {
        type: String
    },
    
    document_details: {
        pan_card_document: {
            type: String,
        },
        pan_number: {
            type: String,
        },

        aadhar_card_document: {
            front_side: {
                type: String,
            },
            back_side: {
                type: String,
            }
        },
        aadhar_number: {
            type: String
        },

        gstin_number: {
            type: String
        }

    },

    referenceDetails: {
        //change name to reference person name , number
        reference_person_name: {
            type: String,
        },
        reference_person_mobile: {
            type: String,
        },
    },

    emergency_details: {
        emergency_person_name: {
            type: String,
        },
        emergency_person_phone: {
            type: String
        }
    },

    clients_ids_list: [{
        type: mongoose.Types.ObjectId,
        ref: 'client'
    }],

    is_technician_admin: {
        type: Boolean,
        default: false
    },

    otp_details: {
        otp: {
            type: Number,
        },
        expires_in: {
            type: Number
        },
        is_otp_verfied: {
            type: Boolean,
            default: false
        }
    },

    device_id : {
        type : String
    },

    is_active: {
        type: Number,
        default: activeStatus.ACTIVE
    },
},
    {
        timestamps: true
    });

const technicianSchema = mongoose.model('technician', technicianModel);
module.exports = technicianSchema;