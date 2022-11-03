const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { activeStatus, adminRoleType, availableAdminRoleTypes } = require('../common/const')

const admin = mongoose.Schema({

    user_name: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    phone: {
        country_code: {
            type: String,
            default: "+91"
        },
        mobile_number: {
            type: String,
        }
    },
    admin_role: {
        type: String,
        enum: availableAdminRoleTypes,
        default: adminRoleType.SUPER_ADMIN
    },
    role_id: {
        type: mongoose.Types.ObjectId,
        ref: "role"
    },
    profile_pic: {
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

const adminSchema = mongoose.model('admin', admin);

module.exports = adminSchema;