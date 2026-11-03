$ErrorActionPreference = 'Stop'

$protocolKey = 'HKCU:\Software\Classes\activepauseoverlay'
$commandKey = Join-Path $protocolKey 'shell\open\command'
$overlayPath = Join-Path $PSScriptRoot 'ActivePauseOverlay\publish\ActivePauseOverlay.exe'

if (-not (Test-Path -LiteralPath $overlayPath -PathType Leaf)) {
    throw "Published overlay executable was not found: $overlayPath"
}

$command = '"{0}" "%1"' -f $overlayPath
New-Item -Path $commandKey -Force | Out-Null
Set-Item -Path $protocolKey -Value 'URL:ActivePauseWallpaper overlay launcher'
New-ItemProperty -Path $protocolKey -Name 'URL Protocol' -PropertyType String -Value '' -Force | Out-Null
Set-Item -Path $commandKey -Value $command

Write-Output 'Registered activepauseoverlay for the current Windows user.'
