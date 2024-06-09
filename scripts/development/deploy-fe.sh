#!/bin/bash
set -e;

BE_HOST=cchsv.iptime.org;
BE_PORT=33333;
NGINX_SERVER_NAME=cchsv.iptime.org;
WORKING_DIR=/var/webhook/tmp/hmz/packages/apps/fe;
TARGET_DIR=/var/www/$NGINX_SERVER_NAME/html;

cd $WORKING_DIR;

BE_HOST=$BE_HOST BE_PORT=$BE_PORT npm run build:development;

mkdir -p $TARGET_DIR;
mv dist/* $TARGET_DIR;
