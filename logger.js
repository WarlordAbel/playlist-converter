const moment = require('moment');
const colors = require("colors")

module.exports = function log(msg) {
    console.log(`[${moment().format('hh:mm:ss.SSS')}] :: ${msg}`);
}
