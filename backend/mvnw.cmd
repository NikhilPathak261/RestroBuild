@echo off
setlocal

set MAVEN_VERSION=3.9.9
set MAVEN_DIR=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%
set MAVEN_CMD=%MAVEN_DIR%\bin\mvn.cmd
set MAVEN_ZIP=%TEMP%\apache-maven-%MAVEN_VERSION%-bin.zip
set MAVEN_URL=https://archive.apache.org/dist/maven/maven-3/%MAVEN_VERSION%/binaries/apache-maven-%MAVEN_VERSION%-bin.zip

if not exist "%MAVEN_CMD%" (
  echo Downloading Apache Maven %MAVEN_VERSION%...
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference='Stop';" ^
    "$zip='%MAVEN_ZIP%';" ^
    "$dest='%USERPROFILE%\.m2\wrapper\dists';" ^
    "New-Item -ItemType Directory -Force -Path $dest | Out-Null;" ^
    "Invoke-WebRequest -Uri '%MAVEN_URL%' -OutFile $zip;" ^
    "Expand-Archive -Force -Path $zip -DestinationPath $dest;" ^
    "Remove-Item -Force $zip"
  if errorlevel 1 exit /b 1
)

"%MAVEN_CMD%" %*
