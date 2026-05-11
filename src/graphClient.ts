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

export async function connectToSharePoint(): Promise<void> {
  await ensureInitialized();

  const result = await msalInstance.loginPopup({ scopes: SCOPES });
  if (result.account) {
    msalInstance.setActiveAccount(result.account);
  }
}

export async function getGraphToken(): Promise<string> {
  await ensureInitialized();

  const activeAccount = msalInstance.getActiveAccount();
  const accounts = msalInstance.getAllAccounts();
  const account = activeAccount || accounts[0];

  if (!account) {
    throw new Error('SharePoint não conectado. Clique em Conectar SharePoint uma vez antes de criar ou editar OPs.');
  }

  try {
    const result = await msalInstance.acquireTokenSilent({
      scopes: SCOPES,
      account,
    });
    return result.accessToken;
  } catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      throw new Error('Sessão do SharePoint expirada ou sem consentimento. Clique em Conectar SharePoint novamente; a criação de OP não abre popup automaticamente.');
    }
    throw err;
  }
}
