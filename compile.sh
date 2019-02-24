#!/bin/bash

echo 'runnning webpack...'
npm run build

echo 'copying non-bundled images...'
mkdir -p dist/assets
cp assets/image/* dist/assets

echo 'done!'
