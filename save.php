<?php
include 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$data_string = $HTTP_RAW_POST_DATA;

$request = $client->createRequest('POST', 'http://services2.arcgis.com/XrTRbkeSS1aM6EfD/arcgis/rest/services/new_floody_houses/FeatureServer/0/addFeatures');
$postBody = $request->getBody();
$postBody->setField('f', 'pjson');
$postBody->setField('features', $data_string);
$postBody->setField('outSR', 102100);
$response = $client->send($request);

header("Content-type: application/json");
echo $response->getBody();

?>