#!/usr/bin/env bash
set -e

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
  @types/lru-cache \
  @types/node \
  @types/normalize-package-data \
  @types/xml2json \
  clone-class \
  brolog \
  file-box \
  fs-extra \
  hot-import \
  lru-cache \
  memory-card \
  normalize-package-data \
  rx-queue \
  state-switch \
  typescript \
  wechaty-puppet@next \
  watchdog \
  qr-image \
  xml2json \

./node_modules/.bin/tsc \
  --esModuleInterop \
  --lib esnext \
  --noEmitOnError \
  --noImplicitAny \
  --target es6 \
  --module commonjs \
  smoke-testing.ts

node smoke-testing.js
