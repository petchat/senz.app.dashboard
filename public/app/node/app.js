(function () {
    'use strict';

    // Prepare the 'apps' module for subsequent registration of controllers and delegates
    angular.module('myApp.services', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/service', {
                templateUrl: './app/node/partial.html',
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

            $scope.refetch = function () {
                new AV.Query(Application).find().then(
                    function (apps) {
                        refineApps(apps);
                        $scope.apps = apps;
                        $scope.$apply();
                    }),
                    function (err) {
                        console.error(err);
                    }
            }

            $scope.reloadApps = function () {
                $scope.appsByName = {};
                AV.Cloud.run('refresh_all_apps')
                    .then(function () {
                        return new AV.Query(Application).find();
                    })
                    .then(function (apps) {
                        refineApps(apps);
                        $scope.apps = apps;
                        $scope.$apply();
                    })
            }

            $scope.refetch();
        }])


})();
