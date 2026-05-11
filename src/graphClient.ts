import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_GRAPH_CLIENT_ID as string,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_GRAPH_TENANT_ID as string}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage' as const,
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

let _initPromise: Promise<void> | null = null;

async function ensureInitialized(): Promise<void> {
  if (!_initPromise) {
    _initPromise = msalInstance.initialize();
  }
  return _initPromise;
}

const SCOPES = ['https://graph.microsoft.com/Sites.ReadWrite.All'];

export async function getGraphToken(): Promise<string> {
  await ensureInitialized();

  const accounts = msalInstance.getAllAccounts();

  if (accounts.length === 0) {
    const result = await msalInstance.loginPopup({ scopes: SCOPES });
    return result.accessToken;
  }

  try {
    const result = await msalInstance.acquireTokenSilent({
      scopes: SCOPES,
      account: accounts[0],
    });
    return result.accessToken;
  } catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      const result = await msalInstance.acquireTokenPopup({ scopes: SCOPES });
      return result.accessToken;
    }
    throw err;
  }
}
