git pull 
yarn build
sed -i '1i#!/usr/bin/env node\' dist/index.js
sudo systemctl restart rainbow-tracker
