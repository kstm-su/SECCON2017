<?php

function calc($s){
	if(strpos($s, '+')){
		$arr=explode('+',$s);
		return $arr[0]+$arr[1];
	}
	if(strpos($s, '-')){
		$arr=explode('-',$s);
		return $arr[0]-$arr[1];
	}
	if(strpos($s, '/')){
		$arr=explode('/',$s);
		return $arr[0]/$arr[1];
	}
	echo '!'.$s.PHP_EOL;
}

while($s=trim(fgets(STDIN))){
	if(strpos($s, 'Write-Progress') !== false){
		continue;
	}
	if(strpos($s, '$ECCON+=[char]([int][Math]::sqrt([Math]::pow(') !== false && strpos($s, '2)));')!==false){
		echo chr(str_replace([',2)));','$ECCON+=[char]([int][Math]::sqrt([Math]::pow('], '', $s));
		continue;
	}
	if(strpos($s,'$ECCON+=[char](') !== false){
		echo chr(calc(str_replace(['$ECCON+=[char](',');'],"",$s)));
		continue;
	}
	echo '!'.$s.PHP_EOL;
}
