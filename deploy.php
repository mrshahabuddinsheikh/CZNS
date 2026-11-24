<?php
/**
 * Automated Deployment Webhook for CZNS Mobile Store
 * Hosted on cPanel / CloudLinux Passenger (czns.newquettaautos.com)
 *
 * Triggered by GitHub Actions on successful release publication.
 */

// Prevent timeout
set_time_limit(300);
ini_set('max_execution_time', '300');
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

// 1. Download release tarball via system curl (handles 302 redirects & SSL reliably)
$dlCmd = 'curl -s -L -k -o ' . escapeshellarg($tarFile) . ' ' . escapeshellarg($releaseUrl) . ' 2>&1';
$dlOutput = [];
$dlRet = 0;
exec($dlCmd, $dlOutput, $dlRet);

clearstatcache(true, $tarFile);
$fileSize = file_exists($tarFile) ? filesize($tarFile) : 0;

if ($dlRet !== 0 || !file_exists($tarFile) || $fileSize < 1000) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to download release tarball',
        'curl_exit_code' => $dlRet,
        'curl_output' => implode("\n", $dlOutput),
        'filesize' => $fileSize,
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

// 3. Kill any previous backend process and touch Phusion Passenger restart.txt
exec('pkill -f "czns.newquettaautos.com/apps/api" 2>&1');
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
    'download_size' => $fileSize,
]);
