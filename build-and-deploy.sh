#!/bin/bash

# clear
ng build --verbose 
# ng build
rm -rf ~/DOCKER_SHARE1/net2/frontend/nginx/wwwroot/*
cp -a dist/ang18-Editor-SupportBlog1/browser/. ~/DOCKER_SHARE1/net2/frontend/nginx/wwwroot/browser
cp -a dist/ang18-Editor-SupportBlog1/server/. ~/DOCKER_SHARE1/net2/frontend/nginx/wwwroot/server