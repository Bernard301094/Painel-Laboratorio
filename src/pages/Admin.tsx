import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, doc, setDoc, deleteDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Edit2, Plus, X, Server, CheckCircle, AlertTriangle, Hourglass, Clock, AlertCircle, ChevronDown, Search, Filter, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';

function ComboInput({ value, options, onChange, placeholder, classNameInput }: { value: string, options: string[], onChange: (v: string) => void, placeholder: string, classNameInput: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(o => o.toLowerCase().includes(value.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-center relative w-full group">
        <input 
          required 
          value={value} 
          onChange={e => {
            onChange(e.target.value.toUpperCase());
            setIsOpen(true);
          }} 
          onFocus={() => setIsOpen(true)}
          className={`${classNameInput} pr-8 focus:ring-1 focus:ring-emerald-500`} 
          placeholder={placeholder} 
        />
        <button 
          title="Abrir opções"
          type="button" 
          onClick={() => setIsOpen(!isOpen)} 
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.2)] p-1 rounded transition-colors" 
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-[100] mt-1 left-0 ring-1 ring-[rgba(255,255,255,0.1)] min-w-[200px] w-full bg-[#141414] shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
           <div className="max-h-56 overflow-y-auto py-1 hide-scrollbar">
            {filteredOptions.map(o => (
              <button
                key={o}
                type="button"
                onClick={() => {
                   onChange(o);
                   setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-[12px] hover:bg-[rgba(255,255,255,0.1)] ${value === o ? 'text-emerald-400 bg-[rgba(16,185,129,0.1)] font-bold tracking-wider' : 'text-gray-300 font-medium'} transition-colors`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ value, options, onChange, placeholder, icon: Icon }: { value: string, options: string[], onChange: (v: string) => void, placeholder: string, icon?: React.ElementType }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full min-w-[170px]" ref={containerRef}>
      {Icon && <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${value || isOpen ? 'text-emerald-400' : 'text-gray-500'} pointer-events-none z-10 transition-colors`} />}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border outline-none py-2.5 ${Icon ? 'pl-9' : 'pl-4'} pr-3 rounded-xl text-[13px] appearance-none cursor-pointer transition-all font-medium flex items-center justify-between text-left ${value ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-emerald-400' : isOpen ? 'bg-[rgba(255,255,255,0.1)] border-[rgba(16,185,129,0.5)] text-white shadow-lg' : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] text-gray-300 shadow-sm'}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 ml-2 opacity-50 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-[100] mt-1 left-0 w-full min-w-[170px] bg-[#141414] ring-1 ring-[rgba(255,255,255,0.1)] shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-56 overflow-y-auto py-1 hide-scrollbar">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 text-[12px] hover:bg-[rgba(255,255,255,0.1)] ${!value ? 'text-emerald-400 bg-[rgba(16,185,129,0.1)] font-bold tracking-wider' : 'text-gray-300 font-medium'} transition-colors`}
            >
              {placeholder}
            </button>
            <div className="h-px bg-[rgba(255,255,255,0.1)] my-1" />
            {options.length > 0 ? options.map(o => (
              <button
                key={o}
                type="button"
                onClick={() => {
                  onChange(o);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-[12px] hover:bg-[rgba(255,255,255,0.1)] ${value === o ? 'text-emerald-400 bg-[rgba(16,185,129,0.1)] font-bold tracking-wider' : 'text-gray-300 font-medium'} transition-colors`}
              >
                {o}
              </button>
            )) : (
              <div className="px-3.5 py-2 text-xs text-gray-500 italic">Nenhuma opção disponível</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CardSelect({ value, options, onChange, colorBg = 'bg-[rgba(0,0,0,0.3)]', colorText = 'text-gray-300', className = '' }: { value: string, options: string[], onChange: (v: string) => void, colorBg?: string, colorText?: string, className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button 
        type="button"
        title="Alterar Opção"
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        className={`${colorBg} ${colorText} pl-2 pr-6 py-1.5 rounded-lg text-[9px] font-bold tracking-wider uppercase border border-[rgba(255,255,255,0.1)] focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer hover:brightness-110 transition-all flex items-center shadow-sm w-full relative z-10`}
      >
        <span className="truncate">{value}</span>
        <ChevronDown className={`w-3 h-3 absolute right-2 text-current opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-[100] mt-1 bottom-full mb-1 right-0 min-w-[120px] bg-[#1a1a1a] ring-1 ring-[rgba(255,255,255,0.15)] shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-bottom-right">
          <div className="max-h-48 overflow-y-auto py-1 hide-scrollbar">
            {options.map(o => (
              <button
                key={o}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onChange(o);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-[10px] font-bold tracking-wider uppercase hover:bg-[rgba(255,255,255,0.1)] ${value === o ? 'text-emerald-400 bg-[rgba(16,185,129,0.1)]' : 'text-gray-300'} transition-colors`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper: build allTimes from a machine's history + current state ───────────
function buildAllTimes(history: any[], tag: string, status: string, time: string): Record<string, string> {
  const allTimes: Record<string, string> = {
    'HORARIO MANIPULADO': '',
    'HORARIO ACABADO': '',
    'HORARIO ANALISE MANIPULADO': '',
    'HORARIO ANALISE ACABADO': '',
    'HORARIO AJUSTE MANIPULADO': '',
  };

  const set = (tg: string, st: string, t: string) => {
    const s = st?.toUpperCase() || '';
    const g = tg?.toUpperCase() || '';
    if (s === 'EM ANÁLISE' && g === 'MANIPULADO') allTimes['HORARIO ANALISE MANIPULADO'] = t;
    else if (s === 'EM ANÁLISE' && g === 'ACABADO') allTimes['HORARIO ANALISE ACABADO'] = t;
    else if (s === 'EM AJUSTE' && g === 'MANIPULADO') allTimes['HORARIO AJUSTE MANIPULADO'] = t;
    else if (s === 'LIBERADO' && g === 'MANIPULADO') allTimes['HORARIO MANIPULADO'] = t;
    else if (s === 'LIBERADO' && g === 'ACABADO') allTimes['HORARIO ACABADO'] = t;
  };

  if (Array.isArray(history)) history.forEach((h: any) => set(h.tag, h.status, h.time));
  set(tag, status, time);
  return allTimes;
}

// ─── Helper: send email via FormSubmit ─────────────────────────────────────────
async function sendFormEmail(machineData: any, acao: string, allTimes: Record<string, string>) {
  const destEmail = 'bernard.castillo@tractgroup.com.br';
  await fetch(`https://formsubmit.co/ajax/${destEmail}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      _subject: `OP_APP | ${machineData.id} | ${machineData.op} | ${machineData.status} | ${Date.now()}`,
      _template: 'table',
      DADOS_SISTEMA: `PARSE_DATA|${machineData.id}|${machineData.product}|${machineData.op}|${machineData.tag}|${machineData.status}|${machineData.time}|${allTimes['HORARIO MANIPULADO']||''}|${allTimes['HORARIO ACABADO']||''}|${allTimes['HORARIO ANALISE ACABADO']||''}|${allTimes['HORARIO ANALISE MANIPULADO']||''}|${allTimes['HORARIO AJUSTE MANIPULADO']||''}|FIM`,
      Acao: acao,
      Reator: machineData.id,
      Produto: machineData.product,
      OP: machineData.op,
      Amostra: machineData.tag,
      Status: machineData.status,
      Horario: machineData.time,
      'HORARIO MANIPULADO': allTimes['HORARIO MANIPULADO'] || '',
      'HORARIO ACABADO': allTimes['HORARIO ACABADO'] || '',
      'HORARIO ANALISE ACABADO': allTimes['HORARIO ANALISE ACABADO'] || '',
      'HORARIO ANALISE MANIPULADO': allTimes['HORARIO ANALISE MANIPULADO'] || '',
      'HORARIO AJUSTE MANIPULADO': allTimes['HORARIO AJUSTE MANIPULADO'] || '',
    }),
  });
}

export default function Admin() {
  const [machines, setMachines] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [testRunning, setTestRunning] = useState(false);
  const [testStep, setTestStep] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ id: '', product: '', op: '', tag: 'MANIPULADO', status: 'LIBERADO', time: '' });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const uniqueTags = Array.from(new Set(machines.map(m => m.tag?.toUpperCase() || ''))).filter(Boolean);
  const uniqueStatuses = Array.from(new Set(machines.map(m => m.status?.toUpperCase() || ''))).filter(Boolean);

  const defaultTags = ['MANIPULADO', 'ACABADO'];
  const defaultStatuses = ['LIBERADO', 'EM AJUSTE', 'AGUARDANDO', 'EM ANÁLISE'];
  const defaultReatores = [
    'AF01', 'AF02', 'AF03', 'AF04', 'AF05', 'AF06', 'AF07', 'AF08', 'AF09', 'AF10', 'AF11', 'AF12',
    'AQ01', 'AQ02', 'AQ03', 'AQ04', 'AQ05', 'AQ06', 'AQ07', 'AQ08', 'AQ09', 'AQ10', 'S SECO'
  ];

  const allTags = Array.from(new Set([...defaultTags, ...uniqueTags]));
  const allStatuses = Array.from(new Set([...defaultStatuses, ...uniqueStatuses]));
  const uniqueReatores = Array.from(new Set(machines.map(m => m.id?.toUpperCase() || ''))).filter(Boolean);
  const allReatores = Array.from(new Set([...defaultReatores, ...uniqueReatores]));

  useEffect(() => {
    const q = query(collection(db, 'machines'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ms = snapshot.docs.map(doc => ({ firebaseId: doc.id, ...doc.data() }));
      setMachines(ms);
    }, (error) => {
      console.error('Error fetching machines:', error);
    });

    return () => unsubscribe();
  }, []);

  // ─── Automated Test Function (DEV only) ────────────────────────────────────
  const runAutoTest = async () => {
    const TEST_ID = 'AF-TEST';
    const TEST_DOC_ID = 'AF-TEST';
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    const INTERVAL = 15000;

    const getTime = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setTestRunning(true);

    try {
      setTestStep('⚗️ Passo 1/5 — Criando OP de teste...');
      const step1Data = { id: TEST_ID, product: 'PRODUTO TESTE', op: '99999', tag: 'MANIPULADO', status: 'EM ANÁLISE', time: getTime(), history: [], order: 9999, updatedAt: serverTimestamp() };
      await setDoc(doc(db, 'machines', TEST_DOC_ID), step1Data);
      await sendFormEmail(step1Data, 'CRIAR', buildAllTimes([], step1Data.tag, step1Data.status, step1Data.time));

      await delay(INTERVAL);
      setTestStep('🔧 Passo 2/5 — Mudando para EM AJUSTE...');
      const snap2 = await getDoc(doc(db, 'machines', TEST_DOC_ID));
      const prev2 = snap2.data() as any;
      const history2 = [...(prev2.history || []), { status: prev2.status, tag: prev2.tag, time: prev2.time, timestamp: new Date().toISOString() }];
      const step2Data = { ...prev2, status: 'EM AJUSTE', time: getTime(), history: history2, updatedAt: serverTimestamp() };
      delete step2Data.firebaseId;
      await setDoc(doc(db, 'machines', TEST_DOC_ID), step2Data);
      await sendFormEmail(step2Data, 'EDITAR', buildAllTimes(history2, step2Data.tag, step2Data.status, step2Data.time));

      await delay(INTERVAL);
      setTestStep('⏳ Passo 3/5 — Mudando para AGUARDANDO...');
      const snap3 = await getDoc(doc(db, 'machines', TEST_DOC_ID));
      const prev3 = snap3.data() as any;
      const history3 = [...(prev3.history || []), { status: prev3.status, tag: prev3.tag, time: prev3.time, timestamp: new Date().toISOString() }];
      const step3Data = { ...prev3, status: 'AGUARDANDO', time: getTime(), history: history3, updatedAt: serverTimestamp() };
      delete step3Data.firebaseId;
      await setDoc(doc(db, 'machines', TEST_DOC_ID), step3Data);
      await sendFormEmail(step3Data, 'EDITAR', buildAllTimes(history3, step3Data.tag, step3Data.status, step3Data.time));

      await delay(INTERVAL);
      setTestStep('🔬 Passo 4/5 — Mudando para ACABADO + EM ANÁLISE...');
      const snap4 = await getDoc(doc(db, 'machines', TEST_DOC_ID));
      const prev4 = snap4.data() as any;
      const history4 = [...(prev4.history || []), { status: prev4.status, tag: prev4.tag, time: prev4.time, timestamp: new Date().toISOString() }];
      const step4Data = { ...prev4, tag: 'ACABADO', status: 'EM ANÁLISE', time: getTime(), history: history4, updatedAt: serverTimestamp() };
      delete step4Data.firebaseId;
      await setDoc(doc(db, 'machines', TEST_DOC_ID), step4Data);
      await sendFormEmail(step4Data, 'EDITAR', buildAllTimes(history4, step4Data.tag, step4Data.status, step4Data.time));

      await delay(INTERVAL);
      setTestStep('✅ Passo 5/5 — Mudando para LIBERADO...');
      const snap5 = await getDoc(doc(db, 'machines', TEST_DOC_ID));
      const prev5 = snap5.data() as any;
      const history5 = [...(prev5.history || []), { status: prev5.status, tag: prev5.tag, time: prev5.time, timestamp: new Date().toISOString() }];
      const step5Data = { ...prev5, status: 'LIBERADO', time: getTime(), history: history5, updatedAt: serverTimestamp() };
      delete step5Data.firebaseId;
      await setDoc(doc(db, 'machines', TEST_DOC_ID), step5Data);
      await sendFormEmail(step5Data, 'EDITAR', buildAllTimes(history5, step5Data.tag, step5Data.status, step5Data.time));

      await delay(INTERVAL);
      setTestStep('🗑️ Limpando OP de teste...');
      await deleteDoc(doc(db, 'machines', TEST_DOC_ID));

      setTestStep('🎉 Teste concluído com sucesso!');
      setTimeout(() => setTestStep(null), 4000);
    } catch (err) {
      console.error('[TEST] Error:', err);
      setTestStep('❌ Erro no teste. Ver console.');
      setTimeout(() => setTestStep(null), 5000);
    } finally {
      setTestRunning(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id.trim()) return;

    try {
      const reatorFormattedId = formData.id.trim().replace(/\s+/g, '-').toUpperCase();
      const dbDocId = reatorFormattedId;
      const ref = doc(db, 'machines', dbDocId);
      
      const oldMachine = editingId
        ? machines.find(m => m.firebaseId === editingId)
        : machines.find(m => m.firebaseId === reatorFormattedId || m.id.toUpperCase() === formData.id.trim().toUpperCase());
      
      // Detectar si la OP cambió → limpiar historial y notificar RESETAR
      const opChanged = oldMachine && oldMachine.op !== formData.op;

      let history = oldMachine?.history || [];
      if (opChanged) {
        history = [];
      } else if (oldMachine) {
        if (oldMachine.status !== formData.status || oldMachine.tag !== formData.tag) {
          history = [...history, {
            status: oldMachine.status,
            tag: oldMachine.tag,
            time: oldMachine.time,
            timestamp: new Date().toISOString()
          }];
        }
      }

      const machineData = {
        id: formData.id.toUpperCase(),
        product: formData.product || '',
        op: formData.op || '',
        tag: formData.tag || 'MANIPULADO',
        status: formData.status || 'LIBERADO',
        time: formData.time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        history,
        order: editingId && oldMachine?.order !== undefined ? oldMachine.order : machines.length,
        updatedAt: serverTimestamp()
      };

      if (editingId && editingId !== dbDocId) {
        await deleteDoc(doc(db, 'machines', editingId));
      }
      await setDoc(ref, machineData);

      const allTimes = buildAllTimes(machineData.history, machineData.tag, machineData.status, machineData.time);

      try {
        // Se a OP mudou → envia RESETAR primeiro para o Power Automate apagar os itens antigos do SharePoint
        if (opChanged) {
          await sendFormEmail({ ...machineData, op: oldMachine.op }, 'RESETAR', {});
        }
        const acao = opChanged ? 'CRIAR' : (editingId || oldMachine) ? 'EDITAR' : 'CRIAR';
        await sendFormEmail(machineData, acao, allTimes);
      } catch (emailError) {
        console.error('Error sending to email: ', emailError);
      }

      setFormData({ id: '', product: '', op: '', tag: 'MANIPULADO', status: 'LIBERADO', time: '' });
      setShowAdd(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving doc: ', error);
      alert('Error saving: ' + error);
    }
  };

  const handleEdit = (m: any) => {
    setFormData({ id: m.id, product: m.product, op: m.op, tag: m.tag, status: m.status, time: m.time });
    setEditingId(m.firebaseId);
    setShowAdd(false);
  };

  const handleQuickUpdate = async (m: any, fieldField: 'status' | 'tag' | 'time', newValue: string) => {
    try {
      const timeInputEl = document.getElementById(`quick-time-${m.firebaseId}`) as HTMLInputElement;
      const inputTimeValue = timeInputEl ? timeInputEl.value : m.time;

      if (fieldField === 'status' || fieldField === 'tag') {
        if (m[fieldField] !== newValue) {
          if (!inputTimeValue || inputTimeValue === m.time) {
            setToastMessage('Atenção: É obrigatório modificar o horário. Por favor, atualize o horário no campo ao lado antes de registrar o novo status ou amostra.');
            setTimeout(() => setToastMessage(null), 5000);
            return;
          }
        } else {
          return;
        }
      }

      const ref = doc(db, 'machines', m.firebaseId);
      let history = m.history || [];
      
      if (fieldField !== 'time') {
        history = [...history, {
          status: m.status,
          tag: m.tag,
          time: m.time,
          timestamp: new Date().toISOString()
        }];
      }

      const updatedMachineData = {
        ...m,
        history,
        ...(fieldField !== 'time' ? { [fieldField]: newValue } : {}),
        time: fieldField === 'time' ? newValue : inputTimeValue,
        updatedAt: serverTimestamp()
      };
      
      delete updatedMachineData.firebaseId;

      await setDoc(ref, updatedMachineData);

      const allTimes = buildAllTimes(updatedMachineData.history, updatedMachineData.tag, updatedMachineData.status, updatedMachineData.time);

      try {
        await sendFormEmail(updatedMachineData, 'EDITAR', allTimes);
      } catch (emailError) {
        console.error('Error sending email: ', emailError);
      }
    } catch (error) {
       console.error('Error quick update: ', error);
       alert('Error update: ' + error);
    }
  };

  const handleDelete = async () => {
    if(deleteConfirmId) {
      try {
        await deleteDoc(doc(db, 'machines', deleteConfirmId));
        setDeleteConfirmId(null);
      } catch (error) {
         console.error('Error deleting doc: ', error);
      }
    }
  };

  const filteredMachines = machines.filter(m => {
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = 
      !searchQuery || 
      m.id?.toLowerCase().includes(searchLower) ||
      m.product?.toLowerCase().includes(searchLower) ||
      m.op?.toLowerCase().includes(searchLower);
    
    const matchTag = !filterTag || m.tag?.toUpperCase() === filterTag;
    const matchStatus = !filterStatus || m.status?.toUpperCase() === filterStatus;

    return matchSearch && matchTag && matchStatus;
  });

  return (
    <div className="bg-[#0a0a0a] text-gray-100 min-h-screen font-sans flex flex-col relative overflow-x-hidden selection:bg-[rgba(16,185,129,0.3)] selection:text-emerald-200">
      <div className="ambient-glow"></div>
      
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[100] animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="glass-card bg-[#141414] p-4 rounded-xl border border-[rgba(245,158,11,0.3)] shadow-[0_0_30px_rgba(245,158,11,0.15)] flex items-start gap-4 max-w-sm">
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-500 mb-1 text-sm">Ação Necessária</h4>
              <p className="text-gray-300 text-xs leading-relaxed">{toastMessage}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-gray-500 hover:text-gray-300 transition-colors shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {testStep && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="glass-card bg-[#141414] px-5 py-3 rounded-xl border border-[rgba(99,102,241,0.4)] shadow-[0_0_30px_rgba(99,102,241,0.2)] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
            <span className="text-indigo-300 text-sm font-semibold">{testStep}</span>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.6)] backdrop-blur-sm px-4">
          <div className="glass-card bg-[#141414] p-6 rounded-2xl w-full max-w-sm border border-[rgba(239,68,68,0.3)] shadow-[0_0_40px_rgba(239,68,68,0.15)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4 text-red-500">
              <AlertCircle className="w-8 h-8" />
              <h3 className="font-bold text-lg text-white">Excluir Registro?</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Tem certeza que deseja apagar permanentemente esta OP? O registro será excluído totalmente da base de dados sem deixar rastros.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors text-sm font-medium">Cancelar</button>
              <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)]">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}
      
      <header className="fixed top-0 w-full z-50 bg-[rgba(10,10,10,0.8)] backdrop-blur-md border-b border-[rgba(255,255,255,0.1)] shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex justify-between items-center px-6 md:px-10 h-16 md:h-20">
        <div>
          <h1 className="font-bold text-xl md:text-2xl text-gray-100 tracking-tight">Painel Admin</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {import.meta.env.DEV && (
            <button
              onClick={runAutoTest}
              disabled={testRunning}
              title="Teste automático do ciclo completo de uma OP (apenas em DEV)"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold uppercase text-[10px] transition-all border ${
                testRunning
                  ? 'bg-indigo-900 border-indigo-700 text-indigo-400 cursor-not-allowed opacity-60'
                  : 'bg-[rgba(99,102,241,0.1)] border-[rgba(99,102,241,0.3)] text-indigo-400 hover:bg-[rgba(99,102,241,0.2)] hover:border-indigo-500'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              {testRunning ? 'Testando...' : 'Teste Auto'}
            </button>
          )}
          <Link to="/" className="text-gray-400 hover:text-white font-medium transition-colors text-sm px-4">Ir para TV</Link>
          <button 
             onClick={() => {
               setShowAdd(!showAdd);
               if(showAdd) setEditingId(null);
               setFormData({ id: '', product: '', op: '', tag: 'MANIPULADO', status: 'LIBERADO', time: '' });
             }}
             className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-lg font-bold uppercase text-[10px] md:text-xs hover:bg-emerald-600 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
           >
             {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
             {showAdd ? 'Cancelar' : 'Nova OP'}
           </button>
        </div>
      </header>

      <main className="flex-grow pt-24 md:pt-28 pb-12 px-6 lg:px-8 mx-auto w-full relative z-10 transition-all duration-300">
        
        {showAdd && (
          <form onSubmit={handleSave} className="glass-card animate-in fade-in slide-in-from-top-4 p-5 md:p-6 rounded-2xl mb-8 grid grid-cols-1 md:grid-cols-7 gap-4 items-end shadow-[0_0_30px_rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.05)]">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Reator</label>
              <ComboInput value={formData.id} options={allReatores} onChange={v => setFormData({...formData, id: v})} placeholder="Ex: AF12" classNameInput="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] outline-none px-3 py-2.5 rounded-lg text-sm text-gray-100 focus:border-emerald-500 focus:bg-[rgba(255,255,255,0.1)] transition-all w-full" />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Produto</label>
              <input required value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] outline-none px-3 py-2.5 rounded-lg text-sm text-gray-100 focus:border-emerald-500 focus:bg-[rgba(255,255,255,0.1)] transition-all" placeholder="Nome do Produto" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">OP</label>
              <input required value={formData.op} onChange={e => setFormData({...formData, op: e.target.value})} className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] outline-none px-3 py-2.5 rounded-lg text-sm text-gray-100 focus:border-emerald-500 focus:bg-[rgba(255,255,255,0.1)] transition-all" placeholder="48800" />
            </div>
            <div className="flex flex-col gap-1.5 relative min-w-[140px]">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Amostra</label>
              <ComboInput value={formData.tag} options={allTags} onChange={v => setFormData({...formData, tag: v})} placeholder="Ex: MANIPULADO" classNameInput="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] outline-none px-3 py-2.5 rounded-lg text-sm text-gray-100 focus:border-emerald-500 focus:bg-[rgba(255,255,255,0.1)] transition-all w-full" />
            </div>
            <div className="flex flex-col gap-1.5 relative min-w-[140px]">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Status</label>
              <ComboInput value={formData.status} options={allStatuses} onChange={v => setFormData({...formData, status: v})} placeholder="Ex: LIBERADO" classNameInput="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] outline-none px-3 py-2.5 rounded-lg text-sm text-gray-100 focus:border-emerald-500 focus:bg-[rgba(255,255,255,0.1)] transition-all w-full" />
            </div>
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Horário</label>
              <input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] outline-none px-3 py-2.5 rounded-lg text-sm text-gray-100 focus:border-emerald-500 focus:bg-[rgba(255,255,255,0.1)] transition-all w-full" placeholder="Ex: 14:30" />
            </div>
            <div className="mt-2 md:col-span-7 flex justify-end">
              <button type="submit" className="bg-emerald-500 text-white font-bold text-[11px] md:text-xs uppercase py-3 px-8 rounded-lg hover:bg-emerald-600 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">Criar Nova OP</button>
            </div>
          </form>
        )}

        <div className="flex flex-col md:flex-row items-center gap-4 mb-6 relative z-30">
          <div className="relative w-full md:w-96 group z-10">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por Reator, OP ou Produto..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] shadow-sm outline-none w-full py-2.5 pl-10 pr-4 rounded-xl text-sm text-gray-100 focus:border-emerald-400 focus:bg-[rgba(255,255,255,0.1)] transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto pb-2 md:pb-0 z-20">
            <div className="w-full sm:w-auto min-w-[170px]">
              <FilterSelect value={filterTag} onChange={setFilterTag} options={allTags} placeholder="Todas Amostras" icon={Filter} />
            </div>
            <div className="w-full sm:w-auto min-w-[170px]">
              <FilterSelect value={filterStatus} onChange={setFilterStatus} options={allStatuses} placeholder="Todos Status" icon={Filter} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
          {filteredMachines.map((m) => {
            if(editingId === m.firebaseId) {
              return (
                <form key={'edit-'+m.firebaseId} onSubmit={handleSave} className="bg-[#1a1a1a] rounded-2xl p-5 relative overflow-visible flex flex-col justify-between h-full min-h-[190px] border border-[rgba(16,185,129,0.4)] shadow-2xl animate-in zoom-in-95 duration-200 z-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-1/2">
                      <span className="text-[10px] font-bold tracking-wider text-emerald-400 block mb-1 uppercase">Reator</span>
                      <ComboInput value={formData.id} options={allReatores} onChange={v => setFormData({...formData, id: v})} placeholder="Reator" classNameInput="bg-[rgba(0,0,0,0.4)] border border-[rgba(16,185,129,0.3)] outline-none px-2 py-1 -ml-2 rounded text-xl font-black tracking-tight text-white w-full focus:border-emerald-500 focus:bg-[rgba(0,0,0,0.6)] transition-all" />
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                       <button type="button" onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:text-white bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded transition-colors"><X className="w-4 h-4"/></button>
                    </div>
                  </div>
                  <div className="space-y-3 flex-grow pt-1 relative z-30">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-gray-400 block mb-0.5 uppercase">Produto</span>
                      <input required value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} className="bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] outline-none px-2 py-1 -ml-2 rounded text-[13px] font-bold text-gray-100 w-full focus:border-emerald-500 focus:bg-[rgba(0,0,0,0.6)] transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-gray-400 block mb-0.5 uppercase">OP</span>
                        <input required value={formData.op} onChange={e => setFormData({...formData, op: e.target.value})} className="bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] outline-none px-2 py-1 -ml-2 rounded text-[13px] font-semibold text-gray-200 w-full focus:border-emerald-500 focus:bg-[rgba(0,0,0,0.6)] transition-all" />
                      </div>
                      <div className="w-[120px]">
                        <span className="text-[10px] font-bold tracking-wider text-gray-400 block mb-0.5 uppercase">Amostra</span>
                        <ComboInput value={formData.tag} options={allTags} onChange={v => setFormData({...formData, tag: v, time: ''})} placeholder="Amostra" classNameInput="bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] outline-none px-2 py-1 -ml-2 rounded text-[13px] font-semibold text-gray-200 w-full focus:border-emerald-500 focus:bg-[rgba(0,0,0,0.6)] transition-all" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.1)] flex flex-col gap-3 relative z-20">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Status</span>
                       <div className="w-[130px]">
                         <ComboInput value={formData.status} options={allStatuses} onChange={v => setFormData({...formData, status: v, time: ''})} placeholder="Status" classNameInput="bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] outline-none px-2 py-1 rounded text-[11px] font-black text-white w-full focus:border-emerald-500 focus:bg-[rgba(0,0,0,0.6)] transition-all text-right" />
                       </div>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Horário</span>
                       <input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] outline-none px-2 py-1 rounded text-[11px] font-black text-white w-[130px] focus:border-emerald-500 focus:bg-[rgba(0,0,0,0.6)] transition-all text-right" />
                    </div>
                    <button type="submit" className="w-full bg-emerald-500 text-white font-bold text-[11px] uppercase py-2 rounded hover:bg-emerald-600 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">Salvar Alterações</button>
                  </div>
                </form>
              );
            }

            const isManipuladoLiberado = m.tag?.toUpperCase() === 'MANIPULADO' && m.status?.toUpperCase() === 'LIBERADO';
            const isGreen = !isManipuladoLiberado && m.status?.toUpperCase() === 'LIBERADO';
            const isRed = m.status?.toUpperCase() === 'EM AJUSTE';
            const isYellow = m.status?.toUpperCase() === 'AGUARDANDO' || isManipuladoLiberado;
            const isBlue = m.status?.toUpperCase() === 'EM ANÁLISE';
            const colorText = isGreen ? 'text-emerald-400' : isRed ? 'text-red-400' : isYellow ? 'text-amber-400' : isBlue ? 'text-blue-400' : 'text-gray-400';
            const colorBg = isGreen ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)]' : isRed ? 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)]' : isYellow ? 'bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)]' : isBlue ? 'bg-[rgba(59,130,246,0.1)] border-[rgba(59,130,246,0.2)]' : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]';
            const headerText = isRed ? 'text-red-400' : isYellow ? 'text-amber-400' : isBlue ? 'text-blue-400' : 'text-gray-100';
            const indicatorColor = isRed ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : isGreen ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : isYellow ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : isBlue ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-gray-600';
            const glowClass = isGreen ? 'glow-green' : isRed ? 'glow-red' : isYellow ? 'glow-yellow' : isBlue ? 'glow-blue' : '';
            const Icon = isGreen ? CheckCircle : isRed ? AlertTriangle : isYellow ? Hourglass : isBlue ? Search : Clock;

            return (
              <div key={m.firebaseId} className={`glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-full min-h-[190px] hover:-translate-y-1 transition-all duration-300 group ${glowClass}`}>
                <div className={`absolute top-0 left-0 w-full h-1 ${indicatorColor}`}></div>
                <div className="absolute top-3 right-3 flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={(e) => { e.preventDefault(); handleEdit(m); }} className="p-1.5 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm border border-[rgba(255,255,255,0.1)] rounded-md hover:bg-[rgba(255,255,255,0.1)] hover:text-white text-gray-400 transition-all shadow-sm">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.preventDefault(); setDeleteConfirmId(m.firebaseId); }} className="p-1.5 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm border border-[rgba(239,68,68,0.2)] rounded-md hover:bg-[rgba(239,68,68,0.2)] hover:text-red-300 text-red-500 transition-all shadow-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex justify-between items-start mb-3 pt-1">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-gray-500 block mb-1 uppercase">Reator</span>
                    <h2 className={`text-3xl font-black tracking-tight ${headerText}`}>{m.id}</h2>
                  </div>
                </div>
                <div className="space-y-3 flex-grow z-10 pt-1">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-gray-500 block mb-0.5 uppercase">Produto</span>
                    <p className="text-base font-bold text-gray-200 uppercase leading-tight truncate" title={m.product}>{m.product}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[rgba(255,255,255,0.05)] p-2 rounded-lg border border-[rgba(255,255,255,0.05)]">
                      <span className="text-[10px] font-bold tracking-wider text-gray-500 block mb-0.5 uppercase">OP</span>
                      <p className="text-[13px] font-semibold text-gray-300">{m.op}</p>
                    </div>
                    <div className="bg-[rgba(255,255,255,0.05)] p-2 rounded-lg border border-[rgba(255,255,255,0.05)]">
                      <span className="text-[10px] font-bold tracking-wider text-gray-500 block mb-0.5 uppercase">Amostra</span>
                      <p className="text-[13px] font-semibold text-gray-300 uppercase">{m.tag}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.1)] flex flex-col gap-2 z-10 shrink-0">
                  <div className="flex justify-between items-center w-full">
                    <span className={`text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${isRed ? 'text-red-400' : 'text-gray-500'}`}>
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <input 
                        id={`quick-time-${m.firebaseId}`}
                        key={m.time}
                        type="time" 
                        defaultValue={m.time || ''} 
                        className={`bg-transparent outline-none w-[70px] hover:bg-[rgba(255,255,255,0.1)] focus:bg-[rgba(255,255,255,0.1)] focus:ring-1 focus:ring-emerald-500 rounded px-1 transition-all cursor-pointer border border-transparent hover:border-[rgba(255,255,255,0.2)] ${isRed ? 'text-red-400' : 'text-gray-300'}`}
                        title="Modifique o horário aqui ANTES de selecionar a amostra ou status."
                      />
                    </span>
                    <div className="flex items-center gap-2">
                      <CardSelect value={m.tag} options={defaultTags} onChange={(v) => handleQuickUpdate(m, 'tag', v)} className="w-[100px]" />
                      <CardSelect value={m.status} options={defaultStatuses} onChange={(v) => handleQuickUpdate(m, 'status', v)} colorBg={colorBg} colorText={colorText} className="w-[110px]" />
                    </div>
                  </div>
                  {m.history && m.history.length > 0 && (
                    <span className="text-[8px] md:text-[9px] font-medium tracking-wide flex items-center text-gray-500 opacity-80 mt-0.5">
                      Anterior: {m.history[m.history.length - 1].status} às {m.history[m.history.length - 1].time}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {filteredMachines.length === 0 && (
            <div className="col-span-full p-8 text-center text-gray-500 border border-[rgba(255,255,255,0.1)] border-dashed rounded-2xl h-40 flex items-center justify-center font-medium bg-[rgba(255,255,255,0.05)] backdrop-blur-sm">
              Nenhum registro encontrado. {searchQuery || filterTag || filterStatus ? 'Tente limpar os filtros.' : 'Adicione uma nova OP.'}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
