// npm run download admin_token production/sandbox emails/all destination_path

// require libs
let ProgressBar = require('progress')
let chalk       = require('chalk')
let program     = require('commander')

// require reflect needed for angular injections
require('./../node_modules/reflect-metadata/Reflect.js')

// get signaturit service
import { SignaturitService } from './js/app/service.signaturit'

// import models
import { File } from './js/app/model.file'
import { User } from './js/app/model.user'

// prepare arguments
var tokenValue, environmentValue, usersValue, destinationValue

// create the program
program
    .description('Download all the signed files')
    .arguments('<token> <environment> <users> <destination>')
    .action(
        (token, environment, users, destination) => {
            // tokenValue       = token
            // environmentValue = environment
            // usersValue       = users
            // destinationValue = destination

            tokenValue       = 'NGFhOWE3MjAwNThlMjY5M2M1MzQxZjNlOTY1M2U0MzhmNTlmMWE1NzIyMTdmMGQwYTkzZDBjOTg4YzZlMGY1NA'
            environmentValue = 'sandbox'
            usersValue       = 'all'
            destinationValue = '/Users/javier/Desktop/fcb'
        }
    )
    .parse(process.argv);

// if no arguments, show help
if (!program.args.length) {
    program.help()

    process.exit(1)
}

// validate token
if (typeof tokenValue === 'undefined') {
   console.error(
       chalk.red('no token given!')
   )

   process.exit(1)
}

// validate environment
if (typeof environmentValue === 'undefined') {
   console.error(
       chalk.red('no environment given!')
   )

   process.exit(1)
}

if (environmentValue != 'production' && environmentValue != 'sandbox') {
   console.error(
       chalk.red('no valid environment!')
   )

   process.exit(1)
}

// validate users
if (typeof usersValue === 'undefined') {
   console.error(
       chalk.red('no users given!')
   )

   process.exit(1)
}

// validate destination
if (typeof destinationValue === 'undefined') {
   console.error(
       chalk.red('no destination given!')
   )

   process.exit(1)
}

// process
let production = environmentValue == 'production'
let emails     = usersValue.split(',')

var signaturitService = new SignaturitService()

signaturitService.getUsers(tokenValue, production, users => {
    // user is admin
    if (users[0].token) {
        // filter users if needed
        users = usersValue == 'all' ? users : users.filter(user => { return emails.indexOf(user.email) >= 0 })

        // download all files
        let download = () => {
            var files = []

            let fn = (index: number) => {
                if (index == users.length) {
                    var bar = new ProgressBar(' downloading [:bar] :percent :etas ', { total: files.length, width: 50 })

                    let fn = (index: number) => {
                        if (files.length > index) {
                            let file = files[index]

                            signaturitService.downloadFile(file, destinationValue, response => {
                                bar.tick()

                                fn(index + 1)
                            }, response => {
                                bar.interrupt('interrupt: current progress is ' + bar.curr + '/' + bar.total);
                                // error
                            })
                        }
                    }

                    fn(0)
                } else {
                    let user = users[index]

                    signaturitService.getSignedFiles(user, _files => {
                        Array.prototype.push.apply(files, _files)

                        fn(index + 1)
                    }, response => {
                        // error
                    })
                }
            }

            fn(0)
        }

        // start the download
        download()
    } else {
        console.error(
            chalk.red('the token must be an admin token')
        )

        process.exit(1)
    }
}, response => {
    console.error(
        chalk.red('some error ocurred while trying to get users!')
    )

    process.exit(1)
})
