'use strict';

var connect = require('connect')
    , log4js = require('log4js'),
    logger = log4js.getLogger();

var cluster = require("cluster");
var argv = process.argv.slice(2);


if (argv.indexOf('--debug') >= 0) {
    logger.setLevel('DEBUG');
    global.debug = true;
} else {
    logger.setLevel('INFO');
}


if (argv.indexOf('--project') >= 0) {
    GLOBAL.pjconfig = require('./project.debug.json')
} else {
    GLOBAL.pjconfig = require('./project.json');
}


// �ж��Ƿ��������߳���
if (cluster.isMaster) {

    var zmq = require(GLOBAL.pjconfig.dispatcher.module)();
    //�̳߳�
    var clusters = [];
    // Fork workers.
    for (var i = 0; i < 4; i++) {
        var forkCluster = cluster.fork();
        clusters.push(forkCluster);
        forkCluster.on("message", function (data) {
            var json = data;
            if (json.msg) {
                zmq.process({data: json.msg});
            }

        })
    }

    setTimeout(function () {
        require('./service/ProjectService')(clusters);
    }, 1000)


    return;
}

//������ = =��=filter������
var interceptor = require("c-interceptor")();
var interceptors = GLOBAL.pjconfig.interceptors;


interceptors.forEach(function (value, key) {
    var one = require(value)();
    interceptor.add(one);
});


var forbiddenData = "forbidden";

global.projectsId = '';
process.on("message", function (data) {
    var json = data;
    if (json.projectsId) {
        global.projectsId = json.projectsId;
    }

})


connect()
    .use('/badjs', connect.query())
    .use('/badjs', function (req, res) {


        logger.debug('===== get a message =====');

        var id;
        if (isNaN(( id = req.query.id - 0)) || id <= 0 || id >= 9999 || global.projectsId.indexOf(id) < 0) {


            res.writeHead(403, {
                'Content-Type': 'image/jpeg',
                'Content-length': forbiddenData.length,
                "Connection": "close"
            });
            res.statusCode = 403;
            res.write(forbiddenData);
            logger.debug("forbidden :" + req.query.id);
            res.end();
            return;
        }

        req.query.id = id;


        try {
            //ִ�й�����
            interceptor.invoke({req: req, data: req.query});
        } catch (e) {
            res.writeHead(403, {
                'Content-Type': 'image/jpeg',
                'Content-length': forbiddenData.length,
                "Connection": "close"
            });
            res.statusCode = 403;
            res.write(forbiddenData);

            logger.info("parse param  error :" + e);
            res.end();
            return;
        }

        // response end with 204
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'image/jpeg',
            "Content-length": 0
        });
        res.statusCode = 204;

        logger.debug("===== complete a message =====");
        res.end();
    })
    .listen(GLOBAL.pjconfig.port);
//.listen({port: GLOBAL.pjconfig.port , backlog :1024000});

logger.info('start badjs-accepter , listen ' + GLOBAL.pjconfig.port + ' ...');





