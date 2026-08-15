const T={domains:"Domaine",teamRef:"TEAM_REF",axes:"Axes_Strategiques",objectives:"Objectifs",offers:"Offres_Services",activityOffers:"Activites_OFS",activities:"Activites",team:"Team",projectStages:"Etapes_Projet",featureStages:"Stades_Fonctionnalite",features:"Fonctionnalites",projects:"Projects",tasks:"Tasks",allocations:"Allocations",contrib:"CONTRIBUTIONS_OBJECTIFS",audit:"JOURNAL_ACTIONS",documentation:"Documentation"};let db={},search="",resolvedTables={},tableErrors={};const $=x=>document.getElementById(x);function rows(d){if(!d||!Array.isArray(d.id))return[];let k=Object.keys(d);return d.id.map((_,i)=>Object.fromEntries(k.map(x=>[x,Array.isArray(d[x])?d[x][i]:d[x]])))}async function ft(k,t){
  const candidates={
    domains:["Domaine","Domaines","DOMAINE","DOMAINES"],
    teamRef:["TEAM_REF","Team_ref","TEAMREF"]
  };
  const names=candidates[k]||[t];
  let lastError=null;
  for(const name of names){
    try{
      const raw=await grist.docApi.fetchTable(name);
      resolvedTables[k]=name;
      delete tableErrors[k];
      return rows(raw);
    }catch(e){
      lastError=e;
      console.warn(name,e);
    }
  }
  tableErrors[k]=lastError?.message||String(lastError||"Table inaccessible");
  resolvedTables[k]=null;
  return[]
}
function tableName(k,fallback){return resolvedTables[k]||fallback}function id(v){if(Array.isArray(v))return v.find(x=>Number.isInteger(x))??null;let n=Number(v);return Number.isFinite(n)?n:null}function refs(v){return Array.isArray(v)?v.filter(Number.isInteger):Number.isInteger(v)?[v]:[]}function get(k,i){return(db[k]||[]).find(r=>r.id==i)||null}function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}function pct(v){let n=Number(v||0);if(n<=1)n*=100;return Math.round(n)}function dms(v){if(!v)return null;if(typeof v==='number')return v>1e12?v:v*1000;let n=Date.parse(v);return isNaN(n)?null:n}function dt(v){let m=dms(v);return m?new Date(m).toLocaleString('fr-FR'):''}function din(v){let m=dms(v);return m?new Date(m).toISOString().slice(0,10):''}function gd(v){return v?Math.floor(Date.parse(v+'T00:00:00Z')/1000):null}function msg(t){$('banner').textContent=t;$('banner').classList.remove('hidden');setTimeout(()=>$('banner').classList.add('hidden'),2500)}async function apply(a,m){try{await grist.docApi.applyUserActions(a);await load();msg(m)}catch(e){console.error(e);msg('Erreur Grist : '+(e.message||e))}}
const A={
documentation:{l:'Documentation',t:'Documentation',k:'documentation',f:[['Nom','Nom','text'],['Icone','Icône','text'],['Type_Document','Type','choice',['URL','Pièce jointe']],['URL','URL','text'],['Piece_Jointe','Pièce jointe Grist','readonly'],['Ordre','Ordre','number'],['Actif','Actif','bool']]},

domains:{l:'Domaines',t:'Domaine',k:'domains',f:[['Code','Code','text'],['Nom','Nom','text'],['Description','Description','text']]},
teamRef:{l:'Équipes / TEAM_REF',t:'TEAM_REF',k:'teamRef',f:[['Code','Code','text'],['Libelle','Libellé','text'],['Description','Description','text'],['Domaine_code','Domaine','ref:domains']]},
axes:{l:'Axes stratégiques',t:'Axes_Strategiques',k:'axes',f:[['Code','Code','text'],['Nom','Nom','text'],['Description','Description','text'],['Sponsor','Sponsor','text'],['Priorite','Priorité','text'],['Horizon','Horizon','text'],['Statut','Statut','text']]},objectives:{l:'Objectifs',t:'Objectifs',k:'objectives',f:[['Code','Code','text'],['Nom','Nom','text'],['Axe_Code','Axe','ref:axes'],['KPI','KPI','text'],['Valeur_Cible','Valeur cible','text'],['Echeance','Échéance','date'],['Responsable','Responsable','text'],['Statut','Statut','text'],['Progression','Progression %','percent']]},offers:{l:'Offres de services',t:'Offres_Services',k:'offers',f:[['Code','Code','text'],['Nom','Nom','text'],['Description','Description','text'],['Responsable','Responsable','text'],['Statut','Statut','text']]},activityOffers:{l:'Activités OFS',t:'Activites_OFS',k:'activityOffers',f:[['Activites_Nom','Nom','text'],['OFS_Code','Offre','ref:offers']]},activities:{l:'Activités',t:'Activites',k:'activities',f:[['Code','Code','text'],['Nom','Nom','text'],['Service_Code','Activité OFS','ref:activityOffers'],['Description','Description','text'],['Responsable','Responsable','text'],['Type','Type','text'],['Capacite_ETP','Capacité ETP','number'],['Statut','Statut','text']]},team:{l:'Équipe / Team',t:'Team',k:'team',f:[['nom','Nom','text'],['role','Rôle','text'],['capacite_ETP','Capacité ETP','number']]},projectStages:{l:'Étapes projet',t:'Etapes_Projet',k:'projectStages',f:[['Code','Code','text'],['Nom','Nom','text'],['Ordre','Ordre','number'],['Actif','Actif','bool']]},featureStages:{l:'Stades fonctionnalité',t:'Stades_Fonctionnalite',k:'featureStages',f:[['Code','Code','text'],['Nom','Nom','text'],['Ordre','Ordre','number'],['Actif','Actif','bool']]}};
function deps(k,r){
if(k==='domains')return db.teamRef.filter(x=>id(x.Domaine_code)==r).length;
if(k==='teamRef')return 0;
if(k==='axes')return db.objectives.filter(x=>id(x.Axe_Code)==r).length;if(k==='objectives')return db.contrib.filter(x=>(id(x.Objectif_Libelle)||id(x.Objectif_Code2))==r).length;if(k==='offers')return db.activityOffers.filter(x=>id(x.OFS_Code)==r).length;if(k==='activityOffers')return db.activities.filter(x=>id(x.Service_Code)==r).length;if(k==='activities')return db.projects.filter(x=>id(x.activite)==r).length;if(k==='team')return db.projects.filter(x=>id(x.responsable)==r).length+db.tasks.filter(x=>refs(x.assignees).includes(r)).length+db.allocations.filter(x=>id(x.Ressource_Code)==r).length+db.features.filter(x=>id(x.Responsable)==r).length;if(k==='projectStages')return db.projects.filter(x=>id(x.etape_courante)==r).length+db.tasks.filter(x=>id(x.etape_projet)==r).length;if(k==='featureStages')return db.features.filter(x=>id(x.stade)==r).length;if(k==='features')return db.tasks.filter(x=>id(x.fonctionnalite)==r).length;return 0}function display(r,f){let[n,,t]=f,v=r[n];if(t==='date')return dt(v);if(t==='percent')return pct(v)+'%';if(t==='bool')return v?'Oui':'Non';if(t.startsWith('ref:')){let x=get(t.split(':')[1],id(v));return x?.Nom||x?.nom||x?.Activites_Nom||x?.Code||''}return v??''}
function init(){refSelect.innerHTML=Object.entries(A).map(([k,c])=>`<option value="${k}">${c.l}</option>`).join('')}function renderRefs(){let k=refSelect.value||Object.keys(A)[0],c=A[k],rs=db[c.k]||[];refTable.innerHTML=rs.length?`<table><thead><tr>${c.f.slice(0,6).map(x=>`<th>${x[1]}</th>`).join('')}<th>Usages</th><th></th></tr></thead><tbody>${rs.map(r=>`<tr>${c.f.slice(0,6).map(f=>`<td>${esc(display(r,f))}</td>`).join('')}<td>${deps(k,r.id)}</td><td class="row-actions"><button data-e="${r.id}">Modifier</button><button class="danger" data-d="${r.id}">Supprimer</button></td></tr>`).join('')}</tbody></table>`:'Aucun enregistrement.';document.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>openEdit(+b.dataset.e));document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>del(+b.dataset.d))}function field(n,l,t,v){if(t.startsWith('ref:')){let rs=db[t.split(':')[1]]||[];return`<label>${l}<select name="${n}"><option value="">—</option>${rs.map(r=>`<option value="${r.id}" ${id(v)==r.id?'selected':''}>${esc(r.Nom||r.nom||r.Activites_Nom||r.Code||'#'+r.id)}</option>`).join('')}</select></label>`}if(t==='date')return`<label>${l}<input type="date" name="${n}" value="${din(v)}"></label>`;if(t==='number')return`<label>${l}<input type="number" step=".01" name="${n}" value="${v??''}"></label>`;if(t==='percent')return`<label>${l}<input type="number" min="0" max="100" name="${n}" value="${pct(v)}"></label>`;if(t==='bool')return`<label>${l}<select name="${n}"><option value="true" ${v!==false?'selected':''}>Oui</option><option value="false" ${v===false?'selected':''}>Non</option></select></label>`;return`<label>${l}<input name="${n}" value="${esc(v??'')}"></label>`}function openEdit(rid){let k=refSelect.value,c=A[k],r=rid?get(c.k,rid):null;editForm.id.value=rid||'';editTitle.textContent=(rid?'Modifier ':'Créer ')+c.l;editFields.innerHTML=c.f.map(f=>field(f[0],f[1],f[2],r?.[f[0]])).join('');depHint.textContent=rid?deps(k,rid)+' dépendance(s).':'Nouvel enregistrement.';editDialog.showModal()}editForm.onsubmit=async e=>{e.preventDefault();let k=refSelect.value,c=A[k],f=e.currentTarget,rid=+f.id.value||null,o={};for(let[n,,t]of c.f){let el=f.elements[n];o[n]=t.startsWith('ref:')?(el.value?+el.value:null):t==='date'?gd(el.value):t==='number'?(el.value===''?null:+el.value):t==='percent'?(+el.value/100):t==='bool'?(el.value==='true'):el.value}editDialog.close();await apply([[rid?'UpdateRecord':'AddRecord',tableName(c.k,c.t),rid||null,o]],rid?'Mis à jour.':'Créé.')};async function del(r){let k=refSelect.value,c=A[k],n=deps(k,r);if(n)return msg('Suppression bloquée : '+n+' dépendance(s).');if(confirm('Supprimer définitivement ?'))await apply([['RemoveRecord',tableName(c.k,c.t),r]],'Supprimé.')}
function prettyDetails(v){
  if(v===null||v===undefined||v==="")return '<span class="muted">Aucun détail enregistré</span>';
  let s=String(v);
  try{
    const o=JSON.parse(s);
    s=JSON.stringify(o,null,2);
  }catch(e){}
  return `<details><summary>Voir le détail</summary><pre style="white-space:pre-wrap;max-width:620px">${esc(s)}</pre></details>`;
}

function traceDate(v){if(!v)return"—";try{const d=typeof v==="number"?new Date(v*1000):new Date(v);return isNaN(d.getTime())?String(v):d.toLocaleString("fr-FR")}catch(_){return String(v)}}
function traceLabel(r){return r.nom||r.Nom||r.titre||r.Titre||r.Code||r.code||`#${r.id}`}
function renderTrace(){const gs=[["Projects",db.projects||[]],["Tasks",db.tasks||[]],["Fonctionnalites",db.features||[]]],rows=[],missing=[];gs.forEach(([n,a])=>{if(a.length&&!["Cree_Par","Cree_Le","Modifie_Par","Modifie_Le"].every(c=>c in a[0]))missing.push(n);a.forEach(r=>rows.push({t:n,o:traceLabel(r),cp:r.Cree_Par||"—",cl:r.Cree_Le,mp:r.Modifie_Par||"—",ml:r.Modifie_Le}))});rows.sort((a,b)=>String(b.ml||b.cl||0).localeCompare(String(a.ml||a.cl||0)));$("traceStats").innerHTML=gs.map(([n,a])=>`<div><strong>${a.length}</strong><span>${esc(n)}</span></div>`).join("");$("traceTable").innerHTML=rows.length?`<div class="table-wrap"><table><thead><tr><th>Table</th><th>Objet</th><th>Créé par</th><th>Créé le</th><th>Modifié par</th><th>Modifié le</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.t)}</td><td>${esc(r.o)}</td><td>${esc(r.cp)}</td><td>${esc(traceDate(r.cl))}</td><td>${esc(r.mp)}</td><td>${esc(traceDate(r.ml))}</td></tr>`).join("")}</tbody></table></div>`:"<p>Aucune donnée.</p>";$("traceWarning").textContent=missing.length?`Colonnes incomplètes : ${missing.join(", ")}`:"Colonnes de traçabilité détectées."}


function auditTimestamp(r){
  const v=r.Date_Heure;
  if(!v)return null;
  if(typeof v==="number")return v>1000000000000?v:v*1000;
  const n=Date.parse(v);return Number.isFinite(n)?n:null;
}
async function purgeAuditOlderThan(days){
  const cutoff=Date.now()-Number(days)*86400000;
  const ids=(db.audit||[]).filter(r=>{
    const ts=auditTimestamp(r);
    return ts!==null&&ts<cutoff;
  }).map(r=>r.id);
  if(!ids.length){banner(`Aucun log de plus de ${days} jours.`);return}
  if(!confirm(`Supprimer définitivement ${ids.length} log(s) de plus de ${days} jours ?`))return;
  await apply(ids.map(id=>["RemoveRecord","JOURNAL_ACTIONS",id]),`${ids.length} log(s) purgé(s).`);
}
async function purgeAllAudit(){
  const ids=(db.audit||[]).map(r=>r.id);
  if(!ids.length){banner("Le journal est déjà vide.");return}
  if(!confirm(`Supprimer définitivement les ${ids.length} logs de JOURNAL_ACTIONS ?`))return;
  await apply(ids.map(id=>["RemoveRecord","JOURNAL_ACTIONS",id]),"Journal purgé.");
}


function renderDocs(){
  const rows=[...(db.documentation||[])].sort((a,b)=>Number(a.Ordre||0)-Number(b.Ordre||0)||String(a.Nom||"").localeCompare(String(b.Nom||"")));
  $("docsTable").innerHTML=rows.length?`<table><thead><tr><th>Ordre</th><th>Icône</th><th>Nom</th><th>Type</th><th>Source</th><th>Actif</th><th></th></tr></thead><tbody>${rows.map(r=>{
    const attachments=Array.isArray(r.Piece_Jointe)?r.Piece_Jointe.filter(x=>Number(x)>0):[];
    const source=r.Type_Document==="Pièce jointe"?(attachments.length?`${attachments.length} pièce(s) jointe(s)`:"À charger dans Grist"):esc(r.URL||"");
    return `<tr>
      <td>${esc(r.Ordre??"")}</td><td class="doc-icon-cell">${esc(r.Icone||"📄")}</td><td><strong>${esc(r.Nom||"")}</strong></td>
      <td>${esc(r.Type_Document||"URL")}</td><td>${source}</td><td>${r.Actif===false?"Non":"Oui"}</td>
      <td class="row-actions"><button data-doc-edit="${r.id}">Modifier</button><button class="danger" data-doc-del="${r.id}">Supprimer</button></td>
    </tr>`;
  }).join("")}</tbody></table>`:'<p class="muted">Aucun lien ou document.</p>';
  document.querySelectorAll("[data-doc-edit]").forEach(b=>b.onclick=()=>{refSelect.value="documentation";openEdit(Number(b.dataset.docEdit));});
  document.querySelectorAll("[data-doc-del]").forEach(b=>b.onclick=async()=>{refSelect.value="documentation";await del(Number(b.dataset.docDel));renderDocs();});
}

function renderAudit(){
  let rs=(db.audit||[]).filter(r=>!search||Object.values(r).some(v=>String(v??'').toLowerCase().includes(search)));
  rs.sort((a,b)=>(dms(b.Date_Heure)||0)-(dms(a.Date_Heure)||0));
  let cr=rs.filter(r=>/create|add|cré/i.test(r.Action||'')).length,
      up=rs.filter(r=>/update|modif/i.test(r.Action||'')).length,
      de=rs.filter(r=>/delete|suppr/i.test(r.Action||'')).length;
  auditStats.innerHTML=`<div class="kpi"><b>${rs.length}</b><small>Actions</small></div><div class="kpi"><b>${cr}</b><small>Créations</small></div><div class="kpi"><b>${up}</b><small>Modifications</small></div><div class="kpi"><b>${de}</b><small>Suppressions</small></div>`;
  if(!db.audit.length){
    auditTable.innerHTML='<p>JOURNAL_ACTIONS absente ou vide. Le widget est prêt à la restituer.</p>';
    return;
  }
  auditTable.innerHTML=`<table><thead><tr><th>Date</th><th>Utilisateur</th><th>Origine</th><th>Action</th><th>Table</th><th>Record</th><th>Libellé</th><th>Détails</th></tr></thead><tbody>${rs.map(r=>`<tr><td>${esc(dt(r.Date_Heure))}</td><td>${esc(r.Utilisateur)}</td><td>${esc(r.Origine)}</td><td>${esc(r.Action)}</td><td>${esc(r.Table)}</td><td>${esc(r.Record_ID)}</td><td>${esc(r.Libelle)}</td><td>${prettyDetails(r.Details)}</td></tr>`).join('')}</tbody></table>`;
}function diag(){
  diagnostic.textContent=Object.entries(T).map(([k,t])=>{
    const source=resolvedTables[k];
    const count=(db[k]||[]).length;
    if(source)return `${t.padEnd(28)} ${String(count).padStart(5)} ligne(s)   ✓ source: ${source}`;
    return `${t.padEnd(28)}     —          ✗ ${tableErrors[k]||"table introuvable"}`;
  }).join('\n')
}async function load(){db=Object.fromEntries(await Promise.all(Object.entries(T).map(async([k,t])=>[k,await ft(k,t)])));renderRefs();renderDocs();renderAudit();diag()}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));['refs','docs','audit','trace','diag','importexport','mcd'].forEach(k=>$(k+'View').classList.toggle('hidden',k!==b.dataset.tab));if(b.dataset.tab==='docs')renderDocs();if(b.dataset.tab==='trace')renderTrace();if(b.dataset.tab==='importexport')renderMapping()});refSelect.onchange=renderRefs;newRefBtn.onclick=()=>openEdit();auditSearch.oninput=e=>{search=e.target.value.toLowerCase();renderAudit()};refreshAuditBtn.onclick=refreshDiagBtn.onclick=load;closeDialog.onclick=cancelDialog.onclick=()=>editDialog.close();document.querySelectorAll("[data-mcd]").forEach(b=>b.onclick=()=>{
  document.querySelectorAll("[data-mcd]").forEach(x=>x.classList.toggle("active",x===b));
  $("mcdMetierPanel").classList.toggle("hidden",b.dataset.mcd!=="metier");
  $("mcdAuditPanel").classList.toggle("hidden",b.dataset.mcd!=="audit");
});
function previewMcd(fileInput,imageId,hintId,sharedName){
  fileInput.onchange=e=>{
    const f=e.target.files?.[0];if(!f)return;
    $(imageId).src=URL.createObjectURL(f);
    $(hintId).textContent=`Prévisualisation locale : ${f.name}. Pour la partager, remplace ${sharedName} dans le dépôt.`;
  };
}
previewMcd($("mcdMetierFile"),"mcdMetierImage","mcdMetierHint","mcd-metier.png");
previewMcd($("mcdAuditFile"),"mcdAuditImage","mcdAuditHint","mcd-audit.png");
init();grist.ready({requiredAccess:'full'});grist.onOptions(()=>load());load();
$("refreshTraceBtn").onclick=renderTrace;

const purgeOldAuditBtn=document.getElementById("purgeOldAuditBtn");
if(purgeOldAuditBtn)purgeOldAuditBtn.onclick=()=>purgeAuditOlderThan(document.getElementById("purgeAgeSelect").value);
const purgeAllAuditBtn=document.getElementById("purgeAllAuditBtn");
if(purgeAllAuditBtn)purgeAllAuditBtn.onclick=purgeAllAudit;

$("newDocBtn").onclick=()=>{refSelect.value="documentation";openEdit();};


// -----------------------------------------------------------------------------
// IMPORT / EXPORT — Mapping Produit
// -----------------------------------------------------------------------------
const MAPPING_STORAGE_KEY="grist-audit:mapping-produit:v1";
let mappingState=null;
let mappingSelectedSource=null;
let mappingPendingSource=null;
let mappingExtraTargets=[];
let mappingDragPoint=null;

function mappingClone(v){return JSON.parse(JSON.stringify(v))}
function mappingEsc(v){return esc(v??"")}
function mappingAllEntries(){
  if(!mappingState)return[];
  const out=[];
  Object.entries(mappingState.fields||{}).forEach(([key,cfg])=>out.push({section:"fields",key,cfg}));
  Object.entries(mappingState.source_fields_without_current_grist_target||{}).forEach(([key,cfg])=>out.push({section:"unmapped",key,cfg}));
  return out;
}
function mappingEntryByJson(jsonField){return mappingAllEntries().find(x=>x.cfg?.json_field===jsonField)||null}
function mappingTargetMeta(){
  const map=new Map();
  mappingAllEntries().forEach(({cfg})=>{
    if(cfg?.target_column)map.set(cfg.target_column,{type:cfg.target_type||"",reference:cfg.reference||null});
  });
  mappingExtraTargets.forEach(x=>{if(!map.has(x))map.set(x,{type:"",reference:null})});
  return map;
}
function mappingSourceRows(){
  return mappingAllEntries().sort((a,b)=>String(a.cfg.json_field||a.key).localeCompare(String(b.cfg.json_field||b.key),'fr'));
}
function mappingSave(){
  if(!mappingState)return;
  localStorage.setItem(MAPPING_STORAGE_KEY,JSON.stringify(mappingState));
  mappingSyncRaw();
}
async function loadDefaultMapping(){
  const saved=localStorage.getItem(MAPPING_STORAGE_KEY);
  if(saved){try{mappingState=JSON.parse(saved);return}catch(e){console.warn(e)}}
  const r=await fetch('mapping-produit.json?v=2.2.0',{cache:'no-store'});
  if(!r.ok)throw new Error('mapping-produit.json introuvable');
  mappingState=await r.json();
  mappingSave();
}
function mappingSyncRaw(){
  const el=$("mappingRawJson");
  if(el&&mappingState)el.value=JSON.stringify(mappingState,null,2);
}
function mappingStatsData(){
  const all=mappingAllEntries(), mapped=all.filter(x=>x.cfg.target_column), refs=all.filter(x=>String(x.cfg.target_type||'').startsWith('Ref:'));
  return {all:all.length,mapped:mapped.length,unmapped:all.length-mapped.length,refs:refs.length};
}
function renderMappingStats(){
  if(!mappingState)return;
  const s=mappingStatsData();
  $("mappingStats").innerHTML=`<div class="kpi"><b>${s.all}</b><small>Champs à identifier</small></div><div class="kpi"><b>${s.mapped}</b><small>Champs mappés</small></div><div class="kpi"><b>${s.unmapped}</b><small>Non mappés</small></div><div class="kpi"><b>${s.refs}</b><small>Références Ref</small></div>`;
}
function mappingBadge(cfg){
  if(!cfg.target_column)return '<span class="mapping-badge warning">Non mappé</span>';
  if(String(cfg.target_type||'').startsWith('Ref:'))return '<span class="mapping-badge ref">Ref</span>';
  return `<span class="mapping-badge">${mappingEsc(cfg.target_type||'champ')}</span>`;
}
function renderMapping(){
  if(!mappingState){loadDefaultMapping().then(renderMapping).catch(e=>msg('Erreur mapping : '+e.message));return}
  const sources=mappingSourceRows();
  $("mappingSources").innerHTML=sources.map(({cfg})=>`<div class="mapping-node source-node ${cfg.target_column?'mapped':'unmapped'} ${mappingSelectedSource===cfg.json_field?'selected':''}" data-source="${mappingEsc(cfg.json_field)}" tabindex="0"><div class="mapping-port source-port" data-port-source="${mappingEsc(cfg.json_field)}" title="Glisser vers une colonne Grist">●</div><div class="mapping-node-body"><strong>${mappingEsc(cfg.json_field)}</strong><small>${mappingEsc(cfg.identify||'Information à identifier dans le document')}</small><span class="mapping-target-chip ${cfg.target_column?'':'unmapped'}">${cfg.target_column?'→ '+mappingEsc(cfg.target_column):'Non mappé'}${cfg.target_column?`<button class="mapping-chip-remove" data-unlink="${mappingEsc(cfg.json_field)}" title="Supprimer cette liaison" aria-label="Supprimer la liaison">×</button>`:''}</span></div>${mappingBadge(cfg)}</div>`).join('');
  const targets=mappingTargetMeta();
  const linkedTargets=new Set(mappingAllEntries().filter(e=>e.cfg.target_column).map(e=>e.cfg.target_column));
  $("mappingTargets").innerHTML=[...targets.entries()].sort((a,b)=>a[0].localeCompare(b[0],'fr')).map(([name,meta])=>`<div class="mapping-node target-node ${linkedTargets.has(name)?'mapping-target-node-linked':''}" data-target="${mappingEsc(name)}"><div class="mapping-port target-port" data-port-target="${mappingEsc(name)}" title="Cible Grist">●</div><div class="mapping-node-body"><strong>${mappingEsc(name)}</strong><small>${mappingEsc(meta.type||'Colonne cible')}</small></div>${String(meta.type||'').startsWith('Ref:')?'<span class="mapping-badge ref">Ref</span>':''}</div>`).join('');
  bindMappingNodes();renderMappingStats();mappingSyncRaw();requestAnimationFrame(drawMappingLines);
  if(mappingSelectedSource)renderMappingRuleEditor(mappingSelectedSource);
}
function bindMappingNodes(){
  document.querySelectorAll('[data-source]').forEach(n=>{
    n.onclick=e=>{if(e.target.closest('.source-port')||e.target.closest('[data-unlink]'))return;selectMappingSource(n.dataset.source)};
    n.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectMappingSource(n.dataset.source)};if((e.key==='Delete'||e.key==='Backspace')&&mappingEntryByJson(n.dataset.source)?.cfg?.target_column){e.preventDefault();disconnectMapping(n.dataset.source)}};
  });
  document.querySelectorAll('[data-unlink]').forEach(b=>{
    b.onclick=e=>{e.preventDefault();e.stopPropagation();disconnectMapping(b.dataset.unlink)};
  });
  document.querySelectorAll('[data-port-source]').forEach(p=>{
    p.onpointerdown=e=>{e.preventDefault();e.stopPropagation();mappingPendingSource=p.dataset.portSource;mappingDragPoint={x:e.clientX,y:e.clientY};selectMappingSource(mappingPendingSource);document.body.classList.add('mapping-connecting');p.setPointerCapture?.(e.pointerId);requestAnimationFrame(drawMappingLines)};
    p.onclick=e=>{e.stopPropagation();mappingPendingSource=p.dataset.portSource;selectMappingSource(mappingPendingSource)};
  });
  document.querySelectorAll('[data-target]').forEach(n=>{
    n.onclick=()=>{if(mappingPendingSource)connectMapping(mappingPendingSource,n.dataset.target)};
  });
  document.querySelectorAll('[data-port-target]').forEach(p=>{
    p.onclick=e=>{e.stopPropagation();if(mappingPendingSource)connectMapping(mappingPendingSource,p.dataset.portTarget)};
  });
}
window.addEventListener('pointermove',e=>{if(!mappingPendingSource||!document.body.classList.contains('mapping-connecting'))return;mappingDragPoint={x:e.clientX,y:e.clientY};requestAnimationFrame(drawMappingLines)});
window.addEventListener('pointerup',e=>{
  if(mappingPendingSource&&document.body.classList.contains('mapping-connecting')){
    const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('[data-target]');
    if(hit){connectMapping(mappingPendingSource,hit.dataset.target);return}
  }
  mappingDragPoint=null;document.body.classList.remove('mapping-connecting');requestAnimationFrame(drawMappingLines);
});
window.addEventListener('resize',()=>requestAnimationFrame(drawMappingLines));
function selectMappingSource(jsonField){
  mappingSelectedSource=jsonField;mappingPendingSource=jsonField;
  document.querySelectorAll('[data-source]').forEach(x=>x.classList.toggle('selected',x.dataset.source===jsonField));
  renderMappingRuleEditor(jsonField);
}
function ensureMappedEntry(jsonField,target){
  let e=mappingEntryByJson(jsonField);if(!e)return null;
  if(e.section==='unmapped'){
    const old=e.cfg;
    delete mappingState.source_fields_without_current_grist_target[e.key];
    const key=e.key==='statut_source'?'statut':e.key;
    mappingState.fields=mappingState.fields||{};
    mappingState.fields[key]={...old};
    delete mappingState.fields[key].status;delete mappingState.fields[key].action;
    e={section:'fields',key,cfg:mappingState.fields[key]};
  }
  e.cfg.target_column=target;
  const targetInfo=mappingTargetMeta().get(target);
  // Un remapping doit reprendre les métadonnées de la nouvelle colonne cible,
  // sinon une ancienne Ref/Date pourrait rester attachée à la nouvelle liaison.
  if(targetInfo?.type)e.cfg.target_type=targetInfo.type;
  if(targetInfo?.reference)e.cfg.reference=mappingClone(targetInfo.reference);
  else if(targetInfo?.type&&!String(targetInfo.type).startsWith('Ref:'))delete e.cfg.reference;
  return e;
}
function connectMapping(jsonField,target){
  const e=ensureMappedEntry(jsonField,target);if(!e)return;
  mappingPendingSource=null;document.body.classList.remove('mapping-connecting');mappingSave();renderMapping();msg(`${jsonField} → ${target}`);
}
function disconnectMapping(jsonField){
  const e=mappingEntryByJson(jsonField);if(!e||!e.cfg.target_column)return;
  const cfg=mappingClone(e.cfg);delete cfg.target_column;delete cfg.target_type;delete cfg.reference;
  delete mappingState.fields[e.key];
  mappingState.source_fields_without_current_grist_target=mappingState.source_fields_without_current_grist_target||{};
  mappingState.source_fields_without_current_grist_target[e.key]={...cfg,status:'identified_but_unmapped',action:'preserve_in_extraction_json'};
  mappingSave();renderMapping();msg(`${jsonField} n'est plus mappé.`);
}
function drawMappingLines(){
  const svg=$("mappingLines"), board=$("mappingBoard");if(!svg||!board||!mappingState)return;
  const r=board.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);svg.innerHTML='';
  mappingAllEntries().filter(e=>e.cfg.target_column).forEach(({cfg})=>{
    const a=document.querySelector(`[data-port-source="${CSS.escape(cfg.json_field)}"]`),b=document.querySelector(`[data-port-target="${CSS.escape(cfg.target_column)}"]`);if(!a||!b)return;
    const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();
    const x1=ar.left+ar.width/2-r.left,y1=ar.top+ar.height/2-r.top,x2=br.left+br.width/2-r.left,y2=br.top+br.height/2-r.top,dx=Math.max(60,(x2-x1)*.42);
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',`M ${x1} ${y1} C ${x1+dx} ${y1}, ${x2-dx} ${y2}, ${x2} ${y2}`);p.setAttribute('class','mapping-link'+(mappingSelectedSource===cfg.json_field?' selected':''));p.dataset.source=cfg.json_field;p.style.pointerEvents='stroke';p.onclick=()=>selectMappingSource(cfg.json_field);p.ondblclick=e=>{e.preventDefault();e.stopPropagation();disconnectMapping(cfg.json_field)};p.oncontextmenu=e=>{e.preventDefault();e.stopPropagation();if(confirm(`Supprimer la liaison ${cfg.json_field} → ${cfg.target_column} ?`))disconnectMapping(cfg.json_field)};svg.appendChild(p);
  });
  if(mappingPendingSource&&mappingDragPoint&&document.body.classList.contains('mapping-connecting')){
    const a=document.querySelector(`[data-port-source="${CSS.escape(mappingPendingSource)}"]`);if(a){const ar=a.getBoundingClientRect();const x1=ar.left+ar.width/2-r.left,y1=ar.top+ar.height/2-r.top,x2=mappingDragPoint.x-r.left,y2=mappingDragPoint.y-r.top,dx=Math.max(50,Math.abs(x2-x1)*.35);const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',`M ${x1} ${y1} C ${x1+dx} ${y1}, ${x2-dx} ${y2}, ${x2} ${y2}`);p.setAttribute('class','mapping-link mapping-link-preview');svg.appendChild(p)}}
}
function ruleField(label,html,help=''){return `<label class="mapping-rule-field"><span>${label}</span>${html}${help?`<small>${mappingEsc(help)}</small>`:''}</label>`}
function mappingTargetOptions(current){
  const targets=[...mappingTargetMeta().keys()].sort((a,b)=>a.localeCompare(b,'fr'));
  if(current&&!targets.includes(current))targets.unshift(current);
  return `<select data-map-edit="target_column"><option value="">— Non mappé —</option>${targets.map(t=>`<option value="${mappingEsc(t)}" ${t===current?'selected':''}>${mappingEsc(t)}</option>`).join('')}</select>`;
}
function renderMappingRuleEditor(jsonField){
  const e=mappingEntryByJson(jsonField);if(!e)return;
  const c=e.cfg;$("mappingRuleSubtitle").textContent=`${c.json_field}${c.target_column?' → '+c.target_column:' · non mappé'}`;
  $("mappingDisconnectBtn").classList.toggle('hidden',!c.target_column);$("mappingDisconnectBtn").onclick=()=>disconnectMapping(jsonField);
  const ref=c.reference||{};
  $("mappingRuleEditor").innerHTML=`
    ${ruleField('Champ JSON',`<input data-map-edit="json_field" value="${mappingEsc(c.json_field)}">`,'Nom stable attendu dans le JSON extrait.')}
    ${ruleField('Colonne Grist',mappingTargetOptions(c.target_column||''),'Choisissez une autre colonne pour remapper. Sélectionnez « Non mappé » pour supprimer la liaison.')}
    ${ruleField('Type cible',`<input data-map-edit="target_type" value="${mappingEsc(c.target_type||'')}" placeholder="Text, Date, Ref:…">`)}
    ${ruleField('À identifier dans le document',`<textarea data-map-edit="identify" rows="5">${mappingEsc(c.identify||'')}</textarea>`,'Instruction donnée à l’IA. Une information non trouvée doit rester null.')}
    <div class="mapping-rule-grid">
      ${ruleField('Obligatoire',`<select data-map-edit="required"><option value="false" ${!c.required?'selected':''}>Non</option><option value="true" ${c.required?'selected':''}>Oui</option></select>`)}
      ${ruleField('Si absent',`<input data-map-edit="when_missing" value="${mappingEsc(c.when_missing||c.when_missing_on_update||'')}">`)}
    </div>
    ${ruleField('Exemples',`<input data-map-edit="examples" value="${mappingEsc((c.examples_from_current_pdf||[]).join(' | '))}">`,'Séparer les exemples par |.')}
    <div class="mapping-ref-box ${String(c.target_type||'').startsWith('Ref:')?'':'hidden'}" id="mappingRefBox">
      <strong>Résolution de référence</strong>
      ${ruleField('Table référente',`<input data-map-ref="table" value="${mappingEsc(ref.table||String(c.target_type||'').replace('Ref:',''))}">`)}
      ${ruleField('Colonne de recherche',`<input data-map-ref="lookup_column" value="${mappingEsc(ref.lookup_column||'Nom')}">`)}
      ${ruleField('Créer si absent',`<select data-map-ref="create_if_missing"><option value="true" ${ref.create_if_missing!==false?'selected':''}>Oui</option><option value="false" ${ref.create_if_missing===false?'selected':''}>Non</option></select>`)}
    </div>
    ${c.transform?`<details class="mapping-advanced"><summary>Transformation</summary><textarea id="mappingTransformEditor" rows="8">${mappingEsc(typeof c.transform==='string'?JSON.stringify(c.transform):JSON.stringify(c.transform,null,2))}</textarea><button id="mappingApplyTransformBtn">Appliquer la transformation</button></details>`:''}
  `;
  document.querySelectorAll('[data-map-edit]').forEach(el=>el.onchange=()=>updateMappingRule(jsonField,el));
  document.querySelectorAll('[data-map-ref]').forEach(el=>el.onchange=()=>updateMappingRef(jsonField,el));
  const tf=$("mappingApplyTransformBtn");if(tf)tf.onclick=()=>{try{const e=mappingEntryByJson(jsonField);let v=JSON.parse($("mappingTransformEditor").value);e.cfg.transform=v;mappingSave();msg('Transformation mise à jour.')}catch(err){msg('JSON transformation invalide : '+err.message)}};
}
function updateMappingRule(jsonField,el){
  let e=mappingEntryByJson(jsonField);if(!e)return;
  const k=el.dataset.mapEdit;
  if(k==='required')e.cfg.required=el.value==='true';
  else if(k==='examples')e.cfg.examples_from_current_pdf=el.value.split('|').map(x=>x.trim()).filter(Boolean);
  else if(k==='target_column'){
    const target=el.value.trim();if(target){ensureMappedEntry(jsonField,target);if(!mappingTargetMeta().has(target))mappingExtraTargets.push(target)}else{disconnectMapping(jsonField);return}
  } else if(k==='json_field'){
    const nv=el.value.trim();if(!nv){msg('Le champ JSON ne peut pas être vide.');return}e.cfg.json_field=nv;mappingSelectedSource=nv;mappingPendingSource=nv;
  } else e.cfg[k]=el.value;
  mappingSave();renderMapping();
}
function updateMappingRef(jsonField,el){
  const e=mappingEntryByJson(jsonField);if(!e)return;e.cfg.reference=e.cfg.reference||{};
  const k=el.dataset.mapRef;e.cfg.reference[k]=k==='create_if_missing'?(el.value==='true'):el.value;
  mappingSave();
}
function validateMapping(show=true){
  const errors=[],warnings=[];if(!mappingState)return {errors:['Mapping non chargé'],warnings};
  const seen=new Set();mappingAllEntries().forEach(({cfg})=>{
    if(!cfg.json_field)errors.push('Un champ JSON est vide.');
    if(seen.has(cfg.json_field))errors.push(`Champ JSON dupliqué : ${cfg.json_field}`);seen.add(cfg.json_field);
    if(cfg.required&&!cfg.identify)warnings.push(`${cfg.json_field} est obligatoire sans règle identify.`);
    if(String(cfg.target_type||'').startsWith('Ref:')){if(!cfg.reference?.table)errors.push(`${cfg.json_field} : table de référence absente.`);if(!cfg.reference?.lookup_column)errors.push(`${cfg.json_field} : colonne de recherche absente.`)}
  });
  if(!mappingState.target?.table)errors.push('Table cible absente.');
  const box=$("mappingValidation");if(show&&box){box.classList.remove('hidden','ok','bad');box.classList.add(errors.length?'bad':'ok');box.innerHTML=`<strong>${errors.length?'Mapping invalide':'Mapping valide'}</strong><div>${errors.length?errors.map(x=>'• '+mappingEsc(x)).join('<br>'):'Aucune erreur bloquante.'}</div>${warnings.length?`<div class="mapping-warnings">${warnings.map(x=>'⚠ '+mappingEsc(x)).join('<br>')}</div>`:''}`}
  return {errors,warnings};
}
function exportMapping(){
  const v=validateMapping(true);if(v.errors.length){msg('Corrigez les erreurs avant export.');return}
  const blob=new Blob([JSON.stringify(mappingState,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mapping-produit.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);msg('mapping-produit.json exporté.');
}
async function importMappingFile(file){
  try{const parsed=JSON.parse(await file.text());if(!parsed.fields||!parsed.target)throw new Error('Structure de mapping non reconnue');mappingState=parsed;mappingSelectedSource=null;mappingPendingSource=null;mappingExtraTargets=[];mappingSave();renderMapping();validateMapping(true);msg('Mapping importé.')}catch(e){msg('Import impossible : '+e.message)}
}
async function resetMapping(){
  if(!confirm('Réinitialiser le mapping Produit à la version fournie avec l’application ?'))return;
  localStorage.removeItem(MAPPING_STORAGE_KEY);mappingState=null;mappingSelectedSource=null;mappingPendingSource=null;mappingExtraTargets=[];await loadDefaultMapping();renderMapping();msg('Mapping réinitialisé.');
}
function initMappingUi(){
  if(!$("mappingImportBtn"))return;
  $("mappingImportBtn").onclick=()=>$("mappingFileInput").click();
  $("mappingFileInput").onchange=e=>{const f=e.target.files?.[0];if(f)importMappingFile(f);e.target.value=''};
  $("mappingExportBtn").onclick=exportMapping;$("mappingValidateBtn").onclick=()=>validateMapping(true);$("mappingResetBtn").onclick=resetMapping;
  $("mappingAddTargetBtn").onclick=()=>{const v=$("mappingNewTarget").value.trim();if(!v)return;if(!mappingExtraTargets.includes(v))mappingExtraTargets.push(v);$("mappingNewTarget").value='';renderMapping()};
  $("mappingApplyRawBtn").onclick=()=>{try{mappingState=JSON.parse($("mappingRawJson").value);mappingSave();mappingSelectedSource=null;renderMapping();validateMapping(true);msg('JSON brut appliqué.')}catch(e){msg('JSON invalide : '+e.message)}};
}
initMappingUi();
loadDefaultMapping().then(()=>{if(!$("importexportView").classList.contains('hidden'))renderMapping()}).catch(e=>console.warn('Mapping Produit',e));
