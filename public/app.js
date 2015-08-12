'use strict';

// Declare app level module which depends on views, and components
angular.module('starterApp', [
    'ngRoute',
    'ngSanitize',
    'myApp.timeline',
    'myApp.monitor',
    'myApp.trace',
    'ngMaterial',
    'myApp.maptool',
    'myApp.services',
    'apps'
]).
    config(['$routeProvider', '$mdThemingProvider', '$mdIconProvider',
        function ($routeProvider, $mdThemingProvider, $mdIconProvider) {
            AV.initialize("knqxgvqzvz5qxlzy4xyu1s45kskq1x0allm6en72pi01ulw4", "yljkxioux02ibrms7hctug9x0ym8jhwtnym00hea2rr8a5lw");

            $routeProvider.otherwise({redirectTo: '/apps'});

            $mdIconProvider
                .defaultIconSet("./assets/svg/avatars.svg", 128)
                .icon("menu", "./assets/svg/menu.svg", 24)
                .icon("share", "./assets/svg/share.svg", 24)
                .icon("google_plus", "./assets/svg/google_plus.svg", 512)
                .icon("hangouts", "./assets/svg/hangouts.svg", 512)
                .icon("twitter", "./assets/svg/twitter.svg", 512)
                .icon("phone", "./assets/svg/phone.svg", 512);

            $mdThemingProvider.theme('default')
                .primaryPalette('brown')
                .accentPalette('red');

        }])
    .controller('AppCtrl', function ($scope) {
    })
