app

    .directive('toolbar', ['$location', function(location) {
        return {
            restrict: 'EA',
            scope: {
                viewSelected:'@',
                onStart:'&?',
                onAdd:'&?',
                onReset:'&?',
                onFinish:'&?',
                onResetSettings:'&?',
                onTestConnection:'&?',
                onConnectSettings:'&?',
                onFinalizeSettings:'&?',
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
                scope.onStartOrder = function(){
                    if(scope.onStart){
                        scope.onStart();
                    }
                };

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

                scope.connectSettings = function(){
                    if(scope.onConnectSettings){
                        scope.onConnectSettings();
                    }
                };

                scope.finalizeSettings = function(){
                    if(scope.onFinalizeSettings){
                        scope.onFinalizeSettings();
                    }
                }

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