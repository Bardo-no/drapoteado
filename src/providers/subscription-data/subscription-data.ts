import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { planes } from '../user-data/planes';
import { Observable } from 'rxjs/Observable';

/*
  Generated class for the SubscriptionDataProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SubscriptionDataProvider {
  nid:number = null; //nid de la subscripcion
  uid:number = null; //uid del doctor
  plan:planes = null;//objeto de plan completo
  field_plan_sus:number=null //nid del plan
  field_subusuarios:number[]=null; //array of sub acound uids

  constructor(public http: HttpClient) {
  }


}