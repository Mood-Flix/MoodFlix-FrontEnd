#!/bin/sh
mkdir -p output
rsync -av --exclude='output' ./ ./output/
