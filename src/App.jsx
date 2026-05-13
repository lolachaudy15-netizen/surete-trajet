import { useState } from "react";

const questions = [
  { id: "pause45", label: "Le trajet nécessite une pause de 45 min ou plus", points: 6,
    precoTSR: "Toute pause doit être planifiée en amont avec le client. Le lieu de stationnement doit être sélectionné selon les critères TAPA PSR (parking sécurisé certifié ou équivalent). Éviter les aires d'autoroute non sécurisées." },
  { id: "decouche", label: "Le trajet nécessite un découchage", points: 9,
    precoTSR: "Le site de découchage doit être un parking certifié TAPA PSR ou présentant des mesures équivalentes (gardiennage 24h, clôture, vidéosurveillance). Valider le lieu avec le client avant départ." },
  { id: "autoroute25", label: "Le trajet comporte moins de 25% d'autoroute", points: 9,
    precoTSR: "Trajet majoritairement sur routes secondaires : privilégier un itinéraire alternatif plus sécurisé si possible. Renforcer le suivi télématique avec des points de contrôle rapprochés toutes les 30 min." },
  { id: "autoroute50", label: "Le trajet comporte moins de 50% d'autoroute", points: 6,
    precoTSR: "Part significative de routes secondaires : prévoir des points de contrôle intermédiaires et valider l'itinéraire avec le responsable sûreté avant départ." },
  { id: "tis", label: "L'outil TIS (ou info LEA locales) révèle un ou plusieurs incidents sur ce trajet", points: 9,
    precoTSR: "Des incidents ont été recensés sur cette zone. Consulter les forces de l'ordre locales. Envisager une modification d'itinéraire ou un renforcement des mesures (escorte, convoi)." },
  { id: "douane", label: "Le trajet inclut un passage douanier", points: 9,
    precoTSR: "Les temps d'attente aux douanes exposent le véhicule. Planifier le passage en concertation avec le client, activer le suivi en continu, s'assurer que le chauffeur ne quitte pas le véhicule sans surveillance." },
  { id: "embouteillage", label: "Le trajet passe par une zone à embouteillages fréquents", points: 6,
    precoTSR: "Les zones de congestion sont propices aux vols à l'arraché et aux intrusions. Sensibiliser le chauffeur (vitres fermées, portes verrouillées) et prévoir un itinéraire alternatif validé." },
  { id: "ferry", label: "Le trajet inclut un passage de ferry", points: 9,
    precoTSR: "Le ferry constitue une rupture de traçabilité. Vérifier les mesures de sécurité à bord, ne pas laisser la marchandise sans contrôle, et prévoir un check-in manuel à l'embarquement et au débarquement." },
  { id: "attractif", label: "La marchandise est attractive pour un vol", points: 9,
    precoTSR: "Marchandise à haute attractivité : verrouillage certifié obligatoire, scellés sur la remorque, discrétion sur le contenu du chargement. Envisager un transport banalisé." },
  { id: "tunnel", label: "Le trajet passe par un tunnel avec risque de perte de connexion", points: 6,
    precoTSR: "Perte de signal possible en tunnel : configurer le système télématique pour détecter toute rupture de connexion anormale et alerter automatiquement le centre de surveillance." },
];

const valeurOptions = [
  { id: "v0",   label: "Moins de 30 000 €",  points: 0,  tsr1: false },
  { id: "v30",  label: "Plus de 30 000 €",   points: 6,  tsr1: false },
  { id: "v70",  label: "Plus de 70 000 €",   points: 9,  tsr1: true  },
  { id: "v150", label: "Plus de 150 000 €",  points: 12, tsr1: true  },
  { id: "v500", label: "Plus de 500 000 €",  points: 15, tsr1: true  },
];

const MAX_SCORE = questions.reduce((s, q) => s + q.points, 0) + 15;

function getLevel(score) {
  if (score <= 35) return { label: "Risque limité",  color: "#22c55e", bg: "#f0fdf4", icon: "✅" };
  if (score <= 65) return { label: "Risque modéré",  color: "#f59e0b", bg: "#fffbeb", icon: "⚠️" };
  return              { label: "Risque élevé",       color: "#ef4444", bg: "#fef2f2", icon: "🔴" };
}

function getTSRLevel(score, valeur) {
  if (!valeur) return null;
  if (valeur.tsr1 || score >= 50) return { level: "TSR 1", color: "#7c3aed", badge: "🔒 TSR 1", desc: "Niveau de certification le plus élevé — requis pour ce trajet." };
  if (score >= 25)                return { level: "TSR 3", color: "#2563eb", badge: "🔐 TSR 3", desc: "Niveau minimum recommandé — envisager TSR 1 si la valeur augmente." };
  return { level: "Bonnes pratiques", color: "#16a34a", badge: "✔️ Bonnes pratiques", desc: "Pas de niveau TSR obligatoire — appliquer les bonnes pratiques de base." };
}

const precoGenerales = {
  "Bonnes pratiques": [
    "Vérifier que le véhicule est équipé d'un système de verrouillage fonctionnel",
    "S'assurer que le chauffeur dispose d'un contact d'urgence joignable pendant le trajet",
    "Confirmer l'itinéraire avec le client avant le départ",
    "Activer le suivi GPS et tester la connexion avant départ",
  ],
  "TSR 3": [
    "Mettre en place un système de suivi télématique actif avec alertes automatiques",
    "Utiliser un système de verrouillage certifié sur la remorque",
    "Définir un protocole de check-in régulier avec le dispatcher (toutes les 2h minimum)",
    "Former le chauffeur aux procédures de sûreté de base",
    "Établir une procédure d'urgence documentée et connue du chauffeur",
    "Valider l'itinéraire avec le responsable sûreté avant départ",
  ],
  "TSR 1": [
    "Exiger une certification TAPA TSR 1 du transporteur",
    "Mettre en place un suivi télématique en temps réel avec centre de surveillance 24h/24",
    "Utiliser des scellés numérotés et vérifiés à chaque étape",
    "Stationner exclusivement sur des parkings certifiés TAPA PSR",
    "Vérifier les antécédents du chauffeur",
    "Mettre en place une procédure de pré-alerte client avant départ et à l'arrivée",
    "Prévoir une escorte ou un convoi si le risque est jugé critique",
    "Briefing sûreté obligatoire avant chaque mission",
  ],
};

export default function App() {
  const [checked, setChecked] = useState({});
  const [valeur, setValeur] = useState(null);
  const [step, setStep] = useState("form");

  const toggle = id => setChecked(p => ({ ...p, [id]: !p[id] }));
  const rawScore = questions.reduce((s, q) => s + (checked[q.id] ? q.points : 0), 0) + (valeur?.points ?? 0);
  const score = Math.min(100, Math.round((rawScore / MAX_SCORE) * 100));
  const answered = Object.values(checked).filter(Boolean).length + (valeur ? 1 : 0);
  const level = getLevel(score);
  const tsrReco = getTSRLevel(score, valeur);

  function reset() { setChecked({}); setValeur(null); setStep("form"); }

  if (step === "result") {
    const tsr = getTSRLevel(score, valeur);
    const triggered = questions.filter(q => checked[q.id]);
    const precos = precoGenerales[tsr.level] || [];

    return (
      <div style={{ fontFamily: "Inter,sans-serif", maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>

        <div style={{ background: level.bg, border: `2px solid ${level.color}`, borderRadius: 16, padding: 24, textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 40 }}>{level.icon}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: level.color }}>{level.label}</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: level.color, lineHeight: 1.1 }}>{score}<span style={{ fontSize: 22 }}>/100</span></div>
          <div style={{ background: "#e5e7eb", borderRadius: 99, height: 10, margin: "10px auto 0", maxWidth: 400 }}>
            <div style={{ background: level.color, width: `${score}%`, height: 10, borderRadius: 99 }} />
          </div>
        </div>

        <div style={{ background: "#f5f3ff", border: `2px solid ${tsr.color}`, borderRadius: 12, padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>{tsr.badge}</span>
          <div>
            <div style={{ fontWeight: 800, color: tsr.color, fontSize: 16 }}>{tsr.level}</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>{tsr.desc}</div>
          </div>
        </div>

        {triggered.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18, marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 13, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Facteurs de risque identifiés</h3>
            {triggered.map(q => (
              <div key={q.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "#1e293b", marginBottom: 4 }}>⚠️ {q.label}</div>
                <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>→ {q.precoTSR}</div>
              </div>
            ))}
            {valeur?.points > 0 && (
              <div style={{ fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>💰 Valeur du transport : {valeur.label}</div>
            )}
          </div>
        )}

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18, marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Préconisations</h3>
          {precos.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13.5, color: "#1e293b", lineHeight: 1.5 }}>
              <span style={{ color: tsr.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
              <span>{p}</span>
            </div>
          ))}
        </div>

        <button onClick={reset} style={{ width: "100%", padding: 14, background: "#1e293b", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          ← Nouveau trajet
        </button>

        <div style={{ marginTop: 32, padding: "16px 0", borderTop: "1px solid #e5e7eb", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Outil conçu par <strong style={{ color: "#475569" }}>Lola CHAUDY</strong></p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>Consultante en sûreté de la supply chain · <a href="tel:0660987642" style={{ color: "#7c3aed", textDecoration: "none" }}>06 60 98 76 42</a></p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter,sans-serif", maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 26 }}>🛡️</span>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1e293b" }}>Scoring Sûreté de Trajet</h1>

        </div>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>Cochez tous les éléments applicables à votre trajet</p>
        <div style={{ marginTop: 8, background: "#e5e7eb", borderRadius: 99, height: 5 }}>
          <div style={{ background: "#3b82f6", width: `${(answered / (questions.length + 1)) * 100}%`, height: 5, borderRadius: 99, transition: "width 0.3s" }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {questions.map(q => (
          <label key={q.id} style={{
            display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 15px",
            background: checked[q.id] ? "#eff6ff" : "#fff",
            border: `1.5px solid ${checked[q.id] ? "#3b82f6" : "#e5e7eb"}`,
            borderRadius: 10, cursor: "pointer", transition: "all 0.15s"
          }}>
            <input type="checkbox" checked={!!checked[q.id]} onChange={() => toggle(q.id)}
              style={{ width: 17, height: 17, accentColor: "#3b82f6", flexShrink: 0, marginTop: 2 }} />
            <span style={{ flex: 1, fontSize: 13.5, color: "#1e293b", lineHeight: 1.45 }}>{q.label}</span>
            <span style={{
              background: checked[q.id] ? "#3b82f6" : "#f1f5f9",
              color: checked[q.id] ? "#fff" : "#6b7280",
              borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1
            }}>+{q.points}</span>
          </label>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: 15, marginBottom: 16 }}>
        <p style={{ margin: "0 0 10px", fontWeight: 700, color: "#1e293b", fontSize: 13.5 }}>
          💰 Valeur du transport <span style={{ color: "#ef4444" }}>*</span>
          <span style={{ fontWeight: 400, color: "#9ca3af", fontSize: 12, marginLeft: 8 }}>→ TSR 1 automatique dès 70 000 €</span>
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {valeurOptions.map(opt => (
            <label key={opt.id} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 13px",
              background: valeur?.id === opt.id ? "#eff6ff" : "#f8fafc",
              border: `1.5px solid ${valeur?.id === opt.id ? "#3b82f6" : "#e5e7eb"}`,
              borderRadius: 8, cursor: "pointer"
            }}>
              <input type="radio" name="valeur" checked={valeur?.id === opt.id} onChange={() => setValeur(opt)} style={{ accentColor: "#3b82f6" }} />
              <span style={{ flex: 1, fontSize: 13.5, color: "#1e293b" }}>{opt.label}</span>
              {opt.tsr1 && <span style={{ fontSize: 11, background: "#ede9fe", color: "#7c3aed", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>TSR 1</span>}
              {opt.points > 0 && <span style={{
                background: valeur?.id === opt.id ? "#3b82f6" : "#f1f5f9",
                color: valeur?.id === opt.id ? "#fff" : "#6b7280",
                borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 700
              }}>+{opt.points}</span>}
            </label>
          ))}
        </div>
      </div>

      {valeur && (
        <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: 13, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <span style={{ color: "#6b7280", fontSize: 12 }}>Score estimé </span>
            <span style={{ fontWeight: 800, fontSize: 22, color: level.color }}>{score}<span style={{ fontSize: 13, fontWeight: 400 }}>/100</span></span>
          </div>
          {tsrReco && (
            <span style={{ fontSize: 12, fontWeight: 700, background: "#ede9fe", color: tsrReco.color, padding: "4px 12px", borderRadius: 99 }}>
              {tsrReco.badge}
            </span>
          )}
        </div>
      )}

      <button onClick={() => setStep("result")} disabled={!valeur} style={{
        width: "100%", padding: 15, fontSize: 15, fontWeight: 700,
        background: valeur ? "#1e293b" : "#e5e7eb",
        color: valeur ? "#fff" : "#9ca3af",
        border: "none", borderRadius: 10, cursor: valeur ? "pointer" : "not-allowed"
      }}>
        Analyser le trajet →
      </button>

      <div style={{ marginTop: 32, padding: "16px 0", borderTop: "1px solid #e5e7eb", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Outil conçu par <strong style={{ color: "#475569" }}>Lola CHAUDY</strong></p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>Consultante en sûreté de la supply chain · <a href="tel:0660987642" style={{ color: "#7c3aed", textDecoration: "none" }}>06 60 98 76 42</a></p>
      </div>
    </div>
  );
}
