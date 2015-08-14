angular.module('myApp.timeline', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/timeline', {
            templateUrl: 'app/timeline/partial.html',
            controller: 'TimelineCtrl'
        });
    }])

    .controller('TimelineCtrl', ["$scope", function ($scope) {
    }]);