import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DeviceIdService {
  private readonly storageKey = 'dlatelabs_device_id';
  private readonly deviceId: string;

  constructor() {
    let id = localStorage.getItem(this.storageKey);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(this.storageKey, id);
    }
    this.deviceId = id;
  }

  getDeviceId(): string {
    return this.deviceId;
  }
}
