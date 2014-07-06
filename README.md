## Angelo - (Repeatable) Mocha Test Runner

- Useful for running (and re-running!) mocha test suites.

- Simple API. Load and play -- that's all you need to know!

- Open source. (MIT License)


### Install

    npm install angelo

### Example usage
 
    Angelo = require('angelo').Angelo
    angelo = new Angelo()
    angelo.load("/path/to/test.js")
    angelo.play()

### FAQ

#### Why "Angelo"?

[Angelo Moriondo](http://en.wikipedia.org/wiki/Angelo_Moriondo) is the inventor of the first espresso machine.

#### Okay, but why use this library?

You might like Angelo if:

  1) You [use mocha programmatically](https://github.com/visionmedia/mocha/wiki/Using-mocha-programmatically).

  **and**
  
  2) You want [re-run a test suite multiple times.](https://github.com/visionmedia/mocha/issues/736).

[TJ says it best:](https://github.com/visionmedia/mocha/pull/977#issuecomment-24460957):

    "IMO this should be done with complete process isolation, you could use json-stream or the json reporter and exec(), plus then that keeps mocha lighter. win-win situation :D" - TJ 

That's exactly what Angelo does! :-)

Detail:

Mocha has an issue with re-running test suites within the same process. This is because Mocha uses a call to "require()" to load test files. When require() is called, however, files are cached and only loaded once. A side-effect of this reliance on require() is that tests are only ever run once. 

As a workaround, you could clear the cache before re-loading, but this isn't foolproof. Instead, Angelo does what TJ recommends -- it run Mocha in a child process and receives results via the JSON stream reporter.
