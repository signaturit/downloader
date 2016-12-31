import { Injectable } from '@angular/core'

import { File } from './model.file'
import { User } from './model.user'

import * as SignaturitClient from './../../../node_modules/signaturit-sdk/signaturit.js'

var fs   = require('fs-extra')
var path = require('path')

@Injectable()
export class SignaturitService {
    private client: SignaturitClient

    public setToken (token: string, production: boolean) {
        this.client = new SignaturitClient(token, production)
    }

    public checkAccessToken (fnSuccess, fnError) {
        return this.client.countSignatures().then(() => {
            fnSuccess()
        }, response => {
            fnError(response)
        })
    }

    public getUsers (fnSuccess, fnError) {
        var data: Array<User> = []

        this.client.getUsers().then(response => {
            for (let obj of response) {
                data.push(
                    new User(obj)
                )
            }

            fnSuccess(data)
        }, response => {
            fnError(response)
        })
    }

    public getSignedFiles (fnSuccess, fnError) {
        var data: Array<Object> = []

        var limit  = 100
        var offset = 0

        let fn = () => {
            this.client.getSignatures(limit, offset, { status: 'completed' }).then(response => {
                for (let signature of response) {
                    for (let document of signature.documents) {
                        data.push(
                            new File(signature, document)
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
        var filePath = `${basePath}/${file.location}`

        if (fs.existsSync(filePath)) {
            fnSuccess(filePath)
        } else {
            this.client.downloadSignedDocument(file.signatureId, file.documentId).then(response => {
                var dir = path.dirname(filePath)

                fs.ensureDir(dir, error => {
                    if (error) {
                        fnError(error)
                    } else {
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
