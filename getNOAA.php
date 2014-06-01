<?php

$response = array();
$xml = @simplexml_load_file('http://alerts.weather.gov/cap/co.atom',null,LIBXML_NOERROR);

if(!empty($xml)){
	
	if(!empty($xml->channel->item))	
	{
		foreach($xml->channel->item as $entry){						
			//Use that namespace
			$namespaces = $entry->getNameSpaces(true);
		  	
		  	$cap = !empty($namespaces['cap'])?$entry->children($namespaces['cap']):''; 
		  	
		  	print_r($cap);
		  	break;

		  	$response[]=array('title'=>$title,
				'description'=>$entry->summary,
				'ts'=>strtotime((string)$entry->published),
				'date'=>(string)$entry->updated,
				'url'=>$link,
				'event'=>!empty($cap->event)?$cap->event:'',
				'effective'=>!empty($cap->effective)?$cap->effective:''
				'expires'=>!empty($cap->expires)?$cap->expires:''
				'status'=>!empty($cap->status)?$cap->status:'',
				'msgType'=>!empty($cap->msgType)?$cap->msgType:'',
				'category'=>!empty($cap->category)?$cap->category:'',
				'urgency'=>!empty($cap->urgency)?$cap->urgency:'',
				'severity'=>!empty($cap->severity)?$cap->severity:'',
				'certainty'=>!empty($cap->certainty)?$cap->certainty:'',
				'areaDesc'=>!empty($cap->areaDesc)?$cap->areaDesc:'',
				'polygon'=>!empty($cap->polygon)?$cap->polygon:''
				);
		}
	}			
}		

header("Content-type: application/json");
echo json_encode($response);	

?>