angular.module('myApp.monitor', ['ngRoute','ngSanitize'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/monitor', {
            templateUrl: 'app/monitor/partial.html',
            controller: 'MonitorCtrl'
        });
    }])

    .controller('MonitorCtrl', ["$scope", "$sce", function ($scope, $sce) {
        $scope.openInNewTab = function(site){
            //loadingPage('tyk', $scope, $sce);
            window.open(site);
        };

    }]);

function loadingPage(site, scope, sce){
    scope.msg = 'loading, please wait ...';
    AV.Cloud.run('login_'+site)
        .then(function (data) {
            //alert(data);
            scope.msg = sce.trustAsHtml(data);
            scope.$apply();
        });

    //window.location.href = 'http://www.baidu.com';
}