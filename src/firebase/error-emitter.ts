// A simple event emitter for handling global errors
// This allows different parts of the app to communicate without direct dependencies.

type EventMap = Record<string, any[]>;
type EventKey<T extends EventMap> = string & keyof T;

class EventEmitter<T extends EventMap> {
  private listeners: { [K in keyof T]?: ((...args: T[K]) => void)[] } = {};

  on<K extends EventKey<T>>(eventName: K, listener: (...args: T[K]) => void) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName]!.push(listener);
  }

  off<K extends EventKey<T>>(eventName: K, listener: (...args: T[K]) => void) {
    const eventListeners = this.listeners[eventName];
    if (eventListeners) {
      this.listeners[eventName] = eventListeners.filter(l => l !== listener);
    }
  }

  emit<K extends EventKey<T>>(eventName: K, ...args: T[K]) {
    const eventListeners = this.listeners[eventName];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(...args));
    }
  }
}

// Define the types of errors our app will handle
import { FirestorePermissionError } from './errors';

interface ErrorEvents {
  'permission-error': [FirestorePermissionError];
}

// Create a singleton instance of the event emitter
export const errorEmitter = new EventEmitter<ErrorEvents>();
