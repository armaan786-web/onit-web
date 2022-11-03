const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { availableStatusOfBroadCastTicket, activeStatus } = require('../common/const')


const centerOnBoarderSchema = mongoose.Schema({

    name: {
        type: String,
        index: true,
    },
    phone_details: {
        country_code: {
            type: String,
            default: '91'
        },
        mobile_number: {
            type: String,
        }
    },
    center_onboarder_id: {
        type: String
    },
    services: {
        primary_services: {
            type: mongoose.Types.ObjectId,
            ref: 'primaryservices',
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
    allowed_states: {
        type: []
    },
    allowed_cities: {
        type: []
    },
    otpDetails: {
        otp: { type: Number },
        is_otp_verfied: { type: Boolean, default: false },
        otp_expires: { type: Number }
    },
    otp_login: {
        otp: { type: Number },
        otp_expires: { type: Number }

    }

}, {
    timestamps: true
})

const centerOnBoarderModel = mongoose.model('centerOnboarder', centerOnBoarderSchema);

module.exports = centerOnBoarderModel;