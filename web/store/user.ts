
import firebase from 'firebase/compat/app';
import { mutationTree, actionTree } from 'typed-vuex';

export type UserState = {
  uid?: string;
  name?: string;
  email?: string;
  imageUrl?: string;
};

export const state = (): UserState => ({
  uid: undefined,
  name: undefined,
  email: undefined,
  imageUrl: undefined
});

export type RootState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  store (state, user: UserState) {
    state.uid = user.uid;
    state.name = user.name;
    state.email = user.email;
    state.imageUrl = user.imageUrl;
  },
  drop (state) {
    state.uid = undefined;
    state.name = undefined;
    state.email = undefined;
    state.imageUrl = undefined;
  }
});

export const actions = actionTree(
  { state, mutations },
  {
    async signIn () {
      const provider = new firebase.auth.GoogleAuthProvider();
      await this.$auth.signInWithPopup(provider);
    },
    async signOut () {
      await this.$auth.signOut();
    }
  }
);
