export type createUserRequestBody = {
    username:string,
    email:string,
    dob:string,
    gender:string,
    photo?:string,
    uid?:string
}
export type createProductRequestBody = {
    name:string,
    photo:string,
    user:string,
    stock:number,
    price:number,
    category:string
}
export type updateProductRequestBody = {
    name?:string,
    photo?:string,
    user?:string,
    stock?:number,
    price?:number,
    category?:string
}

