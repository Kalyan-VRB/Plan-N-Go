import {Activity} from './activity';

export interface ActivityAction {
  actionType: string;
  activity: Activity;
}
