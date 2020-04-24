set mydate=%date:~6,4%-%date:~3,2%-%date:~0,2%
set rar_name= ..\_tingus_setup.exe
set cd_dir=dist
set source_dir=test_runner
echo %rar_name%

cd %cd_dir%
pause

echo Version %mydate% > %source_dir%\readme.txt

"c:\Program Files\WinRAR\WinRAR.exe" a -sfx %rar_name% %source_dir%


REM.... - TEMP - ROLLED OUT IN goodxtests repository . Need to find a better solution
md f:\github\goodxtests\desktop_app_tests\TingusInstall
copy ..\_tingus_setup.exe f:\github\goodxtests\desktop_app_tests\TingusInstall


pause