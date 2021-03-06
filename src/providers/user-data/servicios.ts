import { UserDataProvider } from "./user-data";
import { CitasDataProvider } from '../citas-data/citas-data';
import { Debugger } from "./debugger";

export class servicios{
    Nid:number = null;
    Uid:number = null;
    title:string = null;
    costo:number = null;
    order:number = 0;
    times:number = 1;

    constructor(){
      
    }

    get isCortesia(){
        return Number(this.Nid) === Number(CitasDataProvider.SERVICIO_CORTESIA_NID);
    }

    
    setData( data_input ){
        Debugger.log([`setting data for a service`,data_input]);
        this.Nid = data_input['Nid'];
        this.Uid = data_input['Uid'];
        this.title = data_input['title'];
        this.costo = data_input['costo'];
        this.times = 1;
        Debugger.log([`data set on servicio ${this.Nid}`,this]);
      }

      getData(){
          let aux_Data = UserDataProvider.getEmptyServicio();
          aux_Data.Nid = this.Nid;
          aux_Data.type = 'servicio';
          aux_Data.title = this.title;
          aux_Data.field_costo_servicio['und'][0]['value'] = this.costo;
          Debugger.log([`getting servicio data`,aux_Data]);
          return aux_Data;
      }
}