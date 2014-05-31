<?php
require_once 'Zend/Oauth/Consumer.php';

$data_string = $HTTP_RAW_POST_DATA;

$client = new Zend_Http_Client('http://services2.arcgis.com/XrTRbkeSS1aM6EfD/arcgis/rest/services/new_floody_houses/FeatureServer/0/updateFeatures');
$client->setParameterPost(array('f' => 'pjson'));
$client->setParameterPost(array('features' => $data_string));

$response = $client->request(Zend_Http_Client::POST); 

header("Content-type: application/json");
echo $response->getBody();

?>