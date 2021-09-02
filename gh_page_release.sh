#!/bin/sh

find . -type f -not -name 'gh_page_release.sh'-delete

cp build/* .
