<?php

$response = array();
$xml = @simplexml_load_file('http://alerts.weather.gov/cap/co.atom',null,LIBXML_NOERROR);

if(!empty($xml)){
	
	if(!empty($xml->entry))	
	{
		foreach($xml->entry as $entry){						
			//Use that namespace
			$namespaces = $entry->getNameSpaces(true);
		  	$points = array();
		  	$cap = !empty($namespaces['cap'])?$entry->children($namespaces['cap']):''; 
		  	
		  	if(!empty($cap->polygon)){
		  		$cap->polygon=(string)$cap->polygon;
		  		$pointslist = explode(' ', $cap->polygon);
		  		foreach ($pointslist as $p) {
		  			$points[]=explode(',', $p);
		  		}
		  	}

		  	$response[]=array('title'=>(string)$entry->title,
				'summary'=>(string)$entry->summary,
				'ts'=>strtotime((string)$entry->published),
				'date'=>(string)$entry->updated,
				'link'=>(string)$entry->link->attributes()->href,
				'event'=>!empty($cap->event)?(string)$cap->event:'',
				'effective'=>!empty($cap->effective)?(string)$cap->effective:'',
				'expires'=>!empty($cap->expires)?(string)$cap->expires:'',
				'status'=>!empty($cap->status)?(string)$cap->status:'',
				'msgType'=>!empty($cap->msgType)?(string)$cap->msgType:'',
				'category'=>!empty($cap->category)?(string)$cap->category:'',
				'urgency'=>!empty($cap->urgency)?(string)$cap->urgency:'',
				'severity'=>!empty($cap->severity)?(string)$cap->severity:'',
				'certainty'=>!empty($cap->certainty)?(string)$cap->certainty:'',
				'areaDesc'=>!empty($cap->areaDesc)?(string)$cap->areaDesc:'',
				'polygon'=>!empty($cap->polygon)?(string)$cap->polygon:'',
				'points'=>$points
				);
		}
	}			
}		

header("Content-type: application/json");
echo json_encode($response);	

?>