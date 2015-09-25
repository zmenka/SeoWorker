#!/bin/bash

SCRIPTS_DIR=/home/abryazgin/www/fun/seo-worker/server/db/postgres/procs
DATABASE_NAME=seo

for file in $SCRIPTS_DIR/*.sql
    do sudo -u postgres psql $DATABASE_NAME -f $file
done