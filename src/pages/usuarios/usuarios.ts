import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ViewController } from 'ionic-angular';
import { NuevousuarioModalPage } from '../nuevousuario-modal/nuevousuario-modal';
import { ModalController } from 'ionic-angular';
import { userd, UserDataProvider } from '../../providers/user-data/user-data';

/**
 * Generated class for the UsuariosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-usuarios',
  templateUrl: 'usuarios.html',
})
export class UsuariosPage {
  usersd:userd[];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public modalCtrl: ModalController, 
    public userData:UserDataProvider,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
  ) {
    this.usersd = new Array();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UsuariosPage');
    this.cargarUsuarios();
  }

  openNuevousuario(){
    let Modal = this.modalCtrl.create(NuevousuarioModalPage, undefined, { cssClass: "smallModal nuevousuarioModal" });
    Modal.onDidDismiss(data => {
      this.cargarUsuarios();
    });
    Modal.present({});
  }

  editUsuario( userd ){
    let Modal = this.modalCtrl.create(NuevousuarioModalPage, { 'userd': userd }, { cssClass: "smallModal nuevousuarioModal" });
    Modal.onDidDismiss(data => {
      this.cargarUsuarios();
    });
    Modal.present({});
  }

  
  deleteUsuario( userd ){
    let alert = this.alertCtrl.create({
      title: 'Eliminar',
      message: '¿está seguro de que desea remover? el usuario no se borrara, solo dejara de administrar sus citas',
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
            this,this.removeUsuario( userd );
          }
        }
      ]
    });
    alert.present();
  }

  removeUsuario( userd ){
    let loader = this.loadingCtrl.create({
      content: "Guardando . . ."
    });
    
    //remove this user from array of doctors
    console.log('doctors to remove',userd.field_doctores);
    let index = userd.field_doctores.und.indexOf(this.userData.userData.uid);
    userd.field_doctores.und.splice(index,1);
    console.log(userd.field_doctores.und);
    if(userd.field_doctores.und.length === 0){
      //userd.field_doctores.und.push("_none");
      console.log("este usuario ya no tiene doctores hay que bloquearlo?");
    }
    console.log("updating", userd);
    this.userData.updateUserd( userd ).subscribe(
      (val)=>{
        console.log("usuarioUpdated");
        this.presentToast("Completado");
        loader.dismiss();
        this.cargarUsuarios();
      },
      response => {
        console.log("POST call in error", response);
        console.log("show error");
        for (var key in response.error.form_errors) {
          this.presentAlert(key, response.error.form_errors[key]);
        }
      }
    );
  }

  
  cargarUsuarios(){
    console.log("cargando usuarios");
    this.usersd = new Array();
    let doctors_array =  new Array();
    doctors_array.push(this.userData.userData.uid);
    let dis = this;
    this.userData.getUsers(doctors_array,"").subscribe(
      (val)=>{ 
        let aux_results = Object.keys(val).map(function (key) { return val[key]; });
        aux_results.forEach(function(element) {
          console.log(element);
          let aux_user = dis.userData.getEmptyUserd();
          aux_user.uid = element.uid;
          aux_user.name = element.name;
          aux_user.field_alias.und[0].value = element.field_alias;
          aux_user.field_nombre.und[0].value = element.field_nombre;
          aux_user.field_apellidos.und[0].value = element.field_apellidos;
          aux_user.field_useremail.und[0].email = element.field_useremail.email;
          aux_user.mail = element.mail;
          aux_user.status = "1";
          aux_user.field_doctores.und = new Array();
          let aux_docs = Object.keys(element.field_doctores).map(function (key) { return element.field_doctores[key]; });
          aux_docs.forEach(function(element){
            console.log("entrodeucing",element);
            aux_user.field_doctores.und.push(element.uid);
          });
          console.log(element.field_tipo_de_usuario);
          aux_user.field_tipo_de_usuario.und = new Array();
          let aux_tipos = Object.keys(element.field_tipo_de_usuario).map(function (key) { return element.field_tipo_de_usuario[key]; });
          aux_tipos.forEach(function(element){
            aux_user.field_tipo_de_usuario.und.push(element);
          });
          console.log( aux_user.field_tipo_de_usuario);
          dis.usersd.push(aux_user);
       });
       console.log(dis.usersd);
      },
       response => {
         console.log("POST call in error", response);
       }
      );
  }
  

  


presentToast(msg) {
  let toast = this.toastCtrl.create({
    message: msg,
    duration: 6000,
    position: 'top'
  });
  toast.present();
}

close(){
  this.viewCtrl.dismiss();
}

presentAlert(key,Msg) {
  let alert = this.alertCtrl.create({
    title: key,
    subTitle: Msg,
    buttons: ['Dismiss']
  });
  alert.present();
}

  

}