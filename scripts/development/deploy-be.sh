#!/bin/bash
set -e;

be_port=3333;
working_dir=/var/webhook/tmp/hmz/packages/apps/be;

cd $working_dir;

BE_PORT=$be_port npm run build:development;
