app
    .controller('SettingsController', ['$scope', '$location','$rootScope', '$http',function($scope, $location,$rootScope, $http) {
        //initialize view vars - For production - clean credentials vars
        $scope.backendUrl = 'https://developer.phcfx.com/app/';
        $scope.appId = 'D61151BF98';
        $scope.username = 'parceiro';
        $scope.password = 'parceiro2015';
        $scope.company = 'Dev000001';

        $scope.credentials = undefined;

        $scope.docType = undefined;

        $scope.isReadyConnection = false;


        $scope.updateFlags = function(){

            $scope.step1 = (!$scope.credentials || !$scope.isReadyConnection) && $scope.docType === undefined;
            $scope.step2 = ($scope.credentials && $scope.isReadyConnection) && $scope.docType === undefined;
            $scope.step3 = ($scope.credentials && $scope.isReadyConnection) && $scope.docType !== undefined;

        };

        //run update flags now!
        $scope.updateFlags();


        //test Connection to drive
        $scope.testConnection = function(){


            $http.post('../server/test_connection.php', $scope.credentials)
                .success(function(data) {
                    /*$scope.formData = {}; // clear the form so our user is ready to enter another
                     $scope.todos = data;
                     console.log(data);*/


                    if(data === " "){
                        //if there is errors
                        $scope.isReadyConnection = false;
                        $scope.errorMsg = "";
                    }else{
                        if(data.usstamp === undefined){
                            $scope.errorMsg = data;
                            $scope.isReadyConnection = false;
                        }else{
                            $scope.isReadyConnection = true;
                            $scope.errorMsg = "";
                        }

                    }

                    $scope.updateFlags();

                    //if is ready connection - get the doc type
                    if($scope.isReadyConnection){
                        $scope.getDocumentType();
                    }

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });

        };



        //check if it is in cache
        var cachedObject =  localStorage.getItem('credentials');
        if ( cachedObject ){
            $scope.credentials = JSON.parse(cachedObject);
            //view variables
            $scope.backendUrl = $scope.credentials.backendUrl;
            $scope.appId = $scope.credentials.appId;
            $scope.username = $scope.credentials.username;
            $scope.password = $scope.credentials.password;
            $scope.company = $scope.credentials.company;

            $scope.docType = $scope.credentials.docType;

            //we assume that is correct - NOT bullet proof

            $scope.testConnection();
        }


        //Do the Drive FX connection
        $scope.connect = function (){

            //all fields are fulfilled?
            if($scope.backendUrl !== '' && $scope.appId !== '' && $scope.username !== '' && $scope.password !== '' ){

                $scope.credentials = {
                    backendUrl : $scope.backendUrl,
                    appId : $scope.appId,
                    username : $scope.username,
                    password : $scope.password,
                    company : $scope.company,
                    docType : $scope.docType
                };

                //Store credentials
                localStorage.setItem('credentials',  JSON.stringify($scope.credentials));

                $scope.testConnection();

                //if is ready connection - get the doc type
                if($scope.isReadyConnection){
                    $scope.getDocumentType();
                }

            }



        };

        //Reset settings
        $scope.resetConnection = function(){

            //Store credentials
            localStorage.removeItem('credentials');

            $scope.credentials = undefined;

            $scope.backendUrl = '';
            $scope.appId = '';
            $scope.username = '';
            $scope.password = '';
            $scope.company = '';

            $scope.docType = undefined;

            $scope.updateFlags();
        };


        //get Document Types
        $scope.getDocumentType = function(){

            //check if it is in cache
            var cachedObject =  localStorage.getItem('credentials');
            if ( cachedObject ){
                $scope.credentials = JSON.parse(cachedObject);
            }

            $http.post('../server/get_doctypes.php', $scope.credentials)
                .success(function(data) {

                    if(data !== " "){

                        if(data.result.length > 0 ){
                            $scope.documentList = data.result;
                        }

                    }

                    $scope.updateFlags();

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });


        };

        $scope.confirmDoc = function(){

            $scope.credentials.docType = parseInt($scope.docType);

            //Store credentials
            localStorage.setItem('credentials',  JSON.stringify($scope.credentials));

            if($scope.credentials.docType){
                this.updateFlags();
            }

        }

    }]);