angular.module('myApp.services', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/service', {
            templateUrl: 'service/service.html',
            controller: 'ServiceCtrl'
        });
    }])

    .controller('ServiceCtrl', ["$scope", function ($scope) {

    }])