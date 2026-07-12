Add-Type -AssemblyName 'System.IO.Compression.FileSystem'
$zip = [System.IO.Compression.ZipFile]::OpenRead("$PSScriptRoot\CampusBridge_Complete_Improvement_Roadmap.docx")
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xml = [xml]$reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()
$ns = @{w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
$paragraphs = $xml | Select-Xml -XPath '//w:p' -Namespace $ns
foreach ($p in $paragraphs) {
    $texts = $p.Node | Select-Xml -XPath './/w:t' -Namespace $ns
    $line = ($texts | ForEach-Object { $_.Node.InnerText }) -join ''
    if ($line.Trim()) {
        Write-Output $line
    }
}
