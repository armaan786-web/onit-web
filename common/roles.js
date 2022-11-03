const roles = ['Admin', 'Shipper', 'Transporter', 'Fleet_Owner', 'Transport_Agent','Transport_Contractor', 'Truck_Driver'];

const roleRights = new Map();
roleRights.set(roles[0], ['getUsers', 'manageUsers', 'manageCompanies', 'getCompany']);
roleRights.set(roles[1], []);

module.exports = {
  roles,
  roleRights,
};




