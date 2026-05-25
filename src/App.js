{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17100\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import React, \{ useState, useEffect, useMemo \} from 'react';\
import \{ Calendar, Clock, User, Trash2, ChevronLeft, ChevronRight, X, Plus, AlertCircle \} from 'lucide-react';\
import \{ initializeApp \} from 'firebase/app';\
import \{ getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot \} from 'firebase/firestore';\
\
const firebaseConfig = \{\
  apiKey: "AIzaSyDt8tV3yKbhOJI3IpnZDTEW4uEEJmK0iI4",\
  authDomain: "sala-reunioes-sladvogados.firebaseapp.com",\
  projectId: "sala-reunioes-sladvogados",\
  storageBucket: "sala-reunioes-sladvogados.firebasestorage.app",\
  messagingSenderId: "509967336597",\
  appId: "1:509967336597:web:95079bbc5a68933591079c"\
\};\
\
const app = initializeApp(firebaseConfig);\
const db = getFirestore(app);\
\
const ADVOGADOS = [\
  'Nanda', 'Ana Julia', 'Advogado 3', 'Advogado 4',\
  'Advogado 5', 'Advogado 6', 'Advogado 7', 'Advogado 8',\
];\
\
const CORES = \{\
  'Nanda':      \{ bg: '#8B6F47', text: '#FFF8E7' \},\
  'Ana Julia':  \{ bg: '#A0826D', text: '#FFF8E7' \},\
  'Advogado 3': \{ bg: '#6B5B45', text: '#FFF8E7' \},\
  'Advogado 4': \{ bg: '#8C7355', text: '#FFF8E7' \},\
  'Advogado 5': \{ bg: '#5C4A37', text: '#FFF8E7' \},\
  'Advogado 6': \{ bg: '#9B7E5A', text: '#FFF8E7' \},\
  'Advogado 7': \{ bg: '#735D42', text: '#FFF8E7' \},\
  'Advogado 8': \{ bg: '#A89070', text: '#FFF8E7' \},\
\};\
\
const MESES = ['Janeiro','Fevereiro','Mar\'e7o','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];\
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','S\'e1b'];\
\
function fmtKey(d) \{\
  return `$\{d.getFullYear()\}-$\{String(d.getMonth()+1).padStart(2,'0')\}-$\{String(d.getDate()).padStart(2,'0')\}`;\
\}\
function fmtBR(s) \{ const [y,m,d]=s.split('-'); return `$\{d\}/$\{m\}/$\{y\}`; \}\
function toMin(h) \{ const [a,b]=h.split(':').map(Number); return a*60+b; \}\
\
export default function App() \{\
  const [agendamentos, setAgendamentos] = useState([]);\
  const [loading, setLoading] = useState(true);\
  const [dataAtual, setDataAtual] = useState(new Date());\
  const [diaSel, setDiaSel] = useState(fmtKey(new Date()));\
  const [modal, setModal] = useState(false);\
  const [erro, setErro] = useState('');\
  const [usuario, setUsuario] = useState('Nanda');\
  const [form, setForm] = useState(\{ titulo:'', responsavel:'Nanda', horaInicio:'09:00', horaFim:'10:00', descricao:'' \});\
\
  useEffect(() => \{\
    const unsub = onSnapshot(collection(db, 'agendamentos'), snap => \{\
      setAgendamentos(snap.docs.map(d => (\{ id: d.id, ...d.data() \})));\
      setLoading(false);\
    \});\
    return unsub;\
  \}, []);\
\
  const doDia = useMemo(() =>\
    agendamentos.filter(a => a.data === diaSel).sort((a,b) => a.horaInicio.localeCompare(b.horaInicio)),\
    [agendamentos, diaSel]\
  );\
\
  const diasComReuniao = useMemo(() => new Set(agendamentos.map(a => a.data)), [agendamentos]);\
\
  function conflito(inicio, fim, ignorar=null) \{\
    const s=toMin(inicio), e=toMin(fim);\
    return agendamentos.find(a => a.id!==ignorar && a.data===diaSel && s<toMin(a.horaFim) && e>toMin(a.horaInicio));\
  \}\
\
  async function salvar() \{\
    setErro('');\
    if (!form.titulo.trim()) return setErro('Informe o t\'edtulo da reuni\'e3o');\
    if (toMin(form.horaFim) <= toMin(form.horaInicio)) return setErro('Hor\'e1rio de t\'e9rmino deve ser ap\'f3s o in\'edcio');\
    const c = conflito(form.horaInicio, form.horaFim);\
    if (c) return setErro(`Conflito com "$\{c.titulo\}" ($\{c.horaInicio\}\'96$\{c.horaFim\}) \'97 $\{c.responsavel\}`);\
    await addDoc(collection(db,'agendamentos'), \{\
      data: diaSel, titulo: form.titulo.trim(),\
      responsavel: form.responsavel, horaInicio: form.horaInicio,\
      horaFim: form.horaFim, descricao: form.descricao.trim(),\
      criadoEm: new Date().toISOString(),\
    \});\
    setModal(false);\
    setForm(\{ titulo:'', responsavel:usuario, horaInicio:'09:00', horaFim:'10:00', descricao:'' \});\
  \}\
\
  async function excluir(id) \{\
    if (!window.confirm('Deseja excluir este agendamento?')) return;\
    await deleteDoc(doc(db,'agendamentos',id));\
  \}\
\
  const grade = useMemo(() => \{\
    const p = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);\
    const ini = new Date(p); ini.setDate(ini.getDate()-p.getDay());\
    return Array.from(\{length:42\}, (_,i) => \{ const d=new Date(ini); d.setDate(d.getDate()+i); return d; \});\
  \}, [dataAtual]);\
\
  const hoje = fmtKey(new Date());\
\
  const S = \{\
    page: \{ minHeight:'100vh', background:'linear-gradient(135deg,#F5EFE0,#EBE0C8)', fontFamily:'"Cormorant Garamond",Georgia,serif', color:'#3A2E1F' \},\
    header: \{ background:'#3A2E1F', color:'#F5EFE0', padding:'24px 32px', borderBottom:'3px solid #C9A961' \},\
    card: \{ background:'#FDFAF1', borderRadius:8, padding:28, boxShadow:'0 4px 20px rgba(58,46,31,.08)', border:'1px solid #E5D5B0' \},\
    label: \{ display:'block', fontSize:11, letterSpacing:1.5, color:'#8B6F47', marginBottom:6, fontFamily:'Inter,sans-serif', textTransform:'uppercase' \},\
    input: \{ fontFamily:'Inter,sans-serif', border:'1px solid #C9B896', background:'#FDFAF1', padding:'10px 12px', borderRadius:4, fontSize:14, color:'#3A2E1F', width:'100%', outline:'none' \},\
    btnPrimary: \{ background:'#3A2E1F', color:'#FDFAF1', padding:'10px 24px', borderRadius:4, fontSize:13, fontWeight:500, letterSpacing:.5, border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif' \},\
    btnSecondary: \{ padding:'10px 20px', borderRadius:4, fontSize:13, fontWeight:500, color:'#3A2E1F', border:'1px solid #C9B896', background:'transparent', cursor:'pointer', fontFamily:'Inter,sans-serif' \},\
  \};\
\
  return (\
    <div style=\{S.page\}>\
      <style>\{`\
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');\
        *\{box-sizing:border-box\} body\{margin:0\}\
        .day:hover\{background:#E5D5B0!important\}\
        .card\{transition:transform .15s,box-shadow .15s\}\
        .card:hover\{transform:translateY(-2px);box-shadow:0 8px 24px rgba(58,46,31,.15)\}\
        @keyframes fi\{from\{opacity:0;transform:translateY(8px)\}to\{opacity:1;transform:translateY(0)\}\}\
        .fi\{animation:fi .3s ease-out\}\
        select,input,textarea\{font-family:Inter,sans-serif\}\
      `\}</style>\
\
      \{/* Header */\}\
      <header style=\{S.header\}>\
        <div style=\{\{maxWidth:1400,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16\}\}>\
          <div>\
            <div style=\{\{fontSize:11,letterSpacing:4,color:'#C9A961',textTransform:'uppercase',marginBottom:4,fontFamily:'Inter,sans-serif'\}\}>\
              Souza Le\'e3o Advogados / Luna Advocacia Corporativa\
            </div>\
            <h1 style=\{\{margin:0,fontSize:32,fontWeight:600\}\}>Sala de Reuni\'f5es</h1>\
          </div>\
          <div style=\{\{display:'flex',alignItems:'center',gap:12\}\}>\
            <div style=\{\{fontSize:11,color:'#C9A961',fontFamily:'Inter,sans-serif',letterSpacing:1\}\}>VOC\'ca \'c9:</div>\
            <select value=\{usuario\} onChange=\{e=>\{setUsuario(e.target.value);setForm(p=>(\{...p,responsavel:e.target.value\}))\}\}\
              style=\{\{background:'#4A3E2F',color:'#F5EFE0',border:'1px solid #8B6F47',padding:'8px 12px',borderRadius:4,minWidth:160\}\}>\
              \{ADVOGADOS.map(a=><option key=\{a\} value=\{a\}>\{a\}</option>)\}\
            </select>\
          </div>\
        </div>\
      </header>\
\
      <main style=\{\{maxWidth:1400,margin:'0 auto',padding:32,display:'grid',gridTemplateColumns:'1fr 1fr',gap:32\}\}>\
\
        \{/* Calend\'e1rio */\}\
        <section style=\{S.card\}>\
          <div style=\{\{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24\}\}>\
            <button onClick=\{()=>\{const d=new Date(dataAtual);d.setMonth(d.getMonth()-1);setDataAtual(d)\}\} style=\{\{padding:8,cursor:'pointer',border:'none',background:'none',color:'#3A2E1F'\}\}>\
              <ChevronLeft size=\{24\}/>\
            </button>\
            <h2 style=\{\{margin:0,fontSize:24,fontWeight:600\}\}>\
              \{MESES[dataAtual.getMonth()]\} <span style=\{\{color:'#8B6F47'\}\}>\{dataAtual.getFullYear()\}</span>\
            </h2>\
            <button onClick=\{()=>\{const d=new Date(dataAtual);d.setMonth(d.getMonth()+1);setDataAtual(d)\}\} style=\{\{padding:8,cursor:'pointer',border:'none',background:'none',color:'#3A2E1F'\}\}>\
              <ChevronRight size=\{24\}/>\
            </button>\
          </div>\
          <div style=\{\{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:8\}\}>\
            \{DIAS_SEMANA.map(d=><div key=\{d\} style=\{\{textAlign:'center',fontSize:11,fontWeight:600,color:'#8B6F47',letterSpacing:1,padding:8,fontFamily:'Inter,sans-serif'\}\}>\{d.toUpperCase()\}</div>)\}\
          </div>\
          <div style=\{\{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4\}\}>\
            \{grade.map((dia,i)=>\{\
              const k=fmtKey(dia), sel=k===diaSel, eHoje=k===hoje, mesAtual=dia.getMonth()===dataAtual.getMonth();\
              return (\
                <button key=\{i\} onClick=\{()=>setDiaSel(k)\} className="day"\
                  style=\{\{aspectRatio:'1',border:sel?'2px solid #3A2E1F':eHoje?'2px solid #C9A961':'1px solid transparent',borderRadius:4,background:sel?'#3A2E1F':'transparent',color:sel?'#FDFAF1':mesAtual?'#3A2E1F':'#C9B896',fontSize:14,fontWeight:(eHoje||sel)?600:400,position:'relative',cursor:'pointer',transition:'all .15s',fontFamily:'Inter,sans-serif'\}\}>\
                  \{dia.getDate()\}\
                  \{diasComReuniao.has(k)&&<div style=\{\{position:'absolute',bottom:4,left:'50%',transform:'translateX(-50%)',width:4,height:4,borderRadius:'50%',background:sel?'#C9A961':'#8B6F47'\}\}/>\}\
                </button>\
              );\
            \})\}\
          </div>\
        </section>\
\
        \{/* Agenda do dia */\}\
        <section style=\{\{...S.card,display:'flex',flexDirection:'column'\}\}>\
          <div style=\{\{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24,flexWrap:'wrap',gap:12\}\}>\
            <div>\
              <div style=\{\{fontSize:11,letterSpacing:2,color:'#8B6F47',textTransform:'uppercase',fontFamily:'Inter,sans-serif'\}\}>Agenda do dia</div>\
              <h2 style=\{\{margin:'4px 0 0',fontSize:24,fontWeight:600\}\}>\{fmtBR(diaSel)\}</h2>\
            </div>\
            <button onClick=\{()=>\{setForm(p=>(\{...p,responsavel:usuario\}));setModal(true);setErro('');\}\} style=\{\{...S.btnPrimary,display:'flex',alignItems:'center',gap:8\}\}>\
              <Plus size=\{16\}/> NOVA RESERVA\
            </button>\
          </div>\
\
          \{loading ? (\
            <div style=\{\{textAlign:'center',padding:40,color:'#8B6F47',fontFamily:'Inter,sans-serif'\}\}>Carregando...</div>\
          ) : doDia.length===0 ? (\
            <div style=\{\{textAlign:'center',padding:'60px 20px',color:'#8B6F47'\}\}>\
              <Calendar size=\{48\} style=\{\{opacity:.4,marginBottom:16\}\}/>\
              <div style=\{\{fontSize:18,marginBottom:4\}\}>Nenhuma reserva neste dia</div>\
              <div style=\{\{fontSize:13,opacity:.7,fontFamily:'Inter,sans-serif'\}\}>Clique em "Nova Reserva" para agendar</div>\
            </div>\
          ) : (\
            <div style=\{\{display:'flex',flexDirection:'column',gap:12,overflowY:'auto'\}\}>\
              \{doDia.map(a=>\{\
                const cor=CORES[a.responsavel]||\{bg:'#8B6F47',text:'#FFF8E7'\};\
                return (\
                  <div key=\{a.id\} className="card fi" style=\{\{background:'#FFF8E7',border:'1px solid #E5D5B0',borderLeft:`4px solid $\{cor.bg\}`,borderRadius:4,padding:16,display:'flex',gap:16\}\}>\
                    <div style=\{\{flex:1\}\}>\
                      <div style=\{\{display:'flex',alignItems:'center',gap:8,marginBottom:6\}\}>\
                        <Clock size=\{14\} style=\{\{color:'#8B6F47'\}\}/>\
                        <span style=\{\{fontSize:13,fontWeight:600,fontFamily:'Inter,sans-serif'\}\}>\{a.horaInicio\} \'97 \{a.horaFim\}</span>\
                      </div>\
                      <div style=\{\{fontSize:18,fontWeight:600,marginBottom:4\}\}>\{a.titulo\}</div>\
                      <div style=\{\{display:'inline-flex',alignItems:'center',gap:6,fontSize:12,background:cor.bg,color:cor.text,padding:'3px 10px',borderRadius:12,fontFamily:'Inter,sans-serif'\}\}>\
                        <User size=\{11\}/> \{a.responsavel\}\
                      </div>\
                      \{a.descricao&&<div style=\{\{fontSize:13,color:'#5C4A37',marginTop:10,lineHeight:1.5,fontFamily:'Inter,sans-serif'\}\}>\{a.descricao\}</div>\}\
                    </div>\
                    <button onClick=\{()=>excluir(a.id)\} style=\{\{color:'#8B6F47',padding:6,cursor:'pointer',border:'none',background:'none',alignSelf:'flex-start'\}\}><Trash2 size=\{16\}/></button>\
                  </div>\
                );\
              \})\}\
            </div>\
          )\}\
        </section>\
      </main>\
\
      \{/* Modal */\}\
      \{modal&&(\
        <div onClick=\{()=>setModal(false)\} style=\{\{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(58,46,31,.6)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,zIndex:100\}\}>\
          <div onClick=\{e=>e.stopPropagation()\} className="fi" style=\{\{background:'#FDFAF1',borderRadius:8,padding:32,maxWidth:500,width:'100%',maxHeight:'90vh',overflowY:'auto',border:'1px solid #C9B896'\}\}>\
            <div style=\{\{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4\}\}>\
              <div style=\{\{fontSize:11,letterSpacing:2,color:'#8B6F47',fontFamily:'Inter,sans-serif',textTransform:'uppercase'\}\}>Nova reserva</div>\
              <button onClick=\{()=>setModal(false)\} style=\{\{color:'#8B6F47',border:'none',background:'none',cursor:'pointer'\}\}><X size=\{20\}/></button>\
            </div>\
            <h3 style=\{\{margin:'0 0 24px',fontSize:22,fontWeight:600\}\}>\{fmtBR(diaSel)\}</h3>\
\
            \{erro&&<div style=\{\{background:'#F8E5D5',border:'1px solid #C9876B',color:'#7A3D1F',padding:12,borderRadius:4,marginBottom:16,fontSize:13,display:'flex',alignItems:'center',gap:8,fontFamily:'Inter,sans-serif'\}\}>\
              <AlertCircle size=\{16\}/> \{erro\}\
            </div>\}\
\
            <div style=\{\{display:'flex',flexDirection:'column',gap:14\}\}>\
              <div>\
                <label style=\{S.label\}>T\'cdTULO DA REUNI\'c3O</label>\
                <input style=\{S.input\} value=\{form.titulo\} onChange=\{e=>setForm(p=>(\{...p,titulo:e.target.value\}))\} placeholder="Ex: Reuni\'e3o com cliente \'97 ITCMD" autoFocus/>\
              </div>\
              <div>\
                <label style=\{S.label\}>RESPONS\'c1VEL</label>\
                <select style=\{S.input\} value=\{form.responsavel\} onChange=\{e=>setForm(p=>(\{...p,responsavel:e.target.value\}))\}>\
                  \{ADVOGADOS.map(a=><option key=\{a\} value=\{a\}>\{a\}</option>)\}\
                </select>\
              </div>\
              <div style=\{\{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12\}\}>\
                <div>\
                  <label style=\{S.label\}>IN\'cdCIO</label>\
                  <input style=\{S.input\} type="time" value=\{form.horaInicio\} onChange=\{e=>setForm(p=>(\{...p,horaInicio:e.target.value\}))\}/>\
                </div>\
                <div>\
                  <label style=\{S.label\}>T\'c9RMINO</label>\
                  <input style=\{S.input\} type="time" value=\{form.horaFim\} onChange=\{e=>setForm(p=>(\{...p,horaFim:e.target.value\}))\}/>\
                </div>\
              </div>\
              <div>\
                <label style=\{S.label\}>OBSERVA\'c7\'d5ES (OPCIONAL)</label>\
                <textarea style=\{\{...S.input,resize:'vertical'\}\} value=\{form.descricao\} onChange=\{e=>setForm(p=>(\{...p,descricao:e.target.value\}))\} rows=\{3\} placeholder="Pauta, participantes externos, materiais..."/>\
              </div>\
            </div>\
\
            <div style=\{\{display:'flex',gap:12,marginTop:24,justifyContent:'flex-end'\}\}>\
              <button onClick=\{()=>setModal(false)\} style=\{S.btnSecondary\}>CANCELAR</button>\
              <button onClick=\{salvar\} style=\{S.btnPrimary\}>CONFIRMAR RESERVA</button>\
            </div>\
          </div>\
        </div>\
      )\}\
\
      <footer style=\{\{textAlign:'center',padding:24,fontSize:11,color:'#8B6F47',letterSpacing:1,fontFamily:'Inter,sans-serif'\}\}>\
        SOUZA LE\'c3O ADVOGADOS / LUNA ADVOCACIA CORPORATIVA\
      </footer>\
    </div>\
  );\
\}}
