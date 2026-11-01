'use client';
import { useState, useEffect, useCallback } from 'react';
import { THEMES, THEME_PHOTOS, THEME_DESC, DECOR_ITEMS, DECOR_PHOTOS, MENU_ITEMS, MENU_CATEGORIES, DesignData, DEFAULT_DESIGN } from './designData';

const S = {
  bg:'#fdf8f3', surface:'#fffbf7', border:'#e8d8c8', border2:'#d4bfa8',
  gold:'#b8832a', gold2:'#e6b85c', rose:'#c0394d', blush:'#f7e8e8',
  text:'#2c1a0e', sub:'#7a5c48', muted:'#a8897a',
  ok:'#1e7c4a', okBg:'#e8f7ef', warnBg:'#fef7e8',
  serif:"'Playfair Display',Georgia,serif",
  sans:"'Inter',system-ui,sans-serif",
};

const card: React.CSSProperties = { background:S.surface, border:`1px solid ${S.border}`, borderRadius:16, padding:20, boxShadow:'0 2px 12px #b8832a0d', marginBottom:16 };
const secHd: React.CSSProperties = { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 };
const h3style: React.CSSProperties = { margin:0, fontSize:'1.1rem', color:S.gold, fontFamily:S.serif, fontWeight:700 };
const badge = (bg:string,color:string): React.CSSProperties => ({ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:99, fontSize:'.75rem', fontWeight:600, background:bg, color });
const chip = (on:boolean): React.CSSProperties => ({ padding:'7px 14px', borderRadius:99, font:`500 .82rem ${S.sans}`, cursor:'pointer', transition:'all .15s', border:`1px solid ${on?S.gold:S.border2}`, background:on?S.gold:S.surface, color:on?'#fff':S.text });
const thumb = (sel:boolean, rose?:boolean): React.CSSProperties => ({ position:'relative', borderRadius:10, overflow:'hidden', cursor:'pointer', border:`3px solid ${sel?(rose?S.rose:S.text):'transparent'}`, boxShadow:sel?(rose?'0 0 0 2px #f7c8d8':'0 0 0 2px '+S.gold):undefined, padding:0, background:'none', transition:'all .18s' });
const check: React.CSSProperties = { position:'absolute', top:5, right:5, width:20, height:20, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem', fontWeight:700, color:'#fff' };

interface Props { weddingId: string; pax?: number; }
type View = 'pick'|'summary';

export default function DesignStudio({ weddingId, pax=300 }: Props) {
  const [design,  setDesign]  = useState<DesignData>(DEFAULT_DESIGN);
  const [view,    setView]    = useState<View>('pick');
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [preview, setPreview] = useState<string|null>(null);

  useEffect(() => {
    fetch(`/api/weddings/${weddingId}/design`)
      .then(r=>r.json()).then(d=>setDesign({...DEFAULT_DESIGN,...d})).catch(()=>{});
  }, [weddingId]);

  const persist = useCallback(async (next: DesignData) => {
    setSaving(true);
    try {
      await fetch(`/api/weddings/${weddingId}/design`,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(next) });
      setSaved(true); setTimeout(()=>setSaved(false),2000);
    } finally { setSaving(false); }
  }, [weddingId]);

  const setTheme = (t:string)    => { const n={...design,theme:t};    setDesign(n); persist(n); };
  const togDecor = (item:string) => { const n={...design,decor:design.decor.includes(item)?design.decor.filter(d=>d!==item):[...design.decor,item]}; setDesign(n); persist(n); };
  const togMenu  = (item:string) => { const n={...design,menu:design.menu.includes(item)?design.menu.filter(m=>m!==item):[...design.menu,item]};  setDesign(n); persist(n); };
  const plateCost = design.menu.reduce((s,name)=>s+(MENU_ITEMS.find(m=>m.name===name)?.pricePerPlate??0),0);
  const previewing = preview??design.theme;

  return (
    <div style={{fontFamily:S.sans,color:S.text,background:S.bg,borderRadius:16,padding:'4px 0'}}>
      {(saving||saved)&&<div style={{position:'fixed',top:20,right:20,zIndex:9999,padding:'10px 18px',borderRadius:10,fontSize:'.875rem',fontWeight:500,color:'#fff',boxShadow:'0 4px 20px #0003',background:saved?S.ok:S.gold}}>{saving?'Saving…':'✓ Saved'}</div>}
      {view==='pick'&&<div>

        {/* ── Theme ── */}
        <div style={card}>
          <div style={secHd}>
            <h3 style={h3style}>Wedding Theme</h3>
            <span style={badge('#fef7e0',S.gold)}>{design.theme}</span>
          </div>
          {/* preview hero */}
          <div style={{position:'relative',borderRadius:14,overflow:'hidden',marginBottom:16,height:220,background:'#eee'}}>
            <img src={THEME_PHOTOS[previewing as keyof typeof THEME_PHOTOS]??THEME_PHOTOS['Royal Heritage']} alt={previewing} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.6) 0%,transparent 55%)',display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:'16px 18px'}}>
              <div style={{fontFamily:S.serif,fontSize:'1.25rem',fontWeight:700,color:'#fff',marginBottom:4}}>{previewing}</div>
              <div style={{fontSize:'.82rem',color:'rgba(255,255,255,.8)',lineHeight:1.4,maxWidth:440}}>{THEME_DESC[previewing as keyof typeof THEME_DESC]}</div>
            </div>
            {previewing===design.theme&&<div style={{position:'absolute',top:12,right:12,background:S.ok,color:'#fff',borderRadius:99,padding:'3px 10px',fontSize:'.75rem',fontWeight:700}}>Selected</div>}
          </div>
          {/* theme grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:10}}>
            {THEMES.map(t=>{
              const isSel=design.theme===t;
              return <button key={t} style={thumb(isSel)} onClick={()=>setTheme(t)} onMouseEnter={()=>setPreview(t)} onMouseLeave={()=>setPreview(null)}>
                <img src={THEME_PHOTOS[t]} alt={t} style={{width:'100%',height:90,objectFit:'cover',display:'block',filter:isSel?'none':'brightness(.8)'}}/>
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.65),transparent 50%)',display:'flex',alignItems:'flex-end',padding:8}}>
                  <span style={{fontFamily:S.serif,fontSize:'.78rem',fontWeight:700,color:'#fff',lineHeight:1.2}}>{t}</span>
                </div>
                {isSel&&<div style={{...check,background:S.gold}}>✓</div>}
              </button>;
            })}
          </div>
          <p style={{fontSize:'.75rem',color:S.muted,marginTop:10}}>Hover to preview · Click to select</p>
        </div>

        {/* ── Décor ── */}
        <div style={card}>
          <div style={secHd}>
            <h3 style={h3style}>Décor Selections</h3>
            <span style={{color:S.muted,fontSize:'.82rem'}}>{design.decor.length} of {DECOR_ITEMS.length} selected</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))',gap:10}}>
            {DECOR_ITEMS.map(item=>{
              const on=design.decor.includes(item);
              return <button key={item} style={thumb(on,true)} onClick={()=>togDecor(item)}>
                <img src={DECOR_PHOTOS[item as keyof typeof DECOR_PHOTOS]} alt={item} style={{width:'100%',height:110,objectFit:'cover',display:'block',filter:on?'none':'brightness(.7) saturate(.8)'}}/>
                <div style={{position:'absolute',inset:0,background:on?'rgba(192,57,77,.15)':'rgba(0,0,0,.45)',display:'flex',alignItems:'flex-end',padding:8}}>
                  <span style={{fontFamily:S.serif,fontSize:'.78rem',fontWeight:700,color:'#fff',lineHeight:1.2}}>{item}</span>
                </div>
                {on&&<div style={{...check,background:S.rose}}>✓</div>}
              </button>;
            })}
          </div>
          {design.decor.length>0&&<div style={{marginTop:12,padding:'10px 14px',background:S.blush,borderRadius:8,fontSize:'.85rem',color:S.rose}}>Selected: {design.decor.join(' · ')}</div>}
        </div>
        {/* ── Menu ── */}
        <div style={card}>
          <div style={secHd}>
            <h3 style={h3style}>Food Menu</h3>
            <span style={{color:S.muted,fontSize:'.82rem'}}>{design.menu.length} dishes · {plateCost?`₹${plateCost}/plate`:'select dishes to price'}</span>
          </div>
          {MENU_CATEGORIES.map(cat=>(
            <div key={cat} style={{marginBottom:16}}>
              <div style={{fontSize:'.75rem',fontWeight:700,color:S.sub,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8}}>{cat}</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {MENU_ITEMS.filter(m=>m.category===cat).map(item=>(
                  <button key={item.name} style={chip(design.menu.includes(item.name))} onClick={()=>togMenu(item.name)}>
                    {item.name} · ₹{item.pricePerPlate}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {plateCost>0&&<div style={{background:S.bg,borderRadius:10,padding:'12px 16px',marginTop:8,border:`1px solid ${S.border}`}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <span style={{color:S.sub,fontSize:'.9rem'}}>Cost per plate</span>
              <b>₹{plateCost.toLocaleString('en-IN')}</b>
            </div>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <span style={{color:S.sub,fontSize:'.9rem'}}>Total for {pax} guests</span>
              <b style={{color:S.gold}}>₹{(plateCost*pax/100000).toFixed(2)} L</b>
            </div>
          </div>}
        </div>

        {/* ── Notes ── */}
        <div style={card}>
          <div style={secHd}><h3 style={h3style}>Design Notes</h3></div>
          <textarea rows={3} value={design.designNotes}
            placeholder="Vision, colour preferences, special requests — e.g. lots of marigolds, warm candlelight throughout..."
            onChange={e=>setDesign(prev=>({...prev,designNotes:e.target.value}))}
            onBlur={()=>persist(design)}
            style={{width:'100%',padding:'9px 12px',background:S.surface,color:S.text,border:`1px solid ${S.border2}`,borderRadius:8,fontFamily:S.sans,fontSize:'.9rem',resize:'vertical'}}/>
        </div>

        {/* ── Confirm ── */}
        <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:4}}>
          <button onClick={()=>{persist(design);setView('summary');}}
            style={{display:'inline-flex',alignItems:'center',gap:6,background:S.gold,color:'#fff',border:`1px solid ${S.gold}`,borderRadius:8,padding:'10px 28px',font:`600 1rem ${S.sans}`,cursor:'pointer',transition:'all .15s'}}>
            View My Design →
          </button>
        </div>
      </div>}
      {view==='summary'&&<div>

        {/* ── Hero ── */}
        <div style={{position:'relative',borderRadius:16,overflow:'hidden',marginBottom:20,height:280}}>
          <img src={THEME_PHOTOS[design.theme as keyof typeof THEME_PHOTOS]??THEME_PHOTOS['Royal Heritage']} alt={design.theme} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(44,26,14,.88) 0%,transparent 55%)',display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:'22px 24px'}}>
            <div style={{fontSize:'.78rem',fontWeight:700,color:'#d0b898',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Your Selected Design</div>
            <div style={{fontFamily:S.serif,fontSize:'2rem',fontWeight:700,color:'#fff',marginBottom:6}}>{design.theme}</div>
            <div style={{fontSize:'.88rem',color:'rgba(255,255,255,.75)',maxWidth:480,lineHeight:1.5}}>{THEME_DESC[design.theme as keyof typeof THEME_DESC]}</div>
          </div>
          <div style={{position:'absolute',top:14,right:14,background:S.ok,color:'#fff',borderRadius:99,padding:'4px 14px',fontSize:'.78rem',fontWeight:700}}>✓ Design Saved</div>
        </div>

        {/* ── Stats ── */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:16}}>
          {[['Theme',design.theme],['Décor',design.decor.length+' items'],['Menu',design.menu.length+' dishes'],['Per plate',plateCost>0?'₹'+plateCost:'—']].map(([lbl,val])=>(
            <div key={lbl} style={{background:S.bg,border:`1px solid ${S.border}`,borderRadius:12,padding:'14px 16px'}}>
              <div style={{fontSize:'.72rem',fontWeight:700,color:S.sub,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{lbl}</div>
              <div style={{fontFamily:S.serif,fontSize:'1.1rem',color:S.gold,fontWeight:700}}>{val}</div>
            </div>
          ))}
        </div>

        {/* ── Décor summary ── */}
        {design.decor.length>0&&<div style={card}>
          <div style={secHd}>
            <h3 style={h3style}>Selected Décor</h3>
            <span style={badge(S.blush,S.rose)}>{design.decor.length} items</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10}}>
            {design.decor.map(item=>(
              <div key={item} style={{position:'relative',borderRadius:10,overflow:'hidden'}}>
                <img src={DECOR_PHOTOS[item as keyof typeof DECOR_PHOTOS]} alt={item} style={{width:'100%',height:100,objectFit:'cover',display:'block'}}/>
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.6),transparent 50%)',display:'flex',alignItems:'flex-end',padding:8}}>
                  <span style={{fontFamily:S.serif,fontSize:'.78rem',fontWeight:700,color:'#fff'}}>{item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>}

        {/* ── Menu summary ── */}
        {design.menu.length>0&&<div style={card}>
          <div style={secHd}>
            <h3 style={h3style}>Selected Menu</h3>
            <span style={badge('#fef7e0',S.gold)}>{design.menu.length} dishes</span>
          </div>
          {MENU_CATEGORIES.map(cat=>{
            const items=design.menu.filter(name=>MENU_ITEMS.find(m=>m.name===name&&m.category===cat));
            if(!items.length) return null;
            return <div key={cat} style={{marginBottom:12}}>
              <div style={{fontSize:'.72rem',fontWeight:700,color:S.sub,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>{cat}</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {items.map(name=><span key={name} style={badge('#f0ece8',S.sub)}>{name}</span>)}
              </div>
            </div>;
          })}
          {plateCost>0&&<div style={{marginTop:12,padding:'12px 16px',background:'#fdf8ef',border:'1px solid #e8d0a0',borderRadius:10}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <span style={{color:S.sub,fontSize:'.9rem'}}>Cost per plate</span><b>₹{plateCost.toLocaleString('en-IN')}</b>
            </div>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <span style={{color:S.sub,fontSize:'.9rem'}}>Total for {pax} guests</span>
              <b style={{color:S.gold}}>₹{(plateCost*pax/100000).toFixed(2)} L</b>
            </div>
          </div>}
        </div>}

        {/* ── Notes summary ── */}
        {design.designNotes.trim()&&<div style={card}>
          <div style={secHd}><h3 style={h3style}>Design Notes</h3></div>
          <p style={{color:S.sub,fontSize:'.92rem',lineHeight:1.6,margin:0}}>{design.designNotes}</p>
        </div>}

        {/* ── Edit button ── */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,marginTop:4,flexWrap:'wrap'}}>
          <button onClick={()=>setView('pick')}
            style={{display:'inline-flex',alignItems:'center',gap:6,border:`1px solid ${S.border2}`,background:S.surface,color:S.text,borderRadius:8,padding:'8px 18px',font:`500 .875rem ${S.sans}`,cursor:'pointer'}}>
            ← Edit Design
          </button>
          <span style={badge(S.okBg,S.ok)}>✓ All selections saved</span>
        </div>
      </div>}

    </div>
  );
}