const MYSQLHOST = '31.97.42.126';
const MYSQLUSER = 'linkear';
const MYSQLPASSWORD = '0987021692@Rj';
const MYSQLDATABASE = 'openblind';
const MYSQLPORT = '3306';
const MYSQL_URI = process.env.MYSQL_URI || '';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://linkear:0987021692%40Rj@31.97.42.126:27017/openblind?authSource=openblind';
// Exportar las variables de configuración
module.exports = {
    MYSQLHOST,
    MYSQLUSER,
    MYSQLPASSWORD,
    MYSQLDATABASE,
    MYSQLPORT,
    MYSQL_URI,
    MONGODB_URI
};