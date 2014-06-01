<?php
include 'vendor/autoload.php';

if(isset($_GET['to'])){
	$sendgrid = new SendGrid('floodforecast', 'Xd3ds226M87R9t2Y2Bane2Q9d47N3VUbsD');
	$email = new SendGrid\Email();
	$email->addTo($_GET['to'])->
	       setFrom('alerts@floodforecast.org')->
	       setFromName('Flood Forecast Alerts')->
	       setSubject('Your alerts are set')->
	       setText("Thanks for setting up ALerts with Flood Forecast!\n\n\n")->
	       setHtml('<h1>Thanks for setting up Alerts with Flood Forecast!</h1><br><br><p><a href="http://www.floodforecast.org">http://www.floodforecast.org</a></p>');	
	$sendgrid->send($email);       
	$return = array('message'=>'success')
} else {
	$return = array('message'=>'fail')
}

header("Content-type: application/json");
echo json_encode($return);

?>