<?php
include 'vendor/autoload.php';
 
$account_sid = 'AC6f388ded21dbe579313fcaef8ffbcbbd'; 
$auth_token = '54279ffb68816c143bb88ecb037b15d6'; 
$client = new Services_Twilio($account_sid, $auth_token); 
 
$response  = $client->account->messages->create(array( 
  'To' => $_GET['phone'],
  'From' => "+13039007288", 
  'Body' => "FloodForecast says: Flooding near you, move to higher ground",   
));

header("Content-type: application/json");
echo json_encode($response);
?>