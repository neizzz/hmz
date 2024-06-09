#!/bin/bash

BE_PORT=3333;
WORKING_DIR=/var/webhook/tmp/hmz/packages/apps/be;

cd $WORKING_DIR;

npm install;
BE_PORT=$BE_PORT npm run build;





