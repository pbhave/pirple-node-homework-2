var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');
var lib = {};

lib.baseDir = path.join(__dirname,'/../.data/');


//Create a new item of a particular type: users, tokens, carts, orders
lib.create = function(dir, file, data, callback){
    
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', appendText);

    function appendText(err, fileDescriptor){
        if(!err && fileDescriptor){
            
            var stringData = JSON.stringify(data); // Convert data to string
      
            fs.writeFile(fileDescriptor, stringData, closeFile); // Write to file and close it
        }
        else {
            callback(err);
        }

        function closeFile(err){
            if(!err){
                fs.close(fileDescriptor, function(err){
                  !err ? callback(false): callback('Error closing new file');
                });
              } else {
                callback('Error writing to new file');
              }
        };
    };
};

//read from a file - used in get method
lib.read = function(dir, file, callback){
    
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8', function(err,data){
        if(!err && data){
            console.log("Read data: ", data);
          var parsedData = helpers.parseJsonToObject(data);
          callback(false, parsedData);
        } else {
            console.log(err);
          callback(err, data);
        }
      }) 
};

//Update an item
lib.update = function(dir, file, data, callback){

    fs.open(lib.baseDir+dir+'/'+file+'.json','w', firstWrite);
    
    function firstWrite(err, fileDescriptor){

        var stringData = JSON.stringify(data);
        
        !err ? fs.writeFile(fileDescriptor, stringData, thenClose): callback('Could not open file for updating, it may not exist yet');  
            
        function thenClose(err){
            if (!err){
                    fs.close(fileDescriptor, function(err){
                        !err ? callback(false) : callback('Error closing file'+ err)
                    })
                }
            else {callback('Could not write to the file' + err);}
        }
        }
};  

lib.delete = function(dir, file, callback){
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
        !(err) ? callback(false): callback(err)
    })
}

lib.exists = function(dir, file, callback){
    fs.access(lib.baseDir+dir+'/'+file+'.json', callback);
} 

module.exports = lib;