export class File {
    public signatureId: string
    public documentId: string
    public name: string
    public signer: string
    public status: string
    public createdAt: Date

    constructor(private signature: any, private document: any) {
        this.signatureId = signature.id
        this.documentId  = document.id
        this.name        = document.file.name
        this.signer      = document.name
        this.createdAt   = new Date(signature.created_at)
    }

    get location (): string {
        return `${this.signatureId}/${this.documentId}/${this.name}`
    }
}
