export interface StorageManager {
  getAllData: () => {} | Record<string, string>;
  setItem: (key: string, value: string) => void;
  getItem: (key: string) => string;
  removeItem: (key: string) => void;
  resetAll: () => void;
}

class LocalStorageManage implements StorageManager {
  key: string;
  constructor(key: string = 'intmax.sdk.content') {
    this.key = key;
  }

  getAllData() {
    const data = window.localStorage.getItem(this.key);
    if (data) {
      return JSON.parse(data);
    }
    return {};
  }

  resetAll() {
    window.localStorage.removeItem(this.key);
    window.dispatchEvent(new Event('reset-local-storage-manager'));
  }

  setItem<T>(key: string, value: string | T[] | T) {
    const data = this.getAllData();
    data[key] = value;
    window.localStorage.setItem(this.key, JSON.stringify(data));
  }

  getItem<T>(key: string): T {
    const data = this.getAllData();
    if (!data?.[key]) return data[key];
    try {
      return JSON.parse(data[key]);
      // eslint-disable-next-line
    } catch (e) {
      return data[key];
    }
  }

  removeItem(key: string) {
    const data = this.getAllData();
    delete data[key];
    window.localStorage.setItem(this.key, JSON.stringify(data));
  }
}

export const localStorageManager = new LocalStorageManage();
