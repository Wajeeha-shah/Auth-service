export interface userData {
  username:string,
  email:string,
  password:string
}
export interface registerUserRequest extends Request{
    
  body:userData;
}