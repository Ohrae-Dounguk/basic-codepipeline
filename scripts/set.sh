#!/bin/bash

REPOSITORY=/home/ubuntu/git/source

cd $REPOSITORY

mkdir config

aws ssm get-parameters-by-path --path /code_pipeline/development --query Parameters | \
python3 -c '
import json, sys
print("\n".join([param["Name"].rsplit("/", 1)[-1]+"="+param["Value"] for param in json.load(sys.stdin)]))
' > config/.env.development