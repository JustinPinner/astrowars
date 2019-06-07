#!/bin/bash

# ensure you have run 
#  npm install eccentric-engine
#  npm install --save-dev webpack 
#  npm install -D webpack-cli
# before compiling

echo 'removing previous built assets...'
rm -rf dist

echo 'runnning webpack...'
npm run build

echo 'copying non-bundled images...'
mkdir -p dist/assets
cp assets/image/* dist/assets
echo 'copying html...'
cp html/* dist/.

echo 'done!'
echo ''
PWD=$(pwd)
echo 'go to the path below in your browser to play;'
echo "file://$PWD/dist/default.html"
