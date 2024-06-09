#!/bin/bash
set -e;

BE_PORT=3333;
WORKING_DIR=/var/webhook/tmp/hmz/packages/apps/be;

cd $WORKING_DIR;

BE_PORT=$BE_PORT npm run build:development;
