/**
 * 分id统计数量
 * @type {{}|*|countObj}
 */
var countObj = global.countObj || {};

modules.exports = function () {
    return {
        preProcess: function(data){
            //TODO 过滤忽略错误
        },
        process: function (data) {
            countObj[data.id] = parseInt(countObj[data.id]) ? 0 : countObj[data.id]++;
            global.countObj = countObj;
        }
    }
}