const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { activeStatus } = require('../common/const')

const client = mongoose.Schema({
    client_name: {
        type: String,
        unique: true,
    },
    official_email: {
        type: String,
    },
    client_id: {
        type: String
    },
    short_code: {
        type: String,
    },
    authorization_details: {
        min: {
            type: Number,
        },
        max: {
            type: Number,
        }
    },
    client_poc: {
        person_name: {
            type: String
        },
        person_designation: {
            type: String
        },
        phone: {
            country_code: {
                type: String,
                default: "+91"
            },
            mobile_number: {
                type: String,
            }
        }
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
        country: {
            type: String,
            default: "INDIA"
        },
        google_geo_location: {
            type: String,
        }
    },
    gst_number: {
        type: String,
    },
    is_active: {
        type: Number,
        default: activeStatus.ACTIVE
    }
},
    {
        timestamps: true
    });

const clientSchema = mongoose.model('client', client);

module.exports = clientSchema;