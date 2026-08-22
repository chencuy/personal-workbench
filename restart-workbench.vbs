Option Explicit

Dim shell, fileSystem, scriptDirectory, command, argument
Set shell = CreateObject("WScript.Shell")
Set fileSystem = CreateObject("Scripting.FileSystemObject")

scriptDirectory = fileSystem.GetParentFolderName(WScript.ScriptFullName)
command = QuoteArgument(scriptDirectory & "\restart-workbench.cmd")

For Each argument In WScript.Arguments
  command = command & " " & QuoteArgument(argument)
Next

shell.Run command, 0, False

Function QuoteArgument(value)
  QuoteArgument = Chr(34) & Replace(CStr(value), Chr(34), Chr(34) & Chr(34)) & Chr(34)
End Function
