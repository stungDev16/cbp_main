// services/DeviceControlSubject.ts

import type { DeviceAction, DeviceObserver } from "@/types/pattern/DeviceObserver";

export class DeviceControlSubject {
  private observers: Map<string, DeviceObserver> = new Map();
  // Start with sync enabled by default
  private isEnabled: boolean = true;

  subscribe(observer: DeviceObserver): void {
    this.observers.set(observer.id, observer);
    console.log(`Device ${observer.id} subscribed to sync control`);
  }

  unsubscribe(deviceId: string): void {
    this.observers.delete(deviceId);
    console.log(`Device ${deviceId} unsubscribed from sync control`);
  }

  notify(action: DeviceAction): void {
    if (!this.isEnabled) return;

    console.log(`Broadcasting action from device ${action.sourceDeviceId}:`, action);
    
    // Notify all observers except the source device
    this.observers.forEach((observer) => {
      if (observer.id !== action.sourceDeviceId) {
        try {
          observer.executeAction(action);
        } catch (error) {
          console.error(`Error executing action on device ${observer.id}:`, error);
        }
      }
    });
  }

  enableSyncControl(): void {
    this.isEnabled = true;
    console.log('Sync control enabled - all devices will mirror actions');
  }

  disableSyncControl(): void {
    this.isEnabled = false;
    console.log('Sync control disabled - devices operate independently');
  }

  getObserverCount(): number {
    return this.observers.size;
  }

  isActive(): boolean {
    return this.isEnabled;
  }
}

// Global singleton instance
export const deviceControlSubject = new DeviceControlSubject();