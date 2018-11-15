# Project Title

Demo implementation of an API for a pizza company as a part of the node course with Pirple

### Prerequisites

No dependencies are needed, just node :)

## Getting Started
Just install node and run

node index.js




### API requests - the host is localhost:3000

/users -- API Endpoint
```
Users API accepts request methods as POST, PUT & DELETE. A user in this pizza business has three properties: email, name & address where email is the unique identifier.

    User POST request creates a new user & it expects all three properties as requiredin the payload: email, name, passowrd & address

    User PUT request expects tokenid in the headers, email in the payload & any other field (name & address to be changed)

    User DELETE request expects tokenid in the headers & email in the payload

```

/tokens -- API Endpoint

```
Tokens API accepts request methods as POST & DELETE

    Token POST request creates a new token for the user & it expects three required properties in the payload: email, name & address

    Token DELETE request expects tokenid in the headers & email in the payload
```

/carts -- API Endpoint

```
All logged in users can add to cart, Carts API accepts request methods as POST & PUT

    Cart POST request creates a new cart for the user or it adds to an existing cart & it expects a token & email in the header & products object in the body as follows
    
    {"productId":"123","quantity":2}
     
    Cart PUT request adds to existing cart and the requirement are same as post
```
/orders -- API Endpoint
```
All logged in users can submit orders, Orders API accepts request methods as POST

Order POST request creates a new order for the user & it expects a token & email in the header & products object in the body as follows
    
{"products":[{"productid":"124","quantity":3},{"productid":"123","quantity":2}]}
```
