import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Scale, Building2, Search, Phone, Mail, Copy, Check, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// bkoigl is loaded globally via CDN in index.html
declare const bkoigl: any;

export type Lawyer = {
  name: string;
  location: string;
  phone?: string | null;
  email?: string | null;
  categories: string[];
  court_levels: string[];
  coords: [number, number];
};

const CopyableContactItem = ({ icon: Icon, text, type }: { icon: any, text: string, type: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`Copied ${type} to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="flex items-center justify-between gap-1.5 group/copy hover:bg-muted/50 p-1 -m-1 rounded-md cursor-pointer transition-colors"
      onClick={handleCopy}
      title={`Copy ${type}`}
    >
      <div className="flex items-start gap-1.5 overflow-hidden">
        <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground group-hover/copy:text-foreground transition-colors" />
        <span className="truncate">{text}</span>
      </div>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover/copy:opacity-100 transition-opacity text-muted-foreground" />
      )}
    </div>
  );
};

const LAWYERS: Lawyer[] = [
  { name: "Amir Law Associates", location: "203 Concord Tower, 113 Kazi Nazrul Islam Avenue, Dhaka-1000",
    phone: "+880241030148", email: "info@aalabd.com",
    categories: ["Family","Criminal","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property","Banking and finance"],
    court_levels: ["Supreme Court","High Court","District Court","Family Court"], coords: [23.7378, 90.4015] },
  { name: "Sameer Sattar (Sattar & Co.)", location: "Unit E3, House No. 1/A, Road No. 35, Gulshan 2, Dhaka 1212",
    phone: "+8801711432101", email: "ssattar@sattarandco.com",
    categories: ["Family","Property and land","Corporate and commercial","Labour and employment","Intellectual property","Banking and finance"],
    court_levels: ["High Court","District Court"], coords: [23.7937, 90.4066] },
  { name: "Sara Hossain", location: "Dr. Kamal Hossain & Associates, 122-124 Motijheel C/A, Dhaka-1000",
    phone: "880-2-955-2946", email: "shossain@khossain.com",
    categories: ["Family","Writ and constitutional"],
    court_levels: ["Supreme Court","High Court","Family Court"], coords: [23.7331, 90.4172] },
  { name: "Syeda Shirin Akter", location: "Bar Hall No-2, Judges Court, Sylhet",
    phone: "01711941406", email: "sdbarassociation2011@gmail.com",
    categories: ["Family","Criminal","Property and land","Labour and employment","Tax and customs"],
    court_levels: ["District Court","Family Court"], coords: [24.8949, 91.8687] },
  { name: "Tahmina Akter", location: "16/2 Hassemi Street, Kotwali, Dhaka",
    phone: "+8801711246893", email: "tahmina.akter.law@gmail.com",
    categories: ["Family","Criminal"],
    court_levels: ["Family Court","District Court"], coords: [23.7104, 90.4074] },
  { name: "Jahangir and Associates", location: "Room No.105 (Ground Floor) Annex Building, Supreme Court Bar Association, Dhaka 1000",
    phone: "01714-022369", email: "jahangirkabir1963@gmail.com",
    categories: ["Family","Criminal","Property and land","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property","Banking and finance"],
    court_levels: ["Supreme Court","High Court","District Court"], coords: [23.7297, 90.4023] },
  { name: "Karim & Associates", location: "Room No.5015 Annex Building, Bangladesh Supreme Court Bar Association, Shahbag, Dhaka",
    phone: "01712-878052", email: "karimandassociates@gmail.com",
    categories: ["Family","Criminal","Property and land","Corporate and commercial","Labour and employment","Intellectual property","Banking and finance"],
    court_levels: ["High Court","District Court"], coords: [23.7333, 90.4145] },
  { name: "Stellar Chambers", location: "Room No.5015 Annex Building, Bangladesh Supreme Court Bar Association, Shahbag, Dhaka",
    phone: "01842-138642", email: "info@stellarchambers.com",
    categories: ["Family","Criminal","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property"],
    court_levels: ["Supreme Court","High Court"], coords: [23.8059, 90.4194] },
  { name: "Accord Chambers", location: "Eastern Antik (Suite 101), House 155, Road 4, Niketan, Gulshan, Dhaka-1212",
    phone: "+8809678167167", email: "assistance@accordchambers.com",
    categories: ["Family","Criminal","Property and land","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property","Arbitration and mediation"],
    court_levels: ["High Court","District Court","Tribunal"], coords: [23.7807, 90.4143] },
  { name: "Old Bailey Chambers", location: "House-145, Road-03, Block-A, Niketan, Gulshan-1, Dhaka 1212",
    phone: "01712-7444888", email: "mishbah@oldbaileybd.com",
    categories: ["Family","Criminal","Property and land","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property"],
    court_levels: ["High Court","District Court"], coords: [23.7925, 90.4155] },
  { name: "R & R Law Partners", location: "Bokaul Mansion (3rd Floor), 42/1/Kha, Segunbagicha, Dhaka-1000",
    phone: "01818-086294", email: "info@mrlawpartners.com",
    categories: ["Family","Corporate and commercial","Labour and employment","Intellectual property"],
    court_levels: ["High Court","District Court"], coords: [23.7372, 90.4082] },
  { name: "FM Associates", location: "87 New Eskaton, 16th Floor, Hometown Commercial Complex, Ramna, Dhaka-1000",
    phone: "880-2-8313311", email: "Dhaka@fma.com.bd",
    categories: ["Family","Criminal","Property and land","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property","Banking and finance"],
    court_levels: ["High Court","District Court","Labour Court","Tribunal"], coords: [23.7820, 90.4128] },
  { name: "The Law Counsel", location: "City Heart (14th Floor), Suite #15/1, 67 Naya Paltan, Dhaka 1000",
    phone: "880-2-934-9648", email: "info@thelcounsel.com",
    categories: ["Family","Criminal","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property","Banking and finance"],
    court_levels: ["High Court","District Court"], coords: [23.7359, 90.4146] },
  { name: "Sadat Sarwat & Associates", location: "House # 28 (Ground Floor), Road # 23, Gulshan 1, Dhaka 1212",
    phone: "880-2-985-0355", email: "sadatandsarwat@gmail.com",
    categories: ["Family","Criminal","Property and land","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property","Banking and finance"],
    court_levels: ["High Court","District Court"], coords: [23.7806, 90.4170] },
  { name: "Rashel's Law Desk", location: "57/12, Sonargaon Plaza (3rd Floor), East Rajabazar, West Panthapath, Dhaka 1215",
    phone: "01777-402549", email: "rashel.siddiqui@gmail.com",
    categories: ["Family","Criminal","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property","Banking and finance"],
    court_levels: ["District Court","Family Court","Tribunal"], coords: [23.7325, 90.4131] },
  { name: "Jural Acuity", location: "Apt #A2, House #31, Road #04, Block #F, Banani, Dhaka 1213",
    phone: "880-2-984-4200", email: "sakib@juralacuity.com",
    categories: ["Family","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property"],
    court_levels: ["High Court","District Court"], coords: [23.7945, 90.4035] },
  { name: "The Legal Era", location: "Zaman Tower, Level-10, Suite-1103, 37/2 Culvert Road, Purana Paltan, Dhaka 1000",
    phone: "880-1717-514174", email: "salequzzaman@thelegalera.com",
    categories: ["Family","Criminal","Property and land","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property","Banking and finance"],
    court_levels: ["High Court","District Court","Family Court"], coords: [23.7330, 90.4128] },
  { name: "Russel & Partners", location: "Blue Lobelia, Flat C6, House-26, Road-34, Gulshan-02, Dhaka",
    phone: "8801717252185", email: "info@russelpartners.com",
    categories: ["Family","Criminal","Property and land","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property","Banking and finance"],
    court_levels: ["High Court","District Court"], coords: [23.7960, 90.4072] },
  { name: "Forum Law Partners", location: "Unit A-1, House - 4B, Road-62, Gulshan-2, Dhaka-1212",
    phone: "+880248814457", email: "ahnaf@forumlawbd.com",
    categories: ["Family","Criminal","Property and land","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property","Banking and finance"],
    court_levels: ["High Court","District Court"], coords: [23.7368, 90.4148] },
  { name: "M.R.I. Chowdhury & Associates", location: "House 51/D, Road 01, Nishan Bhaban (Ground Floor) Amirbag R/A, Mehedibag, Chittagong 4000",
    phone: "01841-212225", email: "mrichowdhury@gmail.com",
    categories: ["Family","Criminal","Property and land","Corporate and commercial","Writ and constitutional","Tax and customs","Intellectual property"],
    court_levels: ["High Court","District Court","Family Court"], coords: [22.3569, 91.8317] },
  { name: "Azad & Associate", location: "House Number-25, Sylhet, Bangladesh",
    phone: "+8801711920186", email: "advocateazad@gmail.com",
    categories: ["Criminal","Labour and employment","Intellectual property"],
    court_levels: ["District Court","Labour Court"], coords: [23.7305, 90.4096] },
  { name: "Irfanuzzaman Chowdhury", location: "Hall no 2, 3rd Floor, District BAR Association, Judges Court, Sylhet",
    phone: "01715236969", email: "irfan.chowdhury.law@gmail.com",
    categories: ["Criminal"],
    court_levels: ["District Court"], coords: [24.8978, 91.8714] },
  { name: "Junayed Adel & Associates", location: "Adel Plaza, 5th Floor, 1/1 Lalmatia, Block-A, Dhaka-1207",
    phone: "+8801713062542", email: "junayed.adel@gmail.com",
    categories: ["Criminal","Property and land","Corporate and commercial","Labour and employment"],
    court_levels: ["High Court","District Court"], coords: [23.7461, 90.3742] },
  { name: "Bangladesh Mahila Parishad", location: "Sufia Kamal Bhaban, 10/B/1, Segunbagicha, Dhaka-1000",
    phone: "01710877675", email: "mparishad@gmail.com",
    categories: ["Criminal","Family"],
    court_levels: ["District Court","Family Court"], coords: [23.7378, 90.4078] },
  { name: "Ace Advisory", location: "Suite#5 (7th floor), Akram Tower, 15/5 Bijoynagar, Dhaka-1000",
    phone: "+008801709634143", email: "info@aceadvisory.biz",
    categories: ["Criminal","Property and land","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property","Banking and finance"],
    court_levels: ["Tribunal","District Court"], coords: [23.7925, 90.4078] },
  { name: "Dr. Kamal Hossain & Associates", location: "Chamber Building (2nd Floor), 122-124 Motijheel C/A, Dhaka 1000",
    phone: "880-2-955-2946", email: "khossain@citechco.net",
    categories: ["Criminal","Property and land","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property","Banking and finance"],
    court_levels: ["Supreme Court","High Court"], coords: [23.7331, 90.4172] },
  { name: "Shihab Khan & Co", location: "97/C (Ground Floor), Green Road, Farmgate, Dhaka 1215",
    phone: "01711027127", email: "shihab.khan.law@gmail.com",
    categories: ["Criminal","Property and land","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property","Banking and finance"],
    court_levels: ["High Court","District Court"], coords: [23.7327, 90.4133] },
  { name: "Mahbub & Company", location: "House-37, Road-12/A, Flat-E/1, Dhanmondi, Dhaka 1209",
    phone: "01725-150912", email: "contact@mahbub-law.com",
    categories: ["Criminal","Corporate and commercial","Tax and customs","Intellectual property","Banking and finance"],
    court_levels: ["High Court","District Court"], coords: [23.7339, 90.4180] },
  { name: "Ahammad Jonaed & Partners", location: "Suite #B1, Plot #11/A-1, Road #41, Gulshan 2, Dhaka 1212",
    phone: "01962-000999", email: "info@ahammad-jonaed.com",
    categories: ["Criminal","Property and land","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property","Banking and finance"],
    court_levels: ["High Court","District Court"], coords: [23.7370, 90.4085] },
  { name: "Kazi Law Chamber", location: "Meherba Plaza, Suit # 12-J+H (12th Floor) 33, Topkhana Road, Dhaka-1200",
    phone: "+8801711540084", email: "info@kazilawchamber.com",
    categories: ["Criminal","Corporate and commercial","Labour and employment","Tax and customs","Intellectual property","Banking and finance"],
    court_levels: ["District Court","Tribunal"], coords: [23.7307, 90.4099] },
  { name: "Orr, Dignam & Co", location: "Shajan Tower - 2 (1st Floor), Office No. 101-104, 3, Segun Bagicha, Dhaka-1000",
    phone: "+880-2-9563950", email: "dignior@bangla.net",
    categories: ["Corporate and commercial","Labour and employment","Intellectual property","Banking and finance"],
    court_levels: ["High Court","District Court"], coords: [23.7375, 90.4080] },
  { name: "Chowdhury Ataur Rahman", location: "Sylhet, Bangladesh",
    phone: "+8801711920186", email: "advocateazad@gmail.com",
    categories: ["Corporate and commercial"],
    court_levels: ["High Court"], coords: [23.7320, 90.4165] },
  { name: "Hoque and Chowdhury Associates", location: "Room No. 334 Supreme Court Bar Association (Main Building), 2nd Floor, Shahbagh, Dhaka",
    phone: "01552-377092", email: "thirdeye2050@gmail.com",
    categories: ["Corporate and commercial","Writ and constitutional","Intellectual property","Banking and finance"],
    court_levels: ["High Court","Supreme Court"], coords: [23.7299, 90.4025] },
  { name: "Rahman's Chambers", location: "House 2, Road 02/03, Flat# 2A 2nd Floor, Chairman Bari, Banani, Dhaka-1213",
    phone: "880-2-8815415", email: "info@rahmansc.com",
    categories: ["Property and land","Corporate and commercial","Labour and employment","Tax and customs","Banking and finance"],
    court_levels: ["High Court","Labour Court","Tribunal"], coords: [23.8057, 90.4192] },
  { name: "Legality", location: "A 13, Navana FH Solaris, 65, Bijoy Nagar, Dhaka 1000",
    phone: "+8801713028066", email: "faisal@legalitybd.com",
    categories: ["Corporate and commercial","Labour and employment","Tax and customs","Banking and finance"],
    court_levels: ["High Court","District Court"], coords: [23.8743, 90.3974] },
  { name: "Bangladesh International Arbitration Centre (BIAC)", location: "Unique Heights (13th floor), 117 Kazi Nazrul Islam Avenue, Dhaka-1217",
    phone: "880-2-964-1071", email: "info@biac.org.bd",
    categories: ["Arbitration and mediation"],
    court_levels: ["Tribunal"], coords: [23.7385, 90.4012] },
];

const ALL_CATEGORIES = Array.from(
  new Set(LAWYERS.flatMap((l) => l.categories))
).sort();

const ALL_COURT_LEVELS = Array.from(
  new Set(LAWYERS.flatMap((l) => l.court_levels))
).sort();

const ANY = "__any__";

export default function FindLawyer() {
  const [category, setCategory] = useState<string>(ANY);
  const [courtLevel, setCourtLevel] = useState<string>(ANY);
  const [activeName, setActiveName] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return LAWYERS.filter((l) => {
      const cOk = category === ANY || l.categories.includes(category);
      const jOk = courtLevel === ANY || l.court_levels.includes(courtLevel);
      return cOk && jOk;
    });
  }, [category, courtLevel]);

  // Map setup
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const popupsRef = useRef<Map<string, any>>(new Map());
  const [mapReady, setMapReady] = useState(false);

  // Key is base64-encoded for light obfuscation — not a security boundary
  const BARIKOI_KEY = atob("YmtvaV82ZWYyNDJhNDlhOTYwNTg3ODA5NTczNTVkZmEyNjZiMjU4YmZmODNiMWE1NzI2MmY3Y2M0YzBjMDM1ZmVmNTgw");

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = new bkoigl.Map({
      container: mapRef.current,
      style: "https://map.barikoi.com/styles/barikoi-light/style.json",
      // Barikoi uses [longitude, latitude] order
      center: [90.4060, 23.7600],
      zoom: 11,
      accessToken: BARIKOI_KEY,
    });

    // Add zoom + compass controls
    map.addControl(new bkoigl.NavigationControl(), "top-right");

    mapInstance.current = map;

    // Only allow markers to be added once the style has fully loaded
    map.on("load", () => {
      console.log("Barikoi map loaded");
      setMapReady(true);
    });

    // Cleanup on unmount
    return () => {
      map.remove();
      mapInstance.current = null;
      setMapReady(false);
    };
  }, [BARIKOI_KEY]);

  // Update markers whenever the filtered list changes — but only after map is ready
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapReady) {
      console.log("Waiting for map...", { map: !!map, mapReady });
      return;
    }

    console.log("Adding markers for", filtered.length, "lawyers");

    // Remove existing markers and popups
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();
    popupsRef.current.clear();

    filtered.forEach((l, i) => {
      // Custom numbered pin element
      const el = document.createElement("div");
      el.className = "lawyer-pin";
      el.innerHTML = `<span>${i + 1}</span>`;

      const popup = new bkoigl.Popup({ offset: 25, closeButton: true })
        .setHTML(
          `<div style="font-family:system-ui,sans-serif;min-width:200px;padding:4px 2px">
            <div style="font-weight:700;font-size:15px;margin-bottom:4px">${l.name}</div>
            <div style="color:#475569;font-size:12px;margin-bottom:4px">${l.location}</div>
            ${l.phone ? `<div style="color:#475569;font-size:12px;margin-bottom:2px">📞 ${l.phone}</div>` : ""}
            ${l.email ? `<div style="color:#475569;font-size:12px">✉️ ${l.email}</div>` : ""}
          </div>`
        );

      // Barikoi coords: [longitude, latitude]
      const marker = new bkoigl.Marker({ element: el })
        .setLngLat([l.coords[1], l.coords[0]])
        .setPopup(popup)
        .addTo(map);

      marker.getElement().addEventListener("click", () => setActiveName(l.name));

      markersRef.current.set(l.name, marker);
      popupsRef.current.set(l.name, popup);
    });

    // Fit map to show all filtered markers
    if (filtered.length > 0) {
      const lngs = filtered.map((l) => l.coords[1]);
      const lats = filtered.map((l) => l.coords[0]);
      const bounds: any = [
        [Math.min(...lngs), Math.min(...lats)], // SW
        [Math.max(...lngs), Math.max(...lats)], // NE
      ];
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, animate: true });
    }
  }, [filtered, mapReady]);

  const focusLawyer = (l: Lawyer) => {
    setActiveName(l.name);
    const map = mapInstance.current;
    const marker = markersRef.current.get(l.name);
    if (map && marker) {
      // Barikoi flyTo uses {center: [lng, lat]}
      map.flyTo({ center: [l.coords[1], l.coords[0]], zoom: 15, duration: 600 });
      marker.togglePopup();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden pt-6">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="ambient-blob"
          style={{ width: 520, height: 520, top: -120, left: -100, background: "radial-gradient(circle, oklch(0.85 0.12 148), transparent 70%)" }}
        />
        <div
          className="ambient-blob"
          style={{ width: 460, height: 460, top: 200, right: -120, background: "radial-gradient(circle, oklch(0.88 0.1 170), transparent 70%)", animationDelay: "4s" }}
        />
      </div>

      {/* Hero + filters */}
      <section className="mx-auto max-w-7xl px-6 pt-6 pb-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4 -ml-3 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Homepage
          </Button>
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-3xl" style={{fontFamily: "'Playfair Display', serif"}}>
          Find the right <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400">lawyer</span> in Bangladesh.
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Filter by practice area and court jurisdiction to discover qualified legal counsel — mapped across Dhaka.
        </p>

        <div
          className="mt-7 grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-[1fr_1fr_auto] md:p-5 shadow-sm"
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Practice Area
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-primary" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-ring"
              >
                <option value={ANY}>Any practice area</option>
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Jurisdiction
            </label>
            <div className="relative">
              <Scale className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-primary" />
              <select
                value={courtLevel}
                onChange={(e) => setCourtLevel(e.target.value)}
                className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-ring"
              >
                <option value={ANY}>Any jurisdiction</option>
                {ALL_COURT_LEVELS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-end">
            <Button
              size="lg"
              className="h-11 w-full md:w-auto px-6"
              onClick={() => { setCategory(ANY); setCourtLevel(ANY); }}
              variant="default"
            >
              <Search className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold">
            {filtered.length} {filtered.length === 1 ? "match" : "matches"}
          </h2>
          <span className="text-sm text-muted-foreground">
            {category !== ANY && <Badge variant="outline" className="mr-2">{category}</Badge>}
            {courtLevel !== ANY && <Badge variant="outline">{courtLevel}</Badge>}
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          {/* Map */}
          <div
            className="relative h-[560px] overflow-hidden rounded-2xl border border-border shadow-md"
          >
            <div ref={mapRef} className="absolute inset-0" />
          </div>

          {/* List */}
          <div className="h-[560px] overflow-y-auto rounded-2xl border border-border bg-card/60 backdrop-blur p-3 space-y-3">
            {filtered.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center px-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-4 font-semibold">No lawyers match your filters</p>
                <p className="mt-1 text-sm text-muted-foreground">Try broadening your selection.</p>
              </div>
            )}
            {filtered.map((l, i) => {
              const active = activeName === l.name;
              return (
                <button
                  key={l.name}
                  onClick={() => focusLawyer(l)}
                  className={`group w-full text-left rounded-xl border p-4 transition-all ${
                    active
                      ? "border-primary bg-accent/60 shadow-md"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-primary-foreground bg-primary"
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {l.name}
                        </h3>
                      </div>
                      <div className="mt-1.5 flex flex-col gap-1.5 text-sm text-muted-foreground">
                        <div className="flex items-start gap-1.5 p-1 -m-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{l.location}</span>
                        </div>
                        {l.phone && (
                          <CopyableContactItem icon={Phone} text={l.phone} type="phone number" />
                        )}
                        {l.email && (
                          <CopyableContactItem icon={Mail} text={l.email} type="email address" />
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {l.court_levels.map((c) => (
                          <Badge key={c} variant="secondary" className="text-[10px] font-medium">
                            {c}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {l.categories.slice(0, 4).map((c) => (
                          <span key={c} className="text-[11px] text-muted-foreground">• {c}</span>
                        ))}
                        {l.categories.length > 4 && (
                          <span className="text-[11px] text-muted-foreground">+{l.categories.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
