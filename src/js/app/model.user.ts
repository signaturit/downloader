export class User {
    public id: string
    public email: string
    public name: string
    public selected: boolean

    constructor(private data: any) {
        this.id       = data.id
        this.email    = data.email
        this.name     = data.name
        this.selected = false
    }

    get nameAndEmail (): string {
        return this.name ? `${this.name} (<span class="text-muted">${this.email}</span>)` : this.email
    }
}
