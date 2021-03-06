import { Injectable } from '@angular/core';
import { ModalController, Modal } from 'ionic-angular';
import { PermissionsProvider } from '../permissions/permissions';
import { UserDataProvider } from '../user-data/user-data';
import { DrupalUserManagerProvider } from '../drupal-user-manager/drupal-user-manager';
import { ServiciosManagerProvider } from '../servicios-manager/servicios-manager';
import { SubscriptionDataProvider } from '../subscription-data/subscription-data';
import { BaseUrlProvider } from '../base-url/base-url';

/*
  Generated class for the TutorialProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class TutorialProvider {
  isTutorial:boolean = false;
  serviceCreated:boolean = false;
  usuarioCreated:boolean = false;
  tutorialMainModal: Modal = null;
  serviciosModal: Modal = null;
  usuariosModal: Modal = null;
  canClose:boolean =false;

  usergroupexplain = true;
  get isGroup(){ return this.subsData.isGroup };

  subaccountsleft = 0
  isplanholder = false;
;

  tutorial_users_selected_option:number = 0;
  tutorial_user_created_step:number = 0;

  tutorial_ongroup:boolean  = false;
  tutorial_group_page:number = 1;


  static TUTORIAL_ACTIVE = true;
  static TUTORIAL_FINISHED = false;

  static TUTORIAL_USER_CNR = 1; // opcion de caja y recepcion
  static TUTORIAL_USER_BOTH = 2; //opcion de un usuario para caja y otro para recepcion
  static TUTORIAL_USER_CODE = 3; //opcion de agregar usuarios por codigo

 static TUTORIAL_USER_STEP_CAJA  = 1;
 static TUTORIAL_USER_STEP_RECEPCION = 2;
 

 static TUTORIAL_GRUPO_ACTIVE = true;
 static TUTORIAL_GROUP_FINISHED = false;
 static TUTORIAL_GROUP_STATE_FROMSTART:number = 1;
 static TUTORIAL_GROUP_STATE_FROMBASIC:number = 2;
 static TUTORIAL_GROUP_STATE_FINISHED:number = 3;
 static TUTORIAL_GROUP_MAX_PAGE_FROMBASIC = 4;
 static TUTORIAL_GROUP_MAX_PAGE_FROMSTART = 3;
get gmaxpage(){
  let ret = 4;
  switch (this.userData.TutorialState ){
    case TutorialProvider.TUTORIAL_GROUP_STATE_FROMBASIC: ret = TutorialProvider.TUTORIAL_GROUP_MAX_PAGE_FROMBASIC; break;
    case TutorialProvider.TUTORIAL_GROUP_STATE_FROMSTART: ret = TutorialProvider.TUTORIAL_GROUP_MAX_PAGE_FROMSTART; break;
  }
  return ret;
} 
 

  get TUTORIAL_ACTIVE(){ return TutorialProvider.TUTORIAL_ACTIVE; }
  get TUTORIAL_FINISHED(){ return TutorialProvider.TUTORIAL_FINISHED; }
  get TUTORIAL_USER_CNR(){ return TutorialProvider.TUTORIAL_USER_CNR; }
  get TUTORIAL_USER_BOTH(){ return TutorialProvider.TUTORIAL_USER_BOTH; }
  get TUTORIAL_USER_CODE(){ return TutorialProvider.TUTORIAL_USER_CODE; }

  get TUTORIAL_USER_STEP_CAJA(){ return TutorialProvider.TUTORIAL_USER_STEP_CAJA; }
  get TUTORIAL_USER_STEP_RECEPCION(){ return TutorialProvider.TUTORIAL_USER_STEP_RECEPCION; }

  


  constructor(
    public modalCtrl: ModalController,
    public permissions: PermissionsProvider,
    public userData: UserDataProvider,
    public userMan: DrupalUserManagerProvider,
    public servMan: ServiciosManagerProvider,
    public subsData: SubscriptionDataProvider,
    public bu: BaseUrlProvider

  ) {
  }

  checkNStart(){
   
    if(
      this.permissions.checkUserSuscription([UserDataProvider.PLAN_ANY]) 
      && this.checkTutorialState()
      && !this.bu.reloading
      ){
      this.canClose = false;
      this.openTutorial();
    }else{
      if(this.checkTutorialGroupState()){
        this.openGroupTutorial();
      }
    }
  }

  checkGPage(gpage, gtut){
  return Number(this.tutorial_group_page) === Number(gpage) && this.userData.TutorialState === Number(gtut);
  }

  nextGPage(){
    this.tutorial_group_page++;
  }

  openTutorialCanClose(){
    this.canClose = true;
    this.openTutorial();
  }

  tutorialReplayAvailability(){
    if(this.permissions.checkUserPermission([UserDataProvider.TIPO_DOCTOR])
      && this.userData.userData.tutorial_state.und 
      && Number(this.userData.userData.tutorial_state.und[0].value) !== 0
    ){ return true; } 
    return false;
  }

  checkTutorialState(){
   
    if(
      this.permissions.checkUserSuscription([UserDataProvider.PLAN_ANY])
      && this.permissions.checkUserPermission([UserDataProvider.TIPO_DOCTOR])
      && this.userData.userData.tutorial_state.und 
      && Number(this.userData.userData.tutorial_state.und[0].value) === 0
    ){
      return TutorialProvider.TUTORIAL_ACTIVE;
    }else{
      return TutorialProvider.TUTORIAL_FINISHED;
    }
  }

  checkTutorialGroupState(){
    if(
      this.permissions.checkUserSuscription([SubscriptionDataProvider.PLAN_GROUP])
      && this.permissions.checkUserPermission([UserDataProvider.TIPO_DOCTOR])
      && this.userData.userData.tutorial_state.und 
      && ( this.userData.TutorialState === TutorialProvider.TUTORIAL_GROUP_STATE_FROMBASIC || this.userData.TutorialState === TutorialProvider.TUTORIAL_GROUP_STATE_FROMSTART ) 
    ){
      return true;
    }else{
      return false;
    }

  }

  openTutorial(){
      //this.tutorialMainModal = this.modalCtrl.create("WelcomeModalPage");
      this.subaccountsleft = this.subsData.getSubAccountsLeft();
    
      this.isplanholder = this.permissions.checkUserPlanHolder();
      console.log('openTutorial', this.subaccountsleft,this.isGroup,this.isplanholder  );
      this.tutorialMainModal = this.modalCtrl.create("WelcomeModalPage", undefined, {enableBackdropDismiss: this.canClose});
      this.tutorialMainModal.present({});
  }

  openGroupTutorial(){
    console.log('opening group tutorial here');
    this.tutorial_ongroup = true;
    this.tutorial_group_page = 1;
    this.tutorialMainModal = this.modalCtrl.create("WelcomeModalPage", undefined, {enableBackdropDismiss: this.canClose});
      this.tutorialMainModal.present({});

  }

  async finishTutorial(){
    this.userData.userData.tutorial_state.und[0].value = ""+TutorialProvider.TUTORIAL_GROUP_STATE_FROMSTART;
    let cloneData = {
      uid:this.userData.userData.uid,
      field_tutorial_state: {und: [{value: ""+TutorialProvider.TUTORIAL_GROUP_STATE_FROMSTART}]},
    }
    await this.userMan.updateUserd(cloneData).toPromise();
    this.tutorialMainModal.dismiss();
    if(this.checkTutorialGroupState()){
      this.openGroupTutorial();
    }
    console.log('update tutorial at dismiss');
  }

  async finishGTutorial(){
    this.userData.userData.tutorial_state.und[0].value = ""+TutorialProvider.TUTORIAL_GROUP_STATE_FINISHED;
    let cloneData = {
      uid:this.userData.userData.uid,
      field_tutorial_state: {und: [{value: ""+TutorialProvider.TUTORIAL_GROUP_STATE_FINISHED}]},
    }
    await this.userMan.updateUserd(cloneData).toPromise();
    this.tutorialMainModal.dismiss();
  }

  showServicioModal(){
    this.servMan.isgroup = false;
    this.serviciosModal = this.modalCtrl.create("NuevoservicioModalPage", undefined, { enableBackdropDismiss: this.canClose , cssClass: "smallModal nuevoservicioModal" });
    this.serviciosModal.present({});
  }

  closeServicioModal(){
    //this.serviciosModal.dismiss();
  }

  showUsuarioModal(){
    this.usuariosModal = this.modalCtrl.create("NuevousuarioModalPage", undefined, {enableBackdropDismiss: this.canClose , cssClass: "smallModal nuevousuarioModal" });
    this.usuariosModal.present({});
  }

  closeUsuarioModal(){
    this.usuariosModal.dismiss();
  }

  


}
