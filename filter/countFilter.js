/**
 * ��idͳ������
 * @author homkerliu
 * @type {{}|*|countObj}
 */
var co.ntObj = global.countObj || {};
modules.exports = function () {
    return {
        preProcess: function(data){
            //TODO ���˺��Դ���
        },
        process: function (data) {
	    console.log(data);
            countObj[data.id] = isNaN(parseInt(countObj[data.id])) ? 0 : countObj[data.id]++;
            global.countObj = countObj;
        }
    }
}
