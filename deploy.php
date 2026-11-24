<?php
/**
 * Automated Deployment Webhook for CZNS Mobile Store
 * Hosted on cPanel / CloudLinux Passenger (czns.newquettaautos.com)
 *
 * Triggered by GitHub Actions on successful release publication.
 */

// Prevent timeout
set_time_limit(600);
ini_set('max_execution_time', '600');
ignore_user_abort(true);

// Deployment Security Token (shared between GitHub Actions secret and this webhook)
define('DEPLOY_SECRET', 'czns_deploy_key_2026_a9b8c7');

header('Content-Type: application/json; charset=utf-8');

$providedSecret = $_REQUEST['secret'] ?? $_SERVER['HTTP_X_DEPLOY_SECRET'] ?? '';
if (!hash_equals(DEPLOY_SECRET, (string)$providedSecret)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized: Invalid deployment token']);
    exit;
}

$startTime = microtime(true);
$baseDir = __DIR__;
$tarFile = $baseDir . '/czns-release.tar.gz';
$releaseUrl = $_REQUEST['url'] ?? 'https://github.com/mrshahabuddinsheikh/CZNS/releases/download/latest/czns-release.tar.gz';

// Optional: preserve live SQLite database before extraction if already exists
$dbDir = $baseDir . '/apps/api/data';
$liveDb = $dbDir . '/czns.sqlite';
$backupDb = $baseDir . '/data_backup_live.sqlite';
if (file_exists($liveDb)) {
    copy($liveDb, $backupDb);
}

// 1. Download release tarball
$ch = curl_init($releaseUrl);
$fp = fopen($tarFile, 'wb');
curl_setopt_array($ch, [
    CURLOPT_FILE => $fp,
    CURLOPT_HEADER => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 5,
    CURLOPT_TIMEOUT => 300,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_USERAGENT => 'CZNS-cPanel-Deployer/1.0',
]);

$curlSuccess = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);
fclose($fp);

if (!$curlSuccess || $httpCode >= 400 || !file_exists($tarFile) || filesize($tarFile) < 1000) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to download release tarball',
        'http_code' => $httpCode,
        'curl_error' => $curlError,
        'filesize' => file_exists($tarFile) ? filesize($tarFile) : 0,
    ]);
    if (file_exists($tarFile)) unlink($tarFile);
    exit;
}

// 2. Extract production archive
$tarCmd = 'tar -xzf ' . escapeshellarg($tarFile) . ' -C ' . escapeshellarg($baseDir) . ' 2>&1';
$output = [];
$returnCode = 0;
exec($tarCmd, $output, $returnCode);

// Cleanup tar file
if (file_exists($tarFile)) {
    unlink($tarFile);
}

if ($returnCode !== 0) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to extract release archive',
        'tar_output' => implode("\n", $output),
        'code' => $returnCode,
    ]);
    exit;
}

// Restore live database if backup was created and new one was empty or older
if (file_exists($backupDb)) {
    if (!file_exists($liveDb) || filesize($liveDb) < filesize($backupDb)) {
        if (!is_dir($dbDir)) {
            mkdir($dbDir, 0755, true);
        }
        copy($backupDb, $liveDb);
    }
}

// 3. Touch Phusion Passenger restart.txt
$tmpDir = $baseDir . '/tmp';
if (!is_dir($tmpDir)) {
    mkdir($tmpDir, 0755, true);
}
$restartFile = $tmpDir . '/restart.txt';
touch($restartFile);

$duration = round(microtime(true) - $startTime, 2);

echo json_encode([
    'success' => true,
    'message' => 'CZNS application released and Passenger restarted successfully',
    'duration_seconds' => $duration,
    'timestamp' => date('c'),
    'restart_file' => $restartFile,
]);
