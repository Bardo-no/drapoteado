import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import { DateProvider } from '../date/date';
import { BaseUrlProvider } from '../base-url/base-url';
import { CitasDataProvider } from '../citas-data/citas-data';
import { Citas } from '../user-data/citas';

@Injectable()
export class CitasManagerProvider {

  constructor(
    public http: HttpClient, 
    public datep: DateProvider,
    public baseurl: BaseUrlProvider,
    public citasData: CitasDataProvider
  ) {
    console.log('Hello CitasManagerProvider Provider');
  }

  requestCitas():Observable<any>{
    let observable = this.getCitasObservable().share();
    observable.subscribe(
      (val)=>{this.setCitas(val);},
      response => { console.log('error requestCitas',response);}
    );
    return observable;
  }

  getCitasObservable(
    from:number = this.datep.nowStart,
    to:number = this.datep.nowEnd,
    doctores:number[] = null,  
    cajas:number[] = null,  
    recepciones:number[] = null
  ):Observable<any>{
    let filterString = `args[0]=${doctores ? doctores.join() : 'all'}&args[1]=${cajas ? cajas.join() : 'all'}&args[2]=${recepciones ? recepciones.join() : 'all'}&args[3]=${from}--${to}`;
    let url = `${this.baseurl.endpointUrl}rest_citas.json?${filterString}`;
    return this.http.get(url);
  }

  getCitaObservable( Nid ):Observable<any>{
    let url = `${this.baseurl.endpointUrl}rest_citas.json?args[0]=all&args[1]=all&args[2]=all&args[3]=all&args[4]=${Nid}`;
    return this.http.get(url);
  }

  setCitas( val ){
    console.log('citas response raw value',val);
    for(let cita of val){
      let aux_cita = new Citas();
      aux_cita.setData(cita);
      this.citasData.addCita(aux_cita,false);
    }
    this.citasData.triggerSubject();
  }


}
