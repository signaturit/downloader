import {User} from './model.user'

export class File {
    public user: User;
    public signature: any;
    public document: any;
    public status: string;

    constructor(user: User, signature: any, document: any) {
        this.user      = user;
        this.signature = signature;
        this.document  = document
    }

    get location(): string {
        return `${this.user.email}/${this.createdAt}/${this.document.file.name}`.replace(/\.pdf/, ` ${this.document.id}.pdf`)
    }

    get createdAt(): string {
        let fn = (num: number) => num > 9 ? num : `0${num}`;

        let d     = new Date(this.signature.created_at);
        let day   = fn(d.getDate());
        let month = fn(d.getMonth() + 1);
        let year  = d.getFullYear();

        return `${day}-${month}-${year}`
    }
}
