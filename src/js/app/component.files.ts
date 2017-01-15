import '@angular/core'

import { Component, NgZone } 	  from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'

const { dialog } = require('electron').remote

import { SignaturitService } from './service.signaturit'

import { File } from './model.file'
import { User } from './model.user'

@Component({
	selector: 'files',
	templateUrl: '../views/component.files.html',
	styleUrls: ['../css/component.files.css']
})

export class FilesComponent {
	path: string
	loading: boolean = false
	users: Array<User> = []
	files: Array<File> = []
	downloaded: Array<File> = []
	stats: string = ''

	constructor(private zone: NgZone, private router: Router, private route: ActivatedRoute, private signaturitService: SignaturitService) {
		route.params.subscribe(params => { this.init(params) })
	}

	private init (params: Object) {
		let token      = localStorage.getItem('token')
		let production = localStorage.getItem('environment') == 'production'

		this.loading = true

    	this.path = params['path']
		let ids   = params['users'].split(',')

		this.signaturitService.getUsers(token, production, users => {
			this.users = users.filter(user => {
				return ids.indexOf(user.id) >= 0
			}).map(user => {
				return new User(user.token, production, user.id, user.email, user.name)
			})

			this.getFiles()
		}, response => {
			dialog.showErrorBox('Error de conexión', 'Parece que tienes problemas con la conexión a internet. Inténtalo de nuevo más tarde. Si el problema persiste, escríbenos a soporte@signaturit.com.')
		})
	}

	private getFiles () {
		let fn = (index: number) => {
			if (index == this.users.length) {
				this.zone.run(() => {
					this.loading = false
				})

				this.downloadFiles()
			} else {
				let user = this.users[index]

				this.signaturitService.getSignedFiles(user, files => {
					Array.prototype.push.apply(this.files, files)

					fn(index + 1)
				}, response => {
					dialog.showErrorBox('Error de conexión', 'Parece que tienes problemas con la conexión a internet. Inténtalo de nuevo más tarde. Si el problema persiste, escríbenos a soporte@signaturit.com.')
				})
			}
		}

		fn(0)
	}

	private downloadFiles () {
		let fn = (index: number) => {
			if (this.files.length > index) {
				var file = this.files[index]

				this.zone.run(() => {
					file.status = 'downloading'

					this.downloaded.unshift(file)
				})

				this.signaturitService.downloadFile(file, this.path, response => {
					this.zone.run(() => {
						file.status = 'downloaded'
					})

					fn(index + 1)
				}, response => {
					file.status = 'error'

					fn(index + 1)
				})
			} else {
				let error      = this.downloaded.filter(file => { return file.status == 'error' }).length
				let downloaded = this.downloaded.length - error

				this.zone.run(() => {
					this.stats = `${downloaded} archivos descargado/s, ${error} error/es`
				})
			}
		}

		fn(0)
	}
}
