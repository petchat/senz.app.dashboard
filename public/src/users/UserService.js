(function () {
    'use strict';

    angular.module('apps')
        .service('appService', ['$q', AppService]);

    /**
     * Users DataService
     * Uses embedded, hard-coded data model; acts asynchronously to simulate
     * remote data service call(s).
     *
     * @returns {{loadAll: Function}}
     * @constructor
     */
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
                name: 'Naming',
                id: 'naming'
            }
        ];

        // Promise-based API
        return {
            loadAllUsers: function () {
                // Simulate async nature of real remote calls
                return $q.when(apps);
            }
        };
    }

})();
