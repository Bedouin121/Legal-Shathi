export const LAW_CATEGORIES = [
  "Constitutional Law",
  "Labour & Employment",
  "Property & Land",
  "Commercial Law",
  "Family Law",
  "Criminal Procedure",
];

// Simplified, searchable summaries (demo content).
// Not an official legal translation—verify with the official text / a lawyer.
export const lawSections = [
  // Constitutional Law (10)
  {
    id: "const-01",
    category: "Constitutional Law",
    code: "CONST-01",
    titleEn: "Supremacy of the Constitution (Concept)",
    titleBn: "সংবিধানের সর্বোচ্চতা (ধারণা)",
    summaryEn: "Constitution is the highest law; inconsistent laws/actions can be invalid.",
    summaryBn: "সংবিধান সর্বোচ্চ আইন; অসঙ্গত আইন/কর্ম অবৈধ হতে পারে।",
    contentEn:
      "If a rule or action conflicts with constitutional provisions, courts may strike the conflicting part. This supports rule of law and rights protection.",
    contentBn:
      "কোনো বিধি বা কার্যক্রম সংবিধানের সঙ্গে সংঘর্ষে গেলে আদালত অসঙ্গত অংশ বাতিল করতে পারে। এটি আইনের শাসন ও অধিকার সুরক্ষায় সহায়ক।",
    keywords: ["constitution", "supremacy", "সংবিধান", "সর্বোচ্চতা"],
  },
  {
    id: "const-02",
    category: "Constitutional Law",
    code: "CONST-02",
    titleEn: "Equality Before Law (Principle)",
    titleBn: "আইনের দৃষ্টিতে সমতা (নীতি)",
    summaryEn: "Equal protection under law; no arbitrary discrimination.",
    summaryBn: "আইনের সমান সুরক্ষা; ইচ্ছামতো বৈষম্য নয়।",
    contentEn:
      "State action should be non-arbitrary. Reasonable classification may be allowed when it has a legitimate purpose and clear criteria.",
    contentBn:
      "রাষ্ট্রের কার্যক্রম ইচ্ছামতো হওয়া উচিত নয়। বৈধ উদ্দেশ্য ও স্পষ্ট মানদণ্ড থাকলে যুক্তিসঙ্গত শ্রেণিবিভাগ গ্রহণযোগ্য হতে পারে।",
    keywords: ["equality", "discrimination", "সমতা", "বৈষম্য"],
  },
  {
    id: "const-03",
    category: "Constitutional Law",
    code: "CONST-03",
    titleEn: "Freedom of Speech (Limits)",
    titleBn: "মতপ্রকাশের স্বাধীনতা (সীমা)",
    summaryEn: "Speech is protected but may be restricted by law for specific reasons.",
    summaryBn: "মতপ্রকাশ সুরক্ষিত, তবে নির্দিষ্ট কারণে আইনে সীমাবদ্ধ হতে পারে।",
    contentEn:
      "Restrictions may relate to public order, defamation, contempt of court, morality, or security, depending on the legal framework.",
    contentBn:
      "প্রযোজ্য কাঠামো অনুযায়ী জনশৃঙ্খলা, মানহানি, আদালত অবমাননা, নৈতিকতা বা নিরাপত্তার কারণে সীমাবদ্ধতা থাকতে পারে।",
    keywords: ["speech", "press", "মতপ্রকাশ", "মানহানি"],
  },
  {
    id: "const-04",
    category: "Constitutional Law",
    code: "CONST-04",
    titleEn: "Life & Personal Liberty (Due Process)",
    titleBn: "জীবন ও ব্যক্তিস্বাধীনতা (আইনানুগ প্রক্রিয়া)",
    summaryEn: "Liberty should not be taken except by lawful procedure.",
    summaryBn: "আইনসম্মত প্রক্রিয়া ছাড়া স্বাধীনতা হরণ নয়।",
    contentEn:
      "Arrest/detention should follow legal procedure. Courts may review whether actions were lawful, fair, and proportionate.",
    contentBn:
      "গ্রেপ্তার/আটক আইনসম্মত প্রক্রিয়ায় হতে হবে। আদালত বৈধতা, ন্যায্যতা ও আনুপাতিকতা পর্যালোচনা করতে পারে।",
    keywords: ["due process", "detention", "আইনানুগ প্রক্রিয়া", "আটক"],
  },
  {
    id: "const-05",
    category: "Constitutional Law",
    code: "CONST-05",
    titleEn: "Writ Remedies (Overview)",
    titleBn: "রিট প্রতিকার (সংক্ষিপ্ত)",
    summaryEn: "Courts can issue writs to control unlawful public action.",
    summaryBn: "অবৈধ সরকারি কার্যক্রম নিয়ন্ত্রণে আদালত রিট দিতে পারে।",
    contentEn:
      "Writ-type remedies can include directions to perform duties, stop unlawful acts, or release someone from unlawful detention.",
    contentBn:
      "রিট প্রতিকারে দায়িত্ব পালনের নির্দেশ, অবৈধ কাজ বন্ধের আদেশ, বা অবৈধ আটক থেকে মুক্তির আদেশ থাকতে পারে।",
    keywords: ["writ", "public authority", "রিট", "হাইকোর্ট"],
  },
  {
    id: "const-06",
    category: "Constitutional Law",
    code: "CONST-06",
    titleEn: "Separation of Powers (Idea)",
    titleBn: "ক্ষমতার বিভাজন (ধারণা)",
    summaryEn: "Different branches have different roles to prevent abuse.",
    summaryBn: "অপব্যবহার রোধে শাখাভেদে আলাদা ভূমিকা থাকে।",
    contentEn:
      "Legislature makes laws, executive implements, judiciary interprets. Checks and balances reduce concentration of power.",
    contentBn:
      "আইনসভা আইন প্রণয়ন করে, নির্বাহী বাস্তবায়ন করে, বিচার বিভাগ ব্যাখ্যা করে। চেকস অ্যান্ড ব্যালান্স ক্ষমতার কেন্দ্রীকরণ কমায়।",
    keywords: ["separation", "judiciary", "ক্ষমতার বিভাজন"],
  },
  {
    id: "const-07",
    category: "Constitutional Law",
    code: "CONST-07",
    titleEn: "Parliamentary Law-Making (High Level)",
    titleBn: "সংসদীয় আইন প্রণয়ন (সংক্ষিপ্ত)",
    summaryEn: "Bills pass steps (debate/vote) to become law.",
    summaryBn: "বিল আলোচনা/ভোটসহ ধাপ পার হয়ে আইন হয়।",
    contentEn:
      "Bills are introduced, debated, amended, and voted on. Assent/publication requirements depend on the legal system.",
    contentBn:
      "বিল উত্থাপন, আলোচনা, সংশোধন ও ভোটের ধাপ পেরোয়। সম্মতি/প্রকাশনার বিধান আইনব্যবস্থাভেদে ভিন্ন।",
    keywords: ["bill", "parliament", "বিল", "সংসদ"],
  },
  {
    id: "const-08",
    category: "Constitutional Law",
    code: "CONST-08",
    titleEn: "Fundamental Rights vs Policy Principles",
    titleBn: "মৌলিক অধিকার বনাম নীতিমালা",
    summaryEn: "Rights are enforceable; principles guide governance.",
    summaryBn: "অধিকার প্রয়োগযোগ্য; নীতিমালা শাসনে নির্দেশক।",
    contentEn:
      "Fundamental rights protect individuals directly. Directive principles guide the state and may influence interpretation and legislation.",
    contentBn:
      "মৌলিক অধিকার ব্যক্তি সুরক্ষা দেয়। নীতিমালা রাষ্ট্রকে নির্দেশনা দেয় এবং আইন ব্যাখ্যা/প্রণয়নে প্রভাব ফেলতে পারে।",
    keywords: ["fundamental rights", "directive", "মৌলিক অধিকার", "নীতিমালা"],
  },
  {
    id: "const-09",
    category: "Constitutional Law",
    code: "CONST-09",
    titleEn: "Emergency Powers (Safeguards)",
    titleBn: "জরুরি ক্ষমতা (সুরক্ষা)",
    summaryEn: "Special powers may apply with limits and oversight.",
    summaryBn: "বিশেষ ক্ষমতা সীমা ও নজরদারিসহ প্রযোজ্য হতে পারে।",
    contentEn:
      "Emergency measures are usually time-limited and reviewable. Oversight and proportionality are key safeguards.",
    contentBn:
      "জরুরি ব্যবস্থা সাধারণত সময়সীমাবদ্ধ ও পর্যালোচনাযোগ্য। নজরদারি ও আনুপাতিকতা গুরুত্বপূর্ণ সুরক্ষা।",
    keywords: ["emergency", "oversight", "জরুরি", "নজরদারি"],
  },
  {
    id: "const-10",
    category: "Constitutional Law",
    code: "CONST-10",
    titleEn: "Local Government (Basics)",
    titleBn: "স্থানীয় সরকার (মূল বিষয়)",
    summaryEn: "Local bodies provide services closer to citizens.",
    summaryBn: "স্থানীয় প্রতিষ্ঠান জনগণের নিকটে সেবা দেয়।",
    contentEn:
      "Local government powers, finance, and elections are set by law. Accountability mechanisms can include audits and oversight.",
    contentBn:
      "স্থানীয় সরকারের ক্ষমতা, অর্থায়ন ও নির্বাচন আইন নির্ধারণ করে। জবাবদিহিতে অডিট/নজরদারি থাকতে পারে।",
    keywords: ["local government", "municipal", "স্থানীয় সরকার"],
  },

  // Constitutional Law (extra)
  {
    id: "const-11",
    category: "Constitutional Law",
    code: "CONST-11",
    titleEn: "Rule of Law (Meaning)",
    titleBn: "আইনের শাসন (অর্থ)",
    summaryEn: "Government and citizens are bound by law; arbitrary power is limited.",
    summaryBn: "রাষ্ট্র ও নাগরিক আইন দ্বারা আবদ্ধ; ইচ্ছামতো ক্ষমতা সীমিত।",
    contentEn:
      "Rule of law emphasizes legality, fairness, and equality. Decisions should be made under known rules, with accountability and access to justice.",
    contentBn:
      "আইনের শাসন মানে বৈধতা, ন্যায্যতা ও সমতার ভিত্তিতে সিদ্ধান্ত। সিদ্ধান্ত পরিচিত বিধি অনুযায়ী হবে, জবাবদিহি ও ন্যায়বিচারের সুযোগ থাকবে।",
    keywords: ["rule of law", "legality", "আইনের শাসন", "বৈধতা"],
  },
  {
    id: "const-12",
    category: "Constitutional Law",
    code: "CONST-12",
    titleEn: "Judicial Review (Concept)",
    titleBn: "বিচারিক পর্যালোচনা (ধারণা)",
    summaryEn: "Courts can review legality/constitutionality of public actions.",
    summaryBn: "আদালত সরকারি সিদ্ধান্তের বৈধতা/সংবিধানসম্মততা পর্যালোচনা করতে পারে।",
    contentEn:
      "Judicial review helps prevent unlawful actions by public bodies. It often looks at authority, procedure, reasonableness, and rights impacts.",
    contentBn:
      "বিচারিক পর্যালোচনা সরকারি সংস্থার অবৈধ কাজ রোধে সহায়ক। ক্ষমতা, প্রক্রিয়া, যুক্তিসঙ্গততা ও অধিকার-প্রভাব বিবেচনা করা হয়।",
    keywords: ["judicial review", "public action", "বিচারিক পর্যালোচনা", "সংবিধান"],
  },
  {
    id: "const-13",
    category: "Constitutional Law",
    code: "CONST-13",
    titleEn: "Right to Information (Practical)",
    titleBn: "তথ্য জানার অধিকার (ব্যবহারিক)",
    summaryEn: "Citizens may request public information through a defined process.",
    summaryBn: "নাগরিক নির্ধারিত প্রক্রিয়ায় সরকারি তথ্য চাইতে পারে।",
    contentEn:
      "Use the designated authority/channel to request records. Some exceptions may apply (privacy, security, ongoing investigations).",
    contentBn:
      "নির্ধারিত কর্তৃপক্ষ/চ্যানেলে আবেদন করুন। কিছু ব্যতিক্রম থাকতে পারে (গোপনীয়তা, নিরাপত্তা, চলমান তদন্ত)।",
    keywords: ["information", "RTI", "তথ্য", "অধিকার"],
  },
  {
    id: "const-14",
    category: "Constitutional Law",
    code: "CONST-14",
    titleEn: "Administrative Fairness (Natural Justice)",
    titleBn: "প্রশাসনিক ন্যায্যতা (প্রাকৃতিক বিচারনীতি)",
    summaryEn: "Hear both sides; unbiased decision-making in public administration.",
    summaryBn: "উভয় পক্ষকে শোনা; পক্ষপাতহীন সিদ্ধান্ত।",
    contentEn:
      "Fairness principles include notice, opportunity to be heard, and reasoned decisions. These reduce arbitrary administrative actions.",
    contentBn:
      "ন্যায্যতার নীতিতে নোটিশ, বক্তব্য দেওয়ার সুযোগ এবং কারণসহ সিদ্ধান্ত অন্তর্ভুক্ত। এগুলো প্রশাসনিক ইচ্ছাচার কমায়।",
    keywords: ["natural justice", "fair hearing", "ন্যায্যতা", "নোটিশ"],
  },
  {
    id: "const-15",
    category: "Constitutional Law",
    code: "CONST-15",
    titleEn: "Public Interest Litigation (PIL) (Overview)",
    titleBn: "জনস্বার্থ মামলা (পিআইএল) (সংক্ষিপ্ত)",
    summaryEn: "Some matters can be brought to court for broader public welfare.",
    summaryBn: "কিছু বিষয় জনকল্যাণের স্বার্থে আদালতে উত্থাপন করা যায়।",
    contentEn:
      "PIL-type cases often address environment, safety, and rights issues. Standing and procedure depend on the jurisdiction.",
    contentBn:
      "জনস্বার্থ মামলায় পরিবেশ, নিরাপত্তা ও অধিকারসংক্রান্ত বিষয় উঠতে পারে। গ্রহণযোগ্যতা ও প্রক্রিয়া আইনব্যবস্থাভেদে নির্ভর করে।",
    keywords: ["PIL", "public interest", "জনস্বার্থ", "মামলা"],
  },

  // Labour & Employment (8)
  {
    id: "lab-01",
    category: "Labour & Employment",
    code: "LAB-01",
    titleEn: "Employment Contract Essentials",
    titleBn: "চাকরির চুক্তির মূল বিষয়",
    summaryEn: "Role, pay, hours, benefits, and termination terms in writing.",
    summaryBn: "পদ, বেতন, সময়, সুবিধা ও চাকরি শেষের শর্ত লিখিত রাখা।",
    contentEn:
      "Include duties, probation, salary/allowances, leave, confidentiality, notice and final dues. Written terms reduce disputes.",
    contentBn:
      "দায়িত্ব, প্রোবেশন, বেতন-ভাতা, ছুটি, গোপনীয়তা, নোটিশ ও চূড়ান্ত পাওনা উল্লেখ করুন। লিখিত শর্ত বিরোধ কমায়।",
    keywords: ["employment", "contract", "চুক্তি", "নোটিশ"],
  },
  {
    id: "lab-02",
    category: "Labour & Employment",
    code: "LAB-02",
    titleEn: "Wages & Pay Slip Transparency",
    titleBn: "মজুরি ও পে-স্লিপ স্বচ্ছতা",
    summaryEn: "Pay on time; show deductions and allowances clearly.",
    summaryBn: "সময়মতো বেতন; কর্তন-ভাতা স্পষ্টভাবে দেখান।",
    contentEn:
      "Maintain wage records. Avoid unlawful deductions. Clear pay slips help prevent payroll disputes.",
    contentBn:
      "মজুরি রেকর্ড রাখুন। অবৈধ কর্তন এড়ান। স্পষ্ট পে-স্লিপ বেতন-বিরোধ কমায়।",
    keywords: ["wages", "pay slip", "মজুরি", "বেতন"],
  },
  {
    id: "lab-03",
    category: "Labour & Employment",
    code: "LAB-03",
    titleEn: "Working Hours & Overtime (Concept)",
    titleBn: "কর্মঘণ্টা ও ওভারটাইম (ধারণা)",
    summaryEn: "Track attendance; apply overtime rules where required.",
    summaryBn: "উপস্থিতি ট্র্যাক; প্রযোজ্য হলে ওভারটাইম বিধান প্রয়োগ।",
    contentEn:
      "Define hours, breaks, overtime rate, and approval flow. Keep logs for compliance and claims handling.",
    contentBn:
      "কর্মঘণ্টা, বিরতি, ওভারটাইম হার ও অনুমোদন প্রক্রিয়া নির্ধারণ করুন। সম্মতি ও দাবি ব্যবস্থায় রেকর্ড জরুরি।",
    keywords: ["overtime", "hours", "ওভারটাইম", "কর্মঘণ্টা"],
  },
  {
    id: "lab-04",
    category: "Labour & Employment",
    code: "LAB-04",
    titleEn: "Leave & Holidays (Overview)",
    titleBn: "ছুটি ও ছুটির দিন (সংক্ষিপ্ত)",
    summaryEn: "Annual, sick, casual, and festival leave depend on rules.",
    summaryBn: "বার্ষিক, অসুস্থতা, নৈমিত্তিক ও উৎসবের ছুটি বিধানসাপেক্ষ।",
    contentEn:
      "Keep a written leave policy: eligibility, accrual, approval, and carry-forward. Communicate clearly to staff.",
    contentBn:
      "লিখিত ছুটি নীতিমালা রাখুন: যোগ্যতা, জমা, অনুমোদন, বহন। কর্মীদের স্পষ্টভাবে জানান।",
    keywords: ["leave", "holiday", "ছুটি", "উৎসব"],
  },
  {
    id: "lab-05",
    category: "Labour & Employment",
    code: "LAB-05",
    titleEn: "Workplace Safety (Duty)",
    titleBn: "কর্মস্থলের নিরাপত্তা (দায়িত্ব)",
    summaryEn: "Provide safe conditions, training, and incident reporting.",
    summaryBn: "নিরাপদ পরিবেশ, প্রশিক্ষণ ও দুর্ঘটনা রিপোর্টিং নিশ্চিত করুন।",
    contentEn:
      "Use PPE, hazard controls, and safety training. Document incidents and corrective actions to reduce risk.",
    contentBn:
      "পিপিই, ঝুঁকি নিয়ন্ত্রণ ও নিরাপত্তা প্রশিক্ষণ দিন। দুর্ঘটনা ও সংশোধনী পদক্ষেপ নথিভুক্ত করুন।",
    keywords: ["safety", "PPE", "নিরাপত্তা", "পিপিই"],
  },
  {
    id: "lab-06",
    category: "Labour & Employment",
    code: "LAB-06",
    titleEn: "Disciplinary Process (Fairness)",
    titleBn: "শৃঙ্খলামূলক প্রক্রিয়া (ন্যায্যতা)",
    summaryEn: "Written allegation, chance to respond, inquiry, decision.",
    summaryBn: "লিখিত অভিযোগ, জবাব, তদন্ত, সিদ্ধান্ত।",
    contentEn:
      "Follow consistent procedure and keep records. Fair process reduces wrongful termination claims.",
    contentBn:
      "একই ধরনের প্রক্রিয়া অনুসরণ ও রেকর্ড সংরক্ষণ করুন। ন্যায্য প্রক্রিয়া ভুল বরখাস্তের অভিযোগ কমায়।",
    keywords: ["discipline", "inquiry", "শৃঙ্খলা", "তদন্ত"],
  },
  {
    id: "lab-07",
    category: "Labour & Employment",
    code: "LAB-07",
    titleEn: "Termination & Notice (Overview)",
    titleBn: "চাকরি শেষ ও নোটিশ (সংক্ষিপ্ত)",
    summaryEn: "Notice, final dues, and clearance should follow rules.",
    summaryBn: "নোটিশ, চূড়ান্ত পাওনা ও ক্লিয়ারেন্স বিধানমাফিক।",
    contentEn:
      "Document reasons and settlements. Ensure handover and return of company assets and access.",
    contentBn:
      "কারণ ও নিষ্পত্তি নথিভুক্ত করুন। হস্তান্তর এবং কোম্পানির সম্পদ/অ্যাক্সেস ফেরত নিশ্চিত করুন।",
    keywords: ["termination", "notice", "নোটিশ", "চাকরি শেষ"],
  },
  {
    id: "lab-08",
    category: "Labour & Employment",
    code: "LAB-08",
    titleEn: "Grievance Handling (Channel)",
    titleBn: "অভিযোগ নিষ্পত্তি (চ্যানেল)",
    summaryEn: "A complaint mechanism prevents escalation.",
    summaryBn: "অভিযোগ ব্যবস্থাপনা সমস্যা বড় হওয়া রোধ করে।",
    contentEn:
      "Use a simple flow: receive → investigate → decide → appeal. Protect complainants from retaliation.",
    contentBn:
      "সহজ ধাপ: গ্রহণ → তদন্ত → সিদ্ধান্ত → আপিল। অভিযোগকারীকে প্রতিশোধমূলক আচরণ থেকে রক্ষা করুন।",
    keywords: ["grievance", "complaint", "অভিযোগ", "আপিল"],
  },

  // Labour & Employment (extra)
  {
    id: "lab-09",
    category: "Labour & Employment",
    code: "LAB-09",
    titleEn: "Probation & Confirmation (Practice)",
    titleBn: "প্রোবেশন ও স্থায়ীকরণ (চর্চা)",
    summaryEn: "Define probation length, evaluation criteria, and confirmation process.",
    summaryBn: "প্রোবেশন মেয়াদ, মূল্যায়নের মানদণ্ড ও স্থায়ীকরণ প্রক্রিয়া নির্ধারণ।",
    contentEn:
      "State probation duration, performance review timing, and what happens if standards are not met (extension/termination). Provide written confirmation.",
    contentBn:
      "প্রোবেশন মেয়াদ, কর্মদক্ষতা মূল্যায়নের সময় এবং মানদণ্ড পূরণ না হলে কী হবে (বাড়ানো/শেষ) লিখুন। স্থায়ীকরণ লিখিতভাবে দিন।",
    keywords: ["probation", "confirmation", "প্রোবেশন", "স্থায়ীকরণ"],
  },
  {
    id: "lab-10",
    category: "Labour & Employment",
    code: "LAB-10",
    titleEn: "Harassment at Workplace (Steps)",
    titleBn: "কর্মস্থলে হয়রানি (করণীয়)",
    summaryEn: "Use complaint committee/channel; preserve evidence and ensure confidentiality.",
    summaryBn: "অভিযোগ কমিটি/চ্যানেল ব্যবহার; প্রমাণ সংরক্ষণ ও গোপনীয়তা নিশ্চিত।",
    contentEn:
      "Create a clear reporting pathway, conduct fair inquiry, protect complainants, and document outcomes. Provide awareness training.",
    contentBn:
      "স্পষ্ট রিপোর্টিং ব্যবস্থা, ন্যায্য তদন্ত, অভিযোগকারী সুরক্ষা এবং ফলাফল নথিভুক্ত করুন। সচেতনতামূলক প্রশিক্ষণ দিন।",
    keywords: ["harassment", "workplace", "হয়রানি", "অভিযোগ"],
  },
  {
    id: "lab-11",
    category: "Labour & Employment",
    code: "LAB-11",
    titleEn: "Maternity Leave (Overview)",
    titleBn: "মাতৃত্বকালীন ছুটি (সংক্ষিপ্ত)",
    summaryEn: "Eligibility, duration, and pay rules can apply by law/policy.",
    summaryBn: "আইন/নীতিমালা অনুযায়ী যোগ্যতা, মেয়াদ ও বেতন প্রযোজ্য হতে পারে।",
    contentEn:
      "Maintain medical documents and HR process for applying. Ensure non-discrimination during pregnancy and after return to work.",
    contentBn:
      "আবেদনে মেডিকেল কাগজ ও এইচআর প্রক্রিয়া রাখুন। গর্ভাবস্থা ও কাজে ফেরার পর বৈষম্য এড়ান।",
    keywords: ["maternity", "leave", "মাতৃত্ব", "ছুটি"],
  },
  {
    id: "lab-12",
    category: "Labour & Employment",
    code: "LAB-12",
    titleEn: "Provident Fund & Gratuity (Basics)",
    titleBn: "প্রভিডেন্ট ফান্ড ও গ্র্যাচুইটি (মূল বিষয়)",
    summaryEn: "Clarify contribution, vesting, and payout rules in writing.",
    summaryBn: "অংশদান, ভেস্টিং ও পরিশোধের নিয়ম লিখিতভাবে স্পষ্ট করুন।",
    contentEn:
      "Document PF policy, employer/employee contributions, withdrawal conditions, and settlement steps at separation.",
    contentBn:
      "পিএফ নীতিমালা, নিয়োগকর্তা/কর্মীর অংশ, উত্তোলন শর্ত এবং চাকরি শেষে নিষ্পত্তির ধাপ নথিভুক্ত করুন।",
    keywords: ["provident fund", "gratuity", "প্রভিডেন্ট", "গ্র্যাচুইটি"],
  },
  {
    id: "lab-13",
    category: "Labour & Employment",
    code: "LAB-13",
    titleEn: "Union & Collective Bargaining (Concept)",
    titleBn: "ট্রেড ইউনিয়ন ও সমষ্টিগত দরকষাকষি (ধারণা)",
    summaryEn: "Workers may organize; negotiation should follow lawful process.",
    summaryBn: "কর্মীরা সংগঠিত হতে পারে; দরকষাকষি আইনসম্মত প্রক্রিয়ায় হবে।",
    contentEn:
      "Maintain respectful communication and documented negotiations. Disputes may have conciliation/mediation steps under applicable rules.",
    contentBn:
      "সম্মানজনক যোগাযোগ ও দরকষাকষি নথিভুক্ত রাখুন। বিরোধে প্রযোজ্য বিধান অনুযায়ী মীমাংসা/মধ্যস্থতা ধাপ থাকতে পারে।",
    keywords: ["union", "bargaining", "ইউনিয়ন", "দরকষাকষি"],
  },

  // Property & Land (8)
  {
    id: "prop-01",
    category: "Property & Land",
    code: "PROP-01",
    titleEn: "Land Sale Agreement (Key Clauses)",
    titleBn: "জমি বিক্রয় চুক্তি (মূল শর্ত)",
    summaryEn: "Price, title, possession, and registration timeline.",
    summaryBn: "মূল্য, মালিকানা, দখল ও রেজিস্ট্রেশনের সময়সীমা।",
    contentEn:
      "Verify deed chain and records before paying. Include payment schedule and handover conditions in writing.",
    contentBn:
      "অর্থ দেওয়ার আগে দলিলের ধারাবাহিকতা ও রেকর্ড যাচাই করুন। পরিশোধ সময়সূচি ও দখল হস্তান্তর লিখিত রাখুন।",
    keywords: ["land", "registration", "জমি", "রেজিস্ট্রি", "দলিল"],
  },
  {
    id: "prop-02",
    category: "Property & Land",
    code: "PROP-02",
    titleEn: "Rental Agreement (What to Include)",
    titleBn: "ভাড়ার চুক্তি (কী থাকবে)",
    summaryEn: "Rent, deposit, utilities, notice, and restrictions.",
    summaryBn: "ভাড়া, জামানত, ইউটিলিটি, নোটিশ ও সীমাবদ্ধতা।",
    contentEn:
      "Clearly define duration, renewal, maintenance, subletting, and eviction/notice terms to reduce conflict.",
    contentBn:
      "মেয়াদ, নবায়ন, মেরামত, সাবলেট এবং উচ্ছেদ/নোটিশ শর্ত স্পষ্ট করলে বিরোধ কমে।",
    keywords: ["rent", "deposit", "ভাড়া", "জামানত"],
  },
  {
    id: "prop-03",
    category: "Property & Land",
    code: "PROP-03",
    titleEn: "Title Verification (Checklist)",
    titleBn: "মালিকানা যাচাই (চেকলিস্ট)",
    summaryEn: "Deed, mutation, khatian, taxes, encumbrances.",
    summaryBn: "দলিল, মিউটেশন, খতিয়ান, কর, বন্ধক।",
    contentEn:
      "Do registry search, check disputes, and confirm seller identity. Consider a legal opinion for high-value deals.",
    contentBn:
      "রেজিস্ট্রি সার্চ, বিরোধ যাচাই এবং বিক্রেতার পরিচয় নিশ্চিত করুন। বড় লেনদেনে আইনগত মতামত নিন।",
    keywords: ["title", "mutation", "khatian", "মালিকানা", "মিউটেশন", "খতিয়ান"],
  },
  {
    id: "prop-04",
    category: "Property & Land",
    code: "PROP-04",
    titleEn: "Mutation (Why Needed)",
    titleBn: "মিউটেশন (কেন দরকার)",
    summaryEn: "Updates land record for revenue/admin recognition.",
    summaryBn: "রাজস্ব/প্রশাসনিক স্বীকৃতির জন্য রেকর্ড হালনাগাদ।",
    contentEn:
      "Mutation supports tax payment and record accuracy. Keep mutation order and tax receipts with the deed.",
    contentBn:
      "মিউটেশন কর প্রদান ও রেকর্ড সঠিক রাখতে সহায়ক। মিউটেশন আদেশ ও কর রসিদ দলিলের সাথে রাখুন।",
    keywords: ["mutation", "tax", "মিউটেশন", "রাজস্ব"],
  },
  {
    id: "prop-05",
    category: "Property & Land",
    code: "PROP-05",
    titleEn: "Encumbrance (Mortgage/Lien)",
    titleBn: "দায়/বন্ধক (মর্টগেজ/লিয়েন)",
    summaryEn: "Hidden burdens reduce clear title; search registry.",
    summaryBn: "গোপন দায় মালিকানা ঝুঁকি; রেজিস্ট্রি সার্চ করুন।",
    contentEn:
      "Encumbrance can be mortgage, lien, court attachment, or dispute. Ask for clearance where needed.",
    contentBn:
      "দায় হতে পারে মর্টগেজ, লিয়েন, আদালতের জব্দ বা মামলা। প্রয়োজনে ক্লিয়ারেন্স নিন।",
    keywords: ["encumbrance", "mortgage", "বন্ধক", "লিয়েন"],
  },
  {
    id: "prop-06",
    category: "Property & Land",
    code: "PROP-06",
    titleEn: "Boundary Dispute (First Steps)",
    titleBn: "সীমানা বিরোধ (প্রাথমিক)",
    summaryEn: "Collect documents, maps, survey; try mediation.",
    summaryBn: "কাগজ, মানচিত্র, জরিপ; সমঝোতা চেষ্টা।",
    contentEn:
      "Keep records and photos. Consider survey/commission process and injunction options with legal advice.",
    contentBn:
      "রেকর্ড ও ছবি রাখুন। জরিপ/কমিশন প্রক্রিয়া ও ইনজাংশন বিষয়ে আইনগত পরামর্শ নিন।",
    keywords: ["boundary", "survey", "সীমানা", "জরিপ", "ইনজাংশন"],
  },
  {
    id: "prop-07",
    category: "Property & Land",
    code: "PROP-07",
    titleEn: "Co-ownership (Managing Shared Property)",
    titleBn: "যৌথ মালিকানা (ব্যবস্থাপনা)",
    summaryEn: "Write rules for use, costs, rent, and decisions.",
    summaryBn: "ব্যবহার, খরচ, ভাড়া ও সিদ্ধান্তের নিয়ম লিখিত করুন।",
    contentEn:
      "A simple written arrangement helps prevent conflict. Partition/sale may require consent or legal process.",
    contentBn:
      "লিখিত সমঝোতা বিরোধ কমায়। বণ্টন/বিক্রয়ে সম্মতি বা আইনি প্রক্রিয়া লাগতে পারে।",
    keywords: ["co-owner", "partition", "যৌথ মালিক", "বণ্টন"],
  },
  {
    id: "prop-08",
    category: "Property & Land",
    code: "PROP-08",
    titleEn: "Power of Attorney (Property)",
    titleBn: "পাওয়ার অব অ্যাটর্নি (সম্পত্তি)",
    summaryEn: "Give limited authority; avoid overly broad powers.",
    summaryBn: "সীমিত ক্ষমতা দিন; অতিরিক্ত বিস্তৃত ক্ষমতা এড়ান।",
    contentEn:
      "Set scope, validity, reporting, and revocation steps. Misuse risk is common—prefer specific powers.",
    contentBn:
      "কাজের সীমা, মেয়াদ, রিপোর্টিং ও বাতিলের পদ্ধতি দিন। অপব্যবহারের ঝুঁকি বেশি—নির্দিষ্ট ক্ষমতা দিন।",
    keywords: ["POA", "agent", "পাওয়ার অব অ্যাটর্নি", "এজেন্ট"],
  },

  // Property & Land (extra)
  {
    id: "prop-09",
    category: "Property & Land",
    code: "PROP-09",
    titleEn: "Gift Deed (Property Transfer)",
    titleBn: "হেবা/উপহার দলিল (সম্পত্তি হস্তান্তর)",
    summaryEn: "A gift transfers ownership without price; documentation and intent matter.",
    summaryBn: "মূল্য ছাড়া মালিকানা হস্তান্তর; দলিল ও অভিপ্রায় গুরুত্বপূর্ণ।",
    contentEn:
      "Describe property clearly, identify donor/donee, and state voluntary intent. Consider registration requirements and tax/fee implications.",
    contentBn:
      "সম্পত্তির বিবরণ, দাতা-গ্রহীতা পরিচয় এবং স্বেচ্ছা অভিপ্রায় উল্লেখ করুন। রেজিস্ট্রেশন বিধান ও কর/ফি প্রভাব বিবেচনা করুন।",
    keywords: ["gift deed", "transfer", "হেবা", "উপহার দলিল"],
  },
  {
    id: "prop-10",
    category: "Property & Land",
    code: "PROP-10",
    titleEn: "Partition Deed (Family Property)",
    titleBn: "বণ্টন দলিল (পারিবারিক সম্পত্তি)",
    summaryEn: "Divides joint property shares; boundaries and shares must be precise.",
    summaryBn: "যৌথ সম্পত্তি ভাগ; অংশ ও সীমানা নির্ভুল হতে হবে।",
    contentEn:
      "List co-owners, their shares, and allotted portions. Attach maps if possible and record consent and dispute resolution method.",
    contentBn:
      "যৌথ মালিক, তাদের অংশ এবং বরাদ্দ অংশ উল্লেখ করুন। সম্ভব হলে মানচিত্র যুক্ত করুন এবং সম্মতি/বিরোধ নিষ্পত্তি পদ্ধতি লিখুন।",
    keywords: ["partition", "joint property", "বণ্টন", "যৌথ সম্পত্তি"],
  },
  {
    id: "prop-11",
    category: "Property & Land",
    code: "PROP-11",
    titleEn: "Land Tax & Holding Records (Why Keep)",
    titleBn: "ভূমি কর ও হোল্ডিং রেকর্ড (কেন রাখবেন)",
    summaryEn: "Tax receipts help show possession and reduce future disputes.",
    summaryBn: "কর রসিদ দখল প্রমাণে সহায়ক ও বিরোধ কমায়।",
    contentEn:
      "Maintain up-to-date tax receipts and holding records. They support administrative processes like mutation and services.",
    contentBn:
      "হালনাগাদ কর রসিদ ও হোল্ডিং রেকর্ড রাখুন। মিউটেশন ও সেবামূলক কাজে এগুলো সহায়ক।",
    keywords: ["land tax", "holding", "ভূমি কর", "হোল্ডিং"],
  },
  {
    id: "prop-12",
    category: "Property & Land",
    code: "PROP-12",
    titleEn: "Eviction Notice (Rental) (Basics)",
    titleBn: "উচ্ছেদ নোটিশ (ভাড়া) (মূল বিষয়)",
    summaryEn: "Use written notice with dates, reason (if any), and handover steps.",
    summaryBn: "তারিখ, কারণ (যদি থাকে) ও হস্তান্তর ধাপসহ লিখিত নোটিশ দিন।",
    contentEn:
      "Follow contract terms and lawful procedure. Keep proof of service and communication. Try amicable settlement first.",
    contentBn:
      "চুক্তির শর্ত ও আইনসম্মত প্রক্রিয়া অনুসরণ করুন। নোটিশ প্রেরণের প্রমাণ রাখুন। আগে সমঝোতা চেষ্টা করুন।",
    keywords: ["eviction", "notice", "উচ্ছেদ", "নোটিশ"],
  },
  {
    id: "prop-13",
    category: "Property & Land",
    code: "PROP-13",
    titleEn: "Common Property Fraud Signs (Checklist)",
    titleBn: "সম্পত্তি জালিয়াতির লক্ষণ (চেকলিস্ট)",
    summaryEn: "Red flags: fake deeds, rushed payments, unclear chain, missing records.",
    summaryBn: "রেড ফ্ল্যাগ: জাল দলিল, তাড়াহুড়ো, অস্পষ্ট ধারাবাহিকতা, রেকর্ড নেই।",
    contentEn:
      "Verify identity, check certified copies, match records, and avoid cash-only pressure. Use escrow-like steps where possible.",
    contentBn:
      "পরিচয় যাচাই, সার্টিফাইড কপি, রেকর্ড মিলানো এবং কেবল নগদ চাপ এড়ান। সম্ভব হলে ধাপে ধাপে নিরাপদ পরিশোধ করুন।",
    keywords: ["fraud", "deed", "জালিয়াতি", "দলিল"],
  },

  // Commercial Law (8)
  {
    id: "com-01",
    category: "Commercial Law",
    code: "COM-01",
    titleEn: "Valid Contract (Core Elements)",
    titleBn: "বৈধ চুক্তি (মূল উপাদান)",
    summaryEn: "Offer, acceptance, consideration, capacity, lawful purpose.",
    summaryBn: "প্রস্তাব, গ্রহণ, প্রতিদান, সক্ষমতা, বৈধ উদ্দেশ্য।",
    contentEn:
      "Write key terms: scope, price, delivery, warranty, liability, dispute resolution. Clarity reduces litigation risk.",
    contentBn:
      "মূল শর্ত লিখিত রাখুন: কাজের পরিধি, মূল্য, ডেলিভারি, ওয়ারেন্টি, দায়, বিরোধ নিষ্পত্তি। স্পষ্টতা মামলা ঝুঁকি কমায়।",
    keywords: ["contract", "consideration", "চুক্তি", "প্রতিদান"],
  },
  {
    id: "com-02",
    category: "Commercial Law",
    code: "COM-02",
    titleEn: "Non-Disclosure Agreement (NDA)",
    titleBn: "নন-ডিসক্লোজার এগ্রিমেন্ট (এনডিএ)",
    summaryEn: "Protect confidential business information.",
    summaryBn: "গোপন ব্যবসায়িক তথ্য সুরক্ষা দেয়।",
    contentEn:
      "Define confidential info, permitted use, duration, exceptions, and remedies. Include return/destruction obligations.",
    contentBn:
      "গোপন তথ্য, ব্যবহার, মেয়াদ, ব্যতিক্রম ও প্রতিকার নির্ধারণ করুন। তথ্য ফেরত/ধ্বংসের শর্ত দিন।",
    keywords: ["NDA", "confidential", "এনডিএ", "গোপনীয়তা"],
  },
  {
    id: "com-03",
    category: "Commercial Law",
    code: "COM-03",
    titleEn: "Partnership Deed (Key Points)",
    titleBn: "পার্টনারশিপ দলিল (মূল বিষয়)",
    summaryEn: "Capital, profit share, roles, authority, exit terms.",
    summaryBn: "পুঁজি, লাভ বণ্টন, দায়িত্ব, ক্ষমতা, বের হওয়ার শর্ত।",
    contentEn:
      "Write decision rules, banking authority, partner duties, dispute resolution, and dissolution steps. Keep accounts transparent.",
    contentBn:
      "সিদ্ধান্ত, ব্যাংক ক্ষমতা, দায়িত্ব, বিরোধ নিষ্পত্তি ও ভাঙনের ধাপ লিখুন। হিসাব স্বচ্ছ রাখুন।",
    keywords: ["partnership", "profit share", "পার্টনারশিপ", "লাভ বণ্টন"],
  },
  {
    id: "com-04",
    category: "Commercial Law",
    code: "COM-04",
    titleEn: "Invoice & Payment Terms (Practice)",
    titleBn: "ইনভয়েস ও পেমেন্ট শর্ত (চর্চা)",
    summaryEn: "Clear due dates, late fees, and acceptance criteria help collection.",
    summaryBn: "দেয় তারিখ, বিলম্ব ফি ও গ্রহণযোগ্যতা স্পষ্ট করলে আদায় সহজ।",
    contentEn:
      "Include PO/reference, item description, tax/VAT, due date, and dispute window. Keep delivery proofs and communications.",
    contentBn:
      "পিও/রেফারেন্স, পণ্যের বিবরণ, ভ্যাট/কর, দেয় তারিখ, বিরোধের সময়সীমা দিন। ডেলিভারি প্রমাণ ও যোগাযোগ সংরক্ষণ করুন।",
    keywords: ["invoice", "payment", "ইনভয়েস", "পরিশোধ"],
  },
  {
    id: "com-05",
    category: "Commercial Law",
    code: "COM-05",
    titleEn: "Consumer Complaint (Basics)",
    titleBn: "ভোক্তা অভিযোগ (মূল বিষয়)",
    summaryEn: "Keep receipts; complain with evidence and a clear remedy request.",
    summaryBn: "রসিদ রাখুন; প্রমাণসহ অভিযোগ ও প্রতিকার দাবি করুন।",
    contentEn:
      "Document product/service defects and communications. Ask for repair/replacement/refund depending on the issue and policy.",
    contentBn:
      "ত্রুটি ও যোগাযোগ নথিভুক্ত করুন। সমস্যা ও নীতিমালা অনুযায়ী মেরামত/বদলি/রিফান্ড দাবি করুন।",
    keywords: ["consumer", "refund", "ভোক্তা", "রিফান্ড"],
  },
  {
    id: "com-06",
    category: "Commercial Law",
    code: "COM-06",
    titleEn: "Company Registration (High Level)",
    titleBn: "কোম্পানি রেজিস্ট্রেশন (সংক্ষিপ্ত)",
    summaryEn: "Name, documents, directors, filings, and compliance steps.",
    summaryBn: "নাম, দলিল, পরিচালক, ফাইলিং ও সম্মতি ধাপ।",
    contentEn:
      "Prepare incorporation documents, choose structure, file required forms, and maintain ongoing compliance (returns, taxes).",
    contentBn:
      "ইনকরপোরেশন দলিল প্রস্তুত, কাঠামো নির্ধারণ, প্রয়োজনীয় ফর্ম জমা এবং চলমান সম্মতি (রিটার্ন, কর) বজায় রাখুন।",
    keywords: ["company", "incorporation", "কোম্পানি", "রেজিস্ট্রেশন"],
  },
  {
    id: "com-07",
    category: "Commercial Law",
    code: "COM-07",
    titleEn: "E-signature (When Useful)",
    titleBn: "ই-সিগনেচার (কখন কাজে লাগে)",
    summaryEn: "Speeds up signing; verify identity and audit trail.",
    summaryBn: "সাইন দ্রুত হয়; পরিচয় যাচাই ও অডিট ট্রেইল দরকার।",
    contentEn:
      "Use secure signing with logs, timestamps, and authentication. Some documents may still need wet signature or registration.",
    contentBn:
      "লগ, টাইমস্ট্যাম্প ও যাচাইসহ নিরাপদ সাইন ব্যবহার করুন। কিছু দলিলে এখনও হাতে সাইন/রেজিস্ট্রেশন লাগতে পারে।",
    keywords: ["e-signature", "audit trail", "ই-সিগনেচার", "অডিট"],
  },
  {
    id: "com-08",
    category: "Commercial Law",
    code: "COM-08",
    titleEn: "Dispute Resolution Clause (Why)",
    titleBn: "বিরোধ নিষ্পত্তি ধারা (কেন)",
    summaryEn: "Sets forum, process, and timelines (court/arbitration/mediation).",
    summaryBn: "ফোরাম, প্রক্রিয়া ও সময়সীমা নির্ধারণ করে (আদালত/মধ্যস্থতা)।",
    contentEn:
      "Define governing law, jurisdiction, arbitration seat (if any), notice steps, and cost-sharing to avoid confusion later.",
    contentBn:
      "প্রযোজ্য আইন, বিচারাধীনতা, আরবিট্রেশন সিট (থাকলে), নোটিশ ধাপ ও খরচ বণ্টন নির্ধারণ করুন।",
    keywords: ["arbitration", "mediation", "বিরোধ", "মধ্যস্থতা"],
  },

  // Commercial Law (extra)
  {
    id: "com-09",
    category: "Commercial Law",
    code: "COM-09",
    titleEn: "Service Agreement (Scope & SLA)",
    titleBn: "সেবা চুক্তি (স্কোপ ও এসএলএ)",
    summaryEn: "Define deliverables, timelines, acceptance, and support levels.",
    summaryBn: "ডেলিভারেবল, সময়, গ্রহণযোগ্যতা ও সাপোর্ট স্তর নির্ধারণ।",
    contentEn:
      "Include scope, milestones, acceptance tests, change requests, and service levels (response/uptime) to prevent disputes.",
    contentBn:
      "স্কোপ, মাইলস্টোন, গ্রহণযোগ্যতা পরীক্ষা, পরিবর্তন অনুরোধ এবং সেবা স্তর (রেসপন্স/আপটাইম) যুক্ত করুন।",
    keywords: ["service agreement", "SLA", "সেবা চুক্তি", "এসএলএ"],
  },
  {
    id: "com-10",
    category: "Commercial Law",
    code: "COM-10",
    titleEn: "Intellectual Property in Contracts (Basics)",
    titleBn: "চুক্তিতে মেধাস্বত্ব (মূল বিষয়)",
    summaryEn: "Clarify ownership, licensing, and reuse rights for work outputs.",
    summaryBn: "আউটপুটের মালিকানা, লাইসেন্স ও পুনর্ব্যবহার অধিকার স্পষ্ট করুন।",
    contentEn:
      "State who owns deliverables, whether there is a license, and whether pre-existing tools can be reused. Add confidentiality and attribution terms as needed.",
    contentBn:
      "ডেলিভারেবল কার মালিকানায় যাবে, লাইসেন্স থাকবে কি না, এবং আগের টুল/কোড পুনর্ব্যবহার করা যাবে কি না—লিখুন। প্রয়োজনে গোপনীয়তা ও অ্যাট্রিবিউশন শর্ত দিন।",
    keywords: ["IP", "license", "মেধাস্বত্ব", "লাইসেন্স"],
  },
  {
    id: "com-11",
    category: "Commercial Law",
    code: "COM-11",
    titleEn: "Guarantee vs Warranty (Quick Guide)",
    titleBn: "গ্যারান্টি বনাম ওয়ারেন্টি (গাইড)",
    summaryEn: "Warranty is assurance about quality; guarantee often promises remedy/replacement.",
    summaryBn: "ওয়ারেন্টি মান সম্পর্কে নিশ্চয়তা; গ্যারান্টিতে প্রতিকার/বদলি প্রতিশ্রুতি থাকে।",
    contentEn:
      "Write what is covered, duration, exclusions, and how claims are processed. Keep invoice and serial numbers for claims.",
    contentBn:
      "কী কভারড, মেয়াদ, ব্যতিক্রম এবং দাবি প্রক্রিয়া লিখুন। ইনভয়েস ও সিরিয়াল নম্বর সংরক্ষণ করুন।",
    keywords: ["warranty", "guarantee", "ওয়ারেন্টি", "গ্যারান্টি"],
  },
  {
    id: "com-12",
    category: "Commercial Law",
    code: "COM-12",
    titleEn: "Debt Recovery (Practical Steps)",
    titleBn: "বকেয়া আদায় (ব্যবহারিক)",
    summaryEn: "Send written demand, attach invoices, and propose settlement timeline.",
    summaryBn: "লিখিত ডিমান্ড, ইনভয়েস সংযুক্ত, সমঝোতা সময়সূচি প্রস্তাব।",
    contentEn:
      "Keep proof of delivery and communications. If unresolved, consult a lawyer on legal notice and appropriate forum.",
    contentBn:
      "ডেলিভারি প্রমাণ ও যোগাযোগ সংরক্ষণ করুন। সমাধান না হলে আইনি নোটিশ ও উপযুক্ত ফোরাম বিষয়ে আইনজীবীর পরামর্শ নিন।",
    keywords: ["debt", "recovery", "বকেয়া", "আদায়"],
  },
  {
    id: "com-13",
    category: "Commercial Law",
    code: "COM-13",
    titleEn: "Tax Invoice & VAT (Basics)",
    titleBn: "ট্যাক্স ইনভয়েস ও ভ্যাট (মূল বিষয়)",
    summaryEn: "Correct invoicing fields support compliance and audits.",
    summaryBn: "সঠিক ইনভয়েস ফিল্ড সম্মতি ও অডিটে সহায়ক।",
    contentEn:
      "Include registration details, VAT amount, and reference numbers where applicable. Keep records for audit and returns.",
    contentBn:
      "প্রযোজ্য হলে রেজিস্ট্রেশন তথ্য, ভ্যাট পরিমাণ ও রেফারেন্স নম্বর দিন। অডিট ও রিটার্নের জন্য রেকর্ড রাখুন।",
    keywords: ["VAT", "tax invoice", "ভ্যাট", "ট্যাক্স ইনভয়েস"],
  },

  // Family Law (8)
  {
    id: "fam-01",
    category: "Family Law",
    code: "FAM-01",
    titleEn: "Marriage Registration (Checklist)",
    titleBn: "বিবাহ নিবন্ধন (চেকলিস্ট)",
    summaryEn: "Documents, witnesses, and correct information matter.",
    summaryBn: "দলিল, সাক্ষী ও সঠিক তথ্য জরুরি।",
    contentEn:
      "Keep ID, photos, witness details, and accurate names/addresses. A registered certificate helps with many legal services.",
    contentBn:
      "আইডি, ছবি, সাক্ষীর তথ্য এবং সঠিক নাম/ঠিকানা রাখুন। নিবন্ধিত সনদ বহু আইনি কাজে সহায়ক।",
    keywords: ["marriage", "registration", "বিবাহ", "নিবন্ধন"],
  },
  {
    id: "fam-02",
    category: "Family Law",
    code: "FAM-02",
    titleEn: "Divorce (Mutual vs Contested)",
    titleBn: "তালাক (সমঝোতা বনাম বিতর্কিত)",
    summaryEn: "Procedures differ; documentation and notices are key.",
    summaryBn: "প্রক্রিয়া ভিন্ন; নথি ও নোটিশ গুরুত্বপূর্ণ।",
    contentEn:
      "Keep notice copies, agreements, and custody/maintenance understanding. Seek legal advice for timelines and filings.",
    contentBn:
      "নোটিশ কপি, সমঝোতা এবং ভরণপোষণ/হেফাজত বোঝাপড়া রাখুন। সময়সীমা ও ফাইলিংয়ে আইনগত পরামর্শ নিন।",
    keywords: ["divorce", "maintenance", "তালাক", "ভরণপোষণ"],
  },
  {
    id: "fam-03",
    category: "Family Law",
    code: "FAM-03",
    titleEn: "Maintenance (General)",
    titleBn: "ভরণপোষণ (সাধারণ)",
    summaryEn: "Support duties can apply to spouse/children depending on law.",
    summaryBn: "আইন অনুযায়ী স্বামী/স্ত্রী/সন্তান ভরণপোষণ প্রযোজ্য হতে পারে।",
    contentEn:
      "Keep income proof, expenses, and child needs documented. Courts/authorities consider capacity and necessities.",
    contentBn:
      "আয়, ব্যয় ও সন্তানের চাহিদার প্রমাণ রাখুন। কর্তৃপক্ষ সক্ষমতা ও প্রয়োজন বিবেচনা করে।",
    keywords: ["maintenance", "child support", "ভরণপোষণ", "সন্তান"],
  },
  {
    id: "fam-04",
    category: "Family Law",
    code: "FAM-04",
    titleEn: "Child Custody (Best Interests)",
    titleBn: "সন্তানের হেফাজত (সর্বোত্তম স্বার্থ)",
    summaryEn: "Decision focuses on child welfare and stability.",
    summaryBn: "সিদ্ধান্তে শিশুর কল্যাণ ও স্থিতিশীলতা মুখ্য।",
    contentEn:
      "Prepare school/health info, caregiving history, and safe environment details. Avoid harassment or unsafe contact.",
    contentBn:
      "স্কুল/স্বাস্থ্য তথ্য, দেখাশোনার ইতিহাস ও নিরাপদ পরিবেশের বিবরণ প্রস্তুত করুন। হয়রানি বা অনিরাপদ যোগাযোগ এড়ান।",
    keywords: ["custody", "welfare", "হেফাজত", "কল্যাণ"],
  },
  {
    id: "fam-05",
    category: "Family Law",
    code: "FAM-05",
    titleEn: "Guardianship (When Needed)",
    titleBn: "অভিভাবকত্ব (কখন দরকার)",
    summaryEn: "Needed when a minor’s property/care requires legal guardian.",
    summaryBn: "অপ্রাপ্তবয়স্কের দেখাশোনা/সম্পত্তিতে আইনি অভিভাবক প্রয়োজন হতে পারে।",
    contentEn:
      "Guardianship may involve court authorization for major decisions. Keep birth certificates and property records.",
    contentBn:
      "বড় সিদ্ধান্তে আদালতের অনুমোদন লাগতে পারে। জন্মসনদ ও সম্পত্তির কাগজ রাখুন।",
    keywords: ["guardianship", "minor", "অভিভাবকত্ব", "অপ্রাপ্তবয়স্ক"],
  },
  {
    id: "fam-06",
    category: "Family Law",
    code: "FAM-06",
    titleEn: "Domestic Violence (Safety Steps)",
    titleBn: "পারিবারিক সহিংসতা (নিরাপত্তা)",
    summaryEn: "Prioritize safety; document incidents; seek help.",
    summaryBn: "নিরাপত্তা আগে; ঘটনা নথিভুক্ত; সহায়তা নিন।",
    contentEn:
      "If in danger, contact trusted people and emergency services. Keep evidence (messages, photos) and get legal/NGO support.",
    contentBn:
      "ঝুঁকি থাকলে বিশ্বস্ত ব্যক্তি/জরুরি সেবা নিন। প্রমাণ (মেসেজ, ছবি) রাখুন এবং আইনগত/এনজিও সহায়তা নিন।",
    keywords: ["violence", "protection", "সহিংসতা", "সুরক্ষা"],
  },
  {
    id: "fam-07",
    category: "Family Law",
    code: "FAM-07",
    titleEn: "Inheritance in Family Disputes (General)",
    titleBn: "উত্তরাধিকার বিরোধ (সাধারণ)",
    summaryEn: "Personal law may apply; documents and family tree matter.",
    summaryBn: "ব্যক্তিগত আইন প্রযোজ্য; কাগজ ও ওয়ারিশ তালিকা জরুরি।",
    contentEn:
      "Collect death certificate, heirs list, deeds, and tax receipts. Seek legal advice for partition and settlement.",
    contentBn:
      "মৃত্যু সনদ, ওয়ারিশ তালিকা, দলিল ও কর রসিদ সংগ্রহ করুন। বণ্টন ও সমঝোতায় আইনগত পরামর্শ নিন।",
    keywords: ["inheritance", "partition", "উত্তরাধিকার", "বণ্টন"],
  },
  {
    id: "fam-08",
    category: "Family Law",
    code: "FAM-08",
    titleEn: "Marriage Dower/Denmohor (Concept)",
    titleBn: "দেনমোহর (ধারণা)",
    summaryEn: "Financial right/obligation arising from marriage terms in some personal laws.",
    summaryBn: "কিছু ব্যক্তিগত আইনে বিবাহের শর্ত থেকে আর্থিক অধিকার/দায় সৃষ্টি হয়।",
    contentEn:
      "Keep marriage contract records and payment proof. Disputes often depend on terms, timing, and evidence.",
    contentBn:
      "নিকাহনামা/চুক্তি ও পরিশোধের প্রমাণ রাখুন। বিরোধে শর্ত, সময় ও প্রমাণ গুরুত্বপূর্ণ।",
    keywords: ["dower", "denmohor", "দেনমোহর", "নিকাহনামা"],
  },

  // Family Law (extra)
  {
    id: "fam-09",
    category: "Family Law",
    code: "FAM-09",
    titleEn: "Birth Registration (Why Important)",
    titleBn: "জন্ম নিবন্ধন (কেন জরুরি)",
    summaryEn: "Helps access education, passport, inheritance, and services.",
    summaryBn: "শিক্ষা, পাসপোর্ট, উত্তরাধিকার ও সেবায় সহায়ক।",
    contentEn:
      "Keep accurate names and dates, parents’ IDs, and application receipts. Corrections often require supporting documents.",
    contentBn:
      "সঠিক নাম-তারিখ, বাবা-মায়ের আইডি এবং আবেদন রসিদ রাখুন। সংশোধনে প্রমাণপত্র লাগতে পারে।",
    keywords: ["birth registration", "certificate", "জন্ম নিবন্ধন", "সনদ"],
  },
  {
    id: "fam-10",
    category: "Family Law",
    code: "FAM-10",
    titleEn: "Marriage Consent & Age (Concept)",
    titleBn: "বিবাহে সম্মতি ও বয়স (ধারণা)",
    summaryEn: "Valid marriage generally requires consent and meeting legal age rules.",
    summaryBn: "বৈধ বিয়েতে সম্মতি ও আইনানুগ বয়স শর্ত পূরণ জরুরি।",
    contentEn:
      "Keep proof of age and consent. Forced marriage concerns should be addressed with trusted authorities and legal help.",
    contentBn:
      "বয়স ও সম্মতির প্রমাণ রাখুন। জোরপূর্বক বিয়ের ক্ষেত্রে কর্তৃপক্ষ ও আইনগত সহায়তা নিন।",
    keywords: ["consent", "age", "সম্মতি", "বয়স"],
  },
  {
    id: "fam-11",
    category: "Family Law",
    code: "FAM-11",
    titleEn: "Adoption (Practical Overview)",
    titleBn: "দত্তক (ব্যবহারিক সংক্ষিপ্ত)",
    summaryEn: "Processes vary; documentation and legal advice are important.",
    summaryBn: "প্রক্রিয়া ভিন্ন; নথি ও আইনগত পরামর্শ জরুরি।",
    contentEn:
      "Adoption/guardianship arrangements can depend on applicable personal/statutory rules. Maintain child identity and welfare records.",
    contentBn:
      "দত্তক/অভিভাবকত্ব ব্যবস্থায় প্রযোজ্য ব্যক্তিগত/বিধিবদ্ধ বিধান গুরুত্বপূর্ণ। শিশুর পরিচয় ও কল্যাণ রেকর্ড রাখুন।",
    keywords: ["adoption", "guardianship", "দত্তক", "অভিভাবকত্ব"],
  },
  {
    id: "fam-12",
    category: "Family Law",
    code: "FAM-12",
    titleEn: "Family Mediation (Why Try)",
    titleBn: "পারিবারিক মধ্যস্থতা (কেন করবেন)",
    summaryEn: "A structured mediation can reduce time, cost, and conflict.",
    summaryBn: "মধ্যস্থতা সময়-খরচ ও দ্বন্দ্ব কমাতে পারে।",
    contentEn:
      "Use a neutral mediator, list issues (custody, maintenance, property), and record agreements in writing.",
    contentBn:
      "নিরপেক্ষ মধ্যস্থতাকারী, বিষয় তালিকা (হেফাজত, ভরণপোষণ, সম্পত্তি) এবং লিখিত সমঝোতা করুন।",
    keywords: ["mediation", "settlement", "মধ্যস্থতা", "সমঝোতা"],
  },
  {
    id: "fam-13",
    category: "Family Law",
    code: "FAM-13",
    titleEn: "Name Change (Basic Steps)",
    titleBn: "নাম পরিবর্তন (মূল ধাপ)",
    summaryEn: "Use consistent documents and update records across services.",
    summaryBn: "কাগজ একরকম রাখুন এবং সব রেকর্ড আপডেট করুন।",
    contentEn:
      "Collect supporting documents, publish/notify where required, and update NID/passport/bank/school records accordingly.",
    contentBn:
      "প্রমাণপত্র সংগ্রহ, প্রয়োজনে প্রকাশ/নোটিশ, এবং এনআইডি/পাসপোর্ট/ব্যাংক/স্কুল রেকর্ড আপডেট করুন।",
    keywords: ["name change", "records", "নাম পরিবর্তন", "রেকর্ড"],
  },

  // Criminal Procedure (8)
  {
    id: "crpc-01",
    category: "Criminal Procedure",
    code: "CRPC-01",
    titleEn: "FIR / Complaint (Basics)",
    titleBn: "এফআইআর/অভিযোগ (মূল বিষয়)",
    summaryEn: "Report incident with facts; keep copy and diary number.",
    summaryBn: "ঘটনার তথ্যসহ রিপোর্ট; কপি ও জিডি/নম্বর রাখুন।",
    contentEn:
      "Write time, place, persons, and evidence. Ask for acknowledgement/copy. Escalate per procedure if refused.",
    contentBn:
      "সময়, স্থান, ব্যক্তি ও প্রমাণ লিখুন। গ্রহণপত্র/কপি নিন। গ্রহণ না করলে বিধি অনুযায়ী ঊর্ধ্বতনে জানান।",
    keywords: ["FIR", "complaint", "এফআইআর", "অভিযোগ"],
  },
  {
    id: "crpc-02",
    category: "Criminal Procedure",
    code: "CRPC-02",
    titleEn: "Arrest (Rights & Practical Steps)",
    titleBn: "গ্রেপ্তার (অধিকার ও করণীয়)",
    summaryEn: "Know grounds; contact family/lawyer; record details.",
    summaryBn: "কারণ জানুন; পরিবার/আইনজীবীকে জানান; তথ্য নথিভুক্ত করুন।",
    contentEn:
      "Ask for reasons, note time/place, request legal assistance. Bail options depend on the offence and court practice.",
    contentBn:
      "গ্রেপ্তারের কারণ জিজ্ঞেস করুন, সময়/স্থান নোট করুন, আইনগত সহায়তা চান। জামিন অপরাধ ও আদালতের প্রথাভেদে নির্ভর করে।",
    keywords: ["arrest", "bail", "গ্রেপ্তার", "জামিন"],
  },
  {
    id: "crpc-03",
    category: "Criminal Procedure",
    code: "CRPC-03",
    titleEn: "Bail (Overview)",
    titleBn: "জামিন (সংক্ষিপ্ত)",
    summaryEn: "Release pending trial may be possible under conditions.",
    summaryBn: "বিচার চলাকালে শর্তসাপেক্ষে মুক্তি সম্ভব হতে পারে।",
    contentEn:
      "Courts consider offence nature, flight risk, evidence tampering, and public interest. Provide surety and address details.",
    contentBn:
      "আদালত অপরাধের ধরন, পলায়নের ঝুঁকি, প্রমাণ নষ্টের আশঙ্কা ও জনস্বার্থ বিবেচনা করে। জামিনদার ও ঠিকানার তথ্য দিন।",
    keywords: ["bail", "surety", "জামিন", "জামিনদার"],
  },
  {
    id: "crpc-04",
    category: "Criminal Procedure",
    code: "CRPC-04",
    titleEn: "Investigation (What Happens)",
    titleBn: "তদন্ত (কী হয়)",
    summaryEn: "Police collect evidence, statements, and prepare report/charge sheet.",
    summaryBn: "পুলিশ প্রমাণ, বক্তব্য সংগ্রহ করে রিপোর্ট/চার্জশিট প্রস্তুত করে।",
    contentEn:
      "Keep copies of submissions and contacts. Witness statements and medical reports can be important evidence.",
    contentBn:
      "জমা দেওয়া কাগজ ও যোগাযোগের রেকর্ড রাখুন। সাক্ষীর জবানবন্দি ও মেডিকেল রিপোর্ট গুরুত্বপূর্ণ হতে পারে।",
    keywords: ["investigation", "charge sheet", "তদন্ত", "চার্জশিট"],
  },
  {
    id: "crpc-05",
    category: "Criminal Procedure",
    code: "CRPC-05",
    titleEn: "Summons/Warrant (Meaning)",
    titleBn: "সমন/ওয়ারেন্ট (অর্থ)",
    summaryEn: "Summons requests appearance; warrant compels it.",
    summaryBn: "সমনে হাজিরা অনুরোধ; ওয়ারেন্টে বাধ্যতামূলক।",
    contentEn:
      "Check name, case number, court, and date. Respond in time and consult a lawyer to avoid escalation.",
    contentBn:
      "নাম, মামলা নম্বর, আদালত ও তারিখ যাচাই করুন। সময়মতো উপস্থিত হন এবং আইনজীবীর পরামর্শ নিন।",
    keywords: ["summons", "warrant", "সমন", "ওয়ারেন্ট"],
  },
  {
    id: "crpc-06",
    category: "Criminal Procedure",
    code: "CRPC-06",
    titleEn: "Charge and Trial (Overview)",
    titleBn: "অভিযোগ গঠন ও বিচার (সংক্ষিপ্ত)",
    summaryEn: "Charges framed; evidence and arguments heard before judgment.",
    summaryBn: "অভিযোগ গঠন; প্রমাণ ও যুক্তি শুনে রায়।",
    contentEn:
      "Trial includes examination/cross-examination of witnesses and submission of documents. Keep a case timeline and copies.",
    contentBn:
      "বিচারে সাক্ষ্যগ্রহণ, জেরা এবং দলিল দাখিল হয়। মামলা টাইমলাইন ও কপি সংরক্ষণ করুন।",
    keywords: ["trial", "evidence", "বিচার", "প্রমাণ"],
  },
  {
    id: "crpc-07",
    category: "Criminal Procedure",
    code: "CRPC-07",
    titleEn: "Victim Support (Practical)",
    titleBn: "ভুক্তভোগী সহায়তা (ব্যবহারিক)",
    summaryEn: "Medical care, documentation, and support services matter.",
    summaryBn: "চিকিৎসা, নথি ও সহায়তা সেবা গুরুত্বপূর্ণ।",
    contentEn:
      "Seek medical care quickly where relevant. Keep reports, receipts, and evidence. Consider support NGOs and legal aid.",
    contentBn:
      "প্রয়োজনে দ্রুত চিকিৎসা নিন। রিপোর্ট, রসিদ ও প্রমাণ রাখুন। সহায়তা এনজিও/লিগ্যাল এইড বিবেচনা করুন।",
    keywords: ["victim", "legal aid", "ভুক্তভোগী", "লিগ্যাল এইড"],
  },
  {
    id: "crpc-08",
    category: "Criminal Procedure",
    code: "CRPC-08",
    titleEn: "Appeal/Revision (Concept)",
    titleBn: "আপিল/রিভিশন (ধারণা)",
    summaryEn: "Some decisions can be challenged within time limits.",
    summaryBn: "কিছু সিদ্ধান্ত সময়সীমার মধ্যে চ্যালেঞ্জ করা যায়।",
    contentEn:
      "Time limits are strict. Keep certified copies and consult a lawyer on grounds and proper forum.",
    contentBn:
      "সময়সীমা কঠোর। সার্টিফাইড কপি নিন এবং কারণ/ফোরাম সম্পর্কে আইনজীবীর পরামর্শ নিন।",
    keywords: ["appeal", "revision", "আপিল", "রিভিশন"],
  },

  // Criminal Procedure (extra)
  {
    id: "crpc-09",
    category: "Criminal Procedure",
    code: "CRPC-09",
    titleEn: "GD (General Diary) (When to Use)",
    titleBn: "জিডি (সাধারণ ডায়েরি) (কখন করবেন)",
    summaryEn: "Record incidents like threats/lost items when FIR is not applicable.",
    summaryBn: "এফআইআর প্রযোজ্য না হলে হুমকি/হারানো জিনিস ইত্যাদি নথিভুক্ত করুন।",
    contentEn:
      "Write date/time/place and details. Keep the GD number and copy for later reference.",
    contentBn:
      "তারিখ/সময়/স্থান ও বিবরণ লিখুন। জিডি নম্বর ও কপি সংরক্ষণ করুন।",
    keywords: ["GD", "diary", "জিডি", "হারানো"],
  },
  {
    id: "crpc-10",
    category: "Criminal Procedure",
    code: "CRPC-10",
    titleEn: "Medical Examination (Evidence)",
    titleBn: "মেডিকেল পরীক্ষা (প্রমাণ)",
    summaryEn: "Medical reports can be crucial in assault/accident cases.",
    summaryBn: "আঘাত/দুর্ঘটনা মামলায় মেডিকেল রিপোর্ট গুরুত্বপূর্ণ।",
    contentEn:
      "Seek treatment promptly and request documentation. Preserve prescriptions, reports, and bills.",
    contentBn:
      "দ্রুত চিকিৎসা নিন এবং নথি সংগ্রহ করুন। প্রেসক্রিপশন, রিপোর্ট ও বিল সংরক্ষণ করুন।",
    keywords: ["medical", "evidence", "মেডিকেল", "প্রমাণ"],
  },
  {
    id: "crpc-11",
    category: "Criminal Procedure",
    code: "CRPC-11",
    titleEn: "Witness Statements (Practical)",
    titleBn: "সাক্ষীর বক্তব্য (ব্যবহারিক)",
    summaryEn: "Identify witnesses early; keep contact details and timeline.",
    summaryBn: "শুরুতেই সাক্ষী নির্ধারণ; যোগাযোগ ও টাইমলাইন রাখুন।",
    contentEn:
      "Write what each witness saw/heard and when. Avoid coaching; focus on accuracy and consistency.",
    contentBn:
      "প্রত্যেক সাক্ষী কী দেখেছে/শুনেছে ও কখন—লিখুন। শেখানো নয়; সঠিকতা ও ধারাবাহিকতা জরুরি।",
    keywords: ["witness", "statement", "সাক্ষী", "বক্তব্য"],
  },
  {
    id: "crpc-12",
    category: "Criminal Procedure",
    code: "CRPC-12",
    titleEn: "Police Clearance (Where Needed)",
    titleBn: "পুলিশ ক্লিয়ারেন্স (কোথায় লাগে)",
    summaryEn: "Often needed for travel/jobs; follow official application steps.",
    summaryBn: "ভ্রমণ/চাকরিতে লাগতে পারে; সরকারি প্রক্রিয়া অনুসরণ করুন।",
    contentEn:
      "Ensure documents match (name, DOB, address). Track application status and keep receipts/acknowledgements.",
    contentBn:
      "নথিতে নাম, জন্মতারিখ, ঠিকানা মিল আছে কি না দেখুন। আবেদন স্ট্যাটাস ও রসিদ/গ্রহণপত্র রাখুন।",
    keywords: ["police clearance", "PCC", "ক্লিয়ারেন্স", "পিসিসি"],
  },
  {
    id: "crpc-13",
    category: "Criminal Procedure",
    code: "CRPC-13",
    titleEn: "Cyber Complaint (Basics)",
    titleBn: "সাইবার অভিযোগ (মূল বিষয়)",
    summaryEn: "Preserve screenshots/logs; report through appropriate channel.",
    summaryBn: "স্ক্রিনশট/লগ রাখুন; যথাযথ চ্যানেলে অভিযোগ করুন।",
    contentEn:
      "Keep URLs, timestamps, messages, and payment proofs. Avoid sharing OTP/passwords; secure accounts immediately.",
    contentBn:
      "ইউআরএল, টাইমস্ট্যাম্প, মেসেজ ও পেমেন্ট প্রমাণ রাখুন। ওটিপি/পাসওয়ার্ড শেয়ার করবেন না; অ্যাকাউন্ট সুরক্ষিত করুন।",
    keywords: ["cyber", "fraud", "সাইবার", "প্রতারণা"],
  },
];

