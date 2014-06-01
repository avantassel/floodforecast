<?php
include 'vendor/autoload.php';

if(isset($_GET['to'])){
	$sendgrid = new SendGrid('floodforecast', 'Xd3ds226M87R9t2Y2Bane2Q9d47N3VUbsD');
	$email = new SendGrid\Email();
	$email->addTo($_GET['to'])->
	       setFrom('alerts@floodforecast.org')->
	       setFromName('Flood Forecast Alerts')->
	       setSubject('Your alerts are set')->
	       setText("FloodForecast says: Flooding near you, move to higher ground. Nearest evacuation center: 450 Powers St, Erie, CO. http://bit.ly/1kYEOW8")->
	       setHtml("FloodForecast says: Flooding near you, move to higher ground. Nearest evacuation center: 450 Powers St, Erie, CO. http://bit.ly/1kYEOW8");	
	$return = $sendgrid->send($email);       
} else {
	$return = array('message'=>'error');
}

header("Content-type: application/json");
echo json_encode($return);

?>
