const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { activeStatus } = require('../common/const')

const rolesSchema = mongoose.Schema({

    role_name: {
        type: String,
    },
    role_created_user: {
        type: mongoose.Types.ObjectId,
        ref: "admin",
        required: true,
    },
    permissions: {

        //center
        add_center: { type: Boolean, default: false },
        update_center: {
            full_access: { type: Boolean, default: false },
        },
        delete_center: { type: Boolean, default: false },
        view_center_details: {
            full_access: { type: Boolean, default: false },
            view_pincode: { type: Boolean, default: false },
        },

        //technician roles
        add_technician: { type: Boolean, default: false },
        update_technician: {
            full_access: { type: Boolean, default: false },
        },
        delete_technician: { type: Boolean, default: false },
        view_technician_details: {
            full_access: { type: Boolean, default: false },
            technician_phone: { type: Boolean, default: false },
        },

        //dashboard
        view_dashboard_full_access: { type: Boolean, default: false },

        //services
        add_new_services: { type: Boolean, default: false },
        update_services: {
            full_access: { type: Boolean, default: false },
        },
        inactive_active: { type: Boolean, default: false },
        view_services_list: {
            full_access: { type: Boolean, default: false },
        },

        //tickets
        add_ticket: { type: Boolean, default: false },
        edit_ticket: {
            full_access: { type: Boolean, default: false },
        },
        delete_ticket: { type: Boolean, default: false },
        view_ticket: {
            full_access: { type: Boolean, default: false },
        },

        //clients 
        add_clients: { type: Boolean, default: false },
        edit_clients: {
            full_access: { type: Boolean, default: false },
        },
        view_clients: {
            full_access: { type: Boolean, default: false },
        },

        //broadcastedList
        view_broadcastedList: { type: Boolean, default: false },

        //roles
        add_role: { type: Boolean, default: false },
        edit_role_permissions: {
            full_access: { type: Boolean, default: false },
        },
        delete_role: { type: Boolean, default: false },
        view_role: {
            full_access: { type: Boolean, default: false },
        },
    }
},
    {
        timestamps: true
    });

const rolesSchemaModel = mongoose.model('role', rolesSchema);
module.exports = rolesSchemaModel;