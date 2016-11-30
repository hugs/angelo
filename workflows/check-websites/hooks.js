var cabbie = require('cabbie');
var sleep = require('sleep');
var childProcess = require('child_process');
var chromeDriverWrapper = require('chromedriver');
var binPath = chromeDriverWrapper.path;
var childArgs = [
  'test-type',
];

SLEEP = 1

module.exports = function(){
  beforeEach(function(){
    console.log("Starting chromedriver...")
    child = childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
      // handle results
    });
    console.log('PID: ' + child.pid)
  
    console.log('beforeEach...')
    console.log('Sleeping for ' + SLEEP + ' seconds...');
    sleep.sleep(SLEEP);
    console.log('Done sleeping...')  
  
    console.log("Launching browser...")
    var chromeOptions = {'args':['test-type']};
    var capabilities = {chromeOptions:chromeOptions};

    driver = cabbie('http://127.0.0.1:9515/', 
      capabilities, 
      {mode: cabbie.Driver.MODE_SYNC}
    );
    browser = driver.browser();
    activeWindow = browser.activeWindow();
  
    open = function(url) {
      activeWindow.navigator().setUrl(url);
    }
    
  })

  afterEach(function(){
    console.log('Sleeping for ' + SLEEP + ' seconds...');
    sleep.sleep(SLEEP);
    console.log('Done sleeping...'); 
    
    console.log("Stopping browser ...")
    activeWindow.close();
    driver.dispose();
  
    console.log('Sleeping for ' + SLEEP + ' seconds...');
    sleep.sleep(SLEEP);
    console.log('Done sleeping...');  
  
    console.log('afterEach...');  
    console.log('Stopping chromedriver...');
    child.kill();   
  })
}
