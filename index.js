//  Packages
var core = require('@actions/core')
var execSync = require('child_process').execSync
code = execSync('npm install exeq --save')
var exeq = require('exeq')

//  Input variables
var ARGS = core.getInput('args')

//  Installs Serverless and specified plugins
async function installServerlessAndPlugins() {
  await exeq(
    'echo Installing Serverless and plugins...',
    'npm i -g serverless@1.66.0',
    'npm i serverless-python-requirements',
    'npm i serverless-plugin-canary-deployments',
    'sls -v',
    'pwd',
    'sed -i "6i Os.tmpDir=Os.tmpdir;" SSID-Backend/node_modules/hapi/lib/defaults.js'
  )
}

//  Runs Serverless deploy using SERVERLESS_ACCESS_KEY if specified, else AWS Credentials
async function runServerlessDeploy() {
  await exeq(
    `sed -i "6i Os.tmpDir=Os.tmpdir;" SSID-Backend/node_modules/hapi/lib/defaults.js`,
    `echo Running sls deploy ${ARGS}...`,
    `if [ ${process.env.AWS_ACCESS_KEY_ID} ] && [ ${process.env.AWS_SECRET_ACCESS_KEY} ]; then
      sls config credentials --provider aws --key ${process.env.AWS_ACCESS_KEY_ID} --secret ${process.env.AWS_SECRET_ACCESS_KEY} ${ARGS}
    fi`,
    `sls deploy ${ARGS}`
  )
}

//  Runs all functions sequentially
async function handler() {
  try {
    await installServerlessAndPlugins()
    await runServerlessDeploy()
  } catch (error) {
    core.setFailed(error.message);
  }
}

//  Main function
if (require.main === module) {
  handler()
}
