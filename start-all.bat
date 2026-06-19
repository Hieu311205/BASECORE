@echo off
setlocal
set ROOT=%~dp0

echo ========================================
echo  Starting BaseCore Project
echo ========================================
echo.

echo [0/6] Building solution...
dotnet build "%ROOT%BaseCore.sln" --configuration Debug -v quiet
if %errorlevel% neq 0 (
    echo BUILD FAILED. Fix errors and try again.
    pause
    exit /b 1
)
echo Build OK.
echo.

echo [1/6] Starting Auth Service (port 5002)...
start "AuthService" cmd /k "cd /d %ROOT%BaseCore.AuthService && dotnet run --no-build"

echo [2/6] Starting API Service (port 5001)...
start "APIService" cmd /k "cd /d %ROOT%BaseCore.APIService && dotnet run --no-build"

echo [3/6] Starting Audit Log (port 5004)...
start "AuditLog" cmd /k "cd /d %ROOT%BaseCore.AuditLog && dotnet run --no-build"

echo [4/6] Starting API Gateway (port 5000)...
start "ApiGateway" cmd /k "cd /d %ROOT%BaseCore.ApiGateway && dotnet run --no-build"

echo [5/6] Starting React Admin (port 3000)...
start "WebClient" cmd /k "cd /d %ROOT%BaseCore.WebClient && npm run dev"

echo [6/6] Starting User Frontend (port 5173)...
start "HexaShop" cmd /k "cd /d %ROOT%templatemo_571_hexashop && npm run dev"

echo.
echo ========================================
echo  All services started!
echo ========================================
echo  Gateway:        http://localhost:5000
echo  API Service:    http://localhost:5001/swagger
echo  Auth Service:   http://localhost:5002/swagger
echo  Audit Log:      http://localhost:5004/swagger
echo  Admin (React):  http://localhost:3000
echo  User Frontend:  http://localhost:5173
echo ========================================
echo.
pause
