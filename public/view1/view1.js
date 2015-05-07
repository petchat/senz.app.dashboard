'use strict';

angular.module('myApp.view1', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/utils', {
            templateUrl: 'view1/view1.html',
            controller: 'View1Ctrl'
        });
    }])

    .controller('View1Ctrl', ["$scope", function ($scope) {
        $scope.projectName = function () {
            if ('datasource' === $scope.myRole.name) {
                return;
            } else if ('datasource' === $scope.myRole.name) {

            } else {

            }
        };


        var parserTypes = [
            {name: 'page'}
        ];
        var platforms = [
            {name: 'android'},
            {name: 'ios'},
            {name: 'python'},
            {name: 'web'},
            {name: 'nodejs'}
        ];
        var projects = [
            {name: 'senz'},
            {name: 'petchat'}
        ];
        var roles = [
            {
                name: 'datasource',
                fullname: function () {
                    return $scope.myProject.name + '.'
                        + $scope.myRole.name + '.'
                        + $scope.serviceName
                        + (($scope.subname) ? '.' + $scope.subname : '')
                },
                examples: ['senz.datasource.log']
            },
            {
                name: 'analyzer',
                fullname: function () {
                    return $scope.myProject.name + '.'
                        + $scope.myRole.name + '.'
                        + $scope.analyzTarget;
                },
                examples: [
                    'senz.analyzer.motion',
                    'senz.analyzer.sound',
                    'senz.analyzer.timeline'
                ]
            },
            {
                name: 'middleware',
                fullname: function () {
                    return $scope.myProject.name + '.'
                        + $scope.myRole.name + '.'
                        + $scope.convertFrom + '.'
                        + $scope.convertTo;
                },
                examples: ['senz.middleware.log.rawsenz']
            },
            {
                name: 'app',
                fullname: function () {
                    return $scope.myProject.name + '.'
                        + $scope.myRole.name + '.'
                        + $scope.appName + '.'
                        + $scope.selectedPlatform.name;
                },
                examples: [
                    'senz.app.darktrip.android',
                    'senz.app.timeline'
                ]
            },
            {
                name: 'sdk',
                fullname: function () {
                    return $scope.myProject.name + '.'
                        + $scope.myRole.name + '.'
                        + $scope.sdkName + '.'
                        + $scope.selectedPlatform.name;
                },
                examples: ['senz.sdk.rabbitmq.python']
            },
            {
                name: 'parser',
                fullname: function () {
                    return $scope.myProject.name + '.'
                        + $scope.myRole.name + '.'
                        + $scope.parserType.name + '.'
                        + $scope.parserTarget;
                },
                examples: [
                    'senz.parser.appstore',
                    'senz.parser.qunar'
                ]
            }
        ];

        $scope.projects = projects;
        $scope.platforms = platforms;
        $scope.parserTypes = parserTypes;
        $scope.parserType = parserTypes[0];
        $scope.selectedPlatform = $scope.platforms[0];
        $scope.myProject = $scope.projects[0];

        $scope.roles = roles;
        $scope.myRole = $scope.roles[0];
    }]);