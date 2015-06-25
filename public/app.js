'use strict';

// Declare app level module which depends on views, and components
angular.module('starterApp', [
    'ngRoute',
    'myApp.view1',
    'myApp.services',
    'ngMaterial',
    'apps'
]).
    config(['$routeProvider', '$mdThemingProvider', '$mdIconProvider',
        function ($routeProvider, $mdThemingProvider, $mdIconProvider) {
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
        $scope.test = "lalala";
        //$scope.toggleList = function () {
        //    var pending = $mdBottomSheet.hide() || $q.when(true);
        //
        //    pending.then(function () {
        //        $mdSidenav('left').toggle();
        //    });
        //}
    })
