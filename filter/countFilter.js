/**
 * ��idͳ������
 * @author homkerliu
 * @type {{}|*|countObj}
 */
var countObj = global.countObj || {};

module.exports = function () {
    return {
        preProcess: function (data) {
            //TODO ���˺��Դ���
        },
        process: function (data) {
            var data = data.data;
            data.forEach(function(val){
                countObj[val.id] = isNaN(parseInt(countObj[val.id])) ? 0 : countObj[val.id]++;
            });
            global.countObj = countObj;
        }
    }
}
