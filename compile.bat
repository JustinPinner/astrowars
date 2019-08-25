@echo off

set projdir=%CD%

echo For Windows development ensure you have Node and NPM installed
echo (see https://nodejs.org/en/download/)
echo then run
echo    npm install --save-dev webpack 
echo    npm install -D webpack-cli
echo(
echo This project runs on EccentricEngine, so
echo ensure that you have either run
echo    npm install eccentric-engine
echo or cloned the repo from github 
echo    https://github.com/JustinPinner/EccentricEngine
echo( 
echo The file %projdir%\custom\engine.js contains examples of both import styles for EccentricEngine
echo(
echo You may also need to run
echo    npm install uuid
echo if you get build failures from EccentricEngine saying that uuid/v4 can't be resolved
echo( 
echo Checking for old builds...
IF EXIST %projdir%\dist (
    echo Found. Removing...
    rmdir /S /Q %projdir%\dist
    echo Done!
)
echo( 
echo Runnning webpack...
cd %projdir%
call npm run build
echo( 
echo copying non-bundled images...
cd %projdir%
md %projdir%\dist\assets
copy %projdir%\assets\image\*.* %projdir%\dist\assets\
echo( 
echo copying html...
copy %projdir%\html\*.* %projdir%\dist\
echo( 
cd %projdir%
echo Finished!
echo copy and paste the path below in your browser to play;
echo file://%CD%/dist/default.html
