param(
  [int]$Port = 8000,
  [string]$Root = (Resolve-Path ".").Path
)

$prefix = "http://localhost:$Port/"
Add-Type -AssemblyName System.Net.HttpListener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
  Write-Host "Preview URL: $prefix"
} catch {
  Write-Host "Failed to start server: $($_.Exception.Message)"
  exit 1
}

function Get-ContentType([string]$file) {
  switch([System.IO.Path]::GetExtension($file).ToLower()) {
    '.html' { 'text/html; charset=utf-8' }
    '.css'  { 'text/css; charset=utf-8' }
    '.js'   { 'application/javascript; charset=utf-8' }
    '.svg'  { 'image/svg+xml' }
    '.json' { 'application/json; charset=utf-8' }
    '.txt'  { 'text/plain; charset=utf-8' }
    default { 'application/octet-stream' }
  }
}

while ($true) {
  $context = $listener.GetContext()
  $req = $context.Request
  $resp = $context.Response
  $path = $req.Url.AbsolutePath.TrimStart('/')

  if ([string]::IsNullOrEmpty($path)) { $path = 'index.html' }
  $file = Join-Path $Root $path

  if (Test-Path $file) {
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $resp.ContentType = Get-ContentType $file
    $resp.StatusCode = 200
    $resp.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $resp.StatusCode = 404
    $msg = "Not Found"
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
    $resp.OutputStream.Write($bytes,0,$bytes.Length)
  }
  $resp.Close()
}