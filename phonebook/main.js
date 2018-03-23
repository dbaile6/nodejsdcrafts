let fs = require('fs');
let request = require('request')
let promisify = require('util').promisify;
let readline = require('readline')
let http = require('http')
let url = 'http://localhost:3000/contacts'
let http = require('http');
let fs = require('fs');

let contacts = [
    {id: 0, first: 'Dylan', last: 'Bialy', email: 'dylanbailey@gmail.com'},
    {id: 1, first: 'Molly', last: 'Calhoun', email: 'bmaxace@gmail.com' },
];

let contId = contacts.length;

let serverList = (request, callback) => {
    let body = ''
    request.on('data', (chunk) => {
        body += chunk.toString();
    });
    request.on('end', () => {
        callback(body);
    });
};

let getContacts = (request, response) => {
    response.end(JSON.stringify(contacts)); 
};

let putContact = (request, response) => {
    serverList(request, (body) => {
        let contact = JSON.parse(body);
        contact.id = ++contId;
        contacts.push(contact);
        response.end('Entry Added');
        return contact;
    });
};

let getContact = (request, response) => {
    let urlID = findcontId(request.url);
    let match;
    contacts.forEach((entry) => {
        if (entry.id === urlID) {
            match = JSON.stringify(entry);  
        } 
    });
    if (match) {
        response.end(JSON.stringify(match));
    } else {
        routeNotFound(request, response);
    }
};

let updateContact = (request, response) => {
    let urlID = findcontId(request.url);
    serverList(request, (body) => {
        let updateContact = JSON.parse(body);
        updateContact.id = ++contId;
        contacts.forEach((entry, i) => {
            if (entry.id === urlID) {
                contacts.splice(i, 1, updateContact);
                return response.end('Entry Updated');
            } 
        });
    });
};

let deleteContact = (request, response) => {
    let urlID = findcontId(request.url);
    contacts.forEach((entry, i) => {
        if (entry.id === urlID) {
            contacts.splice(i, 1)
            return response.end('BALEETED');
        } 
    });
};

let serveIndex = (request, response) => {
    if (request.url === '/') {
        fs.readFile(`static/index.html`, (err, data) => {
            if (err) {
                response.end('ERROR! TO COMMUNICATE!')
            } else {
                response.end(data);
            }
        })
    };
};

let serveFile = (request, response) => {
    fs.readFile(`static/${request.url}`, (err, data) => {
        if (err) {
            response.end('ERROR! TO COMMUNICATE!')
        } else {
            response.end(data);
        }
    })
};

let findcontId = (url) => {
    var id = (routes[0].path).exec(url)[1];
    return parseInt(id, 10)
}

let findRoute = (method, url) => {
    var foundRoute;
    routes.forEach((route) => {
        if (route.method === method) {
            if (route.path.exec(url)) {
                foundRoute = route;
            }
        }
    })        
    return foundRoute;
};

let routeNotFound = (request, response) => {
    response.statusCode = 404;
    response.end('ERROR! NO COMMUNICATION!');
}

let routes = [
    { method: 'GET', path: /^\/contacts\/([0-9]+)\/?/, handler: getContact},   
    { method: 'PUT', path: /^\/contacts\/([0-9]+)\/?/, handler: updateContact},
    { method: 'DELETE', path: /^\/contacts\/([0-9]+)\/?/, handler: deleteContact},
    { method: 'GET', path: /^\/contacts\/?$/, handler: getContacts},
    { method: 'POST', path: /^\/contacts\/?$/, handler: putContact},
    { method: 'GET', path: /^\/$/, handler: serveIndex },
    { method: 'GET', path: /^\/[0-9a-zA-Z -.]+\.[0-9a-zA-Z -.]+/, handler: serveFile }
];

let server = http.createServer( (request, response) => {
    let route = findRoute(request.method, request.url);
    if (route) {
        route.handler(request, response);
    } else {
        routeNotFound(request, response);
    };
});

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let rlQuestion = function(question) {
    return new Promise(function(resolve) {
        rl.question(question, resolve);
    });
};

let readFile = promisify(fs.readFile);
let writeFile = promisify(fs.writeFile)
let appendFile = promisify(fs.appendFile)

let lookUpAnEntry = function() {
    let rawData = '';
    rlQuestion('Name: ')
    .then(function(name) {
        http.get(url, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                rawData += chunk;
            });
            res.on('end', function() {
                let contact = JSON.parse(rawData);
                contact.forEach(function(entry) {
                    if (entry.first === name) {
                        console.log(entry);
                        startApp();
                    }
                })
            })        
        })    
    })
};

let addNewEntry = function() {
    let entry = {first: '', last: '', number: ''};
    rlQuestion('First Name: ')
    .then(function(firstName) {
        entry.first = firstName;
        return rlQuestion('Last Name: ')
    })
    .then(function(lastName) {
        entry.last = lastName;
        return rlQuestion('Phone Number: ')
    })
    .then(function(phoneNumber) {
        entry.number = phoneNumber;
        return (JSON.stringify(entry))
    })
    .then(function(entry) {
        request.post({
            headers: {'content-type' : 'application/json'},
            url: url,
            body: entry
          }, function(error, response, body){
            console.log(body);
            startApp()
          });
    })
};   

let deleteAnEntry = function() {
    rlQuestion('ID: ')
    .then(function(id) {
        request.delete({
            headers: {'content-type' : 'application/json'},
            url: url + `/${id}`
          }, function(error, response, body){
            console.log(body);
            startApp()
          });
    })
};

let listAllEntries = function() {
    let rawData;
    let contactList=[];
    http.get(url, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            rawData += chunk;
        });
        res.on('end', function() {
            let contact = rawData.split('undefined')[1];
            contactList.push(contact)
            let parsedList = JSON.parse(contactList)
            console.log(parsedList);
            startApp();
        })
    })
}

let startApp = function() {
    rl.question ('Howdy buckaroos! What can I do ya for today?: \n1. Wheres that partner at!, \n2. Add a new partner!, \n3. Delete that partner!, \n4. List all partners!, \n5. Giddout of here!  ', function(option) {
        let optionNum = Number(option)
        if (optionNum ===1) {
            lookUpAnEntry();
        } else if (optionNum === 2) {
            addNewEntry();
        } else if (optionNum ===3) {
            deleteAnEntry();
        } else if (optionNum ===4) {
            listAllEntries();
        } else if (optionNum === 5) {
            rl.close()
        }
    })
}