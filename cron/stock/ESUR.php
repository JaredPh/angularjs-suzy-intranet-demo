<?php
    $api_url     = 'https://www.quandl.com/api/v3/datasets/LSE/ESUR.json';
    
    $api_query   = '?collapse=weekly&start_date='.date('Y-m-d', strtotime('-1 year')).'auth_token=';

    $api_token   = 'Jqq6t8PQqn3_hLDCbykX';
    
    $output_path = '../data/stock/ESUR.json';
    
    $curl = curl_init();

    $output_file = fopen($output_path, 'w');

    curl_setopt ($curl, CURLOPT_URL, $api_url.$api_query.$api_token);
    curl_setopt ($curl, CURLOPT_FILE, $output_file);
    curl_setopt ($curl, CURLOPT_RETURNTRANSFER, TRUE);
    
    $contents = curl_exec($curl);

    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    if($httpCode == 200) {
        fwrite($output_file, $contents);
        echo "Success: ESUR.json Updated\n";
    }
    else {
        echo "Error: ESUR.json Update Failed\n";
    }

    curl_close ($curl);
    fclose($output_file);
?>