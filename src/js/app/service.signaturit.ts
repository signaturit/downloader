import { Injectable } from '@angular/core'

import { File } from './model.file'
import { User } from './model.user'

import * as SignaturitClient from 'signaturit-sdk'

var fs   = require('fs-extra')
var path = require('path')

@Injectable()
export class SignaturitService {
    public checkAccessToken (token: string, production: boolean, fnSuccess, fnError) {
        let client = new SignaturitClient(token, production)

        return client.getUsers().then(users => {
            if (users[0].token) {
                fnSuccess()
            } else {
                fnError({ error: 'no_admin' })
            }
        }, response => {
            fnError(response)
        })
    }

    public getUsers (token: string, production: boolean, fnSuccess, fnError) {
        let client = new SignaturitClient(token, production)

        var data: Array<User> = []

        client.getUsers().then(response => {
            for (let obj of response) {
                data.push(
                    new User(obj.token, production, obj.id, obj.email, obj.name)
                )
            }

            fnSuccess(data)
        }, response => {
            fnError(response)
        })
    }

    public getSignedFiles (user: User, fnSuccess, fnError) {
        let client = new SignaturitClient(user.token, user.production)

        var data: Array<Object> = []

        var limit  = 100
        var offset = 0

        let fn = () => {
            client.getSignatures(limit, offset, { status: 'completed' }).then(response => {
                for (let signature of response) {
                    for (let document of signature.documents) {
                        data.push(
                            new File(user, signature, document)
                        )
                    }
                }

                offset += limit

                if (response.length > 0) {
                    fn()
                } else {
                    fnSuccess(data)
                }
            }, response => {
                fnError(response)
            })
        }

        fn()
    }

    public downloadFile(file: File, basePath: string, fnSuccess, fnError) {
        let client = new SignaturitClient(file.user.token, file.user.production)

        var filePath = `${basePath}/${file.location}`

        if (fs.existsSync(filePath)) {
            fnSuccess(filePath)
        } else {
            client.downloadSignedDocument(file.signature.id, file.document.id).then(response => {
                var dir = path.dirname(filePath)

                fs.ensureDir(dir, error => {
                    if (error) {
                        fnError(error)
                    } else {
                        let fn = (filePath: string, index: number) => {
                            let path = index ? filePath.replace(/\.pdf/, `-${index}.pdf`) : filePath

                            return fs.existsSync(path) ? fn(filePath, index + 1) : path
                        }

                        filePath = fn(filePath, 0)

                        var stream = fs.createWriteStream(filePath)

                        stream.write(response)

                        stream.on('error', error => {
                            fnError(error)
                        })

                        stream.end(() => {
                            fnSuccess(filePath)
                        })
                    }
                })

            }, response => {
                fnError(response)
            })
        }
    }
}
