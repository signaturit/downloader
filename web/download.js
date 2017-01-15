// npm run download admin_token production/sandbox emails/all destination_path
"use strict";
// require libs
var ProgressBar = require('progress');
var chalk = require('chalk');
var program = require('commander');
// require reflect needed for angular injections
require('./../node_modules/reflect-metadata/Reflect.js');
// get signaturit service
var service_signaturit_1 = require("./js/app/service.signaturit");
// prepare arguments
var tokenValue, environmentValue, usersValue, destinationValue;
// create the program
program
    .description('Download all the signed files')
    .arguments('<token> <environment> <users> <destination>')
    .action(function (token, environment, users, destination) {
    // tokenValue       = token
    // environmentValue = environment
    // usersValue       = users
    // destinationValue = destination
    tokenValue = 'NGFhOWE3MjAwNThlMjY5M2M1MzQxZjNlOTY1M2U0MzhmNTlmMWE1NzIyMTdmMGQwYTkzZDBjOTg4YzZlMGY1NA';
    environmentValue = 'sandbox';
    usersValue = 'all';
    destinationValue = '/Users/javier/Desktop/fcb';
})
    .parse(process.argv);
// if no arguments, show help
if (!program.args.length) {
    program.help();
    process.exit(1);
}
// validate token
if (typeof tokenValue === 'undefined') {
    console.error(chalk.red('no token given!'));
    process.exit(1);
}
// validate environment
if (typeof environmentValue === 'undefined') {
    console.error(chalk.red('no environment given!'));
    process.exit(1);
}
if (environmentValue != 'production' && environmentValue != 'sandbox') {
    console.error(chalk.red('no valid environment!'));
    process.exit(1);
}
// validate users
if (typeof usersValue === 'undefined') {
    console.error(chalk.red('no users given!'));
    process.exit(1);
}
// validate destination
if (typeof destinationValue === 'undefined') {
    console.error(chalk.red('no destination given!'));
    process.exit(1);
}
// process
var production = environmentValue == 'production';
var emails = usersValue.split(',');
var signaturitService = new service_signaturit_1.SignaturitService();
signaturitService.getUsers(tokenValue, production, function (users) {
    // user is admin
    if (users[0].token) {
        // filter users if needed
        users = usersValue == 'all' ? users : users.filter(function (user) { return emails.indexOf(user.email) >= 0; });
        // download all files
        var download = function () {
            var files = [];
            var fn = function (index) {
                if (index == users.length) {
                    var bar = new ProgressBar(' downloading [:bar] :percent :etas ', { total: files.length, width: 50 });
                    var fn_1 = function (index) {
                        if (files.length > index) {
                            var file = files[index];
                            signaturitService.downloadFile(file, destinationValue, function (response) {
                                bar.tick();
                                fn_1(index + 1);
                            }, function (response) {
                                bar.interrupt('interrupt: current progress is ' + bar.curr + '/' + bar.total);
                                // error
                            });
                        }
                    };
                    fn_1(0);
                }
                else {
                    var user = users[index];
                    signaturitService.getSignedFiles(user, function (_files) {
                        Array.prototype.push.apply(files, _files);
                        fn(index + 1);
                    }, function (response) {
                        // error
                    });
                }
            };
            fn(0);
        };
        // start the download
        download();
    }
    else {
        console.error(chalk.red('the token must be an admin token'));
        process.exit(1);
    }
}, function (response) {
    console.error(chalk.red('some error ocurred while trying to get users!'));
    process.exit(1);
});
