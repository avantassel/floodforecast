<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$request = $client->createRequest('POST', 'http://services2.arcgis.com/XrTRbkeSS1aM6EfD/arcgis/rest/services/new_floody_houses/FeatureServer/0/addfeatures');
$postBody = $request->getBody();
foreach($_POST as $k=>$v)
	$postBody->setField($k,$v);
$response = $client->send($request);

header("Content-type: application/json");
echo $response;

?>