<?php
include 'vendor/autoload.php';
 
$account_sid = 'AC6f388ded21dbe579313fcaef8ffbcbbd'; 
$auth_token = '54279ffb68816c143bb88ecb037b15d6'; 
$client = new Services_Twilio($account_sid, $auth_token); 
 
$client->account->messages->create(array( 
  'To' => $_GET['phone'],
  'From' => "+13039007288", 
  'Body' => "Your property is in eminent danger of flooding. Please seek shelter immediately. Nearest Disaster Assistance Center: 123 Street Place",   
));
?>
<!doctype html>
<!--[if IE 9]><html class="lt-ie10" lang="en" > <![endif]-->
<html class="no-js" lang="en" data-useragent="Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FloodForecast</title>
  </head>
  <body>
  	Registered with #: <?php echo $_GET["phone"]; ?>.
  </body>
</html>