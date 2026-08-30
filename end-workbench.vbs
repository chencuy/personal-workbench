Option Explicit

Dim shell, fileSystem, scriptDirectory, command
Set shell = CreateObject("WScript.Shell")
Set fileSystem = CreateObject("Scripting.FileSystemObject")

scriptDirectory = fileSystem.GetParentFolderName(WScript.ScriptFullName)
shell.Environment("PROCESS")("WORKBENCH_DIR") = scriptDirectory
command = "powershell.exe -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command " & QuoteArgument("$root = [IO.Path]::GetFullPath($env:WORKBENCH_DIR).TrimEnd('\'); Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like ('*' + $root + '*') -and $_.CommandLine -match '[\\/]vite(\.js)?' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }")
shell.Run command, 0, False

Function QuoteArgument(value)
  QuoteArgument = Chr(34) & Replace(CStr(value), Chr(34), Chr(34) & Chr(34)) & Chr(34)
End Function
