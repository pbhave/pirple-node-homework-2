//Dependencies
var normalizers = require('./normalizers');
var _data = require('./data');
var helpers = require('./helpers');

//Define handler functions for various routes
const handlers = {}; 

handlers.users = function(data, callback){
    var method = normalizers.methodIsValid(data.method);
    
    handlers._users[method](data, callback); //Depending on the request method (GET, POST, PUT or DELETE) call the right function
};

// Container for all the users methods
handlers._users  = {};

handlers._users.post = function(data, callback){
    //check if all the data is valid - write a function validate name, email, address
    var name = normalizers.stringIsValid(data.payload.name);
    var password = normalizers.stringIsValid(data.payload.password);
    var address = normalizers.stringIsValid(data.payload.address);
    var email = normalizers.emailIsValid(data.payload.email);
    
    //if valid add it to the database

    switch(email){
    
        case (name && password && address && email): 
        
            var hashedPassword = helpers.hash(password);
            var userObj = {
                'name': name, 
                'address': address,
                'email': email,
                'hashedpassword': hashedPassword
            }
            
            _data.create('users', email, userObj, function(err){
                !err ? callback(200) : callback(500, {'Error' : 'Could not create the new user'+': codeError: '+err});
                });
            break;

        case email:

            callback(400,{'Error' : 'Missing required fields'});
            break;

    }
};

handlers._users.put = function(data, callback){
    //check if there is a valid token
    var tokenId = normalizers.stringIsValid(data.headers.tokenid);
    var email = normalizers.emailIsValid(data.payload.email);
    var address = normalizers.stringIsValid(data.payload.address);
    var name = normalizers.stringIsValid(data.payload.name);
    var password = normalizers.stringIsValid(data.payload.password);

    var hashedPassword = helpers.hash(password);


    normalizers.tokenIsValid(tokenId, email, function(validity, dump){
        validity ? createUserObj() : callback(dump.statusCode, dump.payload)
    });
    //sanitise the data object by combining date from request and existing data in the user
    function createUserObj(){

        _data.read('users', email, function(err, data){
            if (!err && data){
                address = address || data.address;
                hashedPassword = hashedPassword || data.hashedpassword;
                name = name || data.name;

                updateUser({"name": name, "address": address, "email": email, "hashedpassword": hashedPassword});
            }
            else {callback(404, {"Error": "User not found"})}
        })
    }
    //add the object to database
    function updateUser(userObj){
        _data.update('users', email, userObj, function(err){
            if (!err) {callback(200)}
            else {callback(401, {"Error": err+"####Error in user update function"})}
        });
    }
    
};

handlers._users.notValid = function(data, callback){
    callback(405);
};

handlers._users.delete = function(data, callback){
    var tokenId = normalizers.stringIsValid(data.headers.tokenid);
    var email = normalizers.emailIsValid(data.payload.email);

    normalizers.tokenIsValid(tokenId, email, function(validity, dump){
        validity ? deleteUser() : callback(dump.statusCode, dump.payload)
    });

    function deleteUser(){
        _data.delete('users', email, function(err){
            !(err)? callback(200): callback({"Error": "error deleting user"+ err})
        })
    }
}

handlers.tokens = function(data, callback){
    var method = normalizers.methodIsValid(data.method);
    handlers._tokens[method](data, callback);//Depending on the request method (GET, POST, PUT or DELETE) call the right function
};

// Container for all the tokens methods
handlers._tokens = {};

handlers._tokens.post = function(data, callback){
    // should contain userId & password, if password matches generate the token
    var email = normalizers.emailIsValid(data.payload.email);
    var password = normalizers.stringIsValid(data.payload.password);
    var hashedPassword = helpers.hash(password);
    
    if (email && password){
        _data.read('users', email, function(err, data){
            if(!err && data){
                hashedPassword === data.hashedpassword ? setToken(email) : callback(404, "Password don't match")
            }
            else {callback(404, "Error fetching user")}
        });
    }

    function setToken(email){
        //token should have a tokenid which will be the name of the file & email associated with it & expirytime
        let tokenId = helpers.createToken();
        let tokenExpiry = Date.now()+ 24*60*60*1000; //token is valid for 24 hours

        _data.create('tokens', tokenId, {"email": email, "tokenExpiry": tokenExpiry }, function(err){
            !err ? callback(200) : callback(500, {'Error' : 'Could not create the new token'+': codeError: '+err});
        })
    }
}

handlers._tokens.get = function(){
    
};

handlers._tokens.delete = function(data, callback){
    var tokenId = normalizers.stringIsValid(data.headers.tokenid);
    var email = normalizers.emailIsValid(data.payload.email);

    normalizers.tokenIsValid(tokenId, email, function(validity, dump){
        validity ? deleteToken() : callback(dump.statusCode, dump.payload)
    });

    function deleteToken(){
        _data.delete('tokens', tokenId, function(err){
            !(err)? callback(200): callback({"Error": "error deleting token"+ err})
        });
    };
};

handlers.menuItems = function(data, callback){
    var method = data.method;

    //Only get allowed on menu items
    method.toLowerCase() === 'get' ? handlers._menuItems[method](data, callback) :callback(405, "Error: Invalid method");
};

handlers._menuItems = {};

handlers._menuItems.get = function(data, callback){

    var tokenId = normalizers.stringIsValid(data.headers.tokenid);
    var email = normalizers.emailIsValid(data.headers.email);

    normalizers.tokenIsValid(tokenId, email, function(validity, dump){
        validity ? readMenuItems() : callback(dump.statusCode, dump.payload)
    });

    function readMenuItems(){
        _data.read('menuitems', 'menuitems', function(err, data){
            !err ? callback(200, data) : callback(400, "Error retrieving menu items");
        });
    }
}

handlers.carts = function(data, callback){
    var method = normalizers.methodIsValid(data.method);
    handlers._carts[method](data, callback); //Depending on the request method (GET, POST, PUT or DELETE) call the right function
};

handlers._carts = {};

handlers._carts.post = function(data, callback){
    var tokenId = normalizers.stringIsValid(data.headers.tokenid);
    var email = normalizers.emailIsValid(data.headers.email);
    var productId = normalizers.stringIsValid(data.payload.productid);
    var quantity = normalizers.numberIsValid(data.payload.quantity);

    normalizers.tokenIsValid(tokenId, email, function(validity, dump){
        validity ? addToCart(email) : callback(dump.statusCode, dump.payload)
    });

    function addToCart(email){
        //Assumption is that the client may not know if the user has an existing cart so I have combined the post and put methods
        console.log('called addtocart')
        _data.exists('carts', email, postOrPut);
        //If the cart exists, we add to the existing cart (put), otherwise we create a new cart

    };

    function postOrPut(err){
        console.log(err);
        !err ? handlers._carts.put(data, callback) : post();
    }

    function post(){
        var cartObj = {};
        var products = cartObj.products = [];
        products.push({"productId": productId, "quantity": quantity});

        if (productId && quantity){
            _data.create('carts', email, cartObj, function(err){
                !err ? callback(200) : callback(500, {'Error' : 'Could not create the new cart'+': codeError: '+err});
            })
        }
        else {callback(400, "Invalid input")};
    }

}

handlers._carts.put = function(data, callback){
    var tokenId = normalizers.stringIsValid(data.headers.tokenid);
    var email = normalizers.emailIsValid(data.headers.email);
    var productId = normalizers.stringIsValid(data.payload.productid);
    var quantity = normalizers.numberIsValid(data.payload.quantity);

    normalizers.tokenIsValid(tokenId, email, function(validity, dump){
        validity ? createCartObj() : callback(dump.statusCode, dump.payload)
    });
    //sanitise the data object by combining data from request and existing data in the cart
    //@TODO only add in cart if productID is valid, check from Menu Items
    function createCartObj(){

        _data.read('carts', email, function(err, data){
            if (!err && data){
                var productsInCart = data.products.map((m)=>m);
                productsInCart.push({"productId": productId, "quantity": quantity}); 

                updateCart({"products": productsInCart});
            }
            else {callback(404, {"Error": "User not found"})}
        })
    }
    //add the object to database
    function updateCart(cartObj){
        _data.update('carts', email, cartObj, function(err){
            if (!err) {callback(200)}
            else {callback(401, {"Error": err+"####Error in cart update function"})}
        });
    }
}

handlers._carts.delete = function(data, callback){
    //not required in the project, though it will be similar to other methods
}

handlers.orders = function(data, callback){
    var method = normalizers.methodIsValid(data.method);
    handlers._orders[method](data, callback); //Depending on the request method (GET, POST, PUT or DELETE) call the right function
};

handlers._orders = {};

handlers._orders.post = function(data, callback){
    var products = data.payload.products;
    products = normalizers.productsAreValid(products);
    
    const email = normalizers.emailIsValid(data.headers.email);
    const tokenId = normalizers.stringIsValid(data.headers.tokenid);

    normalizers.tokenIsValid(tokenId, email, function(validity, dump){
        validity ? menuItemRead() : callback(dump.statusCode, dump.payload)
    });

    //@TODO only add start order processing if all productIDs are valid, check from Menu Items

    function menuItemRead(){
        _data.read('menuitems', 'menuitems', function(err, data){
            (!err && data) ? callStripe(data) : callback('Err:' + err);
        });
    }; 

    function callStripe(menuItems){
        if (products){
            //then we want to find the total amount of those products & call Stripe API for payment
            let total = getTotal(products, menuItems);
            helpers.httpsRequestToStripe(total, email, addOrdertotDatabase);
        }
        else {callback(400, 'Invalid products')};
    };

    function addOrdertotDatabase(){
        //add orders to database
        let orderId = helpers.createOrderId();
        _data.create('orders', orderId, {"products": products, "email": email},  function(err){
            !err ? callback(200) : callback(500, {'Error' : 'Could not create the new order'+': codeError: '+err});
            });

        //send email
        helpers.sendEmail(email);      
    };


    function getTotal(products, menuItems){
        let sum = 0;
        products.forEach(function(curr){
            sum += menuItems.products[curr.productid].price*curr.quantity
        });
        return sum;
    }

};

handlers.notFound = function(data, callback){
    callback(404);
};

var routers = {
    'users': handlers.users,
    'tokens': handlers.tokens,
    'carts': handlers.carts,
    'orders': handlers.orders,
    'menuitems': handlers.menuItems,
    'notFound': handlers.notFound
};

module.exports = routers;
