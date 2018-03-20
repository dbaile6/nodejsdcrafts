/*Begin dependencies*/

var http = require('http')
var contacts = []
var contactID = 0
var fs = require('fs');
var readline = require('readline');
var promisify = require('util').promisify;
var phoneBook = 'phonebook.txt'
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var rlQuestion = function (question) {
    return new Promise(function (resolve) {
        rl.question(question, resolve);
    });
};
var readFile = promisify(fs.readFile);
var writeFile = promisify(fs.writeFile)
var appendFile = promisify(fs.appendFile)

/*End dependencies*/

/*Phonebook Actions*/
var itsAnEntry = function () {
    var phoneList;
    readFile(phoneBook)
        .then(function (data) {
            var stringData = data.toString();
            phoneList = stringData.split("\n")
            return phoneList;
        })
        .then(function (data) {
            return rlQuestion('Name: ')
        })
        .then(function (name) {
            phoneList.forEach(function (entry) {
                if (entry.includes(name)) {
                    console.log(entry);
                }
            })
        })
        .then(function () {
            startApp();
        })
};

var nuEntry = function () {
    var entry = '\n';
    rlQuestion('First Name: ')
        .then(function (firstName) {
            entry += `${firstName}`
            return rlQuestion('Last Name: ')
        })
        .then(function (lastName) {
            entry += ` ${lastName}`
            return rlQuestion('Phone Number: ')
        })
        .then(function (phoneNumber) {
            entry += ` ${phoneNumber}`
            return appendFile(phoneBook, entry)
        })
        .then(function () {
            console.log('Entry Saved')
        })
        .then(function () {
            startApp();
        });
};

var darkEntry = function () {
    var phoneList;
    readFile(phoneBook)
        .then(function (data) {
            var stringData = data.toString();
            phoneList = stringData.split("\n")
            return phoneList;
        })
        .then(function () {
            return rlQuestion('Name: ')
        })
        .then(function (name) {
            phoneList.forEach(function (entry, i) {
                if (entry.includes(name)) {
                    phoneList.splice(i, 1);
                    console.log('Entry Deleted')
                }
            })
            return writeFile(phoneBook, '')
        })
        .then(function () {
            phoneList.forEach(function (entry) {
                appendFile('phonebook.txt', (entry + '\n'))
            })
        })
        .then(function () {
            startApp();
        })
};

var allEntry = function () {
    readFile(phoneBook)
        .then(function (data) {
            var stringData = data.toString();
            console.log(stringData);
        })
        .then(function () {
            startApp();
        });
};

var server = http.createServer(function (request, response) {
    var urlID = Number(request.url.split('/contacts/')[1])
    if (request.url === '/contacts') {
        if (request.method === 'GET') {
            response.end(JSON.stringify(contacts));
        } else if (request.method === 'POST') {
            var body = '';
            request.on('data', function (chunk) {
                body += chunk.toString();
            });
            request.on('end', function () {
                var contact = JSON.parse(body);
                contact.id = ++contactID;
                contacts.push(contact);
                response.end('IT'S GOOD!!!!!!!);
            })
        }
    } else if (Number.isInteger(urlID)) {
        if (request.method === 'GET') {
            ;
            contacts.forEach(function (entry) {
                if (entry.id === urlID) {
                    response.end(JSON.stringify(entry));
                }
            })
        } else if (request.method === 'PUT') {
            var updateEntry = '';
            request.on('data', function (chunk) {
                updateEntry += chunk.toString();
            });
            request.on('end', function () {
                var updateContact = JSON.parse(updateEntry);
                contacts.forEach(function (entry, i) {
                    if (entry.id === urlID) {
                        contacts.splice(i, 1, updateContact)
                        response.end('UPDATED');
                    }
                })
            })
        } else if (request.method === 'DELETE') {
            contacts.forEach(function (entry, i) {
                if (entry.id === urlID) {
                    contacts.splice(i, 1)
                    response.end('BALEETED')
                }
            })
        } else if (request.method === 'POST') {
            response.end('ERROR!')
        }
    } else {
        response.end('ERROR! TO COMMUNICATE!')
    }
});

server.listen(3000);


/*Main App*/

var startApp = function () {
    rl.question('Howdy buckaroos! What can I do ya for today?: \n1. Wheres that partner at!, \n2. Add a new partner!, \n3. Delete that partner!, \n4. List all partners!, \n5. Giddout of here!  ', function (option) {
        var dial = Number(option)
        if (dial === 1) {
            itsAnEntry();
        } else if (dial === 2) {
            nuEntry();
        } else if (dial === 3) {
            darkEntry();
        } else if (dial === 4) {
            allEntry();
        } else if (dial === 5) {
            rl.close();
            return;
        }
    });
};

startApp();