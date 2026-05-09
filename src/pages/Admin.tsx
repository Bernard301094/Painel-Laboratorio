import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Edit2, Plus, X, Server, CheckCircle, AlertTriangle, Hourglass, Clock, AlertCircle, ChevronDown, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

function ComboInput({ value, options, onChange, placeholder, classNameInput }: { value: string, options: string[], onChange: (v: string) => void, placeholder: string, classNameInput: string }) {
  const [mode, setMode] = useState<'select'|'input'>(options.includes(value) || !value ? 'select' : 'input');
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

  if (mode === 'select') {
    return (
      <div className="relative w-full" ref={containerRef}>
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`${classNameInput} flex items-center justify-between cursor-pointer w-full text-left appearance-none select-none`}
        >
          <span className={`${value ? '' : 'text-gray-500'} truncate leading-tight`}>{value || placeholder}</span>
          <ChevronDown className={`w-3.5 h-3.5 ml-2 opacity-50 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-[100] mt-1 left-0 ring-1 ring-white/10 min-w-[160px] bg-[#141414] shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
             <div className="max-h-56 overflow-y-auto py-1 hide-scrollbar">
              {options.map(o => (
                <button
                  key={o}
                  type="button"
                  onClick={() => {
                     onChange(o);
                     setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-[12px] hover:bg-white/10 ${value === o ? 'text-emerald-400 bg-emerald-500/10 font-bold tracking-wider' : 'text-gray-300 font-medium'} transition-colors`}
                >
                  {o}
                </button>
              ))}
            </div>
            <div className="h-px bg-white/10" />
            <button
              type="button"
              onClick={() => {
                setMode('input');
                onChange('');
                setIsOpen(false);
              }}
              className="w-full text-left px-3.5 py-3 text-[12px] text-emerald-400 hover:bg-emerald-500/10 transition-colors font-bold tracking-wider flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Inserir Manualmente
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center relative w-full group">
       <input 
        required 
        autoFocus 
        value={value} 
        onChange={e => onChange(e.target.value.toUpperCase())} 
        className={`${classNameInput} pr-8 focus:ring-1 focus:ring-emerald-500`} 
        placeholder={placeholder} 
      />
      <button 
        type="button" 
        onClick={() => { setMode('select'); onChange(options[0] || ''); }} 
        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 bg-white/5 hover:bg-white/20 p-1.5 rounded-md transition-colors" 
        title="Cancelar entrada manual"
      >
        <X className="w-3.5 h-3.5" />
      </button>
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
        className={`w-full border outline-none py-2.5 ${Icon ? 'pl-9' : 'pl-4'} pr-3 rounded-xl text-[13px] appearance-none cursor-pointer transition-all font-medium flex items-center justify-between text-left ${value ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : isOpen ? 'bg-white/10 border-emerald-500/50 text-white shadow-lg' : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 shadow-sm'}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 ml-2 opacity-50 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-[100] mt-1 left-0 w-full min-w-[170px] bg-[#141414] ring-1 ring-white/10 shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-56 overflow-y-auto py-1 hide-scrollbar">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 text-[12px] hover:bg-white/10 ${!value ? 'text-emerald-400 bg-emerald-500/10 font-bold tracking-wider' : 'text-gray-300 font-medium'} transition-colors`}
            >
              {placeholder}
            </button>
            <div className="h-px bg-white/10 my-1" />
            {options.length > 0 ? options.map(o => (
              <button
                key={o}
                type="button"
                onClick={() => {
                  onChange(o);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-[12px] hover:bg-white/10 ${value === o ? 'text-emerald-400 bg-emerald-500/10 font-bold tracking-wider' : 'text-gray-300 font-medium'} transition-colors`}
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

export default function Admin() {
  const [machines, setMachines] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ id: '', product: '', op: '', tag: 'MANIPULADO', status: 'LIBERADO', time: '' });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const uniqueTags = Array.from(new Set(machines.map(m => m.tag?.toUpperCase() || ''))).filter(Boolean);
  const uniqueStatuses = Array.from(new Set(machines.map(m => m.status?.toUpperCase() || ''))).filter(Boolean);

  const defaultTags = ['MANIPULADO', 'ACABADO'];
  const defaultStatuses = ['LIBERADO', 'EM AJUSTE', 'AGUARDANDO'];

  const allTags = Array.from(new Set([...defaultTags, ...uniqueTags]));
  const allStatuses = Array.from(new Set([...defaultStatuses, ...uniqueStatuses]));

  useEffect(() => {
    const q = query(collection(db, 'machines'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ms = snapshot.docs.map(doc => ({ firebaseId: doc.id, ...doc.data() }));
      setMachines(ms);
    }, (error) => {
      console.error('Error fetching machines:', error);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dbDocId = editingId ? editingId : formData.id.replace(/\s+/g, '-').toUpperCase() + '-' + Date.now();
      const ref = doc(db, 'machines', dbDocId);
      
      const machineData = {
        id: formData.id,
        product: formData.product,
        op: formData.op,
        tag: formData.tag,
        status: formData.status,
        time: formData.time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        order: editingId ? machines.find(m => m.firebaseId === editingId)?.order : machines.length,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(ref, machineData);
      } else {
        await setDoc(ref, machineData);
      }

      setFormData({ id: '', product: '', op: '', tag: 'MANIPULADO', status: 'LIBERADO', time: '' });
      setShowAdd(false);
      setEditingId(null);
    } catch (error) {
      console.error("Error saving doc: ", error);
      alert("Error saving: " + error);
    }
  };

  const handleEdit = (m: any) => {
    setFormData({ id: m.id, product: m.product, op: m.op, tag: m.tag, status: m.status, time: m.time });
    setEditingId(m.firebaseId);
    setShowAdd(false); // we edit inline now
  };

  const handleDelete = async () => {
    if(deleteConfirmId) {
      try {
        await deleteDoc(doc(db, 'machines', deleteConfirmId));
        setDeleteConfirmId(null);
      } catch (error) {
         console.error("Error deleting doc: ", error);
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
    <div className="bg-[#0a0a0a] text-gray-100 min-h-screen font-sans flex flex-col relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="ambient-glow"></div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card bg-[#141414] p-6 rounded-2xl w-full max-w-sm border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.15)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4 text-red-500">
              <AlertCircle className="w-8 h-8" />
              <h3 className="font-bold text-lg text-white">Excluir Registro?</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Tem certeza que deseja apagar permanentemente esta OP? O registro será excluído totalmente da base de dados sem deixar rastros.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium">Cancelar</button>
              <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)]">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex justify-between items-center px-6 md:px-10 h-16 md:h-20">
        <div>
          <h1 className="font-bold text-xl md:text-2xl text-gray-100 tracking-tight">Painel Admin</h1>
        </div>
        
        <div className="flex items-center gap-4">
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

      {/* Main Content */}
      <main className="flex-grow pt-24 md:pt-28 pb-12 px-6 lg:px-8 mx-auto w-full relative z-10 transition-all duration-300">
        
        {showAdd && (
          <form onSubmit={handleSave} className="glass-card animate-in fade-in slide-in-from-top-4 p-5 md:p-6 rounded-2xl mb-8 grid grid-cols-1 md:grid-cols-6 gap-4 items-end shadow-[0_0_30px_rgba(16,185,129,0.1)] border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Novo Reator</label>
              <input required value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="bg-white/5 border border-white/10 outline-none px-3 py-2.5 rounded-lg text-sm text-gray-100 focus:border-emerald-500 focus:bg-white/10 transition-all" placeholder="Ex: AF12" />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Produto</label>
              <input required value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} className="bg-white/5 border border-white/10 outline-none px-3 py-2.5 rounded-lg text-sm text-gray-100 focus:border-emerald-500 focus:bg-white/10 transition-all" placeholder="Nome do Produto" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">OP</label>
              <input required value={formData.op} onChange={e => setFormData({...formData, op: e.target.value})} className="bg-white/5 border border-white/10 outline-none px-3 py-2.5 rounded-lg text-sm text-gray-100 focus:border-emerald-500 focus:bg-white/10 transition-all" placeholder="48800" />
            </div>
            <div className="flex flex-col gap-1.5 relative min-w-[140px]">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Amostra</label>
              <ComboInput value={formData.tag} options={allTags} onChange={v => setFormData({...formData, tag: v})} placeholder="Ex: MANIPULADO" classNameInput="bg-white/5 border border-white/10 outline-none px-3 py-2.5 rounded-lg text-sm text-gray-100 focus:border-emerald-500 focus:bg-white/10 transition-all w-full" />
            </div>
            <div className="flex flex-col gap-1.5 relative min-w-[140px]">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Status</label>
              <ComboInput value={formData.status} options={allStatuses} onChange={v => setFormData({...formData, status: v})} placeholder="Ex: LIBERADO" classNameInput="bg-white/5 border border-white/10 outline-none px-3 py-2.5 rounded-lg text-sm text-gray-100 focus:border-emerald-500 focus:bg-white/10 transition-all w-full" />
            </div>
            <div className="mt-2 md:col-span-6 flex justify-end">
              <button type="submit" className="bg-emerald-500 text-white font-bold text-[11px] md:text-xs uppercase py-3 px-8 rounded-lg hover:bg-emerald-600 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
               Criar Nova OP
              </button>
            </div>
          </form>
        )}

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6 relative z-30">
          <div className="relative w-full md:w-96 group z-10">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por Reator, OP ou Produto..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 shadow-sm outline-none w-full py-2.5 pl-10 pr-4 rounded-xl text-sm text-gray-100 focus:border-emerald-400 focus:bg-white/10 transition-all"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto pb-2 md:pb-0 z-20">
            <div className="w-full sm:w-auto min-w-[170px]">
              <FilterSelect 
                value={filterTag} 
                onChange={setFilterTag}
                options={allTags}
                placeholder="Todas Amostras"
                icon={Filter}
              />
            </div>
            
            <div className="w-full sm:w-auto min-w-[170px]">
              <FilterSelect 
                value={filterStatus} 
                onChange={setFilterStatus}
                options={allStatuses}
                placeholder="Todos Status"
                icon={Filter}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
          {filteredMachines.map((m) => {
            if(editingId === m.firebaseId) {
              return (
                <form key={'edit-'+m.firebaseId} onSubmit={handleSave} className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-full min-h-[190px] border border-emerald-500/40 bg-emerald-500/5 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-1/2">
                      <span className="text-[10px] font-bold tracking-wider text-emerald-400 block mb-1 uppercase">Editar Reator</span>
                      <input required value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="bg-black/40 border border-emerald-500/30 outline-none px-2 py-1 -ml-2 rounded text-xl font-black tracking-tight text-white w-full focus:border-emerald-500 focus:bg-black/60 transition-all" />
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                       <button type="button" onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"><X className="w-4 h-4"/></button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 flex-grow z-10 pt-1">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-gray-400 block mb-0.5 uppercase">Produto</span>
                      <input required value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} className="bg-black/40 border border-white/10 outline-none px-2 py-1 -ml-2 rounded text-[13px] font-bold text-gray-100 w-full focus:border-emerald-500 focus:bg-black/60 transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-gray-400 block mb-0.5 uppercase">OP</span>
                        <input required value={formData.op} onChange={e => setFormData({...formData, op: e.target.value})} className="bg-black/40 border border-white/10 outline-none px-2 py-1 -ml-2 rounded text-[13px] font-semibold text-gray-200 w-full focus:border-emerald-500 focus:bg-black/60 transition-all" />
                      </div>
                      <div className="w-[120px]">
                        <span className="text-[10px] font-bold tracking-wider text-gray-400 block mb-0.5 uppercase">Amostra</span>
                        <ComboInput value={formData.tag} options={allTags} onChange={v => setFormData({...formData, tag: v})} placeholder="Amostra" classNameInput="bg-black/40 border border-white/10 outline-none px-2 py-1 -ml-2 rounded text-[13px] font-semibold text-gray-200 w-full focus:border-emerald-500 focus:bg-black/60 transition-all" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-3 z-10">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Status</span>
                       <div className="w-[130px]">
                         <ComboInput value={formData.status} options={allStatuses} onChange={v => setFormData({...formData, status: v})} placeholder="Status" classNameInput="bg-black/40 border border-white/10 outline-none px-2 py-1 rounded text-[11px] font-black text-white w-full focus:border-emerald-500 focus:bg-black/60 transition-all text-right" />
                       </div>
                    </div>
                    <button type="submit" className="w-full bg-emerald-500 text-white font-bold text-[11px] uppercase py-2 rounded hover:bg-emerald-600 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">Salvar Alterações</button>
                  </div>
                </form>
              );
            }

            // Normal Card display when not being edited
            const isManipuladoLiberado = m.tag?.toUpperCase() === 'MANIPULADO' && m.status?.toUpperCase() === 'LIBERADO';
            
            const isGreen = !isManipuladoLiberado && m.status?.toUpperCase() === 'LIBERADO';
            const isRed = m.status?.toUpperCase() === 'EM AJUSTE';
            const isYellow = m.status?.toUpperCase() === 'AGUARDANDO' || isManipuladoLiberado;

            const colorText = isGreen ? 'text-emerald-400' : isRed ? 'text-red-400' : isYellow ? 'text-amber-400' : 'text-gray-400';
            const colorBg = isGreen ? 'bg-emerald-500/10 border-emerald-500/20' : isRed ? 'bg-red-500/10 border-red-500/20' : isYellow ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5 border-white/10';
            const headerText = isRed ? 'text-red-400' : isYellow ? 'text-amber-400' : 'text-gray-100';
            const indicatorColor = isRed ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : isGreen ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : isYellow ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-gray-600';
            const glowClass = isGreen ? 'glow-green' : isRed ? 'glow-red' : isYellow ? 'glow-yellow' : '';
            
            const Icon = isGreen ? CheckCircle : isRed ? AlertTriangle : isYellow ? Hourglass : Clock;

            return (
              <div key={m.firebaseId} className={`glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-full min-h-[190px] hover:-translate-y-1 transition-all duration-300 group ${glowClass}`}>
                <div className={`absolute top-0 left-0 w-full h-1 ${indicatorColor}`}></div>
                
                <div className="absolute top-3 right-3 flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={(e) => { e.preventDefault(); handleEdit(m); }} className="p-1.5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-md hover:bg-white/10 hover:text-white text-gray-400 transition-all shadow-sm">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.preventDefault(); setDeleteConfirmId(m.firebaseId); }} className="p-1.5 bg-black/40 backdrop-blur-sm border border-red-500/20 rounded-md hover:bg-red-500/20 hover:text-red-300 text-red-500 transition-all shadow-sm">
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
                    <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                      <span className="text-[10px] font-bold tracking-wider text-gray-500 block mb-0.5 uppercase">OP</span>
                      <p className="text-[13px] font-semibold text-gray-300">{m.op}</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                      <span className="text-[10px] font-bold tracking-wider text-gray-500 block mb-0.5 uppercase">Amostra</span>
                      <p className="text-[13px] font-semibold text-gray-300 uppercase">{m.tag}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center z-10">
                  <span className={`text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${isRed ? 'text-red-400' : 'text-gray-500'}`}>
                    <Clock className="w-3.5 h-3.5" />
                    {m.time}
                  </span>
                  <div className={`${colorBg} ${colorText} px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border shadow-sm`}>
                    <Icon className="w-3 h-3" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">{m.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredMachines.length === 0 && (
              <div className="col-span-full p-8 text-center text-gray-500 border border-white/10 border-dashed rounded-2xl h-40 flex items-center justify-center font-medium bg-white/5 backdrop-blur-sm">
                Nenhum registro encontrado. {searchQuery || filterTag || filterStatus ? 'Tente limpar os filtros.' : 'Adicione uma nova OP.'}
              </div>
          )}
        </div>
      </main>
    </div>
  );
}

