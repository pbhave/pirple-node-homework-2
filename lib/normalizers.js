var _data = require('./data');

var normalizers = {}

normalizers.isStatusCodeNumber = function(statuscode){
    return typeof(statusCode) == 'number' ? statusCode : 200;
};

normalizers.isObject = function(obj){
    return typeof(obj) == 'object'? obj : {}; //returns the object or empty obj
};

normalizers.methodIsValid = function(method){
    const acceptableMethods = ['post','get','put','delete'];
    return acceptableMethods.indexOf(method) > -1 ? method : 'notValid' ;  //returns if method is valid or not
};

normalizers.stringIsValid = function(str){
    return typeof str === 'string' && str.trim() ? str : false;
}

normalizers.emailIsValid = function(email){
    if (normalizers.stringIsValid(email)){
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase()) ? email.toLowerCase(): false;
    }
}

normalizers.numberIsValid = function(str){
    if (typeof str === 'number') {return str};
    return typeof parseInt(str.trim()) === 'number' ? parseInt(str.trim()) : false;
}

//@TODO later
normalizers.userIsValid = function(payload){

}

normalizers.tokenIsValid = function(tokenId, email, callback){
    _data.read('tokens', tokenId, function(err, data){
        if (!err && data){
            email === data.email && data.tokenExpiry > Date.now() // checks if token is for the same user 
            ? callback(true) : callback(false, {statusCode: 404, payload: "Error: Token for a different user or expired"});
        }
        else callback(false, {statusCode: 404, payload: "Error: Not a valid token" }) 
    });
}

//@TODO implement later
normalizers.productsAreValid = function(products){
    return products; //@TODO implement later
};

module.exports = normalizers;