import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ViewController } from 'ionic-angular';
import { UserDataProvider } from '../../providers/user-data/user-data';
import { reportes } from '../../providers/user-data/reportes';
import { Debugger } from '../../providers/user-data/debugger';
import { LoaderProvider } from '../../providers/loader/loader';
import { ReportesManagerProvider } from '../../providers/reportes-manager/reportes-manager';
import { ReporteCitasProvider } from '../../providers/reporte-citas/reporte-citas';
import { ReportPresentatorProvider } from '../../providers/report-presentator/report-presentator';
import { PermissionsProvider } from '../../providers/permissions/permissions';
import { Citas } from '../../providers/user-data/citas';
import {Platform} from 'ionic-angular';
import { DateProvider } from '../../providers/date/date';
import { CitasDataProvider } from '../../providers/citas-data/citas-data';
import { CitasPresentatorProvider } from '../../providers/citas-presentator/citas-presentator';
/**
 * Generated class for the ReportePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 
@IonicPage()
@Component({
  selector: 'page-reporte',
  templateUrl: 'reporte.html',
})
export class ReportePage {
    smallMode:boolean = false;
    

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public userData: UserDataProvider,
    public viewCtrl:ViewController,
    public reportesManager: ReportesManagerProvider,
    public loader: LoaderProvider,
    public reportPresentator: ReportPresentatorProvider,
    public permissions:PermissionsProvider,
    public plat: Platform,
    public citasData: CitasDataProvider,
    public citasPresentator: CitasPresentatorProvider
  ) {
   
  }

  ionViewDidLoad() {
    this.setsmallMode();
  }

  verTotales(){
    this.reportPresentator.openTicket(this.reportPresentator.actualReport);
  }

  setsmallMode(){
    console.log('setsmallmode');
    this.plat.ready().then((readySource) => {
      if(this.plat.width() < 1024){
        this.smallMode = true;
      }
      //console.log('Width: ' + this.plat.width());
      //console.log('Height: ' + this.plat.height());
    });
  }

  /**
   * carga el reporte que se envio como parametro, si no existe este parametro carga el reporte de hoy
   * si no existe el reporte de hoy pide a reportesManager que carge la lista de reportes
   * que genera el reporte de hoy.
  */
  async setReport(){
    await this.reportPresentator.setReport(this.navParams.get('reporte'));
    console.log('reportset',this.reportPresentator.actualReport);
  }

    /**
     * carga las citas del reporte actual
    */
  async loadReport(){
    await this.reportPresentator.loadReporte();
    console.log('citas loaded',this.reportPresentator.actualReport.citas);
    /*let aux_citas_list = new Array();
    let citas_res = await this.citasManager.getCitasObservable(
     this.actualrepot.dateStartUTMS,
     this.actualrepot.dateEndUTMS,
     this.actualrepot.doctoresFilter,
     this.actualrepot.cajaFilter,
     this.actualrepot.recepcionFilter
    ).toPromise();
    if(citas_res){
      for(let cita of citas_res){
        let aux_cita = new Citas();
        aux_cita.setData(cita);
        aux_citas_list.push(aux_cita);
      }
    }*/
      /*this.userData.getCitasUTms(`${this.actualrepot.dateStartUTMS}--${this.actualrepot.dateEndUTMS}`,this.actualrepot.doctoresFilter,this.actualrepot.cajaFilter,this.actualrepot.recepcionFilter).subscribe(
        (val)=>{
        let aux_results = Object.keys(val).map(function (key) { return val[key]; });
        aux_results.forEach((element) => {
          Debugger.log([`loadReport check element ${element['Nid']}`,element]);
          let aux_cita = new Citas();
          aux_cita.setData(element);
          Debugger.log(['loadReport check aux cita',aux_cita]);
          aux_cita.setDuracionMs();
          Debugger.log(['loadReport check aux cita',aux_cita]);
          if(aux_cita.checkState(StateCita.STATE_CANCELADA)){
            this.noCancel++;
            this.noCitas++;
          }
          if(aux_cita.checkState(StateCita.STATE_FINALIZADA)){
            this.noShow++;
            this.noCitas++;
            if(aux_cita.duracionMs) this.duracionTotalMs += aux_cita.duracionMs;
            if(aux_cita.costo) this.costoTotal = aux_cita.costo;
            if(aux_cita.cobro) this.total+= aux_cita.cobro;
            if(aux_cita.cobroEfectivo) this.totalefectivo+=aux_cita.cobroEfectivo;
	          if(aux_cita.cobroTarjeta) this.totalTarjeta+=aux_cita.cobroTarjeta;
            if(aux_cita.cobroCheque) this.totalCheques+=aux_cita.cobroCheque;
           
	          this.totalcuentas+=100;
            this.totalAdeudo+=100;
            aux_citas_list.push(aux_cita);
           
          }
       });
       this.actualrepot.citas = aux_citas_list;
       this.setduracionTotalStr();
       //this.cargarServicios();
        this.reportloaded = true;
       console.log("citas obtenidas por el reporte",this.actualrepot.citas);
      },
       response => {
         console.log("POST call in error", response);
         if(logoutonerrror)
         this.userData.logout();
       }
      );*/
  }

  

  /*cargarServicios(){
    /*console.log("cargando servicios");
    this.actualrepot.servicios = new Array();
    let aux_arr = new Array();
    aux_arr[0]= this.userData.getDoctoresSimpleArray()
    this.userData.getServicios(aux_arr).subscribe(
      (val)=>{
         let aux_results = Object.keys(val).map(function (key) { return val[key]; });
         let dis  = this;
         aux_results.forEach(function(element) {
          dis.actualrepot.servicios.push(element);          
        });
        dis.actualrepot.citas.forEach(cita => {
          cita.setAddedServices(dis.actualrepot.servicios);
        });
        this.reportloaded = true;
      },
        response => {
          console.log("POST call in error", response);
        },
        () => {
          console.log("citas w services added",this.actualrepot.citas);
          console.log("loadedServices",this.actualrepot.servicios);
      });
       */
      //}


      gohome(){
        //this.navCtrl.setRoot('HomePage');
      }
    

      exportars(){
        console.log('exportars');
        this.reportPresentator.exportExcel();
      }

      
      dismiss() {
        this.viewCtrl.dismiss();
      }

      setOpendetail(cita:Citas, as:boolean){
        console.log('setOpendetail ',cita,as);
        cita.opendetail = as;
      }

      getDateString(datenumber: number):String{
        let aux_dates = DateProvider.getDisplayableDates(new Date(Number(datenumber)));
        //console.log(aux_dates);
        return aux_dates.date +' - '+aux_dates.time;
       }

       moneyFormat( money:number ): string {
        return CitasDataProvider.moneyFormat(money);
       }

}
