/**
 * ��idͳ������
 * @type {{}|*|countObj}
 */
var countObj = global.countObj || {};

modules.exports = function () {
    return {
        preProcess: function(data){
            //TODO ���˺��Դ���
        },
        process: function (data) {
            countObj[data.id] = parseInt(countObj[data.id]) ? 0 : countObj[data.id]++;
            global.countObj = countObj;
        }
    }
}