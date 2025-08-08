type Listener = (message: string, durationMs?: number) => void;

let listeners: Listener[] = [];

export const showToast = (message: string, durationMs: number = 1500) => {
  for (const fn of listeners) {
    try {
      fn(message, durationMs);
    } catch {}
  }
};

export const subscribeToast = (fn: Listener) => {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
};


