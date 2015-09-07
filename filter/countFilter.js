/**
 * 分id统计数量
 * @author homkerliu
 * @type {{}|*|countObj}
 */
var countObj = global.countObj || {};

module.exports = function () {
    return {
        preProcess: function (data) {
            //TODO 过滤忽略错误
        },
        process: function (data) {
            console.log(data);
            countObj[data.id] = isNaN(parseInt(countObj[data.id])) ? 0 : countObj[data.id]++;
            global.countObj = countObj;
        }
    }
}
