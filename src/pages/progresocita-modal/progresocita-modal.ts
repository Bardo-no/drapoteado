import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { UserDataProvider } from '../../providers/user-data/user-data';
import { CitasManagerProvider } from '../../providers/citas-manager/citas-manager';
import { NotificationsManagerProvider } from '../../providers/notifications-manager/notifications-manager';
import { LoaderProvider } from '../../providers/loader/loader';
import { AlertProvider } from '../../providers/alert/alert';
import { CitasDataProvider } from '../../providers/citas-data/citas-data';
import { CitasPresentatorProvider } from '../../providers/citas-presentator/citas-presentator';
import { CitaProgressControllerProvider } from '../../providers/cita-progress-controller/cita-progress-controller';
import { PermissionsProvider } from '../../providers/permissions/permissions';
import { DateProvider } from '../../providers/date/date';
import { UpdaterProvider } from '../../providers/updater/updater';
import { ReportPresentatorProvider } from '../../providers/report-presentator/report-presentator';


@IonicPage()
@Component({
  selector: 'page-progresocita-modal',
  templateUrl: 'progresocita-modal.html',
})
export class ProgresocitaModalPage {
 
 

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public userData: UserDataProvider,
    public loader: LoaderProvider,
    public viewCtrl: ViewController,
    public alert: AlertProvider,
    public citasData: CitasDataProvider,
    public citasMan: CitasManagerProvider,
    public notiMan: NotificationsManagerProvider,
    public citasPresentator: CitasPresentatorProvider,
    public progressController: CitaProgressControllerProvider,
    public permissions: PermissionsProvider,
    public datep: DateProvider,
    public updater: UpdaterProvider,
    public reportp:ReportPresentatorProvider
  ) {
  }

  get SERVICIO_CORTESIA_NID(){
    return CitasDataProvider.SERVICIO_CORTESIA_NID;
  }

  ionViewDidLoad() {
    
    //console.log('Cita activa ionViewDidLoad',this.progressController.activeCita);
  }

  async ionViewWillLeave(){
      this.progressController.stopInterval();
      this.progressController.activeCitaDoc.resetServiceTimes();
      if(this.progressController.onAdeudo){
      this.loader.presentLoader('Cargando Reporte...');
      this.reportp.loadReporte().then(()=>{this.loader.dismissLoader();});
    }
      console.log('wileave');
  }

  

      finalizarPop(){
          console.log('trailcortesia',this.progressController.hasCortesia());
          if(this.progressController.checkNoServices()){
            this.alert.presentAlert('','No es posible guardar una cita sin introducir ningún servicio');
          }else
          if(this.progressController.inZero()){
            this.alert.chooseAlert(
              '',
              `¿Está seguro que desea finalizar la consulta con un costo de cero? la cita se marcará automáticamente como pagada.`,
              ()=>{ this.finalizarActualCita().then( ()=>{
                this.pagarActualCita();
              }); },
              ()=>{}
            );
          }else{
        this.finalizarActualCita().then( /*()=>{}*/);
          }
          //revisar si esta en 0
      //this.finalizarActualCita().then( ()=>{this.close();});
      }


    
      updateCheckedOptions(Nid,event){
        console.log('updateCheckedOptions',Nid,event.checked);
        this.progressController.updateCheckedOption(Nid,event.checked);
        console.log('finish');
      }


      operateTimes( Nid, operand ){
        console.log('operateTimes',Nid,operand);
        this.progressController.operateTimes(Nid,operand);
        console.log('finish');
      }

      getAddedTimes( Nid ){
        return this.progressController.getAddedTimes(Nid);
      }


      async finalizarActualCita(state = CitasDataProvider.STATE_COBRO){
        this.progressController.finalizarCitaActiva();
        this.citasPresentator.updateStateRequest( this.progressController.activeCita ,state );
        this.close();
      }

      pagadaPop(){
        if(!this.validarPagarNOEMPTY()){
          this.alert.presentAlert('','Introducir monto a pagar.');
          return false;
        }
       

        if( !this.validarPagarNONEG() || !this.validarNotNaN() ){
          this.alert.presentAlert('','No se aceptan valores negativos.');
          return false;
        }
       
      
       
        if( Number(this.progressController.CantidadRestante) < 0 ){
          this.alert.presentAlert('','Está introduciendo un monto mayor al costo de la cita.');
          return false;
        }
        
        if(
          this.progressController.factura_cantidad > this.progressController.activeCita.restantePagos
        ){
          this.alert.presentAlert('','El monto facturado no puede exceder el total de la consulta.');
          return false;
        }
       this.pagarActualCita();
      }

      async pagarActualCita(){
        console.log('pagarActualCita start servicesCompare',JSON.stringify(this.progressController.servicesCompare));
        this.progressController.pagarCitaActiva();
        console.log('pagarActualCita',this.progressController.activeCita);
        console.log('pagartrailc 1');
        this.citasPresentator.updateStateRequest(this.progressController.activeCita ,CitasDataProvider.STATE_FINALIZADA );
        console.log('pagartrailc 2');
        console.log('pagarActualCita end servicesCompare',JSON.stringify(this.progressController.servicesCompare));
        this.close();
      }

      getDateString(datenumber: number):String{
       let aux_dates = DateProvider.getDisplayableDates(new Date(Number(datenumber)));
       //console.log(aux_dates);
       return aux_dates.date +' '+aux_dates.time;
      }

      //esta validacion revisa que si se meta algo en los campos de cobro caundo se paga la cita. si no se pone nada de nada te avisa que no le metiste nada woe que malo eres
      validarPagarNOEMPTY():boolean{
        let ret = true;
        console.log('validarPagar ---------');
        console.log(this.progressController.cobroEfectivo, this.progressController.cobroEfectivo  === null );
        console.log(this.progressController.cobroTarjeta, this.progressController.cobroTarjeta === null );
        console.log(this.progressController.cobroCheque, this.progressController.cobroCheque === null );
        console.log(this.progressController.cobroBancaria, this.progressController.cobroBancaria === null );
        if( this.progressController.cobroEfectivo  === null &&  this.progressController.cobroTarjeta === null && this.progressController.cobroCheque === null  && this.progressController.cobroBancaria === null ){
          console.log('nopusonada'  );
          ret = false;
        }
        return ret;
      }

      //esta validacion revisa que no se puedan meter numeros negativos en el cobro.
      validarPagarNONEG():boolean{
        let ret = true;
        console.log('validarPagarNONEG ---------');
        console.log(this.progressController.cobroEfectivo, Number(this.progressController.cobroEfectivo) );
        console.log(this.progressController.cobroTarjeta,Number(this.progressController.cobroTarjeta) );
        console.log(this.progressController.cobroCheque,Number(this.progressController.cobroCheque));
        console.log(this.progressController.cobroBancaria,Number(this.progressController.cobroBancaria));
        if( Number(this.progressController.cobroEfectivo) < 0 ||  Number(this.progressController.cobroTarjeta) < 0 ||  Number(this.progressController.cobroCheque) < 0 ||  Number(this.progressController.cobroBancaria) < 0){
          ret = false;
        }
        return ret;
      }

      validarNotNaN(){
        let ret = true;
        console.log('validarNotNaN ---------');
        console.log(this.progressController.cobroEfectivo, Number(this.progressController.cobroEfectivo) );
        console.log(this.progressController.cobroTarjeta,Number(this.progressController.cobroTarjeta) );
        console.log(this.progressController.cobroCheque,Number(this.progressController.cobroCheque));
        console.log(this.progressController.cobroBancaria,Number(this.progressController.cobroBancaria));
        if( isNaN(this.progressController.cobroEfectivo)  ||  isNaN(this.progressController.cobroTarjeta)  ||  isNaN(this.progressController.cobroCheque)  ||  isNaN(this.progressController.cobroBancaria) ){
          ret = false;
        }
        return ret;
      }

     

  

      async allsaveActualCita(){
        console.log('allsaveActualCita',this.progressController.costoCita, this.progressController.activeCita.cantidadPagada);

        if( Number( this.progressController.costoCita ) < Number( this.progressController.activeCita.cantidadPagada ) ){
          this.alert.presentAlert('','El monto total de los servicios no puede ser menor a lo que ya se ha cobrado.');
          return false;
        }
        this.progressController.updateCitaActiva();
        //this.progressController.guardarEdiciones();
        await this.citasPresentator.updateStateRequest(this.progressController.activeCita ,CitasDataProvider.STATE_FINALIZADA );
        this.close();
      }

      async guardarEdiciones(){
        if( Number( this.progressController.activeCita.restantePagos ) === 0){
          this.alert.chooseAlert(
            '',
            `¿Está seguro que desea finalizar la consulta? la cita se marcará automáticamente como pagada.`,
            ()=>{ this.finalizarActualCita().then( ()=>{
              this.pagarActualCita();
            }); },
            ()=>{}
          );
        }else{
        if( !this.validarPagarNONEG() ){
          this.alert.presentAlert('','No se aceptan valores negativos.');
          return false;
        }
        if( Number(this.progressController.CantidadRestante) < 0 ){
          this.alert.presentAlert('','El monto total de los servicios no puede ser menor a lo que ya se ha cobrado.');
          return false;
        }
        console.log('guardarEdiciones');
        //this.progressController.loadcita(this.progressController.activeCita);
        this.progressController.updateCitaActiva();
        console.log('check cita before sending',JSON.stringify(this.progressController.activeCita.data.field_ediciones_json), this.progressController.activeCita.data.aux_servicios_json);
        
        this.citasPresentator.updateStateRequest(this.progressController.activeCita ,this.progressController.activeCita.stateNumber );
        this.progressController.loadcita(this.progressController.activeCita);
        this.close();
      }
    }

      moneyFormat( money:number ): string {
        return CitasDataProvider.moneyFormat(money);
       }

  
  
      close(){
        this.viewCtrl.dismiss();
      }

}
