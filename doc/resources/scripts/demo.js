moment.locale('zh-cn');

angular.module('demo', ['anneBonny'])
.controller('demoCtrl', function($scope) {
    $scope.data = {
        und1: undefined,
        und2: '2013-12-11',
        text1: undefined,
        text2: '2013-12-11',
        date1: undefined,
        date2: new Date(2013, 11, 11),
        datetime1: undefined,
        datetime2: new Date(2013, 11, 11, 11, 11),
        datetimeLocal1: undefined,
        datetimeLocal2: new Date(2013, 11, 11, 11, 11),
        month1: undefined,
        month2: new Date(2013, 11),
        week1: undefined,
        week2: new Date(2013, 11, 11, 11, 11),
        time1: undefined,
        time2: new Date(2013, 11, 11, 11, 11)
    };
});
