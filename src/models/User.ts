interface UserType {

}

export class User {
    userid: string;
    email: string;
    password: string;
    role: string;
    salt: string;

    constructor(userid:string, email:string, password:string, role:string, salt:string) {
        this.userid = userid
        this.email = email
        this.password = password
        this.role = role
        this.salt = salt
    }

    /**
     * Returns information that is safe to show to the client.
     * So things properties like password and salt are excluded.
     */
    getClientSafeInfo() {
        return {
            userid: this.userid,
            email: this.email,
            role: this.role
        }
    }
}

