<?php

 //read parameters
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);


$ch=doPhcFXLogin($request);

getDocType($ch, $request);

doPhcFXLogout($ch, $request);


function getDocType($ch, $request){
    $urlBase = $request->backendUrl;
    $usernameLogin = $request->username;
    $passwordLogin = $request->password;
    $appTypeLogin  = $request->appId;
    $companyLogin  = $request->company;
    $docType = $request->docType;


	$url = $urlBase . "REST/SearchWS/QueryAsEntities";
	$params =  array('itemQuery' => '{"groupByItems":[],
    												"lazyLoaded":false,
    												"joinEntities":[],
    												"orderByItems":[],
    												"SelectItems":[],
    												"entityName":"Ft",
    												"filterItems":[{
    																"comparison":0,
    																"filterItem":"ft.draftRecord",
    																"valueItem":true,
    																"groupItem":1,
    																"checkNull":false,
    																"skipCheckType":false,
                                                                    "type":"Number"
    															},
                                                                {
                                                                     "comparison":0,
                                                                     "filterItem":"ft.ndoc",
                                                                     "valueItem": ' . $docType .',
                                                                     "groupItem":1,
                                                                     "checkNull":false,
                                                                     "skipCheckType":false,
                                                                     "type":"Number"
                                                                 },
                                                                 {
                                                                      "comparison":0,
                                                                      "filterItem":"ft.ousrinis",
                                                                      "valueItem": "' . $usernameLogin .'",
                                                                      "groupItem":0,
                                                                      "checkNull":false,
                                                                      "skipCheckType":false,
                                                                      "type":"Number"
                                                                  }

    															]}'
    							);


	$response=doPhcFXRequest($ch, $url,$params);
	//var_dump($response);
	echo json_encode( $response );

}



### GENERIC FUNCTIONS

function doPhcFXRequest($ch, $url,$params){
	// Build Http query using params
	$query = http_build_query ($params);

	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_POST, false);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
	$response = curl_exec($ch);

	// send response as JSON
	return json_decode($response, true);
}

function doPhcFXLogin($request){

    $urlBase = $request->backendUrl;
    $usernameLogin = $request->username;
    $passwordLogin = $request->password;
    $appTypeLogin  = $request->appId;
    $companyLogin  = $request->company;

	/*************************************************************
	 *		 Called webservice that make login in Drive FX       *
	 *************************************************************/
	$url = $urlBase . "REST/UserLoginWS/userLoginCompany";

	// Create map with request parameters
	$params = array('userCode' => $usernameLogin,
					'password' => $passwordLogin,
					'applicationType' => $appTypeLogin,
					'company' => $companyLogin
					);

	// Build Http query using params
	$query = http_build_query ($params);

	//initial request with login data
	$ch = curl_init();

	//URL to save cookie "ASP.NET_SessionId"
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_USERAGENT,'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/32.0.1700.107 Chrome/32.0.1700.107 Safari/537.36');
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

	//Parameters passed to POST
	curl_setopt($ch, CURLOPT_POSTFIELDS, $query);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_COOKIESESSION, true);
	curl_setopt($ch, CURLOPT_COOKIEJAR, '');
	curl_setopt($ch, CURLOPT_COOKIEFILE, '');
	$response = curl_exec($ch);

	// send response as JSON
	$response = json_decode($response, true);

	if (curl_error($ch)) {
		return false;
	} else if(empty($response)){
		return false;
	} else if(isset($response['messages'][0]['messageCodeLocale'])){
		echo "Error in login. Please verify your username, password, applicationType and company." ;
		return false;
	}
	return $ch;
}

function doPhcFXLogout($ch, $request){
    $urlBase = $request->backendUrl;
    $usernameLogin = $request->username;
    $passwordLogin = $request->password;
    $appTypeLogin  = $request->appId;
    $companyLogin  = $request->company;

	/*******************************************************************
	*          Called webservice that makes logout of Drive FX         *
	********************************************************************/
	$url = $urlBase . "REST/UserLoginWS/userLogout";
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_POST, false);
	$response = curl_exec($ch);
}
?>