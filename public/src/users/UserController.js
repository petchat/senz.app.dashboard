(function () {

    angular
        .module('apps')
        .controller('UserController', [
            'appService', '$mdSidenav', '$mdBottomSheet', '$log', '$q', '$location',
            UserController
        ]);

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
        self.showContactOptions = showContactOptions;

        // Load all registered apps

        appService
            .loadAllUsers()
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
        function toggleAppsList() {
            var pending = $mdBottomSheet.hide() || $q.when(true);

            pending.then(function () {
                $mdSidenav('left').toggle();
            });
        }

        /**
         * Select the current avatars
         * @param menuId
         */
        function selectApp(user) {
            self.selected = angular.isNumber(user) ? $scope.apps[user] : user;
            self.toggleList();
            $location.path('/' + user.id)
        }

        /**
         * Show the bottom sheet
         */
        function showContactOptions($event) {
            var user = self.selected;

            return $mdBottomSheet.show({
                parent: angular.element(document.getElementById('content')),
                templateUrl: './src/apps/view/contactSheet.html',
                controller: ['$mdBottomSheet', ContactPanelController],
                controllerAs: "cp",
                bindToController: true,
                targetEvent: $event
            }).then(function (clickedItem) {
                clickedItem && $log.debug(clickedItem.name + ' clicked!');
            });

            /**
             * Bottom Sheet controller for the Avatar Actions
             */
            function ContactPanelController($mdBottomSheet) {
                this.user = user;
                this.actions = [
                    {name: 'Phone', icon: 'phone', icon_url: 'assets/svg/phone.svg'},
                    {name: 'Twitter', icon: 'twitter', icon_url: 'assets/svg/twitter.svg'},
                    {name: 'Google+', icon: 'google_plus', icon_url: 'assets/svg/google_plus.svg'},
                    {name: 'Hangout', icon: 'hangouts', icon_url: 'assets/svg/hangouts.svg'}
                ];
                this.submitContact = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

    }

})();
