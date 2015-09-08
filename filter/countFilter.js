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
            var data = data.data;
            data.forEach(function(val){
                if(!isNaN(parseInt(countObj[val.id]))){
			countObj[val.id] += 1;
		}else{
			countObj[val.id] = 0;
		}
            });
            global.countObj = countObj;
        }
    }
}
