/*
 * pmo-access.js v1.0.0
 * Garde d'accès applicatif pour widgets Grist.
 *
 * Sécurité réelle = ACL Grist sur les tables.
 * Cette garde bloque l'entrée du module et adapte l'UX.
 */
(() => {
  "use strict";

  const VERSION = "1.0.0";
  const RIGHTS_TABLE = "DROITS_MODULES";
  const TEAM_TABLES = ["Team", "TEAM", "Equipe"];
  const EMAIL_FIELDS = ["email", "Email", "EMAIL", "Utilisateur_Email", "Mail"];
  const PROFILE_FIELDS = ["profil", "Profil", "PROFILE", "profile", "role", "Role", "ROLE"];

  const norm = v => String(v ?? "")
    .trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  function gristRows(data) {
    if (!data || !Array.isArray(data.id)) return [];
    const keys = Object.keys(data);
    return data.id.map((_, i) => Object.fromEntries(
      keys.map(k => [k, Array.isArray(data[k]) ? data[k][i] : data[k]])
    ));
  }

  function pick(row, fields) {
    if (!row) return null;
    for (const f of fields) {
      if (Object.prototype.hasOwnProperty.call(row, f) && row[f] !== null && row[f] !== undefined) {
        return row[f];
      }
    }
    return null;
  }

  function flag(v, defaultValue = true) {
    if (v === null || v === undefined || v === "") return defaultValue;
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;
    return !["false", "0", "non", "no", "off", "inactive", "inactif"].includes(norm(v));
  }

  async function currentUser() {
    try {
      const u = await window.PmoPresence?.currentUser?.();
      if (u?.email || u?.Email) {
        return {
          email: u.email || u.Email || "",
          name: u.name || u.Name || u.nom || ""
        };
      }
    } catch (e) {
      console.warn("[PMO Access] Presence currentUser indisponible", e);
    }
    return {email: "", name: ""};
  }

  async function findProfile(email) {
    const tables = await grist.docApi.listTables();
    const table = TEAM_TABLES.find(t => tables.includes(t));
    if (!table) return {profile: "", table: null, found: false};

    const data = await grist.docApi.fetchTable(table);
    const rows = gristRows(data);
    const wanted = norm(email);

    let row = rows.find(r => EMAIL_FIELDS.some(f => norm(r[f]) === wanted));
    if (!row && !wanted) return {profile: "", table, found: false};

    return {
      profile: String(pick(row, PROFILE_FIELDS) ?? "").trim(),
      table,
      found: !!row
    };
  }

  async function isDocumentOwner() {
    /*
     * Probe volontairement sans écriture :
     * /usersForViewAs est un endpoint Grist réservé aux Owners du document.
     * 200 => Owner. 403 => pas Owner.
     * En cas d'indisponibilité de l'endpoint, on ne donne PAS de bypass.
     */
    try {
      const tokenInfo = await grist.docApi.getAccessToken({readOnly: true});
      if (!tokenInfo?.baseUrl || !tokenInfo?.token) return false;
      const url = `${tokenInfo.baseUrl}/usersForViewAs?auth=${encodeURIComponent(tokenInfo.token)}`;
      const res = await fetch(url, {method: "GET", credentials: "omit"});
      return res.status === 200;
    } catch (e) {
      console.warn("[PMO Access] Détection Owner indisponible", e);
      return false;
    }
  }

  async function moduleRows() {
    const tables = await grist.docApi.listTables();
    if (!tables.includes(RIGHTS_TABLE)) {
      throw new Error(`La table ${RIGHTS_TABLE} est absente du document.`);
    }
    return gristRows(await grist.docApi.fetchTable(RIGHTS_TABLE));
  }

  function rowMatches(row, moduleCode, profile) {
    const moduleValue = row.Module ?? row.Code_Module ?? row.module ?? "";
    const profileValue = row.Profil ?? row.Profile ?? row.Role ?? row.profil ?? "";
    const active = flag(row.Actif, true);
    const allowed = flag(row.Acces ?? row.Accès ?? row.Autorise ?? row.Autorisé, true);
    return active && allowed && norm(moduleValue) === norm(moduleCode) && norm(profileValue) === norm(profile);
  }

  function injectStyle() {
    if (document.getElementById("pmoAccessStyle")) return;
    const style = document.createElement("style");
    style.id = "pmoAccessStyle";
    style.textContent = `
      .pmo-access-gate{
        position:fixed;inset:0;z-index:2147483647;
        display:flex;align-items:center;justify-content:center;
        padding:28px;
        background:
          radial-gradient(circle at 18% 18%, rgba(67,97,238,.16), transparent 34%),
          radial-gradient(circle at 82% 76%, rgba(124,58,237,.13), transparent 30%),
          linear-gradient(145deg,#f8fafc 0%,#eef2ff 52%,#f8fafc 100%);
        font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        color:#172033;
      }
      .pmo-access-card{
        width:min(760px,100%);background:rgba(255,255,255,.96);
        border:1px solid rgba(148,163,184,.28);border-radius:24px;
        box-shadow:0 28px 80px rgba(30,41,59,.18);overflow:hidden;
      }
      .pmo-access-top{padding:30px 34px 24px;background:linear-gradient(135deg,#111827,#28385f);}
      .pmo-access-badge{display:inline-flex;align-items:center;gap:8px;padding:7px 12px;
        border-radius:999px;background:rgba(255,255,255,.10);color:#dbeafe;
        font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
      .pmo-access-lock{width:66px;height:66px;border-radius:18px;margin:22px 0 16px;
        display:grid;place-items:center;background:rgba(255,255,255,.12);
        border:1px solid rgba(255,255,255,.15);font-size:32px}
      .pmo-access-top h1{margin:0;color:white;font-size:30px;line-height:1.15}
      .pmo-access-top p{margin:10px 0 0;color:#cbd5e1;font-size:15px;line-height:1.55}
      .pmo-access-body{padding:28px 34px 32px}
      .pmo-access-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:22px}
      .pmo-access-info{padding:14px 16px;border:1px solid #e2e8f0;border-radius:14px;background:#f8fafc}
      .pmo-access-info small{display:block;color:#64748b;font-size:11px;text-transform:uppercase;
        letter-spacing:.05em;font-weight:800;margin-bottom:5px}
      .pmo-access-info strong{display:block;font-size:14px;overflow-wrap:anywhere}
      .pmo-access-rule{display:flex;gap:13px;align-items:flex-start;padding:15px 16px;
        border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;margin-top:10px}
      .pmo-access-rule .ico{font-size:20px;line-height:1}
      .pmo-access-rule strong{display:block;margin-bottom:4px}
      .pmo-access-rule span{display:block;color:#64748b;font-size:13px;line-height:1.45}
      .pmo-access-warning{margin-top:18px;padding:13px 15px;border-radius:12px;
        background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;font-size:13px;line-height:1.45}
      .pmo-access-foot{margin-top:22px;color:#64748b;font-size:12px;line-height:1.5}
      @media(max-width:600px){.pmo-access-grid{grid-template-columns:1fr}.pmo-access-top,.pmo-access-body{padding-left:22px;padding-right:22px}}
    `;
    document.head.appendChild(style);
  }

  function showDenied({module, label, user, profile, reason}) {
    injectStyle();
    document.querySelectorAll("body > :not(.pmo-access-gate)").forEach(el => {
      if (el.tagName !== "SCRIPT") el.style.display = "none";
    });

    const gate = document.createElement("div");
    gate.className = "pmo-access-gate";
    gate.innerHTML = `
      <section class="pmo-access-card" role="alert" aria-live="polite">
        <div class="pmo-access-top">
          <div class="pmo-access-badge">Sécurité applicative Grist</div>
          <div class="pmo-access-lock">🔒</div>
          <h1>Accès au module non autorisé</h1>
          <p>Vous êtes bien connecté au document Grist, mais votre profil ne permet pas d’ouvrir <strong>${escapeHtml(label)}</strong>.</p>
        </div>
        <div class="pmo-access-body">
          <div class="pmo-access-grid">
            <div class="pmo-access-info"><small>Utilisateur</small><strong>${escapeHtml(user?.name || user?.email || "Utilisateur Grist")}</strong></div>
            <div class="pmo-access-info"><small>Profil applicatif détecté</small><strong>${escapeHtml(profile || "Aucun profil")}</strong></div>
            <div class="pmo-access-info"><small>Module</small><strong>${escapeHtml(module)}</strong></div>
            <div class="pmo-access-info"><small>Source des droits</small><strong>${RIGHTS_TABLE}</strong></div>
          </div>

          <div class="pmo-access-rule">
            <div class="ico">👑</div>
            <div><strong>Propriétaire Grist du document</strong><span>Le rôle Owner du document dispose automatiquement de l’accès au module.</span></div>
          </div>
          <div class="pmo-access-rule">
            <div class="ico">🪪</div>
            <div><strong>Autres utilisateurs</strong><span>Votre profil dans la table Team doit disposer d’une ligne active autorisant ce module dans ${RIGHTS_TABLE}.</span></div>
          </div>

          <div class="pmo-access-warning"><strong>Pourquoi cette page ?</strong><br>${escapeHtml(reason || "Aucun droit applicatif actif ne correspond à votre profil pour ce module.")}</div>
          <div class="pmo-access-foot">Si cet accès vous est nécessaire, demandez à un propriétaire du document de vérifier votre profil et la matrice d’accès aux modules. Les ACL Grist sur les tables restent la protection effective des données.</div>
        </div>
      </section>`;
    document.body.appendChild(gate);
  }

  function escapeHtml(v) {
    return String(v ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    })[c]);
  }

  async function check({module, label}) {
    const user = await currentUser();

    if (await isDocumentOwner()) {
      return {allowed: true, owner: true, module, label, user, profile: "Owner Grist"};
    }

    const p = await findProfile(user.email);
    const profile = p.profile;

    if (!p.found) {
      return {allowed:false, owner:false, module, label, user, profile:"",
        reason:`Aucune ligne de la table Team ne correspond à l’adresse ${user.email || "de l’utilisateur courant"}.`};
    }
    if (!profile) {
      return {allowed:false, owner:false, module, label, user, profile:"",
        reason:"Votre ligne Team existe, mais aucun profil/rôle applicatif n’y est renseigné."};
    }

    let rights;
    try {
      rights = await moduleRows();
    } catch (e) {
      return {allowed:false, owner:false, module, label, user, profile, reason:e.message || String(e)};
    }

    const allowed = rights.some(r => rowMatches(r, module, profile));
    return {
      allowed, owner:false, module, label, user, profile,
      reason: allowed ? "" : `Le profil « ${profile} » n’est pas autorisé pour le module « ${module} » dans ${RIGHTS_TABLE}.`
    };
  }

  async function guard(opts) {
    try {
      const result = await check(opts);
      if (!result.allowed) showDenied(result);
      return result.allowed;
    } catch (e) {
      const fallback = {
        ...opts,
        user:{email:"",name:""},
        profile:"",
        reason:`Impossible de vérifier les droits applicatifs : ${e?.message || e}`
      };
      console.error("[PMO Access]", e);
      showDenied(fallback);
      return false;
    }
  }

  window.PmoAccess = {VERSION, RIGHTS_TABLE, check, guard};
})();
