@echo off
chcp 65001 >nul
echo ════════════════════════════════════════════════════════
echo              TripNow 小程序本地一键发布
echo ════════════════════════════════════════════════════════
echo.

:: 检查私钥文件
if not exist "private.wx86331a99c51be758.key" (
    echo [错误] 找不到私钥文件！
    echo 请将微信公众平台下载的私钥重命名为:
    echo   private.wx86331a99c51be758.key
    echo 并放到 weixin 目录下
    echo.
    pause
    exit /b 1
)

:: 显示选项
echo 请选择发布方式:
echo   [1] 预览版 (生成二维码，手机扫码预览)
echo   [2] 上传版 (上传代码，需手动发布审核)
echo   [3] 构建并打开微信开发者工具
echo.

set /p choice=请输入选项 (1/2/3):

echo.
echo ════════════════════════════════════════════════════════
echo.

if "%choice%"=="1" (
    echo [1/3] 构建项目...
    call npm run build:weapp
    if errorlevel 1 (
        echo [错误] 构建失败！
        pause
        exit /b 1
    )
    
    echo [2/3] 上传预览版...
    set MINIPROGRAM_APPID=wx86331a99c51be758
    set MINIPROGRAM_PRIVATE_KEY_PATH=%~dp0private.wx86331a99c51be758.key
    call npm run upload:preview
    
) else if "%choice%"=="2" (
    echo [1/3] 构建项目...
    call npm run build:weapp
    if errorlevel 1 (
        echo [错误] 构建失败！
        pause
        exit /b 1
    )
    
    echo [2/3] 上传代码...
    set MINIPROGRAM_APPID=wx86331a99c51be758
    set MINIPROGRAM_PRIVATE_KEY_PATH=%~dp0private.wx86331a99c51be758.key
    call npm run upload:upload
    
    echo.
    echo [3/3] 请登录微信公众平台发布体验版或提交审核
    start https://mp.weixin.qq.com/
    
) else if "%choice%"=="3" (
    echo [1/2] 构建项目...
    call npm run build:weapp
    if errorlevel 1 (
        echo [错误] 构建失败！
        pause
        exit /b 1
    )
    
    echo [2/2] 打开微信开发者工具...
    :: 尝试不同路径
    if exist "C:\Program Files (x86)\Tencent\微信web开发者工具\微信web开发者工具.exe" (
        start "" "C:\Program Files (x86)\Tencent\微信web开发者工具\微信web开发者工具.exe" --project "%~dp0dist"
    ) else if exist "%LOCALAPPDATA%\微信web开发者工具\微信web开发者工具.exe" (
        start "" "%LOCALAPPDATA%\微信web开发者工具\微信web开发者工具.exe" --project "%~dp0dist"
    ) else (
        echo [警告] 未找到微信开发者工具，请手动打开
        echo 项目路径: %~dp0dist
        pause
    )
    
) else (
    echo [错误] 无效选项
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════
echo                    发布完成！
echo ════════════════════════════════════════════════════════
echo.
pause
