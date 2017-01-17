<?

$url = $_GET['url'];

$curl = curl_init();

curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($curl, CURLOPT_URL, $url);

$xml_str = curl_exec($curl);

curl_close($curl);

$xml = simplexml_load_string($xml_str, 'SimpleXMLElement', LIBXML_NOCDATA);

$json = json_encode($xml);

header('Content-Type: application/json');
echo $json;

?>
