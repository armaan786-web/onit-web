const jwt = require('jsonwebtoken')
require('dotenv').config()
const commonFunction = require("../common/common")
const mongoose = require("mongoose");
const centerDb = require("../model/center.model");
const adminDb = require("../model/admin.model");

exports.verifyJwtToken = async (req, res, next) => {
    let token = req.headers["x-access-token"];
    try {
        if (!token) {
            throw new Error("Permission denied")
        }
        let decoded = await jwt.verify(token, commonFunction.tokenDetails.TOKENSECRET)
        req.admin_obj_id = decoded._id
        if (req.admin_obj_id) {
            let findCriteria = {
                _id: mongoose.Types.ObjectId(req.admin_obj_id),
            }
            let adminDetails = await adminDb.find(findCriteria).populate('role_id')
            if (adminDetails && Array.isArray(adminDetails) && adminDetails.length) {
                req.adminDetails = adminDetails[0]
                next();
            } else {
                throw new Error("User not found")
            }
        } else {
            throw new Error("Token is invalid")
        }

    } catch (err) {
        console.log(err)
        return commonFunction.sendActionFailedResponse(res, null, err.message)
    }

}