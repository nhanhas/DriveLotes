app
    .controller('OrderController', ['$scope', '$location','$rootScope', '$timeout','$http', function($scope, $location,$rootScope, $timeout, $http) {

        //Views flags
        $scope.step1 = true;//add prod view
        $scope.step2 = false;//loading view
        $scope.step3 = false;//finished view
        $scope.toolbarSelected = 'order-start';

        //Products Collection
        $scope.productsList = [];

        //Client Collection
        $scope.clientList = [];
        $scope.clientSelect = undefined;

        //for test
        /*$scope.product1 = {ref: 'a001', qtt:1};
        $scope.product2 = {ref: 'b001', qtt:2};
        $scope.product3 = {ref: 'a001', qtt:1};
        $scope.product4 = {ref: 'b001', qtt:2};
        $scope.product5 = {ref: 'a001', qtt:1};
        $scope.product6 = {ref: 'b001', qtt:2};
        $scope.productsList.push($scope.product1);
        $scope.productsList.push($scope.product2);
        $scope.productsList.push($scope.product3);
        $scope.productsList.push($scope.product4);
        $scope.productsList.push($scope.product5);
        $scope.productsList.push($scope.product6);*/

        $scope.client1 = {nome : 'Miguel' , no : 1};
        $scope.client2 = {nome : 'Jõao' , no : 2};
        $scope.clientList.push($scope.client1);
        $scope.clientList.push($scope.client2);

        $scope.errorMsg = "";

        //check if it is in cache - configured
        var cachedObject =  localStorage.getItem('credentials');
        if ( cachedObject){
            $scope.step0 = false; //config needed
            $scope.stepChoose = true;//choose client
            $scope.step1 = false;//add prod view
            $scope.step2 = false;//loading view
            $scope.step3 = false;//finished view
            $scope.toolbarSelected = 'order-start';

        }else{
            $scope.step0 = true; //config needed
            $scope.stepChoose = false;//choose client
            $scope.step1 = false;//add prod view
            $scope.step2 = false;//loading view
            $scope.step3 = false;//finished view
            $scope.toolbarSelected = 'order-config';
        }

        //after "add new product" and then decoded
        $scope.afterDecode = function (codeResult){

            var newProduct = {
                    ref: codeResult,
                    qtt: 1
            };

            $timeout(function() {
                var alreadyInlist = false;
                //#1 - check if already in list
                $scope.productsList.forEach(function(product) {
                    if(product.ref === newProduct.ref){
                        //+1 qtt
                        product.qtt++;
                        alreadyInlist = true;
                    }
                });

                //#2 - store it into order if not in list
                if(!alreadyInlist){
                    $scope.productsList.push(newProduct);
                }

                //#3 - reset input file
                var input = document.querySelector("input[type=file]");
                input.value = "";
            });

        };

        //on Remove product from list
        $scope.removeProduct = function (ref){

            for (var i = 0; i < $scope.productsList.length; i++){
                if($scope.productsList[i].ref === ref){
                    $scope.productsList.splice(i, 1);
                }
            }

        };


        //CHECK IF IT IS to CONTINUE PENDING OR NOT
        if($rootScope.invoicePending){
            $scope.invoicePending = $rootScope.invoicePending;
            $rootScope.invoicePending = undefined;
            console.log("pending invoice");

            $scope.step0 = false; //config needed
            $scope.stepChoose = false;//choose client
            $scope.step1 = true;//add prod view
            $scope.step2 = false;//loading view
            $scope.step3 = false;//finished view
            $scope.toolbarSelected = 'order';

            //prepare invoice
            $scope.invoicePending.fis.forEach(function(productLine) {
                if(productLine.ref !== ''){
                    $scope.productsList.push({ref: productLine.ref, qtt: productLine.qtt, original:true});
                }
            });

        }


        $scope.onStartingOrder = function(){
            //TODO validate if client is choosed
            $scope.step0 = false; //config needed
            $scope.stepChoose = false;//choose client
            $scope.step1 = true;//add prod view
            $scope.step2 = false;//loading view
            $scope.step3 = false;//finished view
            $scope.toolbarSelected = 'order';

        }

        /**
         * Bar code matters
         */

        //check if getUserMedia is available
        if(navigator.getUserMedia){
            $scope.liveStreamAvailable = true;
        }

        $scope.onAddNewProduct = function (){

            if($scope.liveStreamAvailable){

                $scope.initQuagga();

            }else{

                console.log('adding...');
                //simmulate the "choose file" button
                var input = document.querySelector("input[type=file]");
                input.click();
            }


        };


        $scope.onResetAll = function (){
            console.log('resetting...');
            $scope.productsList = [];
            $scope.errorMsg = "";
            //TODO reset client
            $scope.toolbarSelected = 'order';
            $scope.step0 = false; //config needed
            $scope.stepChoose = true;//choose client
            $scope.step1 = false;//add prod view
            $scope.step2 = false;//loading view
            $scope.step3 = false;//finished view
            $scope.toolbarSelected = 'order-start';
        };


        $scope.onFinishInvoice = function (){
            //finish a pending one
            if($scope.invoicePending){

                //for test
                //$scope.product1 = {ref: 'b001', qtt:2};
                //$scope.productsList.push($scope.product1);

                $scope.productsList.forEach(function(productLine){

                    if(!productLine.original){
                        $scope.invoicePending.fis.push({ref: productLine.ref, qtt:productLine.qtt});
                    }

                });

                console.log($scope.invoicePending);

                //#1 - Get credentials to connect to Drive
                var cachedObject =  localStorage.getItem('credentials');
                if ( cachedObject ){
                    var credentials = JSON.parse(cachedObject);

                    //TODO insert client no into params
                    //#2 - Prepare params to creation_invoice WS
                    var paramsServer = {
                        credentials: credentials,
                        invoice: $scope.invoicePending,
                        option: 0//print options
                    };

                    $scope.step0 = false; //config needed
                    $scope.stepChoose = false;//choose client
                    $scope.step1 = false;//add prod view
                    $scope.step2 = true;//loading view
                    $scope.step3 = false;//finished view

                    //#3 - Make the Call!!
                    $http.post('../server/continue_pending.php', paramsServer)
                        .success(function(data) {

                            //result
                            console.log(data);

                            if(angular.isString(data) && data !== ' '){
                                //show error and then back to order view
                                $scope.errorMsg = data;
                                $scope.step0 = false; //config needed
                                $scope.step1 = true;//add prod view
                                $scope.step2 = false;//loading view
                                $scope.step3 = false;//finished view
                                $scope.toolbarSelected = 'order';
                            }else{
                                $scope.errorMsg = "";
                                //Created!
                                $scope.step0 = false; //config needed
                                $scope.step1 = false;//add prod view
                                $scope.step2 = false;//loading view
                                $scope.step3 = true;//finished view
                                $scope.toolbarSelected = 'order-reset';
                                $scope.invoicePending = undefined;
                            }



                        })
                        .error(function(data) {
                            console.log('Error: ' + data);
                        });

                }else{
                    $scope.step0 = false; //config needed
                    $scope.stepChoose = true;//choose client
                    $scope.step1 = false;//add prod view
                    $scope.step2 = false;//loading view
                    $scope.step3 = false;//finished view


                }


                //end of continue

            }else{
                console.log('finishing invoice...');

                //#1 - Get credentials to connect to Drive
                var cachedObject =  localStorage.getItem('credentials');
                if ( cachedObject ){
                    var credentials = JSON.parse(cachedObject);
                    var docType = credentials.docType;

                    //TODO insert client no into params
                    //#2 - Prepare params to creation_invoice WS
                    var paramsServer = {
                        credentials: credentials,
                        products: $scope.productsList,
                        docType: docType,
                        option: 0//print options
                    };

                    $scope.step0 = false; //config needed
                    $scope.stepChoose = false;//choose client
                    $scope.step1 = false;//add prod view
                    $scope.step2 = true;//loading view
                    $scope.step3 = false;//finished view

                    //#3 - Make the Call!!
                    $http.post('../server/create_invoice.php', paramsServer)
                        .success(function(data) {

                            //result
                            console.log(data);

                            if(angular.isString(data) && data !== ' '){
                                //show error and then back to order view
                                $scope.errorMsg = data;
                                $scope.step0 = false; //config needed
                                $scope.stepChoose = false;//choose client
                                $scope.step1 = true;//add prod view
                                $scope.step2 = false;//loading view
                                $scope.step3 = false;//finished view
                                $scope.toolbarSelected = 'order';
                            }else{
                                $scope.errorMsg = "";
                                //Created!
                                $scope.step0 = false; //config needed
                                $scope.stepChoose = false;//choose client
                                $scope.step1 = false;//add prod view
                                $scope.step2 = false;//loading view
                                $scope.step3 = true;//finished view
                                $scope.toolbarSelected = 'order-reset';
                            }



                        })
                        .error(function(data) {
                            console.log('Error: ' + data);
                        });

                }else{
                    $scope.step0 = false; //config needed
                    $scope.stepChoose = true;//choose client
                    $scope.step1 = false;//add prod view
                    $scope.step2 = false;//loading view
                    $scope.step3 = false;//finished view
                    $scope.toolbarSelected = 'order-start';


                }
            }


        };

        /**
         *
         * CODE BAR
         *
         */
        $scope.lastResult = undefined;

        /**
         * To check out the Live Stream Option
         * Go to View2Controller
         */

        $scope.initQuagga = function() {
            $scope.liveIsReady = true;
            Quagga.init({
                inputStream : {
                    name : "Live",
                    type : "LiveStream",
                    target: document.querySelector('#interactive-live')    // Or '#yourElement' (optional)
                },
                decoder : {
                    readers : ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader", "i2of5_reader"]
                }
            }, function(err) {
                if (err) {
                    console.log(err);
                    return
                }

                console.log("Initialization finished. Ready to start");
                Quagga.start();
            });
        };

        //When file is taken from camera or Src
        $scope.imageUploaded = function (e){
            $scope.decodeQuagga(URL.createObjectURL(e.files[0]));
        };

        //run de decoder!
        $scope.decodeQuagga = function(src) {
            Quagga.decodeSingle({
                src: src,
                numOfWorkers: 0,  // Needs to be 0 when used within node
                inputStream: {
                    size: 800  // restrict input-size to be 800px in width (long-side)
                },
                decoder: {
                    readers : ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader", "i2of5_reader"]
                },
            }, function(result) {
                if(result.codeResult) {
                    console.log("result", result.codeResult.code);
                    $scope.afterDecode(result.codeResult.code);

                } else {
                    console.log("not detected");
                }
            });



        };

        //Quaggajs processes---
        Quagga.onProcessed(function(result) {
            var drawingCtx = Quagga.canvas.ctx.overlay,
                drawingCanvas = Quagga.canvas.dom.overlay,
                area;

            if (result) {
                if (result.boxes) {
                    drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                    result.boxes.filter(function (box) {
                        return box !== result.box;
                    }).forEach(function (box) {
                        Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
                    });
                }

                if (result.box) {
                    Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
                }

                if (result.codeResult && result.codeResult.code) {
                    Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
                }

            }
        });

        Quagga.onDetected(function(result) {
            //diference between live and photo
            if($scope.liveStreamAvailable){

                var code = result.codeResult.code;

                if ($scope.lastResult !== code) {
                    $scope.lastResult = code;
                    var $node = null, canvas = Quagga.canvas.dom.image;

                    var objDiv = document.getElementById("interactive-live");
                    //objDiv.scrollTop = objDiv.scrollHeight;
                    $("#interactive-live").scrollTop($("#interactive-live")[0].scrollHeight);


                    $scope.afterDecode(code);
                    //console.log(result.codeResult);


                    $node = $('<li><div class="thumbnail"><div class="imgWrapper"><img /></div><div class="caption"><h4 class="code"></h4></div></div></li>');
                    $node.find("img").attr("src", canvas.toDataURL());
                    $node.find("h4.code").html(code);
                    $("#result_strip ul.thumbnails").prepend($node);
                }


            }else{
                var code = result.codeResult.code,
                    $node,
                    canvas = Quagga.canvas.dom.image;

                $node = $('<li><div class="thumbnail"><div class="imgWrapper"><img /></div><div class="caption"><h4 class="code"></h4></div></div></li>');
                $node.find("img").attr("src", canvas.toDataURL());
                $node.find("h4.code").html(code);
                $("#result_strip ul.thumbnails").prepend($node);
            }


        });


    }]);