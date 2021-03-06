import { Injectable, ɵConsole } from '@angular/core';
import { Citas } from '../user-data/citas';
import { servicios } from '../user-data/servicios';
import { Doctores } from '../user-data/doctores';
import { CitasManagerProvider } from '../citas-manager/citas-manager';
import { ModalController } from 'ionic-angular';
import { CitasDataProvider } from '../citas-data/citas-data';
import { UserDataProvider } from '../user-data/user-data';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

/*
  Generated class for the CitaProgressControllerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CitaProgressControllerProvider {
  activeCita: Citas;
  available_services: servicios[];
  selectedService:number;
  costoCita:number;
  cobroEfectivo:number=null;
  cobroTarjeta:number=null;
  cobroCheque:number=null;
  cobroBancaria:number=null;
  activeCitaDoc:Doctores;
  showinterval = null;
  editfinish:boolean = false;
  factura_cantidad:number = null;
  factura: number = 0;
  added_services_list:{
    servicio:servicios
    costooverride:number
  };
 onreport:boolean=false;
  servicesCompare: servicios[];
  activeCitaAnterior:number = 0;
  
  onAdeudo:boolean=false;

  checkboxMode:boolean = true;//checkbox mode porque quisieron checkbox pero no es tan viable a ver que pasa.
  checkboxServicesList;


  get CantidadRestante(){ 
    
    
    let ret = 0 + 
    ( (Number(this.activeCita.restantePagos)) - 
    (Number(this.cobroEfectivo) + Number(this.cobroCheque) + Number(this.cobroTarjeta) + Number(this.cobroBancaria) ) ); 
    ret = Number(ret.toFixed(2));
    return ret;
  }


  constructor(
    public citasManager: CitasManagerProvider,
    public userData: UserDataProvider,
    public modalCtrl:ModalController,
  ) {
  
  }

  setInputs(){
    this.cobroEfectivo=null;
    this.cobroTarjeta=null;
    this.cobroCheque=null;
    this.cobroBancaria=null;
  
    this.factura = 0;
    this.factura_cantidad = null;
    this.servicesCompare = null;
  }
  

  openProgress(cita:Citas, onAdeudo:boolean = false){ //open progress is called from the buttons using citas presentator
    this.onAdeudo = onAdeudo;
    if(!cita.checkState(CitasDataProvider.STATE_FINALIZADA)){
      this.setInputs();
    }
    if(!cita.checkState(CitasDataProvider.STATE_FINALIZADA) || !cita.checkState(CitasDataProvider.STATE_COBRO)){
      this.editfinish = false;
    }
    console.log('opening progress');
    this.loadcita(cita);
    let Modal = this.modalCtrl.create("ProgresocitaModalPage", {cita : cita}, { cssClass: "smallModal progressModal" });
    Modal.present({});
    cita.enabledButtons = true;
  }

  loadcita(cita){
    this.setActiveCita(cita);
    this.evalServicios();
    this.servicesCompare = JSON.parse(JSON.stringify(this.activeCita.addedServices));
    console.log('evalServicios this.servicesCompare',JSON.stringify(this.servicesCompare));
    this.calcularCosto();
    this.startInterval();
  }


  setActiveCita(cita:Citas){
    console.log('setActiveCita');
    this.activeCita = cita//navParams.get('cita');
    console.log('trail3 estado data',cita.data.field_estado);
    this.activeCita.estado_anterior = cita.data.field_estado.und[0].value;
    console.log('trail3 setting estado anterior al setearcita', this.activeCita.estado_anterior);
    this.activeCitaDoc = this.citasManager.getDoctorOFCita(this.activeCita);
    this.activeCitaDoc.setServiciosTimes(this.activeCita);
    console.log(this.activeCita.addedServices);
    this.activeCita.PagosonShow = this.activeCita.PagosonFecha;
  }

  finalizarCitaActiva(){
    this.calcularCosto();
    this.activeCita.data.field_costo_sobrescribir.und[0].value = this.costoCita;
    this.activeCita.setServicesData();
    this.activeCitaDoc.citaActiva = null;
  }

  pagarCitaActiva(){
  this.checkCobroStates('end pca');
  this.activeCita.setServicesData();
  this.activeCita.cobroEfectivo = this.cobroEfectivo == null ? 0 : this.cobroEfectivo;
  this.activeCita.cobroCheque = this.cobroCheque == null ? 0 :this.cobroCheque;
  this.activeCita.cobroTarjeta = this.cobroTarjeta == null ? 0 : this.cobroTarjeta;
  this.activeCita.cobroBancaria = this.cobroBancaria == null ? 0 : this.cobroBancaria;
  this.activeCita.data.field_facturar.und[0].value = this.factura;
  this.activeCita.data.field_facturar_cantidad.und[0].value = this.factura_cantidad == null ? 0 : this.factura_cantidad;
  this.citasManager.setCitaFechaReporte( this.activeCita, true );


  let aux_pago = {
    efe:this.cobroEfectivo == null ? ''+0 : ''+this.cobroEfectivo,
    tar:this.cobroTarjeta == null ? ''+0 : ''+this.cobroTarjeta,
    che:this.cobroCheque == null ? ''+0 :''+this.cobroCheque,
    ban:this.cobroBancaria == null ? ''+0 :''+this.cobroBancaria,
    fac: this.factura_cantidad == null ? ''+0 : ''+this.factura_cantidad,
    fec:''+new Date().getTime(),
    uid: Number(this.userData.userData.uid),
    name:this.userData.showname,
    isdoc:this.userData.checkUserPermission([this.userData.TIPO_DOCTOR])? 1 : 0
  };

  console.log('guardando pago',aux_pago);
  this.activeCita.compareServicios(this.servicesCompare);
  this.activeCita.pagos.push(aux_pago);


  console.log('pagos struct',this.activeCita.pagos);
  console.log('stringify',JSON.stringify(this.activeCita.pagos) );
  this.activeCita.data.field_pagos_json =  {und:[{value:''}]};
  this.activeCita.data.field_pagos_json.und[0].value= JSON.stringify(this.activeCita.pagos);
  console.log('pagos field',this.activeCita.data.field_pagos_json);
  console.log('this.cobroEfectivo',JSON.stringify(this.activeCita.cobroEfectivo)); 
  console.log('this.cobroCheque',JSON.stringify(this.activeCita.cobroCheque)); 
  console.log('this.cobroTarjeta',JSON.stringify(this.activeCita.cobroTarjeta)); 
  console.log('this.cobroBancaria',JSON.stringify(this.activeCita.cobroBancaria)); 
  console.log('this.factura',JSON.stringify(this.activeCita.data.field_facturar.und[0].value)); 
  console.log('this.factura_cantidad',JSON.stringify(this.activeCita.data.field_facturar_cantidad.und[0].value)); 
  console.log('checkforjson field_servicios_json',this.activeCita.data.field_servicios_json);
  }

  

  checkCobroStates(msg){
    console.log('checkCobroStates',msg);
    console.log('this.cobroEfectivo',JSON.stringify(this.cobroEfectivo)); 
    console.log('this.cobroCheque',JSON.stringify(this.cobroCheque)); 
    console.log('this.cobroTarjeta',JSON.stringify(this.cobroTarjeta)); 
    console.log('this.cobroBancaria',JSON.stringify(this.cobroBancaria)); 
    console.log('this.factura',JSON.stringify(this.factura)); 
    console.log('this.factura_cantidad',JSON.stringify(this.factura_cantidad)); 
  }

  updateCitaActiva(){
    this.calcularCosto();
    this.activeCita.data.field_costo_sobrescribir.und[0].value = this.costoCita;
    this.activeCita.setServicesData();
    this.activeCita.cobroEfectivo = this.cobroEfectivo;
  this.activeCita.cobroCheque = this.cobroCheque;
  this.activeCita.cobroTarjeta = this.cobroTarjeta;
  this.activeCita.cobroBancaria = this.cobroBancaria;
  this.activeCita.data.field_facturar.und[0].value = this.factura;
  this.activeCita.data.field_facturar_cantidad.und[0].value = this.factura_cantidad;
  
  //actualizando informacion de ediciones
  console.log('actualizando datos de ediciones');
  this.activeCita.compareServicios(this.servicesCompare);
  this.activeCita.setEdicionesField();
  console.log('active cita data ediciones ended',JSON.stringify(this.activeCita.data.field_ediciones_json));
  }

  addService(){
    console.log('addService start servicesCompare',JSON.stringify(this.servicesCompare));
    console.log(this.selectedService);
    if(Number(this.selectedService) !== Number(0)){
      let service_to_add = this.available_services.find((services)=>{ return Number(services.Nid) === Number(this.selectedService)});
      console.log('service to add',service_to_add);
      if(service_to_add && this.activeCita.addServicio(service_to_add)){
        console.log('servicio added');
        service_to_add.times = 1;
        this.available_services = this.activeCita.getServiciosAvailable(this.activeCitaDoc.servicios);
        this.calcularCosto();
        this.selectedService = 0;
       }
    }
    console.log('addService end servicesCompare',JSON.stringify(this.servicesCompare));
  }

  /*setCortesia(){
    let found = this.available_services.find((services)=>{ return Number(services.Nid) === Number(CitasDataProvider.SERVICIO_CORTESIA_NID)});
    if(!found){
      const aux_serv = new servicios();
      aux_serv.Nid = Number(CitasDataProvider.SERVICIO_CORTESIA_NID);
      aux_serv.Uid = 1;
      aux_serv.title = 'Cortesía';
      aux_serv.costo = 0;
      this.available_services.push(aux_serv);
    }
    console.log('adding cortesia',this.available_services);
  }

  unsetCortesia(){
    this.available_services = this.available_services.filter((servicios)=>{ return Number(servicios.Nid) !== Number(CitasDataProvider.SERVICIO_CORTESIA_NID);  });
    console.log('removing cortesia',this.available_services);
  }*/

  removeService( servicio:servicios ){
    this.activeCita.removeServicio(servicio);
    this.available_services = this.activeCita.getServiciosAvailable(this.activeCitaDoc.servicios);
    this.calcularCosto();
  }

  removeServiceWnid( Nid:number ){
    this.activeCita.removeServicioNid(Nid);
    this.available_services = this.activeCita.getServiciosAvailable(this.activeCitaDoc.servicios);
    this.calcularCosto();
  }

  removeAllServices(){
    this.activeCita.removeAllServices();
    this.available_services = this.activeCita.getServiciosAvailable(this.activeCitaDoc.servicios);
    this.cortesiaCheck();
    this.calcularCosto();
  }

  calcularCosto(){
    console.log('calculando costo');
    this.costoCita = 0;
    console.log(this.activeCita.addedServices);
    this.activeCita.addedServices.forEach(element => {
      this.costoCita += (Number(element.costo) * Number(element.times));
      this.activeCita.data.field_costo_sobrescribir.und[0].value = this.costoCita;
    });
    console.log(this.costoCita);
  }

  hasCortesia(){
    let ret = false;
    let hasCortesia = this.activeCita.addedServices.find((servicio)=>{
      return ( Number( servicio.Nid ) === Number( CitasDataProvider.SERVICIO_CORTESIA_NID ) );
    });
    //console.log('trailcortesia hasCortesia',hasCortesia);
    if(hasCortesia){
      ret = true;
    }
    return ret;
  }

  inZero(){
    let ret = false;
    this.calcularCosto();
    if(Number(this.costoCita) === 0){ ret = true;}
    return ret;
  }


  evalServicios(){
    this.activeCita.setAddedServices(this.activeCitaDoc.servicios);
    this.available_services = this.activeCita.getServiciosAvailable(this.activeCitaDoc.servicios);
    this.cortesiaCheck();
    }

    startInterval(){
      if(!this.showinterval){
        this.showinterval = setInterval(() => { this.activeCita.setDuracionMs(); }, 1000);
      }
    }

    stopInterval(){
      if(this.showinterval){
      clearInterval(this.showinterval);
      this.showinterval = null;
      }
    }

    updateCheckedOption(Nid,State){
      console.log('progresscontroller updateCheckedOption',Nid,State);
      console.log('updateCheckedOption start servicesCompare',JSON.stringify(this.servicesCompare));
      console.log('activecita addedservices',this.activeCita.addedServices);
      if(State){ //si se va a agregar
        //this.checkDisableCortesia();
        this.selectedService = Nid;
        this.addService();
      }else{
        //if(! (Number(Nid) === Number(CitasDataProvider.SERVICIO_CORTESIA_NID) ) ) {
        this.removeServiceWnid(Nid);
        //this.cortesiaCheck();
      //}
      
    }
      console.log('added',this.activeCita.addedServices);
      console.log('updateCheckedOption end servicesCompare',JSON.stringify(this.servicesCompare));
    }


    operateTimes(Nid,operand){
      console.log('progresscontroller operateTimes',Nid,operand);
      console.log('updateCheckedOption start operateTimes',JSON.stringify(this.servicesCompare));
      console.log('activecita addedservices',this.activeCita.addedServices); 
      if(this.checkChecked(Nid)){
      this.activeCita.operateServiceTimes(Nid,operand);
      this.calcularCosto();
      }
    }



    getAddedTimes( Nid ){
      let ret = 0;
      if(this.activeCita.checkServicio(Nid)){
        ret = this.activeCita.getAddedTimes(Nid);
      }
      return ret;
    }
 

    checkDisableCortesia(){
      //si solo esta activo el servicio de cortesia y seleccionas otro, cortesia se des-selecciona
      console.log('check disable cortesia',this.checkChecked(Number(CitasDataProvider.SERVICIO_CORTESIA_NID)),this.activeCita.addedServices.length === 1);
      if(this.checkChecked(Number(CitasDataProvider.SERVICIO_CORTESIA_NID)) && this.activeCita.addedServices.length === 1){
        this.removeServiceWnid(Number(CitasDataProvider.SERVICIO_CORTESIA_NID));
      }
    }
    
    checkNoServices(){
      return this.activeCita.addedServices.length === 0;
    }

    checkChecked(Nid:number):boolean{
      return this.activeCita.addedServices.find((aux_serves)=>{ return Number(aux_serves.Nid) === Number(Nid) }) !== undefined;
    }

    isCortesiaOn(Nid){
      if((Number(Nid) === Number(CitasDataProvider.SERVICIO_CORTESIA_NID)) )console.log('iscortesiaon',(Number(Nid) === Number(CitasDataProvider.SERVICIO_CORTESIA_NID)), this.checkChecked(Nid), !(this.activeCita.addedServices.length > 1));
      return (Number(Nid) === Number(CitasDataProvider.SERVICIO_CORTESIA_NID)) 
      && this.checkChecked(Nid)
      && !(this.activeCita.addedServices.length > 1);
    }

   /* async guardarEdiciones(){
      console.log('guardarEdiciones');
      this.activeCita.compareServicios(this.servicesCompare);
      console.log('pcon guardarEdiciones',this.activeCita.todayEdiciones);
      await this.citasManager.guardarEdiciones(this.activeCita);
    }*/

    cortesiaCheck(){
      console.log('cortesiaCheck', this.activeCita.addedServices);
      /*if(this.activeCita.addedServices.length <= 0){
        this.selectedService = Number(CitasDataProvider.SERVICIO_CORTESIA_NID);
        this.addService();
        this.selectedService = null;
      }*/
    }

    /*cortesiaRemoveIfin(){
      if(this.activeCita && this.activeCita.addedServices){
      let found = this.activeCita.addedServices.find(
        (servicio)=>{
          return Number(servicio.Nid) === Number(CitasDataProvider.SERVICIO_CORTESIA_NID);
        }
      );
      if(found){
        this.removeServiceWnid(Number(CitasDataProvider.SERVICIO_CORTESIA_NID));
      }
    }
    }*/

}
