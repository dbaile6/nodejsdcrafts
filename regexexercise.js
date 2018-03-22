var homeURL = 'https://en.wikipedia.org/wiki/List_of_Home_Movies_episodes';
var homeTXT = 'homeMovies.txt';
var regex = require('./main');
var request = require('request-promise');
var fs = require('fs');
var promisify = require('util').promisify
var rawData = '';
var readFile = promisify(fs.readFile);
var writeFile = promisify(fs.writeFile);

var regexpression =
    html: /^<td id="ep" style="[a-zA-Z0-9: -]+">"<a href="[\/a-zA-Z0-9_() ]+" title="[a-zA-Z0-9 ()]+">([a-zA-Z0-9 ]+)<\/a>"<\/td>/
    stocks : /^[a-zA-Z]{1,5}$/,
    credit : /^[0-9]{4}-?[0-9]{4}-?[0-9]{4}-?[0-9]{4}$/,
    links: /^https?:\/\/(www\.)?[a-zA-Z0-9]+\.[A-Za-z]{1,3}\/?/,


request({
    "method":"GET", 
    "url": url,
})
.then(function(body) {
    return writeFile(file, body)
})
.then (function(body) {
    return readFile(file)
})
.then (function(file) {
    var file = file.toString()
    var matches = file.match(regexpression.html);
    console.log(matches);
})
