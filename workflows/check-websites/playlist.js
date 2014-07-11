var hooks = require('./hooks');

playlist("Check Websites");
hooks()

workflow("Google", function() {
  open('http://www.google.com')
  assert(1)
})

workflow("Wikipedia", function() {
  open('http://wikipedia.org/wiki/Robots')  
  assert(1)
})
