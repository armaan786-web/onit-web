const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { activeStatus } = require('../common/const')

const requestTechnicianSchema = mongoose.Schema({

    technicianDetails: { type: mongoose.Schema.Types.Mixed },
    request_status: {
        type: String,
        enum: ["ACCEPTED", "REJECTED"]
    },
    request_on: {
        type: Date
    },
    actioned_on: {
        type: Date
    },
    request_type: {
        type: String,
        enum: ["FOR_SALARIED", "FOR_FREELANCER"]
    },
    center_id_inviting: {
        type: mongoose.Types.ObjectId,
        ref: "center"
    },
    added_by: {
        type: String,
        enum: ["TECHNICIAN_ADMIN", "CENTER_ADMIN"]
    },
    freelancer_techician_id: {
        type: mongoose.Types.ObjectId,
        ref: "technician"
    },
    technician_id_inviting: {
        type: mongoose.Types.ObjectId,
        ref: "technician"
    },
    token: {
        type: String,
        index: true
    },
    expires_in: {
        type: Number
    }
},
    {
        timestamps: true
    });

const requestTechnicianModel = mongoose.model('requestTechnician', requestTechnicianSchema);
module.exports = requestTechnicianModel;