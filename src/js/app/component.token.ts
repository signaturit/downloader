import '@angular/core'

import { Component } from '@angular/core'
import { Router } 	 from '@angular/router'

const { dialog } = require('electron').remote

import { SignaturitService } from './service.signaturit'

@Component({
	selector: 'token',
	templateUrl: '../views/component.token.html',
	styleUrls: ['../css/component.token.css']
})

export class TokenComponent {
	token      : string
	environment: string
	loading    : boolean = false

	constructor(private router: Router, private signaturitService: SignaturitService) {
		this.token = localStorage.getItem('token')

		if (!this.token) {
			this.token = ''
		}

		this.environment = localStorage.getItem('environment')

		if (!this.environment) {
			this.environment = 'production'
		}
	}

	submit() {
		localStorage.setItem('token', this.token)
		localStorage.setItem('environment', this.environment)

		let token      = this.token
		let production = this.environment == 'production'

		this.loading = true

		this.signaturitService.checkAccessToken(token, production, () => {
			this.router.navigate(['users'])
		}, response => {
			if (response.error == 'no_admin') {
				dialog.showErrorBox('Error de token', 'El token debe ser de un administrador.')
			} else {
				dialog.showErrorBox('Error de conexión', 'Parece que tienes problemas con la conexión a internet. Inténtalo de nuevo más tarde. Si el problema persiste, escríbenos a soporte@signaturit.com.')
			}
		})
  	}
}
