$ErrorActionPreference = 'Stop'

$protocolKey = 'HKCU:\Software\Classes\activepauseoverlay'
$commandKey = Join-Path $protocolKey 'shell\open\command'
$overlayPath = Join-Path $PSScriptRoot 'ActivePauseOverlay\publish\ActivePauseOverlay.exe'

if (-not (Test-Path -LiteralPath $commandKey)) {
    Write-Output 'The activepauseoverlay protocol is not registered.'
    return
}

$registeredCommand = (Get-Item -LiteralPath $commandKey).GetValue('')
$expectedCommand = '"{0}" "%1"' -f $overlayPath
if ($registeredCommand -ne $expectedCommand) {
    throw 'The activepauseoverlay protocol points to a different command; it was not removed.'
}

Remove-Item -LiteralPath $protocolKey -Recurse -Force
Write-Output 'Removed the activepauseoverlay protocol for the current Windows user.'
