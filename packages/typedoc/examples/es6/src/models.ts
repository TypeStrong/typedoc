export default class BaseModel {
    public id:number;
}


export class SubModelA extends BaseModel {
    public name:string;
}


export class SubModelB extends BaseModel {
    public mail:string;
    public password:string;
}