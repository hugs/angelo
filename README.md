## Angelo - A (rerunnable) Mocha test runner

- Useful for running (and rerunning!) Mocha test suites.

- Simple API. Load and play -- that's all you need to know!


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
  
  2) You want to [rerun a test suite multiple times](https://github.com/visionmedia/mocha/issues/736).

[TJ says it best](https://github.com/visionmedia/mocha/pull/977#issuecomment-24460957):

    "IMO this should be done with complete process isolation, you could use 
    json-stream or the json reporter and exec(), plus then that keeps mocha 
    lighter. win-win situation :D" - TJ 

And that's what Angelo does!

Mocha has an issue with re-running test suites within the same process. This is because Mocha uses a call to `require` to load test files. When `require` is called, however, files are cached and only loaded once. A side-effect of this reliance on `require` is that tests are only ever run once. 

As a workaround, you could [clear the cache](https://github.com/visionmedia/mocha/pull/266#issuecomment-11794765) of loaded modules before reloading, but this isn't foolproof. Instead, Angelo does what TJ recommends -- it runs Mocha in a child process and receives results via the JSON stream reporter.

Angelo uses `spawn`, instead of `exec`, so that results can be streamed as they happen. Using `exec` would buffer all results until all the tests were completed.
