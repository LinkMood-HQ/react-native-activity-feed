set -exu
yarn build
sed -e 's="main": "./src/index.js",="main": "./lib/index.js",=g' -i.bak package.json
rm package.json.bak
