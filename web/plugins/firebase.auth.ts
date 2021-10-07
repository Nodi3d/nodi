
import firebase from 'firebase/compat/app';
import { Context } from '@nuxt/types';
import { UserState } from '~/store/user';

const collection = 'user';

const getUser = async (firestore: firebase.firestore.Firestore, uid: string): Promise<undefined | UserState> => {
  const q = firestore.collection(collection).where('uid', '==', uid);
  const result = await q.get();
  if (result.empty) {
    return Promise.resolve(undefined);
  }

  const doc = result.docs[0];
  const data = doc.data();
  return Promise.resolve({
    uid,
    name: data.name,
    email: data.email,
    imageUrl: data.imageUrl
  });
};

const createUser = async (firestore: firebase.firestore.Firestore, user: UserState): Promise<UserState> => {
  await firestore.collection(collection).add(user);
  return user;
};

export default (context: Context) => {
  const { app } = context;
  const { $accessor } = app;

  const firestore = app.$firestore;
  app.$auth.onAuthStateChanged(async (user) => {
    if (user !== null) {
      const u = await getUser(firestore, user.uid);
      if (u === undefined) {
        const created = await createUser(firestore, {
          uid: user.uid,
          name: user.displayName as string,
          email: user.email as string,
          imageUrl: user.photoURL as string
        });
        $accessor.user.store(created);
      } else {
        $accessor.user.store(u);
      }
    } else {
      $accessor.user.drop();
    }
  });
};
