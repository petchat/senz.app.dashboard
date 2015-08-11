(function () {
    'use strict';

    // Prepare the 'apps' module for subsequent registration of controllers and delegates
    angular.module('apps', ['ngMaterial'])
        .controller('UserController', [
            'appService', '$mdSidenav', '$mdBottomSheet', '$log', '$q', '$location',
            UserController
        ])
        .service('appService', ['$q', AppService]);

    /**
     * Main Controller for the Angular Material Starter App
     * @param $scope
     * @param $mdSidenav
     * @param avatarsService
     * @constructor
     */
    function UserController(appService, $mdSidenav, $mdBottomSheet, $log, $q, $location) {
        var self = this;

        self.selected = null;
        self.apps = [];
        self.selectApp = selectApp;
        self.toggleList = toggleAppsList;

        // Load all registered apps

        appService
            .loadAllApps()
            .then(function (apps) {
                self.apps = [].concat(apps);
                selectApp(apps[0]);
            });

        // *********************************
        // Internal methods
        // *********************************

        /**
         * First hide the bottomsheet IF visible, then
         * hide or Show the 'left' sideNav area
         */
        function toggleAppsList(action) {
            var pending = $mdBottomSheet.hide() || $q.when(true);

            pending.then(function () {
                if ('open' === action) {
                    $mdSidenav('left').open();
                } else if ('close' === action) {
                    $mdSidenav('left').close();
                } else {
                    $mdSidenav('left').toggle();
                }
            });
        }

        /**
         * Select the current avatars
         * @param menuId
         */
        function selectApp(user) {
            self.selected = angular.isNumber(user) ? $scope.apps[user] : user;
            self.toggleList('close');
            $location.path('/' + user.id)
        }
    }


    function AppService($q) {
        var apps = [
            {
                name: 'Service',
                id: 'service'
            },
            {
                name: 'API',
                id: 'api'
            },
            {
                name: 'Monitor',
                id: 'monitor'
            },
            {
                name: 'Trace',
                id: 'trace'
            },
            {
                name: 'Naming',
                id: 'naming'
            },
            {
                name: 'Timeline',
                id: 'timeline'
            },
            {
                name: 'Parser',
                id: 'parser'
            }
        ];

        // Promise-based API
        return {
            loadAllApps: function () {
                // Simulate async nature of real remote calls
                return $q.when(apps);
            }
        };
    }
})();
