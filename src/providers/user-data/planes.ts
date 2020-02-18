
   

export class planes{
    title:string = null;
    field_costo:number = null;
    nid:number = null;
    field_no_doctores:number = null;
    field_no_subcuentas:number = null;
    field_stripe_id:string = null;
    field_descripcion:string = null;
    field_description_points:string[] = new Array();
    field_orden:number = 0;

    css_fact_selected:boolean = false;

    constructor(){

    }

    setData(input_data){
        console.log("plan input data", input_data);
        this.title = input_data['title'];
        this.field_costo = Number(input_data['field_costo']) / 100;
        this.nid = input_data['nid'];
        this.field_no_doctores = input_data['field_no_doctores'];
        this.field_no_subcuentas = input_data['field_no_subcuentas'];
        this.field_stripe_id = input_data['field_stripe_id'];
        this.field_descripcion = input_data['field_descripcion'];
        this.field_description_points = input_data['field_description_points'];
        this.field_orden =  input_data['field_orden'];
        console.log('loadedOrden',this.field_orden);
        //console.log('plan setdata descriptionpoints',this.field_description_points);
    }

    checkNid( nid:number ):boolean{
        let ret = false;
        if(Number(this.nid) === Number(nid) ){
            ret = true;
        }
        return ret;
    }
    
}