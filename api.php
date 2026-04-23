<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$dataDir = __DIR__ . '/data';
$pwdFile = $dataDir . '/password.txt';
$analyticsFile = $dataDir . '/analytics.json';

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
    file_put_contents($dataDir . '/.htaccess', "Deny from all\n");
}
if (!file_exists($pwdFile)) file_put_contents($pwdFile, 'admin123');
if (!file_exists($analyticsFile)) {
    file_put_contents($analyticsFile, json_encode([
        'visitors'=>[],'pageViews'=>[],'sessions'=>[],'daily'=>[]
    ]));
}

function getPwd(){ return trim(file_get_contents($GLOBALS['pwdFile'])); }
function getAnalytics(){
    $d=file_get_contents($GLOBALS['analyticsFile']);
    $j=json_decode($d,true);
    return $j ?: ['visitors'=>[],'pageViews'=>[],'sessions'=>[],'daily'=>[]];
}
function saveAnalytics($d){ file_put_contents($GLOBALS['analyticsFile'],json_encode($d,JSON_UNESCAPED_UNICODE),LOCK_EX); }
function out($d){echo json_encode($d,JSON_UNESCAPED_UNICODE);exit;}
function authed(){ return !empty($_SESSION['admin']) && time()-($_SESSION['admin_t']??0)<3600; }

$action=$_REQUEST['action']??'';

switch($action){

case 'ping':
    out(['success'=>true,'php'=>true]);

case 'login':
    $pw=$_POST['password']??'';
    if($pw===getPwd()){$_SESSION['admin']=true;$_SESSION['admin_t']=time();out(['success'=>true]);}
    out(['success'=>false,'error'=>'Wrong password']);

case 'check':
    out(['success'=>true,'authenticated'=>authed()]);

case 'logout':
    session_destroy();
    out(['success'=>true]);

case 'change_password':
    if(!authed()) out(['success'=>false,'error'=>'Not authenticated']);
    $np=$_POST['new_password']??'';$cf=$_POST['confirm']??'';
    if(strlen($np)<4) out(['success'=>false,'error'=>'Min 4 characters']);
    if($np!==$cf) out(['success'=>false,'error'=>'Passwords do not match']);
    file_put_contents($GLOBALS['pwdFile'],$np);
    out(['success'=>true]);

case 'track':
    $vid=$_POST['vid']??('v_'.bin2hex(random_bytes(6)));
    $sid=$_POST['sid']??('s_'.bin2hex(random_bytes(4)));
    $page=$_POST['page']??'unknown';
    $now=time();$today=date('Y-m-d');
    $data=getAnalytics();

    if(!isset($data['visitors'][$vid]))
        $data['visitors'][$vid]=['first'=>$now,'last'=>$now,'hits'=>0,'pages'=>[]];
    $data['visitors'][$vid]['last']=$now;
    $data['visitors'][$vid]['hits']++;
    $data['visitors'][$vid]['pages'][$page]=($data['visitors'][$vid]['pages'][$page]??0)+1;

    if(!isset($data['pageViews'][$today])) $data['pageViews'][$today]=[];
    $data['pageViews'][$today][$page]=($data['pageViews'][$today][$page]??0)+1;

    if(!isset($data['daily'][$today])) $data['daily'][$today]=['views'=>0,'uniq'=>[]];
    $data['daily'][$today]['views']++;
    if(!in_array($vid,$data['daily'][$today]['uniq'])) $data['daily'][$today]['uniq'][]=$vid;

    $found=false;
    foreach($data['sessions'] as &$ses){
        if($ses['id']===$sid){$ses['last']=$now;if(!in_array($page,$ses['pages']))$ses['pages'][]=$page;$found=true;break;}
    }unset($ses);
    if(!$found) $data['sessions'][]=['id'=>$sid,'vid'=>$vid,'start'=>$now,'last'=>$now,'pages'=>[$page]];

    $cut=time()-7776000;
    foreach($data['pageViews'] as $k=>$v) if(strtotime($k)<$cut) unset($data['pageViews'][$k]);
    foreach($data['daily'] as $k=>$v) if(strtotime($k)<$cut) unset($data['daily'][$k]);
    $data['sessions']=array_values(array_filter($data['sessions'],function($s)use($cut){return $s['last']>$cut;}));

    saveAnalytics($data);
    out(['success'=>true,'vid'=>$vid]);

case 'get_data':
    if(!authed()) out(['success'=>false,'error'=>'Not authenticated']);
    $data=getAnalytics();$now=time();$today=date('Y-m-d');
    $online=0;
    foreach($data['visitors'] as $v) if($now-$v['last']<300) $online++;
    $td=$data['daily'][$today]??['views'=>0,'uniq'=>[]];
    $tv=0;foreach($data['pageViews'] as $d) $tv+=array_sum($d);
    out(['success'=>true,'data'=>$data,'stats'=>['totalViews'=>$tv,'totalVisitors'=>count($data['visitors']),'todayViews'=>$td['views'],'todayVisitors'=>count($td['uniq']),'onlineNow'=>$online,'totalSessions'=>count($data['sessions'])]]);

case 'reset_data':
    if(!authed()) out(['success'=>false,'error'=>'Not authenticated']);
    saveAnalytics(['visitors'=>[],'pageViews'=>[],'sessions'=>[],'daily'=>[]]);
    out(['success'=>true]);

case 'export_data':
    if(!authed()) out(['success'=>false,'error'=>'Not authenticated']);
    out(['success'=>true,'data'=>getAnalytics()]);

default:
    out(['success'=>false,'error'=>'Unknown action']);
}
