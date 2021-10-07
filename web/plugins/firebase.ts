import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import { Plugin } from '@nuxt/types';
import Project, { ProjectJSONType } from '~/assets/scripts/service/Project';

if (!firebase.apps.length) {
  firebase.initializeApp(process.env.firebase as any);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();

type GetProjectResponse = Promise<{ project: Project, doc: any }>;

const graphCollectionName = 'graph';

const getProjectDocument = async (id: string): Promise<firebase.firestore.DocumentData> => {
  const query = firestore.collection(graphCollectionName).doc(id);
  const doc = await query.get();
  return Promise.resolve(doc);
};

const getProject = async (id: string): GetProjectResponse => {
  const doc = await getProjectDocument(id);
  if (doc.exists) {
    const id = doc.ref.id;
    const json = doc.data();
    const project = new Project();
    project.fromJSON(id, json as ProjectJSONType);
    return Promise.resolve({
      project, doc: json
    });
  }
  return Promise.reject(new Error('this file is not existed.'));
};

const duplicateProject = async (id: string): Promise<Project> => {
  const { project } = await getProject(id);
  project.title += ' copy';
  project.timestamp = firebase.firestore.Timestamp.now();
  const ref = await firestore.collection(graphCollectionName).add(project.toJSON());
  project.id = ref.id;
  return Promise.resolve(project);
};

const deleteProject = async (id: string): Promise<void> => {
  const doc = await getProjectDocument(id);
  if (doc.exists) {
    const data = doc.data() as ProjectJSONType;
    data.deleted = true;
    await doc.ref.update(data);
    return Promise.resolve();
  }
  return Promise.reject(new Error('this file is not existed.'));
};

const getTimestamp = (): firebase.firestore.Timestamp => {
  return firebase.firestore.Timestamp.now();
};

declare module 'vue/types/vue' {
  interface Vue {
    $firebase: firebase.app.App;
    $auth: firebase.auth.Auth;
    $firestore: firebase.firestore.Firestore;
    $storage: firebase.storage.Storage;
    $getProjectDocument(id: string): Promise<firebase.firestore.DocumentData>;
    $getProject(id: string): GetProjectResponse;
    $duplicateProject(id: string): Promise<Project>;
    $deleteProject(id: string): Promise<void>;
    $getTimestamp(): firebase.firestore.Timestamp;
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $firebase: firebase.app.App;
    $auth: firebase.auth.Auth;
    $firestore: firebase.firestore.Firestore;
    $storage: firebase.storage.Storage;
    $getProjectDocument(id: string): Promise<firebase.firestore.DocumentData>;
    $getProject(id: string): GetProjectResponse;
    $duplicateProject(id: string): Promise<Project>;
    $deleteProject(id: string): Promise<void>;
    $getTimestamp(): firebase.firestore.Timestamp;
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $firebase: firebase.app.App
    $auth: firebase.auth.Auth
    $firestore: firebase.firestore.Firestore
    $storage: firebase.storage.Storage
  }
}

const FirebasePlugin: Plugin = (context, inject) => {
  inject('firebase', firebase);
  inject('auth', auth);
  inject('firestore', firestore);
  inject('storage', storage);
  inject('getProjectDocument', getProjectDocument);
  inject('getProject', getProject);
  inject('duplicateProject', duplicateProject);
  inject('deleteProject', deleteProject);
  inject('getTimestamp', getTimestamp);
};

export default FirebasePlugin;
