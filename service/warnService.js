/**
 *ͳ��������ڵ����ݱ仯���������֮ǰ�����ݱ仯���ı仯����
 */


var log4js = require('log4js'),
    tof = require('../oa/node-tof'),
    http = require('http');
    logger = log4js.getLogger();

var countList = [],
    countObj = {};


function addList() {
    countObj = global.countObj;
    countList.push(countObj);
}

function clearList() {
    countList = {};
    countObj = {};
    global.countObj = {};
}

function sendWarn(id) {
    getUserList(id,function(result){
        var info = '������ڴ����ϱ���ͬ����������75%';
        var userlist = '';
        if(result){
            result.data.forEach(function(ele,index){
                userlist += ele.loginName +';'
            });
        }
        tof.sms('',userlist,info,function(err,result){
            if(err){
                logger.error('message send is wrong, error is'+err);
                return;
            }
        })
    })
}

function getUserList(id,callback){
    var url = 'http://badjs.sng.local/getUserList?applyId='+id+'&role=1';
    http.get(url,function(res){
        var buffer = '';
        res.on('data',function(chunk){
            buffer += chunk.toString();
        }).on('end',function(){
            callback&&callback(JSON.parse(buffer))
        });
    }).on('error',function(err){
        logger.warn(err);
    });
}

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
            if (rate > 0.75) {
                sendWarn(id);
            }
        }
    }
}


modules.exports = function () {
    return {
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
}