// Simple content server
var express = require('express');
var app = express();
var port = 3000;

// simple logger
app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

app.use(express.static(__dirname + '/app'));

console.log('http://localhost:%s', port);

app.listen(port);
