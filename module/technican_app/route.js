const express = require('express');
const router = express.Router();
const validate = require('../../middleware/validate');

const verifyJwt = require("../../middleware/technicianJwt");
const technicianController = require('./controller');
const technicianValidator = require('./validation');
const commonController = require('../common/common.controller');

const storeOnsitePictures = require("../../middleware/storeOnsitePictures");

router.post('/upload-ticket-onsite-picture/:ticket_obj_id', storeOnsitePictures.single("OnsitePicture"), commonController.uploadFile);

router.post('/update_technician', verifyJwt.verifyJwtToken, technicianController.updateTechnician)

router.get('/get-pending-tickets', verifyJwt.verifyJwtToken, technicianController.getPendingTickets)

router.get('/current-tickets', verifyJwt.verifyJwtToken, technicianController.getALlTickets)

router.get('/get-all-clients', verifyJwt.verifyJwtToken, technicianController.getALlClients)

router.post('/accepted-broadcast-request-unpaid-ticket', validate(technicianValidator.acceptBroadcastUnPaidTicket), verifyJwt.verifyJwtToken, technicianController.acceptBroadCastUnPaidTicket)

router.post('/accepted-broadcast-request', validate(technicianValidator.acceptBroadCastRequest), verifyJwt.verifyJwtToken, technicianController.acceptBroadCastRequest)

router.post('/pay-onboarding-kit', verifyJwt.verifyJwtToken , technicianController.payOnBoardingKit)

router.post('/after-payment-pay-onboarding-kit', validate(technicianValidator.afterPayingOnBoarding),verifyJwt.verifyJwtToken , technicianController.afterPayingOnBoarding)

router.post('/accept-ticket-after-payment', validate(technicianValidator.acceptTicketAfterPayment), verifyJwt.verifyJwtToken, technicianController.acceptTicketAfterPayment)

router.get('/get-opportunity-in-your-area', technicianController.getAllOppuritiesInYourArea)

router.get('/get-booking-details', validate(technicianValidator.getBookingDetails), verifyJwt.verifyJwtToken, technicianController.getBookingDetails)

router.post('/update-ticket-details', validate(technicianValidator.updateTicketDetails), verifyJwt.verifyJwtToken, technicianController.updateTicketDetails)

router.get('/get-all-technician-center', verifyJwt.verifyJwtToken, validate(technicianValidator.getAllTechniciansCenter), technicianController.getAllTechnicianCenter)

router.post('/assign-technician', verifyJwt.verifyJwtToken, validate(technicianValidator.assignTechnician), technicianController.assignTechnician)

router.get('/get-user-details', verifyJwt.verifyJwtToken, technicianController.getUserDetails)

router.post('/create-new-ticket', verifyJwt.verifyJwtToken, validate(technicianValidator.createNewTicket), technicianController.createNewTicket)

router.post('/create-new-technician', verifyJwt.verifyJwtToken, validate(technicianValidator.createNewTechnician), technicianController.createNewTechnician)

router.get('/get-all-technician-requests', verifyJwt.verifyJwtToken, technicianController.getAllTechnicianRequests)

router.post('/accept-requeset-for-freelancer', verifyJwt.verifyJwtToken, validate(technicianValidator.acceptRequestTechnicianForFreelancer), technicianController.acceptRequestTechnicianForFreelancer)

router.post('/accept-request-for-salaried', validate(technicianValidator.acceptRequestTechnicianForSalaried), technicianController.acceptRequestTechnicianForSalaried)

router.post('/check-request-link', validate(technicianValidator.checkRequestLink), technicianController.checkRequestLink)

router.get('/get-all-technician-ticket-count', verifyJwt.verifyJwtToken, validate(technicianValidator.getAllTechnicianTicketCount), technicianController.getAllTechnicianTicketCount)

router.post('/reject-request-for-freelancer', verifyJwt.verifyJwtToken, technicianController.rejectRequestForFreelancer)

router.post('/reject-request-for-salaried', verifyJwt.verifyJwtToken, technicianController.rejectRequestForSalaried)

router.get('/list-order-details', validate(technicianValidator.getOrderDetails), verifyJwt.verifyJwtToken, technicianController.getAllOrderDetails)

router.get('/get-all-tickets-created-not-assigned', validate(technicianValidator.getAllTicketsCreatedNotAssigned), verifyJwt.verifyJwtToken, technicianController.getAllTicketsCreatedNotAssigned)

module.exports = router;