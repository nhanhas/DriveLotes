app

    .directive('toolbar', ['$location', function(location) {
        return {
            restrict: 'EA',
            scope: {
                viewSelected:'@',
                onAdd:'&?',
                onReset:'&?',
                onFinish:'&?',
                onResetSettings:'&?',
                onTestConnection:'&?',
                onRefreshList:'&?'
            },
            templateUrl: 'shared/toolbar/toolbar.html',

            link: function (scope, element, attrs) {

                scope.goBack = function (){
                    location.path('/home');
                };

                scope.goConfig = function (){
                    location.path('/settings');
                };

                /**
                 * Orders
                 */
                scope.addNewProduct = function(){
                    if(scope.onAdd){
                        scope.onAdd();
                    }
                };

                scope.onResetAll = function(){
                    if(scope.onReset){
                        scope.onReset();
                    }
                };

                scope.onFinishInvoince = function(){
                    if(scope.onFinish){
                        scope.onFinish();
                    }
                };


                /**
                 * Settings
                 */

                scope.resetSettings = function(){
                    if(scope.onResetSettings){
                        scope.onResetSettings();
                    }
                };

                scope.testConnection = function(){
                    if(scope.onTestConnection){
                        scope.onTestConnection();
                    }
                };

                /**
                 * Pending
                 */

                scope.refreshList = function(){
                    if(scope.onRefreshList()){
                        scope.onRefreshList();
                    }
                };


            }
        };
    }]);