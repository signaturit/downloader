import { NgModule }             from '@angular/core'
import { BrowserModule }        from '@angular/platform-browser'
import { FormsModule }          from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'

import { AppComponent }   from './component.app'
import { TokenComponent } from './component.token'
import { UsersComponent } from './component.users'
import { FilesComponent } from './component.files'

import { SignaturitService } from './service.signaturit'

const appRoutes: Routes = [
    { path: 'token', component: TokenComponent },
    { path: 'users', component: UsersComponent },
    { path: 'files', component: FilesComponent }
]

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forRoot(appRoutes, { useHash: true })
    ],
    declarations: [
        AppComponent,
        TokenComponent,
        UsersComponent,
        FilesComponent
    ],
    providers: [
        SignaturitService
    ],
    bootstrap: [
        AppComponent
    ]
})

export class AppModule {
    // left blank intentionally
}
