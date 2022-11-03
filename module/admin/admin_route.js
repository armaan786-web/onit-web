const express = require('express');
const router = express.Router();

const adminController = require('./admin_controller');
const adminValidator = require('./admin_validator');
const validate = require('../../middleware/validate');

const verifyJwt = require("../../middleware/jwt");
const adminVerifyJwt = require("../../middleware/adminJwt")
const checkIfHasPermission = require('../../middleware/checkIfHasPermission')
const uploadFile = require('../../middleware/fileupload')
const storageUrl = require("../../middleware/fileupload");

router.post('/create-admin', validate(adminValidator.createAdmin), adminController.createAdmin);

router.post('/create-user', validate(adminValidator.createUsers), adminVerifyJwt.verifyJwtToken, adminController.createUsers)

router.post('/remove-user', validate(adminValidator.removeUsers), adminVerifyJwt.verifyJwtToken, adminController.removeUsers)

router.get('/get-all-users', validate(adminValidator.getAllUsers), adminVerifyJwt.verifyJwtToken, adminController.getAllUsers)

router.post('/login', validate(adminValidator.login), adminController.login);

router.post('/create-center', validate(adminValidator.adminCreateCenter), adminVerifyJwt.verifyJwtToken, adminController.adminCreateCenter);

router.post('/create-technician', validate(adminValidator.adminCreateTechnician), adminVerifyJwt.verifyJwtToken, adminController.adminCreateTechnician)

router.post('/create-ticket', validate(adminValidator.adminCreateTicket), adminVerifyJwt.verifyJwtToken, adminController.adminCreateTicket);

// router.get('/get-all-centers', validate(adminValidator.adminGetAllCenter), adminVerifyJwt.verifyJwtToken, adminController.adminGetAllCenter)
router.get('/get-all-centers', validate(adminValidator.adminGetAllCenter), adminController.adminGetAllCenter)

router.get('/get-all-broadCasted-ticket', validate(adminValidator.adminGetAllBroadCastedTicket), adminVerifyJwt.verifyJwtToken, adminController.adminGetAllBroadCastedTicket)

// router.get('/get-all-technician', validate(adminValidator.adminGetAllTechnician), adminVerifyJwt.verifyJwtToken, adminController.adminGetAllTechnician)
router.get('/get-all-technician', validate(adminValidator.adminGetAllTechnician), adminController.adminGetAllTechnician)

router.get('/get-all-feedBacks', adminVerifyJwt.verifyJwtToken, adminController.adminGetAllFeedBacks)

// router.get('/get-all-ticket', validate(adminValidator.adminGetAllTickets), adminVerifyJwt.verifyJwtToken, adminController.adminGetAllTickets);
router.get('/get-all-ticket', validate(adminValidator.adminGetAllTickets), adminController.adminGetAllTickets);

router.get('/get-single-ticket', validate(adminValidator.adminGetSingleTickets), adminVerifyJwt.verifyJwtToken, adminController.adminGetSingleTickets)

router.post('/update-center', validate(adminValidator.adminUpdateCenter), adminVerifyJwt.verifyJwtToken, adminController.adminUpdateCenter);

router.post('/admin-broadcast', validate(adminValidator.adminBroadCast), adminVerifyJwt.verifyJwtToken, adminController.adminBroadCast);

router.post('/update-technician', validate(adminValidator.adminUpdateTechnician), adminVerifyJwt.verifyJwtToken, adminController.adminUpdateTechnician);

router.post('/update-ticket', validate(adminValidator.adminUpdateTicket), adminVerifyJwt.verifyJwtToken, adminController.adminUpdateTicket);

router.post('/create-services', validate(adminValidator.adminCreateServices), adminVerifyJwt.verifyJwtToken, adminController.createServices);

//todo used for public also create this later in common
router.get('/get-all-services', validate(adminValidator.adminGetServices), adminController.adminGetServices)

router.get('/get-all-active-services', validate(adminValidator.adminGetActiveServices), adminController.adminGetActiveServices)

router.post('/update-service', validate(adminValidator.adminUpdateService), adminVerifyJwt.verifyJwtToken, adminController.adminUpdateService);

router.post('/update-service-status', validate(adminValidator.adminUpdateServiceStatus), adminVerifyJwt.verifyJwtToken, adminController.adminUpdateServiceStatus);

router.post('/delete-service', validate(adminValidator.adminDeleteService), adminVerifyJwt.verifyJwtToken, adminController.adminDeleteService);

router.post('/add-client', validate(adminValidator.adminAddClient), adminVerifyJwt.verifyJwtToken, adminController.adminAddClient);

router.get('/get-all-clients', validate(adminValidator.adminGetClients), adminController.adminGetClients);

router.post('/delete-client', validate(adminValidator.adminDeleteClient), adminVerifyJwt.verifyJwtToken, adminController.adminDeleteClient);

router.post('/add-role', adminVerifyJwt.verifyJwtToken, (req, res, next) => {
    // checkIfHasPermission(req, res, next, "add_role")
    next()
}, adminController.addMinAddRole)

router.get('/get-all-available-roles', adminVerifyJwt.verifyJwtToken, (req, res, next) => {
    // checkIfHasPermission(req, res, next, "view_role", true)
    next()
}, adminController.getAllAvailableRoles)

router.post('/update-role', adminVerifyJwt.verifyJwtToken, (req, res, next) => {
    // checkIfHasPermission(req, res, next, "edit_role_permissions", true)
    next()
}, adminController.adminUpdateRole)



//center on boarder

router.get('/get-all-onboarder', adminVerifyJwt.verifyJwtToken, validate(adminValidator.getAllCenterOnBoarder), adminController.getAllCenterOnBoarder)

router.post('/create-centerOnBoarder', adminVerifyJwt.verifyJwtToken, validate(adminValidator.createCenterOnBoarder), adminController.createCenterOnBoarder)

router.post('/update-centerOnBoarder', adminVerifyJwt.verifyJwtToken, validate(adminValidator.updateCenterOnBoarder), adminController.updateCenterOnBoarder)

//export file to excel

router.post('/upload-csv-for-ticket', uploadFile.any(), storageUrl.single("ticketsCsvFile"), adminVerifyJwt.verifyJwtToken, adminController.uploadCsvTicket);


module.exports = router;