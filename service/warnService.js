/**
 * @author homker
 *ͳ��������ڵ����ݱ仯���������֮ǰ�����ݱ仯���ı仯����
 */


var log4js = require('log4js'),
    tof = require('../oa/node-tof'),
    http = require('http'),
    async = require('async'),
    logger = log4js.getLogger();

var countList = [],
    countObj = {};
/**
 * ��ȫ�ֶ�����ӵ�������
 */

function addList() {
    countObj = global.countObj;
    countList.push(countObj);
}

/**
 * ��ջ������
 */

function clearList() {
    countList = {};
    countObj = {};
    global.countObj = {};
}
/**
 * ����id����ȡ�ͷ��͸澯
 * @param id
 * @param threshold
 */

function sendWarn(id, threshold) {
    getUserList(id, function (result) {
        var info = '������ڴ����ϱ���ͬ����������' + threshold + '��';
        var userlist = '';
        if (result) {
            result.data.forEach(function (ele, index) {
                userlist += ele.loginName + ';'
            });
        }
        //tof.sms('', userlist, info, function (err, result) {
        //    if (err) {
        //        logger.error('message send is wrong, error is' + err);
        //        return;
        //    }
        //    logger.info('send warn is success ,result is ' + result);
        //})
    })
}

/**
 * ��װ��http����
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
 * ͨ��id��ȡ��Ҫ���͵��û��б�
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
 * ͨ��id��ȡԤ���ļ�鷧ֵ
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
 * �����飬�Ƿ���Ҫ���͸澯
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


modules.exports = {
    init: function () {
        setInterval(function () {
            addList();
            warnCheck();
        }, 5 * 60 * 1000);
        setInterval(function () {
            clearList();
        }, 24 * 60 * 60 * 1000);
    }
}