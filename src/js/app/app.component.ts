import '@angular/core';

import { Component } from '@angular/core';

@Component({
	selector: 'my-app',
    // template: `<section><h3>Type the API access token</h3><form (submit)="submit()"><input [(ngModel)]="token" name="token" /></form></section>`
	templateUrl: '../views/component.access_token.html',
	styleUrls: ['../css/component.access_token.css']
})

export class AppComponent {
	token: string;

	constructor() {
        this.token = "caracola";

		setTimeout(
			() => { this.token = "abc" },
			5000
		);
    }

	submit() {
		console.log(this.token);
  	}
}
