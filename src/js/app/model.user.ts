export class User {
    public token     : string
    public production: boolean
    public id        : string
    public email     : string
    public name      : string
    public selected  : boolean

    constructor(token: string, production: boolean, id: string, email: string, name: string) {
        this.token      = token
        this.production = production
        this.id         = id
        this.email      = email
        this.name       = name
        this.selected   = false
    }

    get nameAndEmail (): string {
        return this.name ? `${this.name} (<span class="text-muted">${this.email}</span>)` : this.email
    }
}
