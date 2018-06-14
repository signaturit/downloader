import '@angular/core'

import {Component} from '@angular/core'
import {Router} from '@angular/router'

@Component({
    selector: 'app',
    templateUrl: '../views/component.app.html',
    styleUrls: ['../css/component.app.css']
})

export class AppComponent {
    constructor(private router: Router) {
        this.init()
    }

    private init() {
        setTimeout(
            () => this.router.navigate(['token']).then(null)
        )
    }
}
