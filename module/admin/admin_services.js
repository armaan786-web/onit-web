
const bcrypt = require("bcrypt");
const saltRounds = require('../../common/common').saltRoundForPasswordHash;
const adminDb = require('../../model/admin.model')
const servicesDb = require('../../model/primaryServices.model')
const broadCastDb = require('../../model/broadcast.model')
const ticketDb = require('../../model/ticket.model')
const centerDb = require('../../model/center.model')
const { ticketStatus, broadCastStatus, broadCastCenterInterval, statusOfBroadcastTicket, rolesBasedOnNumberOfTechnician } = require('../../common/const');

exports.checkIfAdminAlreadyExists = async (user_name) => {
    try {

        let findCriteria = {
            "user_name": user_name
        }

        let adminExist = await adminDb.find(findCriteria).limit(1).exec()
        if (adminExist && Array.isArray(adminExist) && adminExist.length) {
            throw new Error("Admin already exists with this user name")
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

exports.broadCastIfApplicableForAuthorized = async (center_obj_id, ticketObject) => {
    try {
        const { address_details, service_provided_for } = ticketObject;

        let authorized_client_id = ticketObject?.authorized_client_id

        if (center_obj_id) {
            let findCriteria = {
                _id: center_obj_id,
                clients_ids_list: {
                    $in: [authorized_client_id]
                }
            }
            let centerFound = await centerDb.find(findCriteria).limit(1).exec()
            if (centerFound && Array.isArray(centerFound) && centerFound.length) {
                let centerObject = centerFound[0];
                let centerPinCode = centerObject?.address_details?.pincode
                let centerPrimaryService = centerObject?.services?.primary_services;
                let centerSecondaryServices = centerObject?.services?.secondary_services;

                let isPinCodeMatched = centerPinCode == address_details.pincode;

                let isServiceMatched = await this.matchPrimaryOrSecondaryService(service_provided_for, centerPrimaryService, centerSecondaryServices);

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

        }
        let findCriteria = {
            $and: [
                {
                    "address_details.pincode": address_details.pincode
                },
                {
                    $or: [
                        { "services.primary_services": { "$in": [service_provided_for] } },
                        { "services.secondary_services.secondary_services_id": { "$in": [service_provided_for] } },
                    ]
                },
                {
                    "clients_ids_list": {
                        "$in": [authorized_client_id]
                    }
                }
            ]
        }

        let centers = await centerDb.find(findCriteria).sort({ _id: -1 }).exec()

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

        let insertObjArr = []
        for (let center of centers) {
            insertObjArr.push({
                ...insertBroadCastModel,
                center_obj_id: center._id,

            })
        }

        let insertedObject = await broadCastDb.insertMany(insertObjArr)

        console.log(insertedObject, "insertedObject", insertObjArr, "insertObjArr")




    } catch (err) {
        throw new Error("Fail in broadcasting " + err.message)
    }
}

exports.broadCastAllTicketsV1 = async (center_obj_id, ticketObject) => {
    try {
        const { address_details, service_provided_for } = ticketObject;

        if (ticketObject?.authorized_client_id) {
            await this.broadCastIfApplicableForAuthorized(center_obj_id, ticketObject)
            return
        }

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

        console.log(insertedObject, "insertedObject", insertObjArr, "insertObjArr")



    } catch (err) {
        throw new Error("Fail in broadcasting " + err.message)

    }
}

module.exports.returnHashPassword = async (password) => {
    try {
        password = password.toString()
        return await bcrypt.hash(password, saltRounds)

    } catch (e) {
        throw new Error(e.message)
    }
}

module.exports.comparePassword = async (passwordEntered, existingPassword) => {
    try {
        passwordEntered = passwordEntered.toString()
        return await bcrypt.compare(passwordEntered, existingPassword)
    } catch (e) {
        throw new Error(e.message)
    }
}

exports.checkIfServiceAlreadyExists = async (service_name) => {
    try {

        let findCriteria = {
            "service_name": service_name
        }

        let serviceExist = await servicesDb.find(findCriteria).limit(1).exec()
        if (serviceExist && Array.isArray(serviceExist) && serviceExist.length) {
            throw new Error("Service already exists")
        }

    } catch (err) {
        throw new Error(err.message)
    }

}

exports.reBroadcastTicket = async (ticketObjectBeforeUpdate, ticketObjectAfterUpdate) => {
    try {
        if (ticketObjectAfterUpdate.ticket_status == ticketStatus.ACCEPTED) {
            return;
        }

        if (ticketObjectAfterUpdate.broadcast_status == broadCastStatus.ACCEPTED_AFTER_BROADCAST) {
            return;
        }

        if ((ticketObjectBeforeUpdate.address_details.pincode !== ticketObjectAfterUpdate.address_details.pincode)
            || (ticketObjectBeforeUpdate.service_provided_for !== ticketObjectAfterUpdate.service_provided_for)) {

            let findCri = {
                ticket_obj_id: ticketObjectAfterUpdate._id,
            }

            let broadcastObject = await broadCastDb.deleteMany(findCri)
            await this.broadCastAllTicketsV1("", ticketObjectAfterUpdate)
            return

        }
        return;
    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}