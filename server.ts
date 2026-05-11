import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(bodyParser.json());

const SITE_ID = process.env.VITE_GRAPH_SITE_ID; // We can read client env vars normally in server.ts with dotenv
const LIST_ID = process.env.VITE_GRAPH_LIST_ID;
const TENANT_ID = process.env.VITE_GRAPH_TENANT_ID;
const CLIENT_ID = process.env.VITE_GRAPH_CLIENT_ID;
const CLIENT_SECRET = process.env.GRAPH_CLIENT_SECRET;

let cachedToken: string | null = null;
let cachedTokenExpiresAt: number = 0;

async function getBackendGraphToken() {
  if (cachedToken && Date.now() < cachedTokenExpiresAt) {
    return cachedToken;
  }
  
  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('As credenciais do Azure (Tenant, Client ID, Client Secret) não estão configuradas.');
  }

  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('scope', 'https://graph.microsoft.com/.default');
  params.append('client_secret', CLIENT_SECRET);
  params.append('grant_type', 'client_credentials');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token fetch falhou: ${res.status} ${text}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  cachedTokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000; // buffer 1 min
  return cachedToken;
}

function getBaseUrl() {
  if (!SITE_ID || !LIST_ID) {
    throw new Error('Configuração do SharePoint ausente. Verifique VITE_GRAPH_SITE_ID e VITE_GRAPH_LIST_ID no arquivo .env.');
  }
  const isPath = SITE_ID.includes(':/');
  return `https://graph.microsoft.com/v1.0/sites/${SITE_ID}${isPath ? ':' : ''}/lists/${LIST_ID}`;
}

// ⚠️ Nomes internos (StaticName) das colunas no SharePoint.
const F = {
  reator:                   'REATOR',
  produto:                  'PRODUTO',
  op:                       'OP',
  amostra:                  'AMOSTRA',
  status:                   'STATUS',
  horarioManipulado:        'HORARIO_MANIPULADO',
  horarioAcabado:           'HORARIO_ACABADO',
  horarioAnaliseAcabado:    'HORARIO_ANALISE_ACABADO',
  horarioAnaliseManipulado: 'HORARIO_ANALISE_MANIPULADO',
  horarioAjusteManipulado:  'HORARIO_AJUSTE_MANIPULADO',
};

function buildFields(m: any, times: Record<string, string>) {
  return {
    Title:                      `Reator ${m.id} - OP ${m.op}`,
    [F.reator]:                   m.id,
    [F.produto]:                  m.product,
    [F.op]:                       m.op,
    [F.amostra]:                  m.tag,
    [F.status]:                   m.status,
    [F.horarioManipulado]:        times['HORARIO MANIPULADO']         || '',
    [F.horarioAcabado]:           times['HORARIO ACABADO']            || '',
    [F.horarioAnaliseAcabado]:    times['HORARIO ANALISE ACABADO']    || '',
    [F.horarioAnaliseManipulado]: times['HORARIO ANALISE MANIPULADO'] || '',
    [F.horarioAjusteManipulado]:  times['HORARIO AJUSTE MANIPULADO']  || '',
  };
}

async function gFetch(url: string, options: RequestInit = {}) {
  const token = await getBackendGraphToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Graph API ${res.status}: ${body}`);
  }
  return res.json();
}

async function findItemId(reatorId: string, op: string): Promise<string | null> {
  const filter = `fields/${F.reator} eq '${reatorId}' and fields/${F.op} eq '${op}'`;
  const url = `${getBaseUrl()}/items?$expand=fields&$filter=${encodeURIComponent(filter)}&$select=id&$top=1`;
  const data = await gFetch(url);
  return data?.value?.[0]?.id ?? null;
}

app.post('/api/syncToSharePoint', async (req, res) => {
  try {
    const { machineData, acao, allTimes } = req.body;
    
    switch (acao) {
      case 'CRIAR': {
        const fields = buildFields(machineData, allTimes);
        await gFetch(`${getBaseUrl()}/items`, {
          method: 'POST',
          body: JSON.stringify({ fields }),
        });
        break;
      }
      case 'EDITAR': {
        const itemId = await findItemId(machineData.id, machineData.op);
        if (!itemId) {
          const fields = buildFields(machineData, allTimes);
          await gFetch(`${getBaseUrl()}/items`, {
            method: 'POST',
            body: JSON.stringify({ fields }),
          });
        } else {
          const fields = buildFields(machineData, allTimes);
          await gFetch(`${getBaseUrl()}/items/${itemId}/fields`, {
            method: 'PATCH',
            body: JSON.stringify(fields),
          });
        }
        break;
      }
      case 'RESETAR': {
        const itemId = await findItemId(machineData.id, machineData.op);
        if (itemId) {
          await gFetch(`${getBaseUrl()}/items/${itemId}`, { method: 'DELETE' });
        }
        break;
      }
    }
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('SharePoint sync error:', error);
    res.status(500).json({ error: error.message || String(error) });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
