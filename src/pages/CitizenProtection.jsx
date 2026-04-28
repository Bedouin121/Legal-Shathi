import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  Check,
  Clipboard,
  ClipboardList,
  Download,
  FileText,
  Gavel,
  MapPin,
  Megaphone,
  PhoneCall,
  Plus,
  Save,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STORAGE_KEY = "legal-shathi-citizen-protection";

const initialIncident = {
  personName: "",
  phone: "",
  incidentDate: new Date().toISOString().slice(0, 10),
  incidentTime: new Date().toTimeString().slice(0, 5),
  location: "",
  policeStation: "",
  officerDetails: "",
  vehicleNumber: "",
  incidentType: "Police harassment",
  bribeAmount: "",
  witnesses: "",
  injuries: "",
  summary: "",
};

const rights = [
  "Ask for the officer's name, rank, station, and reason for stopping you.",
  "Do not sign blank paper or a statement you do not understand.",
  "Write down vehicle number, place, time, witnesses, and phone numbers.",
  "If money is demanded, record the exact words, amount, place, and witnesses.",
  "If someone is detained, contact family and a lawyer immediately.",
];

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 7 }}>
      <span style={{ color: "var(--ls-text2)", fontSize: ".78rem", fontWeight: 800 }}>{label}</span>
      {children}
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        minHeight: 42,
        border: "1px solid var(--ls-border)",
        borderRadius: 10,
        background: "var(--ls-card)",
        color: "var(--ls-text)",
        padding: "10px 12px",
        outline: "none",
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        ...props.style,
      }}
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        minHeight: 104,
        border: "1px solid var(--ls-border)",
        borderRadius: 10,
        background: "var(--ls-card)",
        color: "var(--ls-text)",
        padding: "10px 12px",
        outline: "none",
        resize: "vertical",
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        lineHeight: 1.6,
        ...props.style,
      }}
    />
  );
}

function ActionButton({ children, variant = "primary", onClick, type = "button", disabled = false }) {
  const primary = variant === "primary";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={primary ? "btn-shimmer" : undefined}
      style={{
        position: "relative",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        minHeight: 42,
        padding: "10px 15px",
        borderRadius: 10,
        border: primary ? "none" : "1px solid var(--ls-border)",
        background: primary ? "linear-gradient(135deg,#16a34a,#0f766e)" : "var(--ls-card)",
        color: primary ? "#fff" : "var(--ls-text)",
        fontWeight: 800,
        fontSize: ".86rem",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.58 : 1,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        boxShadow: primary ? "0 8px 24px rgba(22,163,74,.22)" : "var(--shadow-sm)",
      }}
    >
      {children}
    </button>
  );
}

function StatusPill({ children, tone = "green" }) {
  const colors = {
    green: ["#dcfce7", "#166534"],
    amber: ["#fef3c7", "#92400e"],
    red: ["#ffe4e6", "#be123c"],
    blue: ["#dbeafe", "#1d4ed8"],
  };
  const [bg, color] = colors[tone] || colors.green;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 999,
        background: bg,
        color,
        fontSize: ".73rem",
        fontWeight: 800,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
      }}
    >
      {children}
    </span>
  );
}

function ToolCard({ icon: Icon, title, detail, action, tone = "green" }) {
  return (
    <div
      style={{
        background: "var(--ls-card)",
        border: "1px solid var(--ls-border)",
        borderRadius: 14,
        padding: 18,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <StatusPill tone={tone}>{title}</StatusPill>
        <Icon size={22} color="var(--green)" />
      </div>
      <p style={{ color: "var(--ls-text2)", lineHeight: 1.62, fontSize: ".88rem", minHeight: 64 }}>{detail}</p>
      {action}
    </div>
  );
}

function buildDraft(incident, evidence, contacts, draftType) {
  const title =
    draftType === "antiCorruption"
      ? "Complaint Regarding Bribe or Extortion Demand"
      : draftType === "legalAid"
      ? "Request for Urgent Legal Assistance"
      : "Complaint Regarding Police Harassment";

  const recipient =
    draftType === "antiCorruption"
      ? "To\nThe Concerned Authority / Anti-Corruption Complaint Desk"
      : draftType === "legalAid"
      ? "To\nThe Legal Aid Officer / Concerned Lawyer"
      : "To\nThe Officer-in-Charge / Concerned Authority";

  const evidenceList = evidence.length
    ? evidence.map((item, index) => `${index + 1}. ${item.name} (${item.type || "file"}, ${formatBytes(item.size)})${item.notes ? ` - ${item.notes}` : ""}`).join("\n")
    : "No digital evidence added yet.";

  const contactList = contacts.length
    ? contacts.map((item, index) => `${index + 1}. ${item.name} - ${item.phone}`).join("\n")
    : "No trusted contacts added yet.";

  return `${recipient}\n\nSubject: ${title}\n\nI, ${incident.personName || "[Your Name]"}, phone ${incident.phone || "[Your Phone]"}, am submitting this written record regarding an incident of ${incident.incidentType || "police harassment"}.\n\nIncident date: ${incident.incidentDate || "[Date]"}\nIncident time: ${incident.incidentTime || "[Time]"}\nLocation: ${incident.location || "[Location]"}\nPolice station / unit: ${incident.policeStation || "[Police Station / Unit]"}\nOfficer details: ${incident.officerDetails || "[Officer name, rank, badge, or description]"}\nVehicle number: ${incident.vehicleNumber || "[Vehicle number if known]"}\nBribe or money demanded: ${incident.bribeAmount || "Not stated"}\nWitnesses: ${incident.witnesses || "Not stated"}\nInjuries or damage: ${incident.injuries || "Not stated"}\n\nDescription of incident:\n${incident.summary || "[Write what happened in chronological order. Include exact words used, threats, search, detention, demand for money, seized items, and witnesses.]"}\n\nEvidence available:\n${evidenceList}\n\nTrusted contacts informed:\n${contactList}\n\nRequested action:\nI request that the matter be recorded, investigated, and that I receive written acknowledgement or reference number for follow-up. I am ready to provide evidence and witness details if required.\n\nSincerely,\n${incident.personName || "[Your Name]"}\nDate: ${new Date().toISOString().slice(0, 10)}`;
}

export default function CitizenProtection() {
  const navigate = useNavigate();
  const [incident, setIncident] = useState(initialIncident);
  const [evidence, setEvidence] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [contactDraft, setContactDraft] = useState({ name: "", phone: "" });
  const [draftType, setDraftType] = useState("police");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const complaintDraft = useMemo(
    () => buildDraft(incident, evidence, contacts, draftType),
    [incident, evidence, contacts, draftType]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setIncident({ ...initialIncident, ...(parsed.incident || {}) });
        setEvidence(parsed.evidence || []);
        setContacts(parsed.contacts || []);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ incident, evidence, contacts }));
    setSaved(true);
    const timer = setTimeout(() => setSaved(false), 900);
    return () => clearTimeout(timer);
  }, [incident, evidence, contacts]);

  const updateIncident = (field, value) => {
    setIncident((prev) => ({ ...prev, [field]: value }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      updateIncident("location", "Location is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateIncident("location", `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      },
      () => updateIncident("location", "Could not access location. Write the address manually.")
    );
  };

  const addEvidence = (files) => {
    const next = Array.from(files || []).map((file) => ({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      type: file.type || "unknown",
      size: file.size,
      notes: "",
      addedAt: new Date().toLocaleString(),
    }));
    setEvidence((prev) => [...next, ...prev]);
  };

  const updateEvidenceNote = (id, notes) => {
    setEvidence((prev) => prev.map((item) => (item.id === id ? { ...item, notes } : item)));
  };

  const addContact = (event) => {
    event.preventDefault();
    if (!contactDraft.name.trim() || !contactDraft.phone.trim()) return;
    setContacts((prev) => [{ id: Date.now(), ...contactDraft }, ...prev]);
    setContactDraft({ name: "", phone: "" });
  };

  const copyDraft = async () => {
    await navigator.clipboard.writeText(complaintDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const downloadDraft = () => {
    const blob = new Blob([complaintDraft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `legal-shathi-${draftType}-complaint.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const smsText = encodeURIComponent(
    `Legal Shathi alert: I may need help. Location: ${incident.location || "not set"}. Incident: ${incident.summary || incident.incidentType}.`
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ls-text)", overflowX: "hidden", paddingTop: 64 }}>
      <Navbar />

      <main>
        <section style={{ padding: "44px clamp(16px,5vw,80px) 64px", borderBottom: "1px solid var(--ls-border)" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "none",
                background: "transparent",
                color: "var(--ls-text2)",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: ".86rem",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                marginBottom: 24,
              }}
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <div className="citizen-hero" style={{ display: "grid", gridTemplateColumns: "1.04fr .96fr", gap: 34, alignItems: "center" }}>
              <div>
                <StatusPill tone="red">
                  <ShieldAlert size={14} />
                  Interactive citizen safety toolkit
                </StatusPill>
                <h1
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "clamp(2rem,4vw,3.55rem)",
                    lineHeight: 1.08,
                    fontWeight: 900,
                    margin: "18px 0 16px",
                    maxWidth: 700,
                  }}
                >
                  Document harassment. Alert people. Generate a complaint.
                </h1>
                <p
                  style={{
                    color: "var(--ls-text2)",
                    fontSize: "1rem",
                    lineHeight: 1.75,
                    maxWidth: 640,
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    marginBottom: 24,
                  }}
                >
                  This workspace helps Bangladesh citizens record facts during police harassment, keep evidence organized, and prepare a written complaint or legal aid summary.
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <ActionButton onClick={() => scrollToSection("incident-log")}>
                    <ClipboardList size={18} />
                    Start Incident Log
                  </ActionButton>
                  <ActionButton variant="secondary" onClick={() => scrollToSection("complaint-builder")}>
                    <FileText size={18} />
                    Generate Draft
                  </ActionButton>
                  <ActionButton variant="secondary" onClick={() => navigate("/find-lawyer")}>
                    <Gavel size={18} />
                    Find Lawyer
                  </ActionButton>
                </div>
              </div>

              <div
                style={{
                  background: "linear-gradient(180deg,var(--ls-card),var(--bg3))",
                  border: "1px solid var(--ls-border)",
                  borderRadius: 18,
                  padding: 20,
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <p style={{ color: "var(--ls-text2)", fontSize: ".78rem", fontWeight: 800, margin: 0 }}>CASE SNAPSHOT</p>
                    <h2 style={{ fontSize: "1.35rem", margin: "4px 0 0" }}>{incident.personName || "Unnamed incident"}</h2>
                  </div>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: "var(--g100)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShieldCheck size={24} />
                  </div>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {[
                    { label: "Location", value: incident.location || "Not added", icon: MapPin },
                    { label: "Evidence", value: `${evidence.length} item${evidence.length === 1 ? "" : "s"}`, icon: Camera },
                    { label: "Trusted contacts", value: `${contacts.length} contact${contacts.length === 1 ? "" : "s"}`, icon: Users },
                  ].map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "38px 1fr",
                        gap: 10,
                        alignItems: "center",
                        border: "1px solid var(--ls-border)",
                        borderRadius: 12,
                        padding: 12,
                        background: "var(--ls-card)",
                      }}
                    >
                      <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--bg3)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: ".85rem", fontWeight: 800 }}>{label}</p>
                        <p style={{ margin: "2px 0 0", color: "var(--ls-text2)", fontSize: ".78rem", wordBreak: "break-word" }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ls-text2)", fontSize: ".78rem", marginTop: 14 }}>
                  <Save size={15} />
                  {saved ? "Saved in this browser" : "Autosaves locally"}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: "56px clamp(16px,5vw,80px)", background: "var(--bg2)" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <div className="citizen-actions" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              <ToolCard
                icon={ClipboardList}
                title="Incident Log"
                detail="Fill a structured record that later becomes your complaint draft."
                action={<ActionButton onClick={() => scrollToSection("incident-log")}><ClipboardList size={17} />Open Form</ActionButton>}
              />
              <ToolCard
                icon={Camera}
                title="Evidence Vault"
                detail="Add file names, sizes, timestamps, and short notes for your proof list."
                tone="amber"
                action={<ActionButton variant="secondary" onClick={() => scrollToSection("evidence-vault")}><Upload size={17} />Add Evidence</ActionButton>}
              />
              <ToolCard
                icon={PhoneCall}
                title="Trusted Contacts"
                detail="Create SMS-ready alerts for family, friends, or a lawyer."
                tone="red"
                action={<ActionButton variant="secondary" onClick={() => scrollToSection("trusted-contacts")}><PhoneCall size={17} />Prepare Alert</ActionButton>}
              />
            </div>
          </div>
        </section>

        <section id="incident-log" style={{ padding: "64px clamp(16px,5vw,80px)" }}>
          <div className="citizen-workspace" style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 26 }}>
            <div style={{ background: "var(--ls-card)", border: "1px solid var(--ls-border)", borderRadius: 14, padding: 22, boxShadow: "var(--shadow-sm)" }}>
              <StatusPill tone="green">
                <ClipboardList size={14} />
                Incident log
              </StatusPill>
              <h2 style={{ margin: "14px 0 18px", fontSize: "1.55rem", fontWeight: 900 }}>Write the facts while they are fresh</h2>

              <div className="citizen-form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
                <Field label="Your name">
                  <Input value={incident.personName} onChange={(e) => updateIncident("personName", e.target.value)} placeholder="Full name" />
                </Field>
                <Field label="Your phone">
                  <Input value={incident.phone} onChange={(e) => updateIncident("phone", e.target.value)} placeholder="01XXXXXXXXX" />
                </Field>
                <Field label="Date">
                  <Input type="date" value={incident.incidentDate} onChange={(e) => updateIncident("incidentDate", e.target.value)} />
                </Field>
                <Field label="Time">
                  <Input type="time" value={incident.incidentTime} onChange={(e) => updateIncident("incidentTime", e.target.value)} />
                </Field>
                <Field label="Incident type">
                  <Input value={incident.incidentType} onChange={(e) => updateIncident("incidentType", e.target.value)} placeholder="Harassment, bribe demand, illegal search..." />
                </Field>
                <Field label="Police station / unit">
                  <Input value={incident.policeStation} onChange={(e) => updateIncident("policeStation", e.target.value)} placeholder="Station, traffic box, unit" />
                </Field>
                <Field label="Location">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                    <Input value={incident.location} onChange={(e) => updateIncident("location", e.target.value)} placeholder="Address or GPS" />
                    <ActionButton variant="secondary" onClick={useCurrentLocation}>
                      <MapPin size={17} />
                    </ActionButton>
                  </div>
                </Field>
                <Field label="Police vehicle / patrol number">
                  <Input value={incident.vehicleNumber} onChange={(e) => updateIncident("vehicleNumber", e.target.value)} placeholder="If visible" />
                </Field>
                <Field label="Officer details">
                  <Textarea value={incident.officerDetails} onChange={(e) => updateIncident("officerDetails", e.target.value)} placeholder="Name, rank, badge, physical description, uniform details" />
                </Field>
                <Field label="Witnesses">
                  <Textarea value={incident.witnesses} onChange={(e) => updateIncident("witnesses", e.target.value)} placeholder="Names, phone numbers, nearby shops or people" />
                </Field>
                <Field label="Money demanded or paid">
                  <Input value={incident.bribeAmount} onChange={(e) => updateIncident("bribeAmount", e.target.value)} placeholder="Amount and context" />
                </Field>
                <Field label="Injuries, damage, seized items">
                  <Input value={incident.injuries} onChange={(e) => updateIncident("injuries", e.target.value)} placeholder="Medical, property, phone, documents" />
                </Field>
              </div>

              <div style={{ marginTop: 14 }}>
                <Field label="What happened">
                  <Textarea
                    value={incident.summary}
                    onChange={(e) => updateIncident("summary", e.target.value)}
                    placeholder="Write the sequence: where you were, what they said, whether they searched you, demanded money, threatened, detained, or took anything."
                    style={{ minHeight: 150 }}
                  />
                </Field>
              </div>
            </div>

            <div style={{ display: "grid", gap: 14, alignSelf: "start" }}>
              <div style={{ background: "var(--ls-card)", border: "1px solid var(--ls-border)", borderRadius: 14, padding: 18 }}>
                <StatusPill tone="amber">
                  <AlertTriangle size={14} />
                  Rights card
                </StatusPill>
                <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                  {rights.map((right, index) => (
                    <div key={right} style={{ display: "grid", gridTemplateColumns: "30px 1fr", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--g100)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
                        {index + 1}
                      </div>
                      <p style={{ margin: 0, color: "var(--ls-text2)", fontSize: ".86rem", lineHeight: 1.55 }}>{right}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 14, padding: 18, color: "#7c2d12" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900, marginBottom: 8 }}>
                  <Siren size={18} />
                  Emergency reminder
                </div>
                <p style={{ margin: 0, lineHeight: 1.6, fontSize: ".88rem" }}>
                  If someone is injured, detained, or in immediate danger, contact emergency help and a lawyer. This tool is for organizing information, not replacing urgent help.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="evidence-vault" style={{ padding: "64px clamp(16px,5vw,80px)", background: "var(--bg2)", borderTop: "1px solid var(--ls-border)" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
              <div>
                <StatusPill tone="amber">
                  <Camera size={14} />
                  Evidence vault
                </StatusPill>
                <h2 style={{ margin: "14px 0 0", fontSize: "1.55rem", fontWeight: 900 }}>Build a clean proof list</h2>
              </div>
              <label
                htmlFor="citizen-evidence-files"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  minHeight: 42,
                  padding: "10px 15px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#16a34a,#0f766e)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: ".86rem",
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  boxShadow: "0 8px 24px rgba(22,163,74,.22)",
                }}
              >
                <input
                  id="citizen-evidence-files"
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => addEvidence(e.target.files)}
                />
                <Upload size={17} />
                Add Files
              </label>
            </div>

            {evidence.length === 0 ? (
              <div style={{ border: "1px dashed var(--ls-border)", borderRadius: 14, padding: 28, textAlign: "center", color: "var(--ls-text2)", background: "var(--ls-card)" }}>
                No evidence added yet. Add photos, videos, audio recordings, medical papers, receipts, or screenshots.
              </div>
            ) : (
              <div className="evidence-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
                {evidence.map((item) => (
                  <div key={item.id} style={{ background: "var(--ls-card)", border: "1px solid var(--ls-border)", borderRadius: 14, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 900, wordBreak: "break-word" }}>{item.name}</p>
                        <p style={{ margin: "4px 0 0", color: "var(--ls-text2)", fontSize: ".78rem" }}>{formatBytes(item.size)} | {item.addedAt}</p>
                      </div>
                      <button
                        onClick={() => setEvidence((prev) => prev.filter((e) => e.id !== item.id))}
                        style={{ border: "none", background: "transparent", color: "#be123c", cursor: "pointer", height: 30 }}
                        aria-label="Remove evidence"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <Input value={item.notes} onChange={(e) => updateEvidenceNote(item.id, e.target.value)} placeholder="Short note: what this file proves" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="trusted-contacts" style={{ padding: "64px clamp(16px,5vw,80px)" }}>
          <div className="citizen-workspace" style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: ".9fr 1.1fr", gap: 26 }}>
            <div style={{ background: "var(--ls-card)", border: "1px solid var(--ls-border)", borderRadius: 14, padding: 20 }}>
              <StatusPill tone="red">
                <PhoneCall size={14} />
                Trusted contacts
              </StatusPill>
              <h2 style={{ margin: "14px 0 16px", fontSize: "1.45rem", fontWeight: 900 }}>Add people to alert quickly</h2>
              <form onSubmit={addContact} style={{ display: "grid", gap: 12 }}>
                <Field label="Name">
                  <Input value={contactDraft.name} onChange={(e) => setContactDraft((prev) => ({ ...prev, name: e.target.value }))} placeholder="Family member, lawyer, friend" />
                </Field>
                <Field label="Phone">
                  <Input value={contactDraft.phone} onChange={(e) => setContactDraft((prev) => ({ ...prev, phone: e.target.value }))} placeholder="01XXXXXXXXX" />
                </Field>
                <ActionButton type="submit" disabled={!contactDraft.name.trim() || !contactDraft.phone.trim()}>
                  <Plus size={17} />
                  Add Contact
                </ActionButton>
              </form>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {contacts.length === 0 ? (
                <div style={{ border: "1px dashed var(--ls-border)", borderRadius: 14, padding: 26, color: "var(--ls-text2)", background: "var(--ls-card)" }}>
                  No contacts yet. Add at least one trusted person for SMS-ready emergency alerts.
                </div>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "center", background: "var(--ls-card)", border: "1px solid var(--ls-border)", borderRadius: 14, padding: 14 }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 900 }}>{contact.name}</p>
                      <p style={{ margin: "4px 0 0", color: "var(--ls-text2)", fontSize: ".82rem" }}>{contact.phone}</p>
                    </div>
                    <a href={`sms:${contact.phone}?&body=${smsText}`} style={{ textDecoration: "none" }}>
                      <ActionButton variant="secondary">
                        <PhoneCall size={16} />
                        SMS
                      </ActionButton>
                    </a>
                    <button
                      onClick={() => setContacts((prev) => prev.filter((item) => item.id !== contact.id))}
                      style={{ border: "none", background: "transparent", color: "#be123c", cursor: "pointer" }}
                      aria-label="Remove contact"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section id="complaint-builder" style={{ padding: "64px clamp(16px,5vw,80px)", background: "var(--bg2)", borderTop: "1px solid var(--ls-border)" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
              <div>
                <StatusPill tone="blue">
                  <FileText size={14} />
                  Complaint builder
                </StatusPill>
                <h2 style={{ margin: "14px 0 0", fontSize: "1.55rem", fontWeight: 900 }}>Generate a written draft from your record</h2>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  ["police", "Police complaint", Megaphone],
                  ["antiCorruption", "Bribe report", ShieldAlert],
                  ["legalAid", "Legal aid", Gavel],
                ].map(([value, label, Icon]) => (
                  <ActionButton key={value} variant={draftType === value ? "primary" : "secondary"} onClick={() => setDraftType(value)}>
                    <Icon size={16} />
                    {label}
                  </ActionButton>
                ))}
              </div>
            </div>

            <div className="citizen-workspace" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18 }}>
              <Textarea readOnly value={complaintDraft} style={{ minHeight: 460, fontFamily: "Consolas, 'Courier New', monospace", fontSize: ".84rem", background: "var(--ls-card)" }} />
              <div style={{ display: "grid", gap: 12, alignSelf: "start" }}>
                <ActionButton onClick={copyDraft}>
                  {copied ? <Check size={17} /> : <Clipboard size={17} />}
                  {copied ? "Copied" : "Copy Draft"}
                </ActionButton>
                <ActionButton variant="secondary" onClick={downloadDraft}>
                  <Download size={17} />
                  Download TXT
                </ActionButton>
                <ActionButton variant="secondary" onClick={() => navigate("/chat")}>
                  <ShieldAlert size={17} />
                  Ask AI to Improve
                </ActionButton>
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: 14, color: "#1e3a8a", fontSize: ".84rem", lineHeight: 1.55 }}>
                  This draft is a starting point. Review facts carefully before submitting anywhere.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @media(max-width: 980px) {
          .citizen-hero,
          .citizen-actions,
          .citizen-workspace,
          .citizen-form-grid,
          .evidence-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
