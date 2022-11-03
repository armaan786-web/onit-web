const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/../uploads/');
    },
    filename: function (req, file, cb) {
        var fileName = file.originalname.replace(/[|&;$%@"<>()+,' '?]/g, "");
        fileName = fileName.replace('.csv', '_' + Date.now() + '.csv');
        fileName = fileName.replace('.xlsx', '_' + Date.now() + '.xls');
        cb(null, fileName);
    }
});
var uploadFile = multer({ storage: storage })

module.exports = uploadFile
