/**
 * Where the path starts
 */

//Dependencies

var http = require('http');
var routers = require('./lib/routers');
var config = require('./lib/config');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var helpers = require('./lib/helpers');

var server = http.createServer((req, res)=>{
    var reqUrl = req.url;

    var method = req.method.toLowerCase(); // get method
    var headers = req.headers; //Get the headers as an object

    var parsedUrl = url.parse(reqUrl, true); //true is passed so that the query property in the parsed Url comes as object, rather than pure string

    //get needed data from parsed url needed to process the request
    var trimmedPath = parsedUrl.path.replace(/^\/+|\/+$/g, '');
    var queryStrings = parsedUrl.query;

    //get Payload if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    
    req.on('data', function(data){
        buffer+= decoder.write(data);
    });

    req.on('end', function(){
        buffer+= decoder.end();

        //choose the right handler depending on the path requested

        var chosenHandler = typeof routers[trimmedPath] === 'function' ? routers[trimmedPath] : routers.notFound;

        var data = {                    //set the data to be passed to the handler to process the request
            'method': method,
            'query' : queryStrings, 
            'headers': headers, 
            'payload': helpers.parseJsonToObject(buffer)
        }

        chosenHandler(data, function(statusCode, payload){
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
});


server.listen(config.PORT, ()=>{
    console.log(`Server rolling on ${config.PORT}`);
});