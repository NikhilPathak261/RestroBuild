@echo off
setlocal
set "ROOT_DIR=%CD%"

if "%VERIFY_DB_URL%"=="" set "VERIFY_DB_URL=jdbc:mysql://localhost:3306/restrobuild_test"
set "DB_URL=%VERIFY_DB_URL%"
if "%DB_USERNAME%"=="" set "DB_USERNAME=root"
if "%E2E_BACKEND_PORT%"=="" set "E2E_BACKEND_PORT=18080"
if "%E2E_FRONTEND_PORT%"=="" set "E2E_FRONTEND_PORT=5174"

if "%DB_PASSWORD%"=="" (
  echo DB_PASSWORD must be set as an environment variable before running verify.bat.
  exit /b 1
)

if "%JWT_SECRET%"=="" (
  echo JWT_SECRET must be set as an environment variable before running verify.bat.
  exit /b 1
)

echo Creating isolated test database...
echo Using verification database: %DB_URL%
pushd frontend
call npm.cmd run create:test-db
if errorlevel 1 exit /b 1
popd

echo Running backend tests...
set "BACKEND_TARGET=%ROOT_DIR%\backend\target"
if exist "%BACKEND_TARGET%" powershell -NoProfile -ExecutionPolicy Bypass -Command "Remove-Item -LiteralPath $env:BACKEND_TARGET -Recurse -Force -ErrorAction Stop"
if errorlevel 1 exit /b 1
pushd backend
call mvnw.cmd clean test
if errorlevel 1 exit /b 1

echo Packaging backend...
popd
set "BACKEND_TARGET=%ROOT_DIR%\backend\target"
pushd backend
call mvnw.cmd -DskipTests package
if errorlevel 1 exit /b 1
popd

echo Running frontend lint...
pushd frontend
call npm.cmd run lint
if errorlevel 1 exit /b 1

echo Running frontend tests...
call npm.cmd test
if errorlevel 1 exit /b 1

echo Building frontend...
call npm.cmd run build
if errorlevel 1 exit /b 1

echo Running Playwright end-to-end tests...
call npm.cmd run test:e2e
if errorlevel 1 exit /b 1
popd

echo RestroBuild verification passed.
endlocal
exit /b 0
