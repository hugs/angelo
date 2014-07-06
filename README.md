### Angelo - (Repeatable) Mocha Test Runner

## Awesome features!

- Useful for being able to run (and re-run!) your mocha test suites

- Simple API. Load and play -- that's all you need to know!

- Open source. (MIT License)


## Install

### Local

    npm install angelo

### Everywhere

    npm install -g angelo

## Example usage

### As a Library

#### Default
 
    Angelo = require('angelo').Angelo
    var angelo = new Angelo()
    angelo.load("/path/to/workflows/playlist.js")
    angelo.play()


### From the Command Line

      angelo /path/to/workflows/playlist.js

## FAQ

### Why "Angelo"?

[Angelo Moriondo](http://en.wikipedia.org/wiki/Angelo_Moriondo) invented one of the first espresso machines.

### Okay, but why use this library?

You might like Angelo if:

  1) You [use mocha programmatically](https://github.com/visionmedia/mocha/wiki/Using-mocha-programmatically), instead of the mocha command line tool.

  **and**
  
  2) You want to easily [re-run test suites](https://github.com/visionmedia/mocha/issues/736).


[TJ says it best:](https://github.com/visionmedia/mocha/pull/977#issuecomment-24460957):

    "IMO this should be done with complete process isolation, you could use json-stream or the json reporter and exec(), plus then that keeps mocha lighter. win-win situation :D" - TJ 

That's exactly what angelo does! :-)

Detail:

Mocha has an issue with re-running test suites within the same process. This is because Mocha uses a call to "require()" to load test files. When require() is called, however, files are cached and only loaded once. A side-effect of this reliance on require() is that tests are only ever run once. 

If you use Mocha through its API, you could clear the cache before re-loading, but this isn't fool-proof. Instead, TJ recommends using a child process and getting results via the JSON stream stream reporter. This is exactly what Angelo does!
