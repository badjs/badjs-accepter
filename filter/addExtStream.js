var map = require('map-stream');

/**
 * 添加服务器参数
 * @param {Request} req
 * @returns {Stream}
 */
module.exports = function (nextStream) {

    function getClientIp(req) {
        return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    };

    var stream = map(function (data, fn) {
        data.data.ip = getClientIp(data.req);
        data.data.userAgent = data.req.headers['user-agent'];
        fn(null, data);
    });
    return stream;
};