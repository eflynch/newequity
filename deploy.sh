#!/usr/bin/env bash

cd newquity
npm install
npm run build
mkdir -p ../docs
cp -r build/* ../docs
