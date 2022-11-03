const jwt = require('jsonwebtoken')
require('dotenv').config()
const commonFunction = require("../common/common")
const mongoose = require("mongoose");
const centerDb = require("../model/center.model");

exports.checkIfAdminHasPermission = async (req, res, next, role_name, full_access) => {
    try {
        let adminDetails = req.adminDetails
        let roles = adminDetails.role_id

        if (full_access) {
            if (!roles.permissions[role_name]['full_access']) {
                throw new Error("You have permission for access for this api")
            }

        }

        if (!roles.permissions[role_name]) {
            throw new Error("You have permission for access for this api")
        }

        next()

    } catch (err) {
        console.log(err)
        return commonFunction.sendActionFailedResponse(res, null, err.message)
    }

}