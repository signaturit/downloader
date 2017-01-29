import '@angular/core'

import { Component, NgZone } from '@angular/core'
import { Router } 			 from '@angular/router'

const { dialog } = require('electron').remote

import { SignaturitService } from './service.signaturit'

import { User } from './model.user'

@Component({
	selector: 'users',
	templateUrl: '../views/component.users.html',
	styleUrls: ['../css/component.users.css']
})

export class UsersComponent {
	users: Array<User> = []
	loading: boolean = false

	constructor(private zone: NgZone, private router: Router, private signaturitService: SignaturitService) {
		this.init()
	}

	private init() {
		let token      = localStorage.getItem('token')
		let production = localStorage.getItem('environment') == 'production'

		this.loading = true

		this.signaturitService.getUsers(token, production, users => {
			this.zone.run(() => {
				this.users = users

				this.loading = false
			})
        }, response => {
            dialog.showErrorBox('Error de conexión', 'Parece que tienes problemas con la conexión a internet. Inténtalo de nuevo más tarde. Si el problema persiste, escríbenos a soporte@signaturit.com.')
        })
	}

	public numUsersSelected(): number {
		var num = 0

		for (let user of this.users) {
			if (user.selected) {
				num++
			}
		}

		return num
	}

	public selectAll(event) {
		event.preventDefault()

		this.zone.run(() => {
			for (let user of this.users) {
				user.selected = true
			}
		})
	}

	public selectNone(event) {
		event.preventDefault()

		this.zone.run(() => {
			for (let user of this.users) {
				user.selected = false
			}
		})
	}

	public submit() {
		let ids = this.users
			.filter(user => { return user.selected })
			.map(user => { return user.id })

		dialog.showOpenDialog(
			{ buttonLabel: 'Descargar', properties: ['openDirectory', 'createDirectory'] },
			path => {
				if (path) {
					this.router.navigate(['files', { path: path, users: ids }])
				}
			}
		)
  	}
}
