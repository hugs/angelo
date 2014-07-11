var getBrowser = require('cabbie');
var teddybear = require('teddybear');
var childProcess = require('child_process');
var chromeDriverWrapper = require('chromedriver');
var binPath = chromeDriverWrapper.path;
var childArgs = [
  'test-type',
];

SLEEP = 1000

module.exports = function(){
  beforeEach(function(){
    console.log("Starting chromedriver...")
    child = childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
      // handle results
    });
    console.log('PID: ' + child.pid)
  
    console.log('beforeEach...')
    console.log('Sleeping for ' + SLEEP / 1000 + ' seconds...');
    teddybear(SLEEP);  
    console.log('Done sleeping...')  
  
    console.log("Launching browser...")
    var chromeOptions = {'args':['test-type']};
    var capabilities = {chromeOptions:chromeOptions};
    browser = getBrowser('http://127.0.0.1:9515/',
      capabilities, 
      { mode: 'sync', debug: false }
    );
  
    open = function(url) {
      browser.navigateTo(url);
    }
    
  })

  afterEach(function(){
    console.log('Sleeping for ' + SLEEP / 1000 + ' seconds...');
    teddybear(SLEEP);  
    console.log('Done sleeping...'); 
    
    console.log("Stopping browser ...")
    browser.dispose()
  
    console.log('Sleeping for ' + SLEEP / 1000 + ' seconds...');
    teddybear(SLEEP);  
    console.log('Done sleeping...');  
  
    console.log('afterEach...');  
    console.log('Stopping chromedriver...');
    child.kill();   
  })
}
