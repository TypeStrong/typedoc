import BaseModel from './models';

export default class ControllerBase {
    protected model:BaseModel;

    constructor(model:BaseModel = new BaseModel()) {
        this.model = model;
    }
}