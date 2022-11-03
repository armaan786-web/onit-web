const jwt = require('jsonwebtoken')
require('dotenv').config()
const commonFunction = require("../common/common")
const mongoose = require("mongoose");
const technicianDb = require("../model/technician.model");
const centerDb = require("../model/center.model");

exports.verifyJwtToken = async (req, res, next) => {
    let token = req.headers["x-access-token"];
    try {
        if (!token) {
            throw new Error("Permission denied")
        }
        let decoded = await jwt.verify(token, commonFunction.tokenDetails.TOKENSECRET)
        req.technician_obj_id = decoded._id
        console.log(req.technician_obj_id)
        if (req.technician_obj_id) {
            let findCriteria = {
                _id: mongoose.Types.ObjectId(req.technician_obj_id),
            }
            let technicianDetails = await technicianDb.find(findCriteria)

            console.log(technicianDetails , "technicianDetails")

            if (technicianDetails && Array.isArray(technicianDetails) && technicianDetails.length) {
                req.technicianDetails = technicianDetails[0]
                let centerDetails = await centerDb.findOne({ _id: req.technicianDetails?.center_id?.[0] })
                req.centerDetails = centerDetails
                console.log(centerDetails , "centerDetails")
                next();
            } else {
                throw new Error("Technician not found")
            }
        } else {
            throw new Error("Token is invalid")
        }

    } catch (err) {
        console.log(err)
        return commonFunction.sendActionFailedResponse(res, null, err.message)
    }

}