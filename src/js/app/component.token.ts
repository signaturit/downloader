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
	token: string = 'NGFhOWE3MjAwNThlMjY5M2M1MzQxZjNlOTY1M2U0MzhmNTlmMWE1NzIyMTdmMGQwYTkzZDBjOTg4YzZlMGY1NA'
	loading: boolean = false

	constructor(private router: Router, private signaturitService: SignaturitService) {
		// left blank intentionally
	}

	submit() {
		this.loading = true

		this.signaturitService.setToken(this.token, false)

		this.signaturitService.checkAccessToken(() => {
			this.router.navigate(['users'])
		}, response => {
			dialog.showErrorBox('Error de conexión', 'Parece que tienes problemas con la conexión a internet. Inténtalo de nuevo más tarde. Si el problema persiste, escríbenos a soporte@signaturit.com.')
		})
  	}
}
