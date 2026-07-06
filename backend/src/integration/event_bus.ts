import { EventEmitter } from 'events';

export class EventBus {
  private static emitter = new EventEmitter();

  static subscribe(event: string, callback: (...args: any[]) => void | Promise<void>): void {
    this.emitter.on(event, callback);
  }

  static unsubscribe(event: string, callback: (...args: any[]) => void | Promise<void>): void {
    this.emitter.off(event, callback);
  }

  static publish(event: string, payload: any): void {
    console.log(`[EVENT-BUS] Event Published: ${event} | Payload Uid: ${payload?.uid || 'Unknown'}`);
    
    const listeners = this.emitter.listeners(event);
    
    // Trigger listeners in the background so that they are non-blocking to the caller
    for (const listener of listeners) {
      try {
        const result = listener(payload);
        if (result instanceof Promise) {
          result.catch(err => {
            console.error(`[EVENT-BUS] Asynchronous listener for event '${event}' failed:`, err);
          });
        }
      } catch (err) {
        console.error(`[EVENT-BUS] Synchronous listener for event '${event}' threw an error:`, err);
      }
    }
  }
}
export default EventBus;
