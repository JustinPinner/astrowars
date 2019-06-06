#!/bin/bash

# ensure you have run 
#  npm install eccentric-engine
#  npm install --save-dev webpack 
#  npm install -D webpack-cli
# before compiling

echo 'runnning webpack...'
npm run build

echo 'copying non-bundled images...'
mkdir -p dist/assets
cp assets/image/* dist/assets
echo 'copying html...'
cp html/* dist/.

echo 'done!'
