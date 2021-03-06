import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { UserDataProvider } from '../../providers/user-data/user-data';
import { ServiciosManagerProvider } from '../../providers/servicios-manager/servicios-manager';
import { LoaderProvider } from '../../providers/loader/loader';
import { CitasDataProvider } from '../../providers/citas-data/citas-data';
//import { servicios } from '../../providers/user-data/servicios';



/**
 * Generated class for the ServiciosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-servicios',
  templateUrl: 'servicios.html',
})
export class ServiciosPage {

  showMis:boolean = true;
  showGrupales:boolean = true;
  
  //servicios:servicios[];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public modalCtrl: ModalController,
    public userData: UserDataProvider,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public servicioMan: ServiciosManagerProvider,
    public loader: LoaderProvider
  ) {
    //this.servicios = new Array();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad');
    console.log('lista de servicios es',this.servicioMan.servicios);
    this.cargarServicios();
  }

  ToggleView(val){
    switch(val){
      case 1: this.showMis = !this.showMis;break;
      case 2:  this.showGrupales = !this.showGrupales; break;
    }
  }

  get viewMisLabel(){ return this.showMis ? 'Ocultar' : 'Mostrar'; }
  get viewGroupLabel(){ return this.showGrupales ? 'Ocultar' : 'Mostrar'; }




  openNuevoservicio(){
    this.servicioMan.isgroup = false;
    this.openNuevo();
  }

  openNuevoservicioGrupal(){
    this.servicioMan.isgroup = true;
    this.openNuevo();
  }

  openNuevo(){
    let Modal = this.modalCtrl.create("NuevoservicioModalPage", undefined, { cssClass: "smallModal nuevoservicioModal" });
    Modal.present({});
  }
  

  editServicio( edit_servicio ){
    let Modal = this.modalCtrl.create("NuevoservicioModalPage",{ servicio: edit_servicio.getData() } , { cssClass: "smallModal nuevoservicioModal" });
    Modal.present({});
  }

  async cargarServicios(){
    /*this.loader.presentLoader('cargando...');
    await this.servicioMan.loadServicios();
    this.loader.dismissLoader();*/
  }

 

  deleteServicio( delete_servicio ){
    let alert = this.alertCtrl.create({
      title: 'Eliminar',
      message: '¿Está seguro de que desea eliminar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
           
          }
        },
        {
          text: 'Eliminar',
          handler: () => {
            //console.log('Buy clicked');
            this.servicioMan.deleteService(delete_servicio).subscribe(
              (val)=>{
                 this.servicioMan.removeServicioFromLists(delete_servicio);
                }
            );
          }
        }
      ]
    });
    alert.present();
  } 



presentToast(msg) {
  let toast = this.toastCtrl.create({
    message: msg,
    duration: 6000,
    position: 'top'
  });
  toast.present();
}

moneyFormat( money:number ): string {
  return CitasDataProvider.moneyFormat(money);
 }
  
}
