/**
 * @author homker
 *统计五分钟内的数据变化量和五分钟之前的数据变化量的变化幅度
 */


var log4js = require('log4js'),
    tof = require('../oa/node-tof'),
    http = require('http'),
    async = require('async'),
    logger = log4js.getLogger();

var countList = [],
    countObj = {};
/**
 * 将全局对象添加到队列中
 */

function addList() {
    countObj = global.countObj;
    countList.push(countObj);
}

/**
 * 清空缓存队列
 */

function clearList() {
    countList = {};
    countObj = {};
    global.countObj = {};
}
/**
 * 根据id来获取和发送告警
 * @param id
 * @param threshold
 */

function sendWarn(id, threshold) {
    getUserList(id, function (result) {
        var info = '五分钟内错误上报量同比增幅超过' + threshold + '倍';
        var userlist = '';
        if (result) {
            result.data.forEach(function (ele, index) {
                userlist += ele.loginName + ';'
            });
        }
        tof.sms('', userlist, info, function (err, result) {
            if (err) {
                logger.error('message send is wrong, error is' + err);
                return;
            }
            logger.info('send warn is success ,result is ' + result);
        })
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

function getUserList(id, callback) {
    var url = 'http://badjs.sng.local/getUserList?applyId=' + id + '&role=1';
    httpGet(url, function (data) {
        callback && callback(data);
    });
}

/**
 * 通过id获取预警的检查阀值
 * @param id
 * @param callback
 */

function getThreshold(id, callback) {
    var url = 'http://badjs.sng.local/getThreshold';
    httpGet(url, function (data) {
        callback && callback(data[id]);
    })
}

/**
 * 警告检查，是否需要发送告警
 */

function warnCheck() {
    var historyCountObj = countList.slice(-2) || {};
    var preHisCountObj = countList.slice(-3) || {};
    for (var id in historyCountObj) {
        var hisNum = preHisCountObj[id] - historyCountObj[id];
        var num = countObj[id] - historyCountObj[id];
        if (isNaN(num - hisNum)) {
            logger.warn('num is wrong,the hisNum : ' + hisNum + '  the num is :' + num);
            return;
        } else {
            var rate = hisNum != 0 ? (num - hisNum) / hisNum : num;
            getThreshold(id, function (threshold) {
                if (rate > threshold) {
                    sendWarn(id, threshold);
                }
            });
        }
    }
}


addList();
console.log(countList);
console.log(global.countObj);
clearList();
console.log(countList);

tof.mail('homkerliu',info,info,null,function(err,result){
    if (err) {
        logger.error('message send is wrong, error is' + err);
    }
    logger.info('send warn is success ,result is ' + result);
})
//console.log(tof);
/*tof.sms('jameszuo', 'homkerliu;jameszuo', 'test for jamesz', function (err, result) {
    if (err) {
        logger.error('message send is wrong, error is' + err);
        return;
    }
    logger.info('send warn is success ,result is ' + result);
})*/
