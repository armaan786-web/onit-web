
const bcrypt = require("bcrypt");
const saltRounds = require('../../common/common').saltRoundForPasswordHash;
const verificationDb = require('../../model/otpVerificationModel')
const centerDb = require('../../model/center.model')
const technicianDb = require('../../model/technician.model')
const ticketDb = require('../../model/ticket.model')
const broadCastCacheDb = require('../../model/cache_brodcast.model')
const broadCastDb = require('../../model/broadcast.model')
const { broadCastStatus, broadCastCenterInterval, statusOfBroadcastTicket, rolesBasedOnNumberOfTechnician, ticketStatus } = require('../../common/const');

exports.checkIfTechnicianAlreadyExists = async (country_code, phone_number) => {
    try {

        let findCriteria = {
            "personal_details.phone.country_code": country_code,
            "personal_details.phone.mobile_number": phone_number,
        }


        let technicianExists = await technicianDb.find(findCriteria).limit(1).exec()
        if (technicianExists && Array.isArray(technicianExists) && technicianExists.length) {
            throw new Error("Technician already exists")
        }

    } catch (err) {
        throw new Error(err.message)
    }

}

module.exports.checkIfTechnicianDoesNotExists = async (country_code, phone_number) => {
    try {

        let findCriteria = {
            "personal_details.phone.country_code": country_code,
            "personal_details.phone.mobile_number": phone_number,
        }


        let technicianFound = await technicianDb.find(findCriteria).limit(1).exec()

        if (technicianFound && Array.isArray(technicianFound) && technicianFound.length) {
            throw new Error("Technician already exists with this phone number")
        }

    } catch (err) {
        throw new Error(err.message)
    }
}

exports.checkIfTechnicianExists = async (country_code, phone_number) => {
    try {

        let findCriteria = {
            "personal_details.phone.country_code": country_code,
            "personal_details.phone.mobile_number": phone_number,
        }


        let technicianFound = await technicianDb.find(findCriteria).limit(1).exec()
        if (!(technicianFound && Array.isArray(technicianFound) && technicianFound.length)) {
            throw new Error("Technician doesnt exists with this phone number")
        }

        return technicianFound[0]

    } catch (err) {
        throw new Error(err.message)
    }
}


exports.checkIFTheOtpIsVerifiedForThisNumber = async (country_code, mobile_number) => {
    try {
        let findCriteria = {
            country_code,
            mobile_number,
        }
        let verificationFound = await verificationDb.find(findCriteria).limit(1).exec()
        if (verificationFound && Array.isArray(verificationFound) && verificationFound.length) {
            if (verificationFound[0].expries_at < Date.now()) {
                throw new Error("your otp is expired")
            }
            if (verificationFound[0].verified == false) {
                throw new Error("Verify your otp before you register")
            }
        }
    } catch (err) {
        throw new Error(err.message)

    }
}



exports.checkIfTheOtpIsValid = async (country_code, mobile_number, otp) => {
    try {

        let findCriteria = {
            country_code,
            mobile_number,
        }

        let verificationFound = await verificationDb.find(findCriteria).limit(1).exec()
        if (verificationFound && Array.isArray(verificationFound) && verificationFound.length) {

            if (verificationFound[0].verified) {
                throw new Error("Your otp has been verified already")
            } else if (verificationFound[0].otp != otp) {
                throw new Error("Your otp is not correct")
            } else if (verificationFound[0].otp == otp) {
                if (verificationFound[0].expries_at < Date.now()) {
                    throw new Error("Your otp is expired already , try again")
                }
            }

            return verificationFound[0]

        } else {
            throw new Error("Invalid Otp")
        }
    } catch (err) {
        throw new Error(err.message)
    }
}