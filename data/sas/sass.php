<?
	$output = array();

	$output['modules']  = array();

	$count = 0;
	$tProgress = 0;

	for ($i = 0; $i <= rand(1,5); $i++) {
		
		$module = array(
			'name'    => 'Module '.($i+1),
			'progress'=> rand(0,1000)/10,
		    'status'  => (rand(0,10) <= 7)
		);
		
		array_push($output['modules'],$module);		

		$count++;
		$tProgress += $module['progress'];
	}

	$output['datamats']  = array();

	for ($i = 0; $i <= rand(2,3); $i++) {
		
		$datamat = array(
			'name'    => 'Datamat '.($i+1),
			'progress'=> rand(0,1000)/10,
		    'status'  => (rand(0,10) <= 7)
		);
		
		array_push($output['datamats'],$datamat);

		$count++;
		$tProgress += $datamats['progress'];
		
	}


	$output['progress'] = rand(0,1000)/10;
        $output['time']     = time()*1000;
    
    header('Content-Type: application/json');
    echo json_encode($output);
?>