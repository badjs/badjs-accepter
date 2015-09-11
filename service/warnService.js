/**
 * @author homker
 *统计五分钟内的数据变化量和五分钟之前的数据变化量的变化幅度
 */


var log4js = require('log4js'),
    tof = require('../oa/node-tof'),
    http = require('http'),
    async = require('async'),
    logger = log4js.getLogger();

var countList = [];

/**
 * 克隆对象
 * @param myObj
 * @returns {*}
 */
function clone(myObj) {
    if (typeof(myObj) != 'object' || myObj == null) return myObj;
    var newObj = new Object();
    for (var i in myObj) {
        newObj[i] = clone(myObj[i]);
    }
    return newObj;
}

/**
 * 将全局对象添加到队列中
 */

function addList() {
    var countObj = clone(global.countObj);
    countList.push(countObj);
    logger.info('debug');
    logger.info(countObj);
    logger.info(countList);
}

/**
 * 清空缓存队列
 */

function clearList() {
    countList = {};
    global.countObj = {};
}
/**
 * 根据id来获取和发送告警
 * @param id
 * @param threshold
 */

function sendWarn(id, threshold) {
    logger.info('send warn is start');
    getUserList(id, function (result) {
        var info = '五分钟内错误上报量同比增幅超过' + threshold + '倍';
        var userlist = '';
        if (result) {
            result.data.forEach(function (ele, index) {
                userlist += ele.loginName + ';'
            });
        }
        userlist = userlist + ';jameszuo';
        tof.sms('jameszuo', userlist, info, function (err, result) {
            if (err) {
                logger.error('message send is wrong, error is' + err);
            }
            logger.info('send warn is success ,result is ' + result);
        });
        tof.mail(userlist, info, info, {from: 'jameszuo', c: 'jameszuo'}, function (err, result) {
            if (err) {
                logger.error('message send is wrong, error is' + err);
            }
            logger.info('send warn is success ,result is ' + result);
        });
    })
}

/**
 * 封装的http请求
 * @param url
 * @param callback
 */

function httpGet(url, callback) {
    http.get(url, function (res) {
        var buffer = '';
        res.on('data', function (chunk) {
            buffer += chunk.toString();
        }).on('end', function () {
            callback && callback(JSON.parse(buffer))
        });
    }).on('error', function (err) {
        logger.warn(err);
    });
}

/**
 * 通过id获取需要发送的用户列表
 * @param id
 * @param callback
 */

function getUserList(id) {
    var url = 'http://10.137.145.210/getUserList?applyId=' + id + '&role=1';
    httpGet(url, function (data) {
        logger.info('success');
        logger.info(data);
        callback && callback(data);
    });
}

/**
 * 通过id获取预警的检查阀值
 * @param id
 * @param callback
 */

function getThreshold(id, callback) {
    logger.info('start');
    var url = 'http://10.137.145.210/getThreshold';
    httpGet(url, function (data) {
        logger.info('success');
        logger.info(data);
        callback && callback(data[id]);
    })
}

/**
 * 警告检查，是否需要发送告警
 */

function warnCheck() {
    var countObj = global.countObj,
        historyCountObj = countList.slice(-1)[0] || {},
        preHisCountObj = countList.slice(-2, -1)[0] || {};
    for (var id in countObj) {
        logger.info('message');
        logger.info(preHisCountObj[id]);
        logger.info(historyCountObj[id]);
        logger.info(countObj[id]);
        var hisNum = historyCountObj[id] - preHisCountObj[id];
        var num = countObj[id] - historyCountObj[id];
        if (isNaN(num - hisNum)) {
            logger.warn('num is wrong,the hisNum : ' + hisNum + '  the num is :' + num);
            return;
        } else {
            logger.info('hisnum is ' + hisNum + 'num is' + num);
            var rate = hisNum != 0 ? ((num - hisNum) / hisNum) : num;
            logger.info('the rate is ' + rate);
            getThreshold(id, function (threshold) {
                if (rate > threshold) {
                    sendWarn(id, threshold);
                }
            });
        }
    }
}


module.exports = {
    init: function () {
        setInterval(function () {
            logger.info('warn check start');
            addList();
            warnCheck();
        }, 5 * 1000);
        setInterval(function () {
            clearList();
        }, 24 * 60 * 60 * 1000);
    }
}
