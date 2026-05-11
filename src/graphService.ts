import { getGraphToken } from './graphClient';

const SITE_ID = import.meta.env.VITE_GRAPH_SITE_ID as string;
const LIST_ID = import.meta.env.VITE_GRAPH_LIST_ID as string;
const SHAREPOINT_WEBHOOK_URL = import.meta.env.VITE_SHAREPOINT_WEBHOOK_URL as string | undefined;

const BASE = `https://graph.microsoft.com/v1.0/sites/${SITE_ID}:/lists/${LIST_ID}`;

// ⚠️ Nomes internos (StaticName) das colunas no SharePoint.
// Se a API retornar erros 400, verifique em Configurações da Lista > coluna > "Nome interno".
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

async function gFetch(url: string, options: RequestInit = {}) {
  const token = await getGraphToken();
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


async function postToSharePointWebhook(
  machineData: any,
  acao: 'CRIAR' | 'EDITAR' | 'RESETAR',
  allTimes: Record<string, string>,
): Promise<boolean> {
  if (!SHAREPOINT_WEBHOOK_URL) return false;

  const fields = buildFields(machineData, allTimes);
  const res = await fetch(SHAREPOINT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      acao,
      action: acao,
      reator: machineData.id,
      produto: machineData.product || '',
      op: machineData.op || '',
      amostra: machineData.tag || '',
      status: machineData.status || '',
      horario: machineData.time || '',
      horarios: allTimes,
      fields,
      machine: machineData,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SharePoint webhook ${res.status}: ${body}`);
  }

  return true;
}

async function findItemId(reatorId: string, op: string): Promise<string | null> {
  const filter = `fields/${F.reator} eq '${reatorId}' and fields/${F.op} eq '${op}'`;
  const url = `${BASE}/items?$expand=fields&$filter=${encodeURIComponent(filter)}&$select=id&$top=1`;
  const data = await gFetch(url);
  return data?.value?.[0]?.id ?? null;
}

export async function syncToSharePoint(
  machineData: any,
  acao: 'CRIAR' | 'EDITAR' | 'RESETAR',
  allTimes: Record<string, string>,
): Promise<void> {
  const sentByWebhook = await postToSharePointWebhook(machineData, acao, allTimes);
  if (sentByWebhook) return;

  switch (acao) {
    case 'CRIAR': {
      const fields = buildFields(machineData, allTimes);
      await gFetch(`${BASE}/items`, {
        method: 'POST',
        body: JSON.stringify({ fields }),
      });
      break;
    }
    case 'EDITAR': {
      const itemId = await findItemId(machineData.id, machineData.op);
      if (!itemId) {
        const fields = buildFields(machineData, allTimes);
        await gFetch(`${BASE}/items`, {
          method: 'POST',
          body: JSON.stringify({ fields }),
        });
      } else {
        const fields = buildFields(machineData, allTimes);
        await gFetch(`${BASE}/items/${itemId}/fields`, {
          method: 'PATCH',
          body: JSON.stringify(fields),
        });
      }
      break;
    }
    case 'RESETAR': {
      const itemId = await findItemId(machineData.id, machineData.op);
      if (itemId) {
        await gFetch(`${BASE}/items/${itemId}`, { method: 'DELETE' });
      }
      break;
    }
  }
}
