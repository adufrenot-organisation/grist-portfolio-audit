const VERSION="2.5.4";
const T={domains:"Domaine",teamRef:"TEAM_REF",axes:"Axes_Strategiques",objectives:"Objectifs",offers:"Offres_Services",activityOffers:"Activites_OFS",activities:"Activites",team:"Team",projectStages:"Etapes_Projet",featureStages:"Stades_Fonctionnalite",features:"Fonctionnalites",projects:"Projects",tasks:"Tasks",allocations:"Allocations",contrib:"CONTRIBUTIONS_OBJECTIFS",audit:"JOURNAL_ACTIONS",documentation:"Documentation",frontOfficeConfig:"Parametres_FrontOffice",suggestions:"Suggestions",sessions:"SESSIONS_UTILISATEURS"};let db={},search="",resolvedTables={},tableErrors={};const $=x=>document.getElementById(x);function rows(d){if(!d||!Array.isArray(d.id))return[];let k=Object.keys(d);return d.id.map((_,i)=>Object.fromEntries(k.map(x=>[x,Array.isArray(d[x])?d[x][i]:d[x]])))}async function ft(k,t){
  const candidates={
    domains:["Domaine","Domaines","DOMAINE","DOMAINES"],
    teamRef:["TEAM_REF","Team_ref","TEAMREF"],
    frontOfficeConfig:["Parametres_FrontOffice","PARAMETRES_FRONTOFFICE","ParametresFrontOffice"]
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
function init(){refSelect.innerHTML=Object.entries(A).map(([k,c])=>`<option value="${k}">${c.l}</option>`).join('')}function renderRefs(){let k=refSelect.value||Object.keys(A)[0],c=A[k],rs=db[c.k]||[];refTable.innerHTML=rs.length?`<table><thead><tr>${c.f.slice(0,6).map(x=>`<th>${x[1]}</th>`).join('')}<th>Usages</th><th></th></tr></thead><tbody>${rs.map(r=>`<tr>${c.f.slice(0,6).map(f=>`<td>${esc(display(r,f))}</td>`).join('')}<td>${deps(k,r.id)}</td><td class="row-actions"><button data-e="${r.id}">Modifier</button><button class="danger" data-d="${r.id}">Supprimer</button></td></tr>`).join('')}</tbody></table>`:'Aucun enregistrement.';document.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>openEdit(+b.dataset.e));document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>del(+b.dataset.d))}function field(n,l,t,v,choices){if(t.startsWith('ref:')){let rs=db[t.split(':')[1]]||[];return`<label>${l}<select name="${n}"><option value="">—</option>${rs.map(r=>`<option value="${r.id}" ${id(v)==r.id?'selected':''}>${esc(r.Nom||r.nom||r.Activites_Nom||r.Code||'#'+r.id)}</option>`).join('')}</select></label>`}if(t==='choice')return`<label>${l}<select name="${n}">${(choices||[]).map(x=>`<option value="${esc(x)}" ${String(v||'')===String(x)?'selected':''}>${esc(x)}</option>`).join('')}</select></label>`;if(t==='readonly')return`<label>${l}<input name="${n}" value="${esc(v??'')}" disabled></label>`;if(t==='date')return`<label>${l}<input type="date" name="${n}" value="${din(v)}"></label>`;if(t==='number')return`<label>${l}<input type="number" step=".01" name="${n}" value="${v??''}"></label>`;if(t==='percent')return`<label>${l}<input type="number" min="0" max="100" name="${n}" value="${pct(v)}"></label>`;if(t==='bool')return`<label>${l}<select name="${n}"><option value="true" ${v!==false?'selected':''}>Oui</option><option value="false" ${v===false?'selected':''}>Non</option></select></label>`;return`<label>${l}<input name="${n}" value="${esc(v??'')}"></label>`}function openEdit(rid){let k=refSelect.value,c=A[k],r=rid?get(c.k,rid):null;editForm.id.value=rid||'';editTitle.textContent=(rid?'Modifier ':'Créer ')+c.l;editFields.innerHTML=c.f.map(f=>field(f[0],f[1],f[2],r?.[f[0]],f[3])).join('');depHint.textContent=rid?deps(k,rid)+' dépendance(s).':'Nouvel enregistrement.';editDialog.showModal()}editForm.onsubmit=async e=>{e.preventDefault();let k=refSelect.value,c=A[k],f=e.currentTarget,rid=+f.id.value||null,o={};for(let[n,,t]of c.f){let el=f.elements[n];if(t==='readonly'||!el)continue;o[n]=t.startsWith('ref:')?(el.value?+el.value:null):t==='date'?gd(el.value):t==='number'?(el.value===''?null:+el.value):t==='percent'?(+el.value/100):t==='bool'?(el.value==='true'):el.value}editDialog.close();await apply([[rid?'UpdateRecord':'AddRecord',tableName(c.k,c.t),rid||null,o]],rid?'Mis à jour.':'Créé.')};async function del(r){let k=refSelect.value,c=A[k],n=deps(k,r);if(n)return msg('Suppression bloquée : '+n+' dépendance(s).');if(confirm('Supprimer définitivement ?'))await apply([['RemoveRecord',tableName(c.k,c.t),r]],'Supprimé.')}
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
  if(!ids.length){msg(`Aucun log de plus de ${days} jours.`);return}
  if(!confirm(`Supprimer définitivement ${ids.length} log(s) de plus de ${days} jours ?`))return;
  await apply(ids.map(id=>["RemoveRecord","JOURNAL_ACTIONS",id]),`${ids.length} log(s) purgé(s).`);
}
async function purgeAllAudit(){
  const ids=(db.audit||[]).map(r=>r.id);
  if(!ids.length){msg("Le journal est déjà vide.");return}
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

}
const FRONT_DEFAULTS={
  SUGGESTIONS:{Code:"SUGGESTIONS",Libelle:"Suggestions",Actif:true,Emplacement:"HEADER",Ordre:1},
  DISCUSSIONS:{Code:"DISCUSSIONS",Libelle:"Discussions",Actif:true,Emplacement:"HEADER",Ordre:2},
  PRESENCE:{Code:"PRESENCE",Libelle:"Présence",Actif:true,Emplacement:"HEADER",Ordre:3}
};
function frontConfig(){
  const out={};Object.values(FRONT_DEFAULTS).forEach(x=>out[x.Code]={...x});
  (db.frontOfficeConfig||[]).forEach(r=>{const code=String(r.Code||"").trim().toUpperCase();if(out[code])out[code]={...out[code],...r,Code:code}});
  return out;
}
function renderFrontOffice(){
  const host=$("frontOfficeRows"),missing=$("frontOfficeMissing");if(!host)return;
  if(tableErrors.frontOfficeConfig){
    missing.classList.remove("hidden");missing.innerHTML=`<strong>Table Parametres_FrontOffice inaccessible.</strong><br>${esc(tableErrors.frontOfficeConfig)}<br><small>Importez la table de configuration avant d’enregistrer ces paramètres.</small>`;
  }else missing.classList.add("hidden");
  const cfg=frontConfig(),labels={
    SUGGESTIONS:["💡 Suggestions","Formulaire de suggestions utilisateurs"],
    DISCUSSIONS:["💬 Discussions","Chat et messages contextuels"],
    PRESENCE:["👥 Présence","Indicateur des utilisateurs actifs"]
  };
  host.innerHTML=["SUGGESTIONS","DISCUSSIONS","PRESENCE"].map(code=>{const r=cfg[code],l=labels[code],places=code==="PRESENCE"?[["HEADER","Barre principale"],["HIDDEN","Masqué"]]:[["HEADER","Barre principale"],["PLUS","Menu Plus"],["HIDDEN","Masqué"]];return `<div class="fo-row"><div><strong>${l[0]}</strong><small>${l[1]}</small></div><label class="toggle"><input type="checkbox" name="${code}_Actif" ${r.Actif!==false?"checked":""}><span></span><em>${r.Actif!==false?"Actif":"Masqué"}</em></label><select name="${code}_Emplacement">${places.map(([v,n])=>`<option value="${v}" ${String(r.Emplacement||"HEADER").toUpperCase()===v?"selected":""}>${n}</option>`).join("")}</select><input type="number" name="${code}_Ordre" min="1" max="99" value="${Number(r.Ordre||1)}"></div>`}).join("");
  host.querySelectorAll('input[type="checkbox"]').forEach(cb=>cb.onchange=()=>{const em=cb.closest('.toggle').querySelector('em');em.textContent=cb.checked?'Actif':'Masqué'});
}
async function saveFrontOffice(e){
  e.preventDefault();if(tableErrors.frontOfficeConfig)return msg("Table Parametres_FrontOffice inaccessible.");
  const f=e.currentTarget,actions=[];
  ["SUGGESTIONS","DISCUSSIONS","PRESENCE"].forEach(code=>{const existing=(db.frontOfficeConfig||[]).find(r=>String(r.Code||"").trim().toUpperCase()===code);const fields={Code:code,Libelle:FRONT_DEFAULTS[code].Libelle,Actif:f.elements[`${code}_Actif`].checked,Emplacement:f.elements[`${code}_Emplacement`].value,Ordre:Number(f.elements[`${code}_Ordre`].value||1)};actions.push(existing?["UpdateRecord",tableName("frontOfficeConfig","Parametres_FrontOffice"),existing.id,fields]:["AddRecord",tableName("frontOfficeConfig","Parametres_FrontOffice"),null,fields])});
  await apply(actions,"Paramètres Front Office enregistrés.");
}


function adminPresenceContext(){
  const labels={home:"Accueil",refs:"Référentiels",frontoffice:"Front Office",suggestions:"Suggestions",presence:"Présence",docs:"Documentation",audit:"Audit / Logs",trace:"Traçabilité Grist",diag:"Diagnostic",mcd:"MCD"};
  return {module:"Admin",context:labels[currentAdminTab||"home"]||"Admin",contextId:""};
}
let currentAdminTab="home";
function presenceAgo(v){
  const ms=dms(v);if(!ms)return "—";const sec=Math.max(0,Math.round((Date.now()-ms)/1000));
  if(sec<60)return `${sec}s`;if(sec<3600)return `${Math.floor(sec/60)} min`;return `${Math.floor(sec/3600)} h`;
}
async function renderPresenceAdmin(){
  const host=$("presenceAdminTable");if(!host||!window.PmoPresence)return;
  try{
    const users=await window.PmoPresence.listActive({minutes:10,allModules:true});
    const modules=[...new Set(users.map(u=>String(u.Module||u.Widget_Code||"Module")))].sort();
    const filter=$("presenceModuleFilter");
    const previous=filter.value;
    filter.innerHTML='<option value="">Tous les modules</option>'+modules.map(m=>`<option>${esc(m)}</option>`).join("");
    if(modules.includes(previous))filter.value=previous;
    const shown=users.filter(u=>!filter.value||String(u.Module||u.Widget_Code||"")===filter.value);
    $("presenceNavBadge").textContent=users.length;
    const uniqueUsers=new Set(users.map(u=>String(u.Utilisateur_Email||u.Utilisateur_Nom||u.Session_ID||u.id).toLowerCase())).size;
    $("presenceAdminKpis").innerHTML=`<div class="kpi"><span>Utilisateurs actifs</span><strong>${uniqueUsers}</strong></div><div class="kpi"><span>Présences module</span><strong>${users.length}</strong></div><div class="kpi"><span>Modules actifs</span><strong>${modules.length}</strong></div>`;
    host.innerHTML=shown.length?`<table><thead><tr><th>Utilisateur</th><th>Module</th><th>Contexte</th><th>Version</th><th>Dernière activité</th><th>Sessions</th></tr></thead><tbody>${shown.map(u=>`<tr><td><strong>${esc(u.Utilisateur_Nom||u.Utilisateur_Email||"Utilisateur")}</strong><small class="presence-email">${esc(u.Utilisateur_Email||"")}</small></td><td><span class="presence-module">${esc(u.Module||u.Widget_Code||"Module")}</span></td><td>${esc(u.Contexte||u.Page||"—")}${u.Contexte_ID?` <small>#${esc(u.Contexte_ID)}</small>`:""}</td><td>${esc(u.Widget_Version||"—")}</td><td>${presenceAgo(u.Derniere_Activite)}</td><td>${u.sessions||1}</td></tr>`).join("")}</tbody></table>`:'<p class="muted">Aucune présence active pour ce filtre.</p>';
  }catch(e){host.innerHTML=`<p class="muted">Présence inaccessible : ${esc(e?.message||e)}</p>`}
}

function suggestionAdminStatusClass(v){
  const x=String(v||"Nouvelle").toLowerCase();
  if(/réalis|real/.test(x))return "done";if(/refus/.test(x))return "refused";if(/accept|planifi/.test(x))return "accepted";if(/étude|etude/.test(x))return "study";return "new";
}
function suggestionAdminDate(v){return v?dt(v):""}
function renderSuggestions(){
  const host=$("suggestionsAdminTable");if(!host)return;
  const rows=[...(db.suggestions||[])];
  const q=String($("suggestionAdminSearch")?.value||"").trim().toLowerCase();
  const status=$("suggestionStatusFilter")?.value||"";
  const filtered=rows.filter(x=>(!status||String(x.Statut||"Nouvelle")===status)&&(!q||[x.Titre,x.Description,x.Auteur_Email,x.Module,x.Contexte,x.Type].some(v=>String(v||"").toLowerCase().includes(q)))).sort((a,b)=>(dms(b.Date_MAJ||b.Date_Creation)||0)-(dms(a.Date_MAJ||a.Date_Creation)||0));
  const counts={};rows.forEach(x=>{const k=String(x.Statut||"Nouvelle");counts[k]=(counts[k]||0)+1});
  const pending=(counts["Nouvelle"]||0)+(counts["À l’étude"]||0);
  $("suggestionsNavBadge").textContent=pending;
  $("suggestionAdminKpis").innerHTML=`<div class="kpi"><span>Total</span><strong>${rows.length}</strong></div><div class="kpi"><span>Nouvelles</span><strong>${counts["Nouvelle"]||0}</strong></div><div class="kpi"><span>À l’étude</span><strong>${counts["À l’étude"]||0}</strong></div><div class="kpi"><span>Planifiées</span><strong>${counts["Planifiée"]||0}</strong></div><div class="kpi"><span>Réalisées</span><strong>${counts["Réalisée"]||0}</strong></div>`;
  if(tableErrors.suggestions){host.innerHTML=`<p class="muted">Table Suggestions inaccessible : ${esc(tableErrors.suggestions)}</p>`;return}
  host.innerHTML=filtered.length?`<table><thead><tr><th>Date</th><th>Auteur</th><th>Type</th><th>Suggestion</th><th>Contexte</th><th>Statut</th><th>Priorité</th><th>Cible</th><th></th></tr></thead><tbody>${filtered.map(x=>`<tr><td>${esc(suggestionAdminDate(x.Date_Creation))}</td><td>${esc(x.Auteur_Email||"—")}</td><td>${esc(x.Type||"—")}</td><td><strong>${esc(x.Titre||"")}</strong></td><td>${esc(x.Contexte||x.Module||"")}</td><td><span class="admin-suggestion-status ${suggestionAdminStatusClass(x.Statut)}">${esc(x.Statut||"Nouvelle")}</span></td><td>${esc(x.Priorite||"—")}</td><td>${esc(x.Version_Cible||"—")}</td><td><button class="small" data-edit-suggestion="${x.id}">Traiter</button></td></tr>`).join("")}</tbody></table>`:'<p class="muted">Aucune suggestion pour ce filtre.</p>';
  host.querySelectorAll("[data-edit-suggestion]").forEach(b=>b.onclick=()=>openSuggestionAdmin(Number(b.dataset.editSuggestion)));
  const sample=rows[0]||{};
  const needed=["Reponse_PMO","Priorite","Version_Cible","Date_MAJ","Traite_Par"];
  const missing=rows.length?needed.filter(k=>!Object.prototype.hasOwnProperty.call(sample,k)):[];
  const warn=$("suggestionsWorkflowWarning");
  if(missing.length){warn.classList.remove("hidden");warn.innerHTML=`Le workflow enrichi nécessite les colonnes : <strong>${missing.join(", ")}</strong>. Ajoutez-les à la table Suggestions pour enregistrer la réponse PMO, la priorité et la cible.`}else warn.classList.add("hidden");
}
function openSuggestionAdmin(rowId){
  const x=(db.suggestions||[]).find(r=>Number(r.id)===Number(rowId));if(!x)return;
  const f=$("suggestionAdminForm");f.id.value=x.id;f.Statut.value=x.Statut||"Nouvelle";f.Priorite.value=x.Priorite||"";f.Version_Cible.value=x.Version_Cible||"";f.Reponse_PMO.value=x.Reponse_PMO||"";f.Traite_Par.value=x.Traite_Par||"";
  $("suggestionAdminTitle").textContent=x.Titre||"Suggestion";$("suggestionAdminMeta").textContent=`${x.Auteur_Email||"—"} • ${suggestionAdminDate(x.Date_Creation)} • ${x.Type||"—"}`;$("suggestionAdminDescription").textContent=x.Description||"";$("suggestionAdminContext").textContent=x.Contexte||x.Module||"";
  $("suggestionAdminDialog").showModal();
}
async function saveSuggestionAdmin(e){
  e.preventDefault();const f=e.currentTarget,rowId=Number(f.id.value);
  const fields={Statut:f.Statut.value,Priorite:f.Priorite.value,Version_Cible:f.Version_Cible.value,Reponse_PMO:f.Reponse_PMO.value,Traite_Par:f.Traite_Par.value,Date_MAJ:Math.floor(Date.now()/1000)};
  try{await grist.docApi.applyUserActions([["UpdateRecord",tableName("suggestions","Suggestions"),rowId,fields]]);$("suggestionAdminDialog").close();await load();msg("Suivi de la suggestion enregistré.")}catch(e){console.error(e);msg("Impossible d’enregistrer : vérifiez les colonnes du workflow Suggestions.")}
}

function healthLine(label,ok,detail){return `<div class="health-line"><span class="health-dot ${ok?'ok':'bad'}">${ok?'✓':'!'}</span><span><strong>${esc(label)}</strong><small>${esc(detail||'')}</small></span><em class="${ok?'ok':'bad'}">${ok?'OK':'À vérifier'}</em></div>`}
function renderHome(){
  if(!$("homeKpis"))return;
  const refKeys=Object.keys(A).filter(k=>k!=="documentation"),refRows=refKeys.reduce((n,k)=>n+(db[A[k].k]||[]).length,0),tableTotal=Object.keys(T).length,tableOk=Object.values(resolvedTables).filter(Boolean).length,docs=(db.documentation||[]).filter(r=>r.Actif!==false).length,audit=(db.audit||[]).length;
  $("homeKpis").innerHTML=`<article class="home-kpi"><span class="kpi-icon blue">▤</span><div><small>Référentiels</small><strong>${refRows}</strong><em>${refKeys.length} familles administrées</em></div></article><article class="home-kpi"><span class="kpi-icon green">▦</span><div><small>Tables Grist</small><strong>${tableOk}/${tableTotal}</strong><em>${tableTotal-tableOk?`${tableTotal-tableOk} à vérifier`:'Toutes accessibles'}</em></div></article><article class="home-kpi"><span class="kpi-icon purple">▧</span><div><small>Documentation publiée</small><strong>${docs}</strong><em>${(db.documentation||[]).length} document(s) configuré(s)</em></div></article><article class="home-kpi"><span class="kpi-icon orange">◫</span><div><small>Logs d’audit</small><strong>${audit}</strong><em>JOURNAL_ACTIONS</em></div></article>`;
  const allOk=tableOk===tableTotal;$("topHealthBadge").className=`health-badge ${allOk?'ok':'warn'}`;$("topHealthBadge").textContent=allOk?'● Système opérationnel':`● ${tableTotal-tableOk} table(s) à vérifier`;$("homeTableHealth").textContent=allOk?'● Sources opérationnelles':`● ${tableTotal-tableOk} source(s) à vérifier`;
  $("homeHealth").innerHTML=healthLine('Connexion Grist',true,'API du document accessible')+healthLine('Référentiels',refKeys.every(k=>!!resolvedTables[A[k].k]),`${refKeys.length} familles attendues`)+healthLine('Journal d’audit',!!resolvedTables.audit,`${audit} ligne(s)`)+healthLine('Documentation',!!resolvedTables.documentation,`${docs} publiée(s)`)+healthLine('Paramètres Front Office',!!resolvedTables.frontOfficeConfig,resolvedTables.frontOfficeConfig?'Configuration détectée':'Table absente');
  const cfg=frontConfig();$("homeFrontOffice").innerHTML=["SUGGESTIONS","DISCUSSIONS","PRESENCE"].map(code=>{const r=cfg[code];return `<div class="config-line"><span>${esc(r.Libelle)}</span><strong class="${r.Actif!==false?'ok':'muted'}">${r.Actif!==false?`${esc(r.Emplacement||'HEADER')}`:'Masqué'}</strong></div>`}).join('');
  const recent=[...(db.audit||[])].sort((a,b)=>(dms(b.Date_Heure)||0)-(dms(a.Date_Heure)||0)).slice(0,5);$("homeRecentAudit").innerHTML=recent.length?`<div class="recent-table">${recent.map(r=>`<div class="recent-row"><span>${esc(dt(r.Date_Heure))}</span><strong>${esc(r.Utilisateur||'—')}</strong><span>${esc(r.Action||'—')}</span><span>${esc(r.Table||'—')}</span><em>${esc(r.Libelle||'')}</em></div>`).join('')}</div>`:'<p class="muted">Aucune activité enregistrée.</p>';
}
function setTab(tab){currentAdminTab=tab;window.PmoPresence?.touch?.();
  document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));
  ['home','refs','frontoffice','suggestions','presence','docs','audit','trace','diag','mcd'].forEach(k=>$(k+'View')?.classList.toggle('hidden',k!==tab));
  const titles={home:['Accueil','Administration et gouvernance de la plateforme PMO'],refs:['Référentiels','Administration des données de référence'],frontoffice:['Front Office','Configuration de l’expérience Cockpit'],suggestions:['Suggestions','Qualification et suivi des demandes utilisateurs'],presence:['Présence','Utilisateurs actifs sur les modules PMO'],docs:['Documentation','Contenus publiés dans le Cockpit'],audit:['Audit / Logs','Journal des actions applicatives'],trace:['Traçabilité Grist','Création et modification des données métier'],diag:['Diagnostic','Santé des tables et des sources'],mcd:['MCD','Documentation graphique des modèles']};
  if(titles[tab]){$('topbarTitle').textContent=titles[tab][0];$('topbarSubtitle').textContent=titles[tab][1]}
  if(tab==='home')renderHome();if(tab==='refs')renderRefs();if(tab==='frontoffice')renderFrontOffice();if(tab==='suggestions')renderSuggestions();if(tab==='presence')renderPresenceAdmin();if(tab==='docs')renderDocs();if(tab==='audit')renderAudit();if(tab==='trace')renderTrace();if(tab==='diag')diag();
}
function diag(){
  diagnostic.textContent=Object.entries(T).map(([k,t])=>{
    const source=resolvedTables[k];
    const count=(db[k]||[]).length;
    if(source)return `${t.padEnd(28)} ${String(count).padStart(5)} ligne(s)   ✓ source: ${source}`;
    return `${t.padEnd(28)}     —          ✗ ${tableErrors[k]||"table introuvable"}`;
  }).join('\n')
}async function load(){db=Object.fromEntries(await Promise.all(Object.entries(T).map(async([k,t])=>[k,await ft(k,t)])));renderRefs();renderDocs();renderAudit();diag();renderFrontOffice();renderSuggestions();renderPresenceAdmin();renderHome()}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));document.querySelectorAll('[data-go-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.goTab));refSelect.onchange=renderRefs;newRefBtn.onclick=()=>openEdit();auditSearch.oninput=e=>{search=e.target.value.toLowerCase();renderAudit()};refreshAuditBtn.onclick=refreshDiagBtn.onclick=load;closeDialog.onclick=cancelDialog.onclick=()=>editDialog.close();document.querySelectorAll("[data-mcd]").forEach(b=>b.onclick=()=>{
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
grist.ready({requiredAccess:'full'});
async function bootAdminAuditPMO(){
  const allowed=await window.PmoAccess?.guard({module:'AUDIT_PMO',label:'Administration & Audit PMO'});
  if(!allowed)return;
  init();
  initModuleRightsUI();
  grist.onOptions(()=>load());
  await load();
  setTab('home');
  window.PmoPresence?.start({widget:'AUDIT_PMO',version:VERSION,getContext:adminPresenceContext});
}
$("refreshTraceBtn").onclick=renderTrace;

const purgeOldAuditBtn=document.getElementById("purgeOldAuditBtn");
if(purgeOldAuditBtn)purgeOldAuditBtn.onclick=()=>purgeAuditOlderThan(document.getElementById("purgeAgeSelect").value);
const purgeAllAuditBtn=document.getElementById("purgeAllAuditBtn");
if(purgeAllAuditBtn)purgeAllAuditBtn.onclick=purgeAllAudit;

$("newDocBtn").onclick=()=>{refSelect.value="documentation";openEdit();};

const frontOfficeForm=document.getElementById('frontOfficeForm');if(frontOfficeForm)frontOfficeForm.onsubmit=saveFrontOffice;
const refreshFrontOfficeBtn=document.getElementById('refreshFrontOfficeBtn');if(refreshFrontOfficeBtn)refreshFrontOfficeBtn.onclick=load;
const topRefreshBtn=document.getElementById('topRefreshBtn');if(topRefreshBtn)topRefreshBtn.onclick=load;
const collapseSidebarBtn=document.getElementById('collapseSidebarBtn');if(collapseSidebarBtn)collapseSidebarBtn.onclick=()=>{document.getElementById('app').classList.toggle('sidebar-collapsed');collapseSidebarBtn.querySelector('span').textContent=document.getElementById('app').classList.contains('sidebar-collapsed')?'Déployer le menu':'Réduire le menu'};

$("suggestionAdminSearch").oninput=renderSuggestions;
$("suggestionStatusFilter").onchange=renderSuggestions;
$("refreshSuggestionsBtn").onclick=load;
$("closeSuggestionAdmin").onclick=$("cancelSuggestionAdmin").onclick=()=>$("suggestionAdminDialog").close();
$("suggestionAdminForm").onsubmit=saveSuggestionAdmin;

$("presenceModuleFilter").onchange=renderPresenceAdmin;
$("refreshPresenceAdminBtn").onclick=renderPresenceAdmin;


// ---- Accès modules / matrice profils x modules (v2.5.4) ----
const MODULE_CATALOG=[
  {code:"AUDIT_PMO",label:"Administration & Audit PMO",icon:"🛡️"},
  {code:"COCKPIT_RH",label:"Cockpit RH",icon:"👥"}
];
let moduleRightsState={profiles:[],rows:[],dirty:false};

function _rowsFromTable(data){
  if(!data||!Array.isArray(data.id))return[];
  const keys=Object.keys(data);
  return data.id.map((_,i)=>Object.fromEntries(keys.map(k=>[k,Array.isArray(data[k])?data[k][i]:data[k]])));
}
function _norm(v){return String(v??"").trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}
function _truth(v){return v===true||v===1||["true","1","oui","yes","on"].includes(_norm(v))}
function _pick(row,names){for(const n of names){if(row&&row[n]!==undefined&&row[n]!==null)return row[n]}return null}

async function loadModuleRights(){
  const host=document.getElementById("rightsMatrix");
  const status=document.getElementById("rightsStatus");
  if(!host)return;
  host.innerHTML='<div class="rights-loading">Chargement des profils et des modules…</div>';
  if(status)status.textContent="";
  try{
    const tables=await grist.docApi.listTables();
    if(!tables.includes("DROITS_MODULES")){
      host.innerHTML='<div class="rights-empty"><div class="big">🔐</div><h3>Table DROITS_MODULES absente</h3><p>Importez la table de configuration fournie avec cette version puis revenez sur cette page.</p></div>';
      return;
    }
    const teamTable=["Team","TEAM","Equipe"].find(t=>tables.includes(t));
    if(!teamTable)throw new Error("Table Team introuvable.");

    const [teamData,rightsData]=await Promise.all([
      grist.docApi.fetchTable(teamTable),
      grist.docApi.fetchTable("DROITS_MODULES")
    ]);
    const teamRows=_rowsFromTable(teamData);
    const rightsRows=_rowsFromTable(rightsData);

    const profileNames=["profil","Profil","profile","Profile","role","Role","ROLE"];
    const profiles=[...new Set(teamRows.map(r=>String(_pick(r,profileNames)??"").trim()).filter(Boolean))]
      .sort((a,b)=>a.localeCompare(b,"fr"));

    moduleRightsState={profiles,rows:rightsRows,dirty:false};
    renderModuleRights();
  }catch(e){
    host.innerHTML=`<div class="rights-empty"><div class="big">⚠️</div><h3>Impossible de charger les droits</h3><p>${esc(e.message||e)}</p></div>`;
  }
}

function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

function rightRow(moduleCode,profile){
  return moduleRightsState.rows.find(r=>
    _norm(r.Module??r.Code_Module??r.module)===_norm(moduleCode) &&
    _norm(r.Profil??r.Profile??r.Role??r.profil)===_norm(profile)
  );
}
function rightAllowed(moduleCode,profile){
  const r=rightRow(moduleCode,profile);
  return !!r && _truth(r.Acces??r["Accès"]??r.Autorise??r["Autorisé"]) && (r.Actif===undefined||_truth(r.Actif));
}
function renderModuleRights(){
  const host=document.getElementById("rightsMatrix");
  if(!host)return;
  const {profiles}=moduleRightsState;
  if(!profiles.length){
    host.innerHTML='<div class="rights-empty"><div class="big">👤</div><h3>Aucun profil détecté</h3><p>Renseignez un profil/rôle dans la table Team pour construire la matrice.</p></div>';
    return;
  }
  let h='<table class="rights-table"><thead><tr><th class="module-col">Module</th>';
  h+=profiles.map(p=>`<th><div class="profile-pill">${esc(p)}</div></th>`).join("");
  h+='</tr></thead><tbody>';
  for(const m of MODULE_CATALOG){
    h+=`<tr><td class="module-cell"><span class="module-icon">${m.icon}</span><div><strong>${esc(m.label)}</strong><small>${esc(m.code)}</small></div></td>`;
    for(const p of profiles){
      const checked=rightAllowed(m.code,p);
      h+=`<td class="right-cell"><label class="access-switch" title="${esc(p)} → ${esc(m.label)}">
        <input type="checkbox" data-module="${esc(m.code)}" data-profile="${esc(p)}" ${checked?"checked":""}>
        <span class="access-slider"><span class="access-check">✓</span><span class="access-dash">—</span></span>
      </label></td>`;
    }
    h+='</tr>';
  }
  h+='</tbody></table>';
  host.innerHTML=h;
  host.querySelectorAll('input[type="checkbox"]').forEach(el=>el.addEventListener("change",()=>{
    moduleRightsState.dirty=true;
    const s=document.getElementById("rightsStatus");
    if(s){s.className="rights-status pending";s.textContent="Modifications non enregistrées";}
  }));
}

async function saveModuleRights(){
  const status=document.getElementById("rightsStatus");
  const host=document.getElementById("rightsMatrix");
  if(!host)return;
  const inputs=[...host.querySelectorAll('input[type="checkbox"][data-module][data-profile]')];
  if(status){status.className="rights-status saving";status.textContent="Enregistrement…";}
  try{
    const updates=[];
    const adds=[];
    for(const input of inputs){
      const module=input.dataset.module, profile=input.dataset.profile, allowed=input.checked;
      const row=rightRow(module,profile);
      if(row){
        const current=rightAllowed(module,profile);
        if(current!==allowed){
          updates.push({id:row.id,fields:{Acces:allowed,Actif:true}});
        }
      }else if(allowed){
        const meta=MODULE_CATALOG.find(m=>m.code===module);
        adds.push({fields:{Module:module,Profil:profile,Acces:true,Actif:true,Description:`Accès ${meta?.label||module} pour le profil ${profile}`}});
      }
    }
    if(updates.length)await grist.docApi.applyUserActions(updates.map(u=>["UpdateRecord","DROITS_MODULES",u.id,u.fields]));
    if(adds.length)await grist.docApi.applyUserActions(adds.map(a=>["AddRecord","DROITS_MODULES",null,a.fields]));
    moduleRightsState.dirty=false;
    if(status){status.className="rights-status success";status.textContent="✓ Droits enregistrés dans DROITS_MODULES";}
    await loadModuleRights();
  }catch(e){
    if(status){status.className="rights-status error";status.textContent=`Erreur : ${e.message||e}`}
  }
}

function initModuleRightsUI(){
  document.getElementById("rightsRefreshBtn")?.addEventListener("click",loadModuleRights);
  document.getElementById("rightsSaveBtn")?.addEventListener("click",saveModuleRights);
  document.querySelector('[data-tab="module-rights"]')?.addEventListener("click",()=>setTimeout(loadModuleRights,0));
}

bootAdminAuditPMO().catch(e=>window.PmoAccess?.guard({module:'AUDIT_PMO',label:'Administration & Audit PMO'}));
