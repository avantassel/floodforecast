<?php

include 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$data_string = $HTTP_RAW_POST_DATA;

$request = $client->createRequest('POST', 'http://services2.arcgis.com/XrTRbkeSS1aM6EfD/arcgis/rest/services/new_floody_houses/FeatureServer/0/updateFeatures');
$postBody = $request->getBody();
$postBody->setField('f', 'pjson');
$postBody->setField('features', $data_string);
$response = $client->send($request);


if(!empty($email)){
	$email = new SendGrid\Email();
	$email->addTo($email)->
	       setFrom('me@floodforecast.org')->
	       setSubject('Flood Forecast')->
	       setText('Thanks for setting up ALerts with Flood Forecast!')->
	       setHtml('<h1>Thanks for setting up ALerts with Flood Forecast!</h1>');
}

header("Content-type: application/json");
echo $response->getBody();

?>