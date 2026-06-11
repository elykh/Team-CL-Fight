// Runtime configuration
let runtimeConfig: {
  API_BASE_URL: string;
} | null = null;

let configLoading = true;

const defaultConfig = {
  API_BASE_URL: 'http://127.0.0.1:8000',
};

export async function loadRuntimeConfig(): Promise<void> {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        runtimeConfig = await response.json();
      }
    }
  } catch (error) {
    console.log('Failed to load runtime config, using defaults:', error);
  } finally {
    configLoading = false;
  }
}

export function getConfig() {
  if (configLoading) return defaultConfig;
  if (runtimeConfig) return runtimeConfig;
  if (import.meta.env.VITE_API_BASE_URL) {
    return { API_BASE_URL: import.meta.env.VITE_API_BASE_URL };
  }
  return defaultConfig;
}

export function getAPIBaseURL(): string {
  return getConfig().API_BASE_URL;
}

export const config = {
  get API_BASE_URL() {
    return getAPIBaseURL();
  },
};
