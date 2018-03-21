/*Begin dependencies*/

const http = require('http')
let contacts = [
    { id: 0, first: 'Dylan', last: 'Bialy', email: 'dylanbailey@gmail.com' },
    { id: 1, first: 'Molly', last: 'Calhoun', email: 'bmaxace@gmail.com' },
];
const fs = require('fs');
const readline = require('readline');
const promisify = require('util').promisify;
const phoneBook = 'phonebook.txt'
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const rlQuestion = function (question) {
    return new Promise(function (resolve) {
        rl.question(question, resolve);
    });
};
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile)
const appendFile = promisify(fs.appendFile)

/*End dependencies*/

/*Phonebook Actions*/
let itsAnEntry = function () {
    let phoneList;
    readFile(phoneBook)
        .then(function (data) {
            let stringData = data.toString();
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

let nuEntry = function () {
    let entry = '\n';
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

let darkEntry = function () {
    let phoneList;
    readFile(phoneBook)
        .then(function (data) {
            let stringData = data.toString();
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

let allEntry = function () {
    readFile(phoneBook)
        .then(function (data) {
            let stringData = data.toString();
            console.log(stringData);
        })
        .then(function () {
            startApp();
        });

    // let server = http.createServer(function (request, response) {
    //     let urlID = Number(request.url.split('/contacts/')[1])
    //     if (request.url === '/contacts') {
    //         if (request.method === 'GET') {
    //             response.end(JSON.stringify(contacts));
    //         } else if (request.method === 'POST') {
    //             let body = '';
    //             request.on('data', function (chunk) {
    //                 body += chunk.toString();
    //             });
    //             request.on('end', function () {
    //                 let contact = JSON.parse(body);
    //                 contacts.push(contact);
    //                 response.end('ITs good');
    //             })
    //         }
    //     } else if (Number.isInteger(urlID)) {
    //         if (request.method === 'GET') {
    //             ;
    //             contacts.forEach(function (entry) {
    //                 if (entry.id === urlID) {
    //                     response.end(JSON.stringify(entry));
    //                 }
    //             })
    //         } else if (request.method === 'PUT') {
    //             let updateEntry = '';
    //             request.on('data', function (chunk) {
    //                 updateEntry += chunk.toString();
    //             });
    //             request.on('end', function () {
    //                 let updateContact = JSON.parse(updateEntry);
    //                 contacts.forEach(function (entry, i) {
    //                     if (entry.id === urlID) {
    //                         contacts.splice(i, 1, updateContact)
    //                         response.end('UPDATED');
    //                     }
    //                 })
    //             })
    //         } else if (request.method === 'DELETE') {
    //             contacts.forEach(function (entry, i) {
    //                 if (entry.id === urlID) {
    //                     contacts.splice(i, 1)
    //                     response.end('BALEETED')
    //                 }
    //             })
    //         } else if (request.method === 'POST') {
    //             response.end('ERROR!')
    //         }
    //     } else {
    //         response.end('ERROR! TO COMMUNICATE!')
    //     }
    // });

    let erRor = function (request, response) {
        response.statusCode = 404;
        response.end('404, nothing here!');
    };

    let paths = [
        { method: 'DELETE', path: '/contacts/', handler: deleteContactRoute },
        { method: 'GET', path: '/contacts/', handler: getContactRoute },
        { method: 'PUT', path: '/contacts/', handler: putContactRoute },
        { method: 'GET', path: '/contacts', handler: getContactsRoute },
        { method: 'POST', path: '/contacts', handler: postContactsRoute },
    ];

    /*Main App*/

    let startApp = function () {
        rl.question('Howdy buckaroos! What can I do ya for today?: \n1. Wheres that partner at!, \n2. Add a new partner!, \n3. Delete that partner!, \n4. List all partners!, \n5. Giddout of here!  ', function (option) {
            let dial = Number(option)
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

    let server = http.createServer(function (request, response) {
        console.log(request.method, request.url);

        let route = routes.find(function (route) {
            return matches(request, route.method, route.path);
        });

        (route ? route.handler : erRor)(request, response);

    });

    server.listen(3000);

    startApp();
};

function generateRandomNum(options) {
    var min = options.min || 1;
    var max = options.max || 100;
    console.log(min, max);
}