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
