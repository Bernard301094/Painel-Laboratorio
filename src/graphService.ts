export async function syncToSharePoint(
  machineData: any,
  acao: 'CRIAR' | 'EDITAR' | 'RESETAR',
  allTimes: Record<string, string>,
): Promise<void> {
  const url = '/api/syncToSharePoint';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ machineData, acao, allTimes })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro de sincronização: ${res.status}`);
  }
}
