
const bcrypt = require("bcrypt");
const saltRounds = require('../../common/common').saltRoundForPasswordHash;
const verificationDb = require('../../model/otpVerificationModel')
const centerDb = require('../../model/center.model')
const technicianDb = require('../../model/technician.model')
const ticketDb = require('../../model/ticket.model')
const broadCastCacheDb = require('../../model/cache_brodcast.model')
const broadCastDb = require('../../model/broadcast.model')
const { broadCastStatus, broadCastCenterInterval, statusOfBroadcastTicket, rolesBasedOnNumberOfTechnician, ticketStatus } = require('../../common/const');
const requestTechnicianModel = require('../../model/requestTechnician.model');
const commonFunctionForAuth = require('../../helpers/common');
const commonFolder = require('../../common/common');
const notificationService = require('../../helpers/NotificationService')


exports.checkIfBroadCastIsAlreadyAccepted = async (ticket_obj_id) => {
    try {
        let findCriIsAlreadyAccepted = {
            ticket_obj_id: ticket_obj_id,
            status_of_ticket: statusOfBroadcastTicket.ACCEPTED
        }

        let isBroCastAlreadyAccepted = await broadCastDb.find(findCriIsAlreadyAccepted).limit(1).exec()

        if (isBroCastAlreadyAccepted && Array.isArray(isBroCastAlreadyAccepted) && isBroCastAlreadyAccepted.length) {
            throw new Error("ticket is already assigned to some one")
        }

    } catch (err) {
        throw new Error(err.message)
    }
}

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


exports.getTotalNoOfTechnicianInACenter = async (center_obj_id) => {
    try {
        let findCri = {
            center_id: {
                $in: center_obj_id
            }
        }

        let totalCountsOfTechnician = await technicianDb.countDocuments(findCri)

        return totalCountsOfTechnician
    } catch (err) {
        throw new Error(err.message)
    }
}

exports.getInsertObjBasedOnNoOfTechnicain = (insertObj, no_of_technicians) => {

    if (no_of_technicians > 1) {
        insertObj = {
            ...insertObj,
            role_based_on_no_of_technicians: rolesBasedOnNumberOfTechnician.CENTER
        }
        return insertObj

    }
    switch (no_of_technicians) {
        case 0: {
            insertObj = {
                ...insertObj,
                role_based_on_no_of_technicians: rolesBasedOnNumberOfTechnician.DEALER
            }

        }
            break;
        case 1: {
            insertObj = {
                ...insertObj,
                role_based_on_no_of_technicians: rolesBasedOnNumberOfTechnician.FREELANCER
            }

        }
            break;
        default: {
            throw new Error("Invalid number of technician")
        }

    }
    return insertObj

}

module.exports.checkIfCenterDoesNotExists = async (country_code, phone_number) => {
    try {

        let findCriteria = {
            "personal_details.phone.country_code": country_code,
            "personal_details.phone.mobile_number": phone_number,
        }


        let centerFound = await centerDb.find(findCriteria).limit(1).exec()

        if (centerFound && Array.isArray(centerFound) && centerFound.length) {
            throw new Error("Center already exists with this phone number")
        }

    } catch (err) {
        throw new Error(err.message)
    }
}

module.exports.checkIfTechnicianOtpVerified = async (country_code, phone_number) => {
    try {

        let findCriteria = {
            "personal_details.phone.country_code": country_code,
            "personal_details.phone.mobile_number": phone_number,
        }


        let technicianFound = await technicianDb.find(findCriteria).limit(1).exec()

        if (technicianFound && Array.isArray(technicianFound) && technicianFound.length) {
            if (technicianFound?.otp_details?.is_otp_verfied) {
                throw new Error("Technician already exists with this phone number")
            }
            await technicianDb.findOneAndDelete(findCriteria);
        }

    } catch (err) {
        throw new Error(err.message)
    }
}

module.exports.checkIfCenterOtpVerified = async (country_code, phone_number) => {
    try {

        let findCriteria = {
            "personal_details.phone.country_code": country_code,
            "personal_details.phone.mobile_number": phone_number,
        }


        let centerFound = await centerDb.find(findCriteria).limit(1).exec()
        console.log("centerFound is", centerFound)
        if (centerFound && Array.isArray(centerFound) && centerFound.length) {
            if (centerFound?.otp_details?.is_otp_verfied) {
                throw new Error("Center already exists with this phone number")
            }
            await centerDb.findOneAndDelete(findCriteria);
        }

    } catch (err) {
        throw new Error(err.message)
    }
}

exports.checkIfCenterExists = async (country_code, phone_number) => {
    try {

        let findCriteria = {
            "personal_details.phone.country_code": country_code,
            "personal_details.phone.mobile_number": phone_number,
        }


        let centerFound = await centerDb.find(findCriteria).limit(1).exec()
        if (!(centerFound && Array.isArray(centerFound) && centerFound.length)) {
            throw new Error("Center doesnt exists with this phone number")
        }

        return centerFound[0]

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

exports.checkIfTheOtpIsValidForCenterViaApp = async (country_code, mobile_number, otp) => {
    try {

        let findCriteria = {
            "personal_details.phone.country_code": country_code,
            "personal_details.phone.mobile_number": mobile_number,
        }

        let centerFound = await centerDb.find(findCriteria).limit(1).exec()
        console.log("centerFound is", centerFound)
        if (centerFound && Array.isArray(centerFound) && centerFound.length) {

            if (centerFound[0]?.otp_details?.is_otp_verfied) {
                throw new Error("Your otp has been verified already")
            } else if (centerFound[0]?.otp_details?.otp != otp) {
                throw new Error("Your otp is not correct")
            } else if (centerFound[0]?.otp_details?.otp == otp) {
                if (centerFound[0]?.otp_details.expires_in < Date.now()) {
                    throw new Error("Your otp is expired already , try again")
                }
            }

            return centerFound[0]

        } else {
            throw new Error("Invalid Otp")
        }
    } catch (err) {
        throw new Error(err.message)
    }
}

exports.checkIfTheOtpIsValidForTechnicianViaApp = async (country_code, mobile_number, otp) => {
    try {

        let findCriteria = {
            "personal_details.phone.country_code": country_code,
            "personal_details.phone.mobile_number": mobile_number,
        }

        let technicianFound = await technicianDb.find(findCriteria).limit(1).exec()
        if (technicianFound && Array.isArray(technicianFound) && technicianFound.length) {

            if (technicianFound[0]?.otp_details?.is_otp_verfied) {
                throw new Error("Your otp has been verified already")
            } else if (technicianFound[0]?.otp_details?.otp != otp) {
                throw new Error("Your otp is not correct")
            } else if (technicianFound[0]?.otp_details?.otp == otp) {
                if (technicianFound[0]?.otp_details.expires_in < Date.now()) {
                    throw new Error("Your otp is expired already , try again")
                }
            }

            return technicianFound[0]

        } else {
            throw new Error("Invalid Otp")
        }
    } catch (err) {
        throw new Error(err.message)
    }
}

exports.matchPrimaryOrSecondaryService = async (service_provided_for, centerPrimaryService, centerSecondaryServices) => {
    try {
        let isPrimaryServiceMatched = false;
        let isSecondaryServiceMatched = false;
        let isServiceMatched = false;

        if (service_provided_for == centerPrimaryService) {
            isPrimaryServiceMatched = true;
        }


        if (!isPrimaryServiceMatched) {
            let matchSecondary =
                centerSecondaryServices && centerSecondaryServices.length > 0 &&
                centerSecondaryServices.find(item => item.secondary_services_id == service_provided_for);

            if (matchSecondary) {
                isSecondaryServiceMatched = true;
            }
        }


        if (isPrimaryServiceMatched || isSecondaryServiceMatched) {
            isServiceMatched = true;
        }


        return isServiceMatched
    } catch (err) {
        throw new Error(err.message)
    }
}

exports.checkIfCenterCanAcceptMoreBroadCastedTickets = async (center_obj_id) => {
    try {

        let findCri = {
            "assigned_ids.assigned_center_id": center_obj_id,
            "broadcast_status": "accepted after broadcast"
        }

        let totalTickets = await ticketDb.countDocuments(findCri)

        findCri = {
            ...findCri,
            ticket_status: ticketStatus.CLOSED,
            "broadcast_status": "accepted after broadcast"
        }

        let closedTickets = await ticketDb.countDocuments(findCri)

        let difference = totalTickets - closedTickets;

        if (difference > 3) {
            throw new Error("You have more than 3 pending ticket of broadcast, please complete that to accept more")
        }

    } catch (err) {
        throw new Error(err)

    }
}


exports.broadCastAllTicketsV1ForCreatedUsingQR = async (center_obj_id, ticketObject) => {
    try {
        const { address_details, service_provided_for } = ticketObject;

        if (center_obj_id) {
            let findCriteria = {
                _id: center_obj_id,
            }

            let centerFound = await centerDb.find(findCriteria).limit(1).exec()
            if (!(centerFound && Array.isArray(centerFound) && centerFound.length)) {
                throw new Error("Center doesnt exists with this id")
            }

            let centerObject = centerFound[0];
            let centerPinCode = centerObject?.address_details?.pincode
            let centerPrimaryService = centerObject?.services?.primary_services;
            let centerSecondaryServices = centerObject?.services?.secondary_services;

            let isPinCodeMatched = centerPinCode == address_details.pincode;

            let isServiceMatched = await this.matchPrimaryOrSecondaryService(service_provided_for, centerPrimaryService, centerSecondaryServices);
            console.log("isPinCodeMatched matched", isPinCodeMatched, isServiceMatched)

            // if (isPinCodeMatched && isServiceMatched) {
            if (isServiceMatched) {


                console.log("isPinCodeMatched matched", isPinCodeMatched)

                let findCri = {
                    _id: ticketObject._id,
                }

                let updateCri = {}
                center_obj_id ? updateCri['assigned_ids.assigned_center_id'] = center_obj_id : ''
                updateCri['broadcast_status'] = broadCastStatus.MATCHED_IN_SAME_CENTER

                await ticketDb.findOneAndUpdate(findCri, updateCri, { new: true })
                return
            }
        }

        let findCriteria = {
            $and: [
                {
                    "address_details.pincode": address_details.pincode
                },
                {
                    $or: [
                        { "services.primary_services": { "$in": [service_provided_for] } },
                        { "services.secondary_services.secondary_services_id": { "$in": [service_provided_for] } }
                    ]
                }
            ]
        }

        let centers = await centerDb.find(findCriteria).sort({ _id: -1 }).exec()
        console.log("centers available for broadcast", centers)
        if (!(centers && Array.isArray(centers) && centers.length)) {
            let findCri = {
                _id: ticketObject._id,
            }

            let updateCri = {
                broadcast_status: broadCastStatus.NO_MATCH_FOUND
            }

            let updateddTicketAs = await ticketDb.findOneAndUpdate(findCri, updateCri, { new: true })

            console.log("updatedTicket", updateddTicketAs)

            return
        }


        let insertBroadCastModel = {
            ticket_obj_id: ticketObject._id,
            status_of_ticket: statusOfBroadcastTicket.PENDING
        }

        let findCriTcket = {
            _id: ticketObject._id,
        }

        let updateCriTicket = {}
        updateCriTicket['broadcast_status'] = broadCastStatus.BROADCASTED

        let updatedd = await ticketDb.findOneAndUpdate(findCriTcket, updateCriTicket, { new: true })

        console.log("updatedTicket", updatedd)


        let insertObjArr = []
        for (let center of centers) {
            insertObjArr.push({
                ...insertBroadCastModel,
                center_obj_id: center._id,

            })
        }

        let insertedObject = await broadCastDb.insertMany(insertObjArr)


        for (let center of centers) {
            let center_obj_id = center._id

            let findCriteriaCriii = {
                center_id: {
                    $in: [center_obj_id]
                },
                is_technician_admin: true

            }


            let technicianExists = await technicianDb.findOne(findCriteriaCriii)

            if (technicianExists && technicianExists?.device_id) {

                let pushMessage = {
                    title: "New Ticket",
                    body: "Hey ! There is a new ticket for you !"
                }
                await commonFunctionForAuth.sendAndroidPushNotificationUsingFCM(technicianExists?.device_id, pushMessage, "", "")

            }
        }



    } catch (err) {
        throw new Error("Fail in broadcasting " + err.message)

    }
}

exports.broadCastAllTicketsV1 = async (center_obj_id, ticketObject) => {
    try {
        const { address_details, service_provided_for } = ticketObject;

        if (center_obj_id) {
            let findCriteria = {
                _id: center_obj_id,
            }

            let centerFound = await centerDb.find(findCriteria).limit(1).exec()
            if (!(centerFound && Array.isArray(centerFound) && centerFound.length)) {
                throw new Error("Center doesnt exists with this id")
            }

            let centerObject = centerFound[0];
            let centerPinCode = centerObject?.address_details?.pincode
            let centerPrimaryService = centerObject?.services?.primary_services;
            let centerSecondaryServices = centerObject?.services?.secondary_services;

            let isPinCodeMatched = centerPinCode == address_details.pincode;

            let isServiceMatched = await this.matchPrimaryOrSecondaryService(service_provided_for, centerPrimaryService, centerSecondaryServices);
            console.log("isPinCodeMatched matched", isPinCodeMatched, isServiceMatched)

            if (isPinCodeMatched && isServiceMatched) {

                console.log("isPinCodeMatched matched", isPinCodeMatched)

                let findCri = {
                    _id: ticketObject._id,
                }

                let updateCri = {}
                center_obj_id ? updateCri['assigned_ids.assigned_center_id'] = center_obj_id : ''
                updateCri['broadcast_status'] = broadCastStatus.MATCHED_IN_SAME_CENTER

                await ticketDb.findOneAndUpdate(findCri, updateCri, { new: true })
                return
            }
        }

        let findCriteria = {
            $and: [
                {
                    "address_details.pincode": address_details.pincode
                },
                {
                    $or: [
                        { "services.primary_services": { "$in": [service_provided_for] } },
                        { "services.secondary_services.secondary_services_id": { "$in": [service_provided_for] } }
                    ]
                }
            ]
        }

        let centers = await centerDb.find(findCriteria).sort({ _id: -1 }).exec()
        console.log("centers available for broadcast", centers)
        if (!(centers && Array.isArray(centers) && centers.length)) {
            let findCri = {
                _id: ticketObject._id,
            }

            let updateCri = {
                broadcast_status: broadCastStatus.NO_MATCH_FOUND
            }

            let updateddTicketAs = await ticketDb.findOneAndUpdate(findCri, updateCri, { new: true })

            console.log("updatedTicket", updateddTicketAs)

            return
        }


        let insertBroadCastModel = {
            ticket_obj_id: ticketObject._id,
            status_of_ticket: statusOfBroadcastTicket.PENDING
        }

        let findCriTcket = {
            _id: ticketObject._id,
        }

        let updateCriTicket = {}
        updateCriTicket['broadcast_status'] = broadCastStatus.BROADCASTED

        let updatedd = await ticketDb.findOneAndUpdate(findCriTcket, updateCriTicket, { new: true })

        console.log("updatedTicket", updatedd)


        let insertObjArr = []
        for (let center of centers) {
            insertObjArr.push({
                ...insertBroadCastModel,
                center_obj_id: center._id,

            })
        }

        let insertedObject = await broadCastDb.insertMany(insertObjArr)


        for (let center of centers) {
            let center_obj_id = center._id

            let findCriteriaCriii = {
                center_id: {
                    $in: [center_obj_id]
                },
                is_technician_admin: true
            }


            let technicianExists = await technicianDb.findOne(findCriteriaCriii)

            if (technicianExists && technicianExists?.device_id) {

                let pushMessage = {
                    title: "New Ticket",
                    body: "Hey ! There is a new ticket for you !"
                }
                await commonFunctionForAuth.sendAndroidPushNotificationUsingFCM(technicianExists?.device_id, pushMessage, "", "")

            }
        }
        console.log(insertedObject, "insertedObject", insertObjArr, "insertObjArr")



    } catch (err) {
        throw new Error("Fail in broadcasting " + err.message)

    }
}

exports.ticketAllocation = async (center_obj_id, ticketObject) => {
    try {
        const { address_details, service_provided_for } = ticketObject;
        let findCriteria = {
            _id: center_obj_id,
        }

        let centerFound = await centerDb.find(findCriteria).limit(1).exec()
        if (!(centerFound && Array.isArray(centerFound) && centerFound.length)) {
            throw new Error("Center doesnt exists with this id")
        }

        let centerObject = centerFound[0];
        let centerPinCode = centerObject?.address_details?.pincode
        let centerPrimaryService = centerObject?.services?.primary_services;
        let centerSecondaryServices = centerObject?.services?.secondary_services;

        let isPinCodeMatched = centerPinCode == address_details.pincode;

        let isServiceMatched = await this.matchPrimaryOrSecondaryService(service_provided_for, centerPrimaryService, centerSecondaryServices);

        if (isPinCodeMatched && isServiceMatched) {
            let findCri = {
                _id: ticketObject._id,
            }

            let updateCri = {}
            center_obj_id ? updateCri['assigned_ids.assigned_center_id'] = center_obj_id : ''

            await ticketDb.findOneAndUpdate(findCri, updateCri, { new: true })

        } else {
            await this.findOtherCenters(ticketObject);
        }


    } catch (err) {
        throw new Error(err.message)
    }
}

exports.findOtherCenters = async (ticketObject) => {
    try {
        const { address_details, service_provided_for } = ticketObject;
        let findCriteria = {
            $and: [
                {
                    "address_details.pincode": address_details.pincode
                },
                {
                    $or: [
                        { "services.primary_services": { "$in": [service_provided_for] } },
                        { "services.secondary_services.secondary_services_id": { "$in": [service_provided_for] } }
                    ]
                }
            ]
        }

        let centers = await centerDb.find(findCriteria).limit(1).sort({ _id: -1 }).exec()
        if (!(centers && Array.isArray(centers) && centers.length)) {
            let findCri = {
                _id: ticketObject._id,
            }

            let updateCri = {
                broadcast_status: broadCastStatus.NO_MATCH_FOUND
            }

            await ticketDb.findOneAndUpdate(findCri, updateCri, { new: true })
            return
        }

        let totalAvailableCenters = await centerDb.countDocuments(findCriteria)

        let criteria = {
            primary_services: service_provided_for,
            pincode: address_details.pincode
        }

        let doesCacheDataExists = await broadCastCacheDb.findOne(criteria)

        let insertBroadCastModel = {
            ticket_obj_id: ticketObject._id,
            status_of_ticket: statusOfBroadcastTicket.PENDING
        }

        if (doesCacheDataExists) {
            let skip = doesCacheDataExists.skip
            let total_count = doesCacheDataExists.total_count;

            if (totalAvailableCenters != totalCount) {
                total_count = totalAvailableCenters
            }

            let diff = total_count - skip

            let itemsToSkip = skip;

            if (diff <= broadCastCenterInterval) {
                itemsToSkip = 0;
            }

            await broadCastCacheDb.findOneAndUpdate({ _id: doesCacheDataExists._id }, {
                skip: itemsToSkip + broadCastCenterInterval,
                total_count
            }, { new: true })

            let centers = await centerDb.find(findCriteria).skip(itemsToSkip).limit(broadCastCenterInterval).sort({ _id: -1 }).exec()

            await this.insertBroadCastDataInCenters(centers, ticketObject._id, insertBroadCastModel)
        } else {
            let insertObjCache = {
                total_count: totalAvailableCenters,
                skip: broadCastCenterInterval,
                pincode: address_details.pincode,
                primary_services: service_provided_for
            }

            await new broadCastCacheDb(insertObjCache).save()
            let itemsToSkip = 0;

            let centers = await centerDb.find(findCriteria).skip(itemsToSkip).limit(broadCastCenterInterval).sort({ _id: -1 }).exec()

            await this.insertBroadCastDataInCenters(centers, ticketObject._id, insertBroadCastModel)

        }


    } catch (err) {
        throw new Error(err.message)
    }
}

exports.insertBroadCastDataInCenters = async (centers, ticket_obj_id, insertBroadCastModel) => {
    try {

        let insertObjArr = []
        for (let center of centers) {
            insertObjArr.push({
                ...insertBroadCastModel,
                center_obj_id: center._id
            })
        }

        await broadCastDb.insertMany(insertObjArr)

    } catch (err) {
        throw new Error(err.message)
    }
}

exports.sendRequestToTechnician = async (technicianObject, request_type, center_id, addedBy, technicianId, technician_id_inviting) => {
    try {
        let insertObject = {
            request_on: new Date(),
            request_type: request_type,
            center_id_inviting: center_id,
            added_by: addedBy,
        }

        if ((request_type === "FOR_FREELANCER" || request_type === "FOR_SALARIED")
            && technicianObject) {
            insertObject['technicianDetails'] = technicianObject
        }

        (request_type === "FOR_FREELANCER" && technicianId) ? insertObject['freelancer_techician_id'] = technician_id : ''

        technician_id_inviting ? insertObject['technician_id_inviting'] = technician_id_inviting : ''

        //creating a techniican -> not registered , salaried / freelancer -> both case we need to create
        // a table and add a request both will accept or reject
        // if technician salaried rejects then u need to create a center for him  and make his stats as freelancer

        await new requestTechnicianModel(insertObject).save();

    } catch (err) {
        throw new Error(err.message)
    }
}