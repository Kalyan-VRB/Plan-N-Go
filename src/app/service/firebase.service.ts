import {Injectable} from '@angular/core';
import {DayActivity} from '../interface/day-activity';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  setDoc,
  updateDoc
} from '@angular/fire/firestore';
import {DocumentSnapshot} from 'firebase/firestore';
import {Trip} from '../interface/trip';
import {Activity} from '../interface/activity';
import {Forum} from '../interface/forum';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(private firestore: Firestore) {
  }

  async checkAndCreateUser(userId: string): Promise<boolean> {
    const usersCollectionRef = collection(this.firestore, 'users');

    const usersSnapshot = await getDocs(usersCollectionRef);
    const userExists = usersSnapshot.docs.some(doc => doc.id === userId);

    if (userExists) {
      return true;
    }
    const userRef = doc(usersCollectionRef, userId);
    await setDoc(userRef, {});
    return false;
  }

  async createUserWithTrips(userId: string) {
    const userRef = doc(collection(this.firestore, 'users'), userId);
    await setDoc(userRef, {});
    const tripId = 'T001';
    const tripRef = doc(collection(userRef, 'trips'), tripId);
    await setDoc(tripRef, {
      name: 'Kashmir',
      id: tripId,
      details: []
    });
    await this.addDetailsToTrip(userId, 'T001', []);
  }

  async getDayActivity(userId: string, tripId: string, dayActivityId: string): Promise<any | null> {
    try {
      const dayActivityRef = doc(
        this.firestore,
        `users/${userId}/trips/${tripId}/details/${dayActivityId}`
      );
      const dayActivitySnapshot = await getDoc(dayActivityRef);

      if (dayActivitySnapshot.exists()) {
        return dayActivitySnapshot.data();
      } else {
        console.error('No such day activity document!');
        return null;
      }
    } catch (error) {
      console.error('Error fetching day activity:', dayActivityId);
      return null;
    }
  }

  async updateTripForUser(userId: string, tripId: string, tripData: { name: string; details: DayActivity[] }) {
    const tripRef = doc(collection(doc(collection(this.firestore, 'users'), userId), 'trips'), tripId);
    await updateDoc(tripRef, {
      name: tripData.name,
      details: tripData.details
    });
  }


  async saveActivityForDayActivity(
    userId: string,
    tripId: string,
    dayActivityId: string,
    activity: Activity,
    isNew: boolean
  ): Promise<Activity | null> {
    try {
      const dayActivityRef = doc(this.firestore, `users/${userId}/trips/${tripId}/details/${dayActivityId}`);
      const dayActivitySnapshot = await getDoc(dayActivityRef);

      if (dayActivitySnapshot.exists()) {
        const dayActivityData = dayActivitySnapshot.data() as DayActivity;
        let activityRef;

        if (isNew) {
          activityRef = await addDoc(collection(dayActivityRef, 'activities'), activity);
          activity.id = activityRef.id;
          dayActivityData.activities.push(activity);
        } else {
          const existingActivityIndex = dayActivityData.activities.findIndex(a => a.id === activity.id);

          if (existingActivityIndex >= 0) {
            dayActivityData.activities[existingActivityIndex] = activity;
          } else {
            console.warn('Activity not found, adding as new.');
            dayActivityData.activities.push(activity);
          }
        }

        await setDoc(dayActivityRef, {activities: dayActivityData.activities}, {merge: true});
        return activity;
      } else {
        console.error('No such DayActivity document!');
        return null;
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      return null;
    }
  }

  async deleteActivityFromDayActivity(
    userId: string,
    tripId: string,
    dayActivityId: string,
    activityId: string
  ): Promise<boolean> {
    try {
      const dayActivityRef = doc(this.firestore, `users/${userId}/trips/${tripId}/details/${dayActivityId}`);
      const dayActivitySnapshot = await getDoc(dayActivityRef);

      if (dayActivitySnapshot.exists()) {
        const dayActivityData = dayActivitySnapshot.data() as DayActivity;
        const activityIndex = dayActivityData.activities.findIndex(a => a.id === activityId);

        if (activityIndex >= 0) {
          dayActivityData.activities.splice(activityIndex, 1);
          await setDoc(dayActivityRef, {activities: dayActivityData.activities}, {merge: true});
          return true;
        } else {
          console.warn('Activity not found for deletion.');
          return false;
        }
      } else {
        console.error('No such DayActivity document!');
        return false;
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      return false;
    }
  }


  async saveDayActivityForTrip(
    userId: string,
    tripId: string,
    dayActivity: DayActivity,
    newDayActivity: boolean
  ): Promise<DayActivity | null> {
    try {
      let dayActivityRef;

      if (!dayActivity.id && newDayActivity) {
        const detailsCollectionRef = collection(
          doc(collection(this.firestore, 'users'), userId),
          'trips',
          tripId,
          'details'
        );
        const newDocRef = await addDoc(detailsCollectionRef, dayActivity);
        dayActivity.id = newDocRef.id;
        dayActivityRef = newDocRef;
      } else {
        dayActivityRef = doc(
          collection(
            doc(collection(this.firestore, 'users'), userId),
            'trips',
            tripId,
            'details'
          ),
          dayActivity.id
        );
      }

      dayActivity.activities = dayActivity.activities.map((activity) => {
        if (activity.isNew) {
          const newId = doc(collection(this.firestore, 'placeholder')).id;
          return {
            ...activity,
            id: newId,
            isNew: false,
          };
        }
        return activity;
      });

      await setDoc(dayActivityRef, dayActivity, {merge: true});

      const updatedSnapshot = await getDoc(dayActivityRef);
      if (updatedSnapshot.exists()) {
        return updatedSnapshot.data() as DayActivity;
      } else {
        console.error('No such day activity document after saving!');
        return null;
      }
    } catch (error) {
      console.error('Error saving day activity:', error);
      return null;
    }
  }

  async addDetailsToTrip(userId: string, tripId: string, details: DayActivity[]) {
    const detailsCollectionRef = collection(
      this.firestore,
      `users/${userId}/trips/${tripId}/details`
    );
    for (const detail of details) {
      const detailDocRef = doc(detailsCollectionRef, detail.id.toString());
      await setDoc(detailDocRef, detail);
    }
  }

  async getTripActivities(userId: string, tripId: string): Promise<DayActivity[]> {
    const detailsCollectionRef = collection(
      this.firestore,
      `users/${userId}/trips/${tripId}/details`
    );
    const detailsSnapshot = await getDocs(detailsCollectionRef);
    return detailsSnapshot.docs.map(doc => doc.data() as DayActivity);
  }


  async getUserTrips(userId: string): Promise<Trip[]> {
    const userRef = doc(this.firestore, 'users', userId);
    const tripsCollectionRef = collection(userRef, 'trips');
    const tripsSnapshot = await getDocs(tripsCollectionRef);

    return tripsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data()['name'] as string,
    } as Trip));
  }

  async addTripForUser(userId: string, tripData: Trip) {
    const userRef = doc(this.firestore, 'users', userId);
    const tripsCollectionRef = collection(userRef, 'trips');

    try {
      const newTripRef = await addDoc(tripsCollectionRef, {
        ...tripData,
        id: ''
      });

      await updateDoc(newTripRef, {id: newTripRef.id});
      console.log(`Trip added with ID: ${newTripRef.id}`);
    } catch (error) {
      console.error('Error adding trip:', error);
    }
  }

  async deleteTripForUser(userId: string, tripId: string) {
    const userRef = doc(this.firestore, 'users', userId);
    const tripRef = doc(userRef, 'trips', tripId);

    try {
      await deleteDoc(tripRef);
      console.log(`Trip with ID: ${tripId} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  }

  async deleteDayActivity(userId: string, tripId: string, dayActivityId: string): Promise<boolean> {
    try {
      const dayActivityRef = doc(
        this.firestore,
        `users/${userId}/trips/${tripId}/details/${dayActivityId}`
      );

      await deleteDoc(dayActivityRef);
      return true;
    } catch (error) {
      console.error('Error deleting DayActivity:', error);
      return false;
    }
  }

  async getForums(
    userId: string,
    tripId: string
  ): Promise<Forum[]> {
    const forums: Forum[] = [];
    const announcementsRef = collection(
      this.firestore,
      `users/${userId}/trips/${tripId}/announcements`
    );

    try {
      const snapshot = await getDocs(announcementsRef);
      snapshot.forEach((doc) => {
        forums.push({
          id: doc.id,
          date: doc.data()['date'],
          content: doc.data()['content'],
        });
      });
      return forums;
    } catch (error) {
      console.error('Error fetching forums:', error);
      return [];
    }
  }

  async addAnnouncement(
    userId: string,
    tripId: string,
    forum: Forum
  ): Promise<void> {
    try {
      if (forum.id) {
        const announcementRef = doc(
          this.firestore,
          `users/${userId}/trips/${tripId}/announcements/${forum.id}`
        );
        await setDoc(announcementRef, {
          id: forum.id,
          date: forum.date,
          content: forum.content,
        });
      } else {
        const announcementsRef = collection(
          this.firestore,
          `users/${userId}/trips/${tripId}/announcements`
        );
        const newDocRef = await addDoc(announcementsRef, {
          date: forum.date,
          content: forum.content,
        });
        forum.id = newDocRef.id;
        await setDoc(newDocRef, {
          id: forum.id,
          date: forum.date,
          content: forum.content,
        });
      }
      console.log('Announcement added successfully!');
    } catch (error) {
      console.error('Error adding announcement:', error);
    }
  }


  async editAnnouncement(
    userId: string,
    tripId: string,
    forum: Forum
  ): Promise<void> {
    console.error('Forum', forum);
    if (!forum.id) {
      console.error('Forum ID is required to edit an announcement.');
      return;
    }

    const announcementRef = doc(
      this.firestore,
      `users/${userId}/trips/${tripId}/announcements/${forum.id}`
    );

    try {
      await updateDoc(announcementRef, {
        id: forum.id,
        date: forum.date,
        content: forum.content,
      });
      console.log('Announcement updated successfully!');
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  }


  async deleteAnnouncement(
    userId: string,
    tripId: string,
    forumId: string
  ): Promise<void> {
    const announcementRef = doc(
      this.firestore,
      `users/${userId}/trips/${tripId}/announcements/${forumId}`
    );

    try {
      await deleteDoc(announcementRef);
      console.log('Announcement deleted successfully!');
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  }

}
