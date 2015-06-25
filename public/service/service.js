angular.module('myApp.services', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/service', {
            templateUrl: 'service/service.html',
            controller: 'ServiceCtrl'
        });
    }])

    .controller('ServiceCtrl', ["$scope", function ($scope) {
        var Application = AV.Object.extend('Application');

        function refineApps(apps) {
            var appsByName = {};

            apps.forEach(function (app) {
                var app_fullname = app.get('app_name'),
                    app_name = app_fullname,
                    is_test = false;
                if (app_fullname.indexOf('test@') === 0) {
                    app_name = app_fullname.slice('test@'.length);
                    is_test = true;
                }
                appsByName[app_name] = appsByName[app_name] || {};
                if (is_test) {
                    appsByName[app_name].test = app.toJSON();
                } else {
                    appsByName[app_name].prod = app.toJSON();
                }
            })
            $scope.appsByName = appsByName;
        }

        $scope.refreshApps = function () {
            new AV.Query(Application).find(
                function (apps) {
                    refineApps(apps);
                    $scope.apps = apps;
                    $scope.$apply();
                }
            )
        }
        $scope.refreshApps();

    }])