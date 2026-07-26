[CmdletBinding()]
param(
    [Parameter()]
    [ValidatePattern('^v\d+\.\d+\.\d+$')]
    [string]$Version = 'v1.1.1'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$rootPrefix = $repoRoot.TrimEnd('\') + '\'
$releaseDirectory = [IO.Path]::GetFullPath((Join-Path $repoRoot "release\$Version"))
$artifactDirectory = [IO.Path]::GetFullPath((Join-Path $repoRoot 'artifacts'))
$archivePath = [IO.Path]::GetFullPath((Join-Path $artifactDirectory "BlockAd-SR-$Version.zip"))
$artifactModule = [IO.Path]::GetFullPath((Join-Path $artifactDirectory 'BlockAd.Unified.sgmodule'))
$checksumPath = [IO.Path]::GetFullPath((Join-Path $artifactDirectory 'SHA256SUMS.txt'))

function Assert-RepositoryPath {
    param([Parameter(Mandatory)][string]$Path)

    $fullPath = [IO.Path]::GetFullPath($Path)
    if (-not $fullPath.StartsWith(
        $rootPrefix,
        [StringComparison]::OrdinalIgnoreCase
    )) {
        throw "Refusing to operate outside the repository: $fullPath"
    }
}

foreach ($target in @(
    $releaseDirectory,
    $artifactDirectory,
    $archivePath,
    $artifactModule,
    $checksumPath
)) {
    Assert-RepositoryPath -Path $target
}

if (-not (Test-Path -LiteralPath $releaseDirectory -PathType Container)) {
    throw "Release directory does not exist: $releaseDirectory"
}

$releaseUnified = Join-Path $releaseDirectory 'BlockAd.Unified.sgmodule'
$releaseChecksums = Join-Path $releaseDirectory 'SHA256SUMS.txt'
foreach ($required in @($releaseUnified, $releaseChecksums)) {
    if (-not (Test-Path -LiteralPath $required -PathType Leaf)) {
        throw "Required release file is missing: $required"
    }
}

New-Item -ItemType Directory -Path $artifactDirectory -Force | Out-Null
foreach ($exactFile in @($archivePath, $artifactModule, $checksumPath)) {
    if (Test-Path -LiteralPath $exactFile -PathType Leaf) {
        Remove-Item -LiteralPath $exactFile -Force
    }
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$fixedTimestamp = [DateTimeOffset]::Parse(
    '2026-07-26T00:00:00Z',
    [Globalization.CultureInfo]::InvariantCulture
)
$releaseFiles = @(
    Get-ChildItem -LiteralPath $releaseDirectory -Recurse -File |
        Sort-Object FullName
)
$zip = [IO.Compression.ZipFile]::Open(
    $archivePath,
    [IO.Compression.ZipArchiveMode]::Create
)
try {
    foreach ($file in $releaseFiles) {
        $relative = $file.FullName.Substring(
            $releaseDirectory.TrimEnd('\').Length + 1
        ).Replace('\', '/')
        $entry = $zip.CreateEntry(
            $relative,
            [IO.Compression.CompressionLevel]::Optimal
        )
        $entry.LastWriteTime = $fixedTimestamp
        $sourceStream = [IO.File]::OpenRead($file.FullName)
        $entryStream = $entry.Open()
        try {
            $sourceStream.CopyTo($entryStream)
        }
        finally {
            $entryStream.Dispose()
            $sourceStream.Dispose()
        }
    }
}
finally {
    $zip.Dispose()
}
Copy-Item -LiteralPath $releaseUnified -Destination $artifactModule

$zip = [IO.Compression.ZipFile]::OpenRead($archivePath)
try {
    $actualEntries = @(
        $zip.Entries |
            Where-Object { $_.Name } |
            ForEach-Object { $_.FullName.Replace('\', '/') } |
            Sort-Object
    )
    foreach ($entry in $actualEntries) {
        if (
            $entry.StartsWith('/') -or
            $entry -match '(^|/)\.\.(/|$)' -or
            $entry -match '^[A-Za-z]:'
        ) {
            throw "ZIP contains an unsafe path: $entry"
        }
    }
    $expectedEntries = @(
        Get-ChildItem -LiteralPath $releaseDirectory -Recurse -File |
            ForEach-Object {
                $_.FullName.Substring(
                    $releaseDirectory.TrimEnd('\').Length + 1
                ).Replace('\', '/')
            } |
            Sort-Object
    )
    if ([string]::Join("`n", $actualEntries) -ne [string]::Join("`n", $expectedEntries)) {
        throw 'ZIP entries do not match the release directory'
    }
}
finally {
    $zip.Dispose()
}

$archiveHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
$moduleHash = (Get-FileHash -LiteralPath $artifactModule -Algorithm SHA256).Hash.ToLowerInvariant()
$checksumLines = @(
    "$archiveHash  BlockAd-SR-$Version.zip"
    "$moduleHash  BlockAd.Unified.sgmodule"
)
[IO.File]::WriteAllText(
    $checksumPath,
    ([string]::Join("`n", $checksumLines) + "`n"),
    [Text.UTF8Encoding]::new($false)
)

[ordered]@{
    version = $Version
    archive = "artifacts/BlockAd-SR-$Version.zip"
    archiveSha256 = $archiveHash
    module = 'artifacts/BlockAd.Unified.sgmodule'
    moduleSha256 = $moduleHash
    filesInArchive = $actualEntries.Count
    checksums = 'artifacts/SHA256SUMS.txt'
} | ConvertTo-Json
