#!/usr/bin/env bash
set -e

NPM_TAG=latest
if [ ./development-release.ts ]; then
  NPM_TAG=next
fi

npm run dist
npm run pack

TMPDIR="/tmp/npm-pack-testing.$$"
mkdir "$TMPDIR"
mv *-*.*.*.tgz "$TMPDIR"
cp tests/fixtures/smoke-testing.ts "$TMPDIR"

cd $TMPDIR
npm init -y
npm install --production \
  *-*.*.*.tgz \
  @babel/runtime@7.0.0-beta.39 \
  @types/quick-lru \
  @types/node \
  @types/normalize-package-data \
  @types/xml2js \
  clone-class \
  brolog \
  file-box \
  fs-extra \
  hot-import \
  quick-lru \
  memory-card \
  normalize-package-data \
  rx-queue \
  state-switch \
  typescript \
  "wechaty-puppet@$NPM_TAG" \
  watchdog \
  qr-image \
  xml2js \

./node_modules/.bin/tsc \
  --esModuleInterop \
  --lib esnext \
  --noEmitOnError \
  --noImplicitAny \
  --target es6 \
  --module commonjs \
  smoke-testing.ts

node smoke-testing.js
