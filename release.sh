#!/bin/bash
eval yarn bump

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

echo $PACKAGE_VERSION

cp="gh release create v$PACKAGE_VERSION --notes \"v$PACKAGE_VERSION\""

echo $cp

eval "$cp"