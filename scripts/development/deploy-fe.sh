#!/bin/bash
set -e;

be_host=cchsv.iptime.org
be_port=33333
nginx_server_name=cchsv.iptime.org;
working_dir=/var/webhook/tmp/hmz/packages/apps/fe;
target_dir=/var/www/$nginx_server_name/html;

cd $working_dir;

BE_HOST=$be_host BE_PORT=$be_port npm run build:development;

rm -rf $target_dir;
mkdir -p $target_dir;
mv dist/* $target_dir;
