
import { IDisposable } from './IDisposable';

export interface TypedEventListener<T> {
  (event: T): any;
}

/** passes through events as they happen. You will not get events from before you start listening */
export class TypedEvent<T> implements IDisposable {
  private listeners: TypedEventListener<T>[] = [];
  private listenersOncer: TypedEventListener<T>[] = [];

  on = (listener: TypedEventListener<T>): IDisposable => {
    this.listeners.push(listener);
    return {
      dispose: () => this.off(listener)
    };
  };

  once = (listener: TypedEventListener<T>): void => {
    this.listenersOncer.push(listener);
  };

  off = (listener: TypedEventListener<T>) => {
    const callbackIndex = this.listeners.indexOf(listener);
    if (callbackIndex > -1) {
      this.listeners.splice(callbackIndex, 1);
    }
  };

  emit = (event: T) => {
    /** Update any general listeners */
    this.listeners.forEach(listener => listener(event));

    /** Clear the `once` queue */
    if (this.listenersOncer.length > 0) {
      const toCall = this.listenersOncer;
      this.listenersOncer = [];
      toCall.forEach(listener => listener(event));
    }
  };

  pipe = (te: TypedEvent<T>): IDisposable => {
    return this.on(e => te.emit(e));
  };

  dispose (): void {
    this.listeners = [];
    this.listenersOncer = [];
  }
}
