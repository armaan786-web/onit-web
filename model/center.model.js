const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { rolesArray, profileCreated, activeStatus } = require('../common/const')

const centerModel = mongoose.Schema({

    center_name: {
        type: String,
        required: true,
    },
    services: {
        primary_services: {
            type: mongoose.Types.ObjectId,
            ref: 'primaryservices',
            // required: true,
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
    address_details: {
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

    no_of_technicians: {
        type: Number,
        required: true,

    },

    role_based_on_no_of_technicians: {
        type: String,
        enum: rolesArray,
        required: true,

    },



    profile_created_by: {
        type: String,
        enum: profileCreated
    },

    personal_details: {
        phone: {
            country_code: {
                type: String,
                default: "+91"
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
        }
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

    //qr code INA1020001 
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

    disabled_for: {
        login_into_application: {
            type: Boolean,
            default: false

        },
        accepting_broadcast_ticket: {
            type: Boolean,
            default: false
        }
    },

    //todo keep maximum no of technician he can add to -> this is done by no of technician

    payment_details: {
        upi_id: {
            type: String,
        },
        paid_for_onboarding_kit: {
            type: Boolean,
            default: false
        }
    },

    qr_details: {
        qr_id: {
            type: String,
            // unique: true
        }
    },

    count_details: {
        closed_ticket_count: {
            type: Number,
            default: 0
        }
    },

    annual_turnover: {
        type: Number
    },

    verification_status: {
        type: String,
    },

    clients_ids_list: [{
        type: mongoose.Types.ObjectId,
        ref: 'client'
    }],

    otp_details: {
        otp: {
            type: Number,
        },
        expires_in: {
            type: Number
        },
        is_otp_verfied: {
            type: Boolean,
            default: true
        }
    },

    is_active: {
        type: Number,
        default: activeStatus.ACTIVE,
        index: true
    },

    onboarded_by: {
        type: mongoose.Types.ObjectId,
        ref: 'centerOnboarder'
    }
},
    {
        timestamps: true
    });

const centerSchema = mongoose.model('center', centerModel);
module.exports = centerSchema;