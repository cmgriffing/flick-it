#!/bin/bash

cd player || exit;

yarn build;

cd ..;

mv ./player/dist ./dist/player

exit 0
