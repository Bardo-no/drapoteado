import { Injectable } from '@angular/core';
import { UserDataProvider } from '../user-data/user-data';
import { SubscriptionDataProvider } from '../subscription-data/subscription-data';
import { subscriptions } from '../user-data/subscriptions';
import { Debugger } from '../../providers/user-data/debugger';

@Injectable()
export class PermissionsProvider {

 

  get PLAN_GROUP(){ return SubscriptionDataProvider.PLAN_GROUP }
  get PLAN_BASIC(){ return SubscriptionDataProvider.PLAN_BASIC }
  checkPlan = false;

  constructor(
    public userData: UserDataProvider,
    public subsData: SubscriptionDataProvider
  ) {
   
  }

  /**
  * CheckUserFeature resolves if a feature should appear for this user giving the user roles (permision) and the user plan suscriptions (suscriptions)
  * and has been created to simplify the check on features that requiere both.
  */

 checkUserFeature( permision:Array<number>,suscriptions:Array<number>, debug:boolean = false):boolean{
  Debugger.log(['permision',permision,'suscriptions',suscriptions],debug);
  let ret = false;
  let permisioncheck = false;
  let suscriptionscheck = false;
  if(permision === null || permision === undefined || permision.length === 0){ permisioncheck = true;}
  else{permisioncheck = this.checkUserPermission(permision,debug);}
  if(suscriptions === null || suscriptions === undefined || suscriptions.length === 0){ suscriptionscheck = true;}
  else{suscriptionscheck = this.checkUserSuscription(suscriptions,debug);}
  if(permisioncheck && suscriptionscheck){ ret = true; }
  return ret;
}

checkUserPermission( permision:Array<number> , debug:boolean = false):boolean{
  let ret = false;
  //checking for ANY
  if(permision.indexOf(UserDataProvider.TIPO_ANY) > -1 && this.userData.userData.field_tipo_de_usuario.und.length > 0){ return true;}
  //regular check
  for(let i=0; i< this.userData.userData.field_tipo_de_usuario.und.length; i++){
    if (permision.indexOf(parseInt(this.userData.userData.field_tipo_de_usuario.und[i].value)) > -1) {ret = true; break;}
  }
  return ret;
}

  /**
   * la suscripcion debe resultar false si:
   * el usuario no tiene guardado un id de suscripcion en su data, o esta es 0
   * la suscripcion que carga el usuario esta inactiva.
  */
checkUserSuscription2( suscriptions:Array<number>, debug:boolean = false):boolean{
  let ret = false;
  //si la subscripcion no esta activa (expiro, no ha sido pagada etc) retorna false
  //if(Number(this.userData.field_sub_id.und[0]) === Number(0) || this.subscription === null){return false;}
  if(!this.checkUserPermission([UserDataProvider.TIPO_DOCTOR])){return true;} //now subusers dont get to check on subscription
  if(this.subsData.subscription === null){return false;}
  if(Number(this.subsData.subscription.field_active) === Number(0)){return false;} //if not active returns false also
  // checking for ANY, automatically returns true since we checked for not 0 or null up here
  if(suscriptions.indexOf(UserDataProvider.PLAN_ANY) > -1){ return true;}
  //regular check
  Debugger.log(['suscriptions',suscriptions,'this.subsData.subscription.field_plan_sus',this.subsData.subscription.field_plan_sus],debug);
  if(suscriptions.indexOf(Number(this.subsData.subscription.field_plan_sus)) > -1){ret = true;}
  return ret;
}

checkUserSuscription( suscriptions:Array<number>, debug:boolean = false):boolean{
  let ret = false;
  let plan_sus = new Array();
  //si la subscripcion no esta activa (expiro, no ha sido pagada etc) retorna false
  //if(Number(this.userData.field_sub_id.und[0]) === Number(0) || this.subscription === null){return false;}
  if(!this.checkUserPermission([UserDataProvider.TIPO_DOCTOR])){
    
    this.subsData.Groups.forEach(sub => {
      plan_sus.push(sub.field_plan_sus);
    });
  }else{  //chequeos para doctores mijo
  if(this.subsData.subscription === null){return false;}
  
  if(!this.subsData.subscription.field_active || Number(this.subsData.subscription.field_active) === Number(0)){return false;} //if not active returns false also
  // checking for ANY, automatically returns true since we checked for not 0 or null up here
  plan_sus.push(this.subsData.subscription.field_plan_sus);
  }
  if(suscriptions.indexOf(UserDataProvider.PLAN_ANY) > -1 && plan_sus.length > 0){ return true;}
  //regular check
  //Debugger.log(['suscriptions',suscriptions,'this.subsData.subscription.field_plan_sus',this.subsData.subscription.field_plan_sus],debug);
  let result = plan_sus.filter((having)=>{ return suscriptions.some((wanting)=>{ return Number(wanting) === Number(having) });  });
  //console.log('checkUserSuscription result',result);
  if(result.length > 0){ret = true;}
  return ret;
}

checkifgroup(){
//if(this.checkPlan)
console.log('CHECK IF GROUP', this.checkUserSuscription([SubscriptionDataProvider.PLAN_GROUP]));
return this.checkUserSuscription([SubscriptionDataProvider.PLAN_GROUP]);
 //return this.subsData.isGroup;
}


checkUserPlanHolder(){
  let ret = false;
  if(this.subsData.checkForSub()){
    ret =  this.checkUserPermission([UserDataProvider.TIPO_DOCTOR]) && (Number(this.subsData.subscription.field_plan_holder) === Number(this.userData.userData.uid));
  } 
  return ret;
}

checkPlanholderUid(Uid):boolean{
  let ret = false;
  if(this.subsData.checkForSub()){
    ret =  (Number(this.subsData.subscription.field_plan_holder) === Number(Uid));
  } 
  return ret;
}


}
