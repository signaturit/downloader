// npm run download:log admin_token production/sandbox emails/all destination_path
// npm run download:progress admin_token production/sandbox emails/all destination_path

// require libs
let ProgressBar = require('progress');
let chalk       = require('chalk');
let program     = require('commander');

const {app, autoUpdater, dialog} = require('electron');

// require reflect needed for angular injections
require('./../node_modules/reflect-metadata/Reflect.js');

// get signaturit service
import {SignaturitService} from './js/app/service.signaturit'

// prepare arguments
let tokenValue, environmentValue, usersValue, destinationValue, progressValue;

// create the program
program
    .description('Download all the signed files')
    .arguments('<token> <environment> <users> <destination>')
    .option('-p --progress <progress>', 'Progress type')
    .action(
        (token, environment, users, destination) => {
            tokenValue       = token;
            environmentValue = environment;
            usersValue       = users;
            destinationValue = destination
        }
    )
    .parse(process.argv);

// get progress value
progressValue = program.progress;

// if no arguments, show help
if (!program.args.length) {
    program.help();

    process.exit(1)
}

// validate token
if (typeof tokenValue === 'undefined') {
    console.error(
        chalk.red('no token given!')
    );

    process.exit(1)
}

// validate environment
if (typeof environmentValue === 'undefined') {
    console.error(
        chalk.red('no environment given!')
    );

    process.exit(1)
}

if (environmentValue != 'production' && environmentValue != 'sandbox') {
    console.error(
        chalk.red('no valid environment!')
    );

    process.exit(1)
}

// validate users
if (typeof usersValue === 'undefined') {
    console.error(
        chalk.red('no users given!')
    );

    process.exit(1)
}

// validate destination
if (typeof destinationValue === 'undefined') {
    console.error(
        chalk.red('no destination given!')
    );

    process.exit(1)
}

// process
let production = environmentValue == 'production';
let emails     = usersValue.split(',');

const signaturitService = new SignaturitService();

signaturitService.getUsers(tokenValue, production, users => {
    // user is admin
    if (users[0].token) {
        // filter users if needed
        users = usersValue == 'all' ? users : users.filter(user => {
            return emails.indexOf(user.email) >= 0
        });

        // download all files
        let download = () => {
            let files = [];

            let fn = (index: number) => {
                if (index == users.length) {
                    const bar = new ProgressBar(' downloading [:bar] :percent (:current/:total) :etas :file', {
                        total: files.length,
                        width: 50
                    });

                    let fn = (index: number) => {
                        if (files.length > index) {
                            let file = files[index];

                            if (progressValue == 'log') {
                                process.stdout.write(`downloading file ${index + 1} / ${files.length} - ${file.location}... `)
                            }

                            signaturitService.downloadFile(file, destinationValue, response => {
                                if (progressValue == 'log') {
                                    process.stdout.write(
                                        chalk.green('done!\n')
                                    )
                                }

                                if (progressValue == 'bar') {
                                    bar.tick({
                                        file: chalk.green(file.location)
                                    })
                                }

                                fn(index + 1)
                            }, response => {
                                if (progressValue == 'log') {
                                    process.stdout.write(
                                        chalk.red('error!\n')
                                    )
                                }

                                if (progressValue == 'bar') {
                                    bar.tick({
                                        file: chalk.red(`error downloading ${file.location}`)
                                    })
                                }

                                fn(index + 1)
                            })
                        }
                    };

                    fn(0)
                } else {
                    let user = users[index];

                    signaturitService.getSignedFiles(user, _files => {
                        Array.prototype.push.apply(files, _files);

                        fn(index + 1)
                    }, response => {
                        // error
                    })
                }
            };

            fn(0)
        };

        // start the download
        download()
    } else {
        console.error(
            chalk.red('the token must be an admin token')
        );

        process.exit(1)
    }
}, response => {
    console.error(
        chalk.red('some error ocurred while trying to get users!')
    );

    process.exit(1)
});
