import {Activity} from './activity';

export interface DayActivity {
  id: string;
  name: string;
  activities: Array<Activity>;
  isNew: boolean;
  date: string;
}
