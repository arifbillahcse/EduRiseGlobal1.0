/* =====================================================================
   data.js — site settings and ALL page content. No logic here.
   Sources: PDF company profile, DOCX proposal, EduRise Facebook posts.
   Anything not yet confirmed by EduRise is marked TBC on the page.
   Fields are added phase by phase, never renamed.
   ===================================================================== */

/* ---------- site settings ---------- */
const SITE = {
  name: 'EduRise Global',
  tagline: 'Guiding Your Global Future',
  phone: '+880 1321-216402',
  whatsapp: '8801321216402',                 // digits only, for wa.me links
  email: 'info.eduriseglobal@gmail.com',      // TBC: a domain email (info@eduriseglobal.com) is recommended
  address: '177 Mahtab Center, 6th Floor, Bijoy Nagar, Dhaka-1000',
  offices: 'Dhaka (head office) · Madrid, Spain · Suffolk, UK',
  hours: 'Saturday to Thursday, 10:00 to 19:00', // TBC
  social: {
    facebook: 'https://www.facebook.com/EduRiseGlobalConsultancy',
    instagram: '',                            // TBC
    linkedin: ''                              // TBC
  },
  whatsappGreeting: 'Hello EduRise Global, I would like a free consultation about studying abroad.',
  currentPhase: 6                             // links to features from later phases explain when they arrive
};

/* ---------- navigation: one list feeds the header, the mobile drawer and the footer ---------- */
const NAV = [
  { id: 'home',         label: 'Home',         href: 'index.html',        phase: 2 },
  { id: 'destinations', label: 'Destinations', href: 'destinations.html', phase: 4 },
  { id: 'universities', label: 'Universities', href: 'universities.html', phase: 5 },
  { id: 'programs',     label: 'Programs',     href: 'programs.html',     phase: 4 },
  { id: 'scholarships', label: 'Scholarships', href: 'scholarships.html', phase: 4 },
  { id: 'services',     label: 'Services',     href: 'services.html',     phase: 4 },
  { id: 'about',        label: 'About',        href: 'about.html',        phase: 4 },
  { id: 'contact',      label: 'Contact',      href: 'contact.html',      phase: 4 }
];

/* extra footer links (not in the main menu) */
const FOOTER_EXTRA = [
  { label: 'News',                   href: 'news.html',  phase: 6 },
  { label: 'Staff dashboard (demo)', href: 'admin.html', phase: 6 }
];

const LEGAL = [
  { label: 'Privacy policy', href: 'policies.html#privacy',    phase: 4 },
  { label: 'Terms of use',   href: 'policies.html#terms',      phase: 4 },
  { label: 'Disclaimer',     href: 'policies.html#disclaimer', phase: 4 }
];

/* =====================================================================
   DESTINATIONS (Phase 4) — one entry per country page: destination.html#<id>
   code = airport/city code shown on cards
   ===================================================================== */
const DESTINATIONS = [
  { id: 'korea', code: 'ICN', city: 'Seoul', name: 'South Korea', levels: ['Bachelor’s', 'Master’s', 'Language (KLP / EAP)'],
    intro: 'Our largest route. We handle Bachelor’s and Master’s admissions at Korean universities, scholarships linked to English scores, and Korean (KLP) and English (EAP) language pathways.',
    highlights: ['English-taught Master’s tracks at several universities', 'Tuition scholarships of 30% to 50% at many universities, based on your English score', 'E-visa routes offered by selected universities', 'Language programs for students who need to build skills first'],
    requirements: [['Academic', 'HSC for Bachelor’s; Bachelor’s degree for Master’s'], ['CGPA', 'Usually 2.70 to 2.80 or higher, depending on the university'], ['English', 'IELTS 5.5 at most universities; some programs accept students without IELTS'], ['Study gap', 'Accepted at many universities, case by case']],
    extraDocs: ['Apostille or attestation of academic documents', 'Bank solvency certificate (amount set by the university)'] },
  { id: 'japan', code: 'TYO', city: 'Tokyo', name: 'Japan', levels: ['Master’s'],
    intro: 'Master’s admissions at Japanese universities, including selected programs that do not require IELTS. Our European Affairs team supervises Japan admissions.',
    highlights: ['Master’s programs at selected universities without IELTS', 'Research-focused universities with strong reputations', 'Part-time work allowed within immigration limits', 'Family accompaniment possible in some cases, subject to immigration rules'],
    requirements: [['Academic', 'Completed Bachelor’s degree'], ['English', 'Depends on the program; some accept students without IELTS'], ['Research plan', 'Often required for Master’s'], ['Japanese', 'Not required for English-taught programs']],
    extraDocs: ['Research plan or statement of purpose', 'Financial support documents'] },
  { id: 'uk', code: 'LON', city: 'London', name: 'United Kingdom', levels: ['Bachelor’s', 'Master’s'],
    intro: 'One-year Master’s and three-year Bachelor’s degrees. University relationships are managed by our Managing Director in the UK.',
    highlights: ['One-year Master’s programs', 'Partnerships managed from our UK office', 'Chevening and university scholarships'],
    requirements: [['Academic', 'Depends on the program'], ['English', 'IELTS for UKVI or a test the university accepts'], ['Intakes', 'September and January'], ['Funds', 'Maintenance funds for the visa']],
    extraDocs: ['Tuberculosis test certificate'] },
  { id: 'malta', code: 'MLA', city: 'Valletta', name: 'Malta', levels: ['Bachelor’s', 'Master’s'],
    intro: 'An English-speaking EU country. Admissions are supported by our European Affairs team in Spain.',
    highlights: ['English is an official language', 'EU qualification', 'Supported from our Madrid office'],
    requirements: [['Academic', 'Depends on the program'], ['English', 'Usually IELTS or equivalent'], ['Intakes', 'Mainly September and February'], ['Budget', 'Ask a counsellor for current costs']],
    extraDocs: [] },
  { id: 'italy', code: 'ROM', city: 'Rome', name: 'Italy', levels: ['Bachelor’s', 'Master’s'],
    intro: 'Public universities with comparatively low tuition, and government scholarship options for international students.',
    highlights: ['Public universities with low tuition', 'Italian Government (MAECI) and regional scholarships', 'English-taught programs'],
    requirements: [['Academic', 'Depends on the program'], ['English', 'IELTS or equivalent'], ['Pre-enrolment', 'Through the Universitaly portal'], ['Intakes', 'Mainly September']],
    extraDocs: ['Declaration of value or CIMEA statement'] },
  { id: 'russia', code: 'MOW', city: 'Moscow', name: 'Russia', levels: ['Master’s'],
    intro: 'Fully funded scholarship places for Master’s programs at Russian universities, with English-taught options.',
    highlights: ['Tuition fee waiver on scholarship places', 'Monthly stipend, which varies by university', 'University dormitory accommodation', 'Health insurance on scholarship places'],
    requirements: [['Academic', 'Completed Bachelor’s degree'], ['CGPA', '2.70 out of 4.00 (some accept 2.50+)'], ['English', 'IELTS, TOEFL or Duolingo; many programs without IELTS'], ['Age and gap', 'Usually under 35; study gap up to 10 years']],
    extraDocs: ['Medical certificate (format set by the university)'] },
  { id: 'finland', code: 'HEL', city: 'Helsinki', name: 'Finland', levels: ['Bachelor’s', 'Master’s'],
    intro: 'English-taught Bachelor’s and Master’s programs in one of Europe’s strongest education systems.',
    highlights: ['English-taught degrees with a research focus', 'Lower tuition than many European countries', 'Spouse may apply in some cases, subject to Finnish immigration rules', 'Part-time work allowed within residence permit limits'],
    requirements: [['Academic', 'HSC for Bachelor’s; Bachelor’s degree for Master’s'], ['English', 'IELTS 6.0+ or TOEFL iBT 90+'], ['Study gap', 'Considered case by case'], ['Intakes', 'January and September']],
    extraDocs: ['Proof of funds for the residence permit'] },
  { id: 'malaysia', code: 'KUL', city: 'Kuala Lumpur', name: 'Malaysia', levels: ['Foundation', 'Diploma', 'Bachelor’s', 'Master’s'],
    intro: 'An affordable route from Foundation to Master’s, with credit transfer options and lower English requirements at selected universities.',
    highlights: ['Programs from Foundation to Master’s', 'Credit transfer to save time and money', 'Low IELTS or without IELTS at selected universities', 'Internship and industry exposure'],
    requirements: [['Academic', 'SSC / HSC for Foundation and Diploma'], ['English', 'Varies; some programs without IELTS'], ['Budget', 'Lower tuition and living costs'], ['Intakes', 'Several each year']],
    extraDocs: [] },
  { id: 'china', code: 'BJS', city: 'Beijing', name: 'China', levels: ['Bachelor’s', 'Master’s', 'Language'],
    intro: 'Degree and Chinese language programs, with Chinese Government (CSC) and university scholarship options and two intakes a year.',
    highlights: ['Chinese Government (CSC), provincial and university scholarships', 'Engineering, IT, business and medical programs', 'Airport pickup and accommodation support', 'September and March intakes'],
    requirements: [['Academic', 'HSC for Bachelor’s; Bachelor’s degree for Master’s'], ['English', 'Some programs without IELTS'], ['Chinese', 'Not required for English-taught programs'], ['Intakes', 'September and March']],
    extraDocs: ['Physical examination form'] }
];
const OTHER_REGIONS = [
  { region: 'Europe',        countries: ['Estonia', 'Hungary', 'Cyprus', 'Other EU countries'] },
  { region: 'North America', countries: ['USA', 'Canada'] },
  { region: 'Oceania',       countries: ['Australia', 'New Zealand'] }
];
const BASE_DOCUMENTS = ['Valid passport', 'SSC and HSC certificates and transcripts', 'Bachelor’s certificate and transcript (for Master’s)', 'English test result, if required', 'Statement of purpose', 'CV', 'Two recommendation letters', 'Bank solvency certificate and statement', 'Passport-size photographs'];

/* =====================================================================
   HOMEPAGE (Phase 3)
   ===================================================================== */
const HERO_DESTINATIONS = ['korea', 'japan', 'uk', 'malta', 'italy'].map(id => {
  const notes = { korea: 'Our largest route, with English-score scholarships', japan: 'Selected programs without IELTS', uk: 'Partnerships managed by our UK team', malta: 'English-speaking EU country', italy: 'Public universities with low tuition' };
  const d = DESTINATIONS.find(x => x.id === id);
  return { id, code: d.code, country: d.name, city: d.city, programs: d.levels.join(' · '), note: notes[id] };
});
const HERO_MORE_DESTINATIONS = 'Russia, Finland, Malaysia, China and more';

const TRUST_POINTS = [
  { title: '3 countries',      text: 'Teams in Bangladesh, Spain and the United Kingdom' },
  { title: 'Lived experience', text: 'Leaders who studied in Malaysia, South Korea and Austria' },
  { title: 'End to end',       text: 'From first counselling to pre-departure' }
];

/* services (PDF "Our Core Services"); icon = id in partials/icons.html; details used on services.html */
const SERVICES = [
  { icon: 'user',     title: 'Career counselling & academic guidance', text: 'Personal guidance based on your academic background, career goals and financial plan.',
    details: ['Profile review: results, English level, study gap and budget', 'Country and program options that fit your career plan', 'An honest view of your chances'] },
  { icon: 'cap',      title: 'University & program selection',         text: 'A shortlist of universities and programs that suit your profile and budget.',
    details: ['Shortlist with entry requirements and costs', 'Comparison of tuition, scholarships and location', 'Intake and deadline planning'] },
  { icon: 'doc',      title: 'Admission application support',         text: 'Help preparing, checking and submitting your application and documents.',
    details: ['Application forms completed and checked', 'Statement of purpose and CV review', 'Follow-up with the university until a decision'] },
  { icon: 'award',    title: 'Scholarship guidance',                   text: 'Finding the scholarships you qualify for and applying for them on time.',
    details: ['University and government scholarship options', 'Eligibility check before you apply', 'Help with scholarship essays and documents'] },
  { icon: 'passport', title: 'Visa application assistance',            text: 'Guidance on preparing and submitting your student visa application.',
    details: ['Country-specific document list', 'Financial documents reviewed before filing', 'Appointment and submission guidance'] },
  { icon: 'check',    title: 'Documentation & interview preparation',  text: 'Getting every document right and practising for university and visa interviews.',
    details: ['Attestation and translation guidance', 'Mock interviews for universities and embassies', 'Common questions and how to answer honestly'] },
  { icon: 'plane',    title: 'Pre-departure guidance',                 text: 'Travel, accommodation and what to expect in your first weeks abroad.',
    details: ['Travel, packing and arrival checklist', 'Accommodation guidance', 'Part-time work and local rules briefing'] }
];

const PROCESS = [
  { title: 'Free consultation',       text: 'Share your results, goals and budget with a counsellor.' },
  { title: 'University selection',    text: 'We shortlist the countries and universities that fit.' },
  { title: 'Document preparation',    text: 'We guide you through every certificate, letter and form.' },
  { title: 'Application submission',  text: 'We submit your application and follow up with the university.' },
  { title: 'Admission & visa',        text: 'Offer letter first, then a carefully prepared visa file.' },
  { title: 'Fly to your destination', text: 'A pre-departure briefing so you arrive ready.' }
];

/* leadership (PDF "Leadership Team"): bio for the homepage, story for the About page */
const TEAM = [
  { id: 'ceo', name: 'MD Ibna Faysal', role: 'Chief Executive Officer & Country Director', location: 'Dhaka, Bangladesh', photo: 'assets/img/team/ceo.jpg',
    bio: 'Leads EduRise in Bangladesh: student counselling, admissions and service standards. His own studies in Malaysia inspired him to start EduRise.',
    story: 'MD Ibna Faysal leads the overall operations of EduRise Global in Bangladesh and is responsible for student counselling, admission management and the consultancy’s service standards. He studied in Malaysia, where his journey in international education began, and that experience inspired him to establish EduRise Global. Because he faced the same challenges himself, he focuses on honest, practical and student-focused guidance, so that every student gets accurate information and realistic expectations before a life-changing decision.',
    tags: ['Studied in Malaysia'] },
  { id: 'faysal', name: 'Faysal Ahmed', role: 'Chairman, European Affairs', location: 'Madrid, Spain', photo: 'assets/img/team/faysal.jpg',
    bio: 'Oversees European operations and supervises admissions for Malta, South Korea, Japan and other European destinations.',
    story: 'Faysal Ahmed lives in Spain and oversees EduRise Global’s European operations and international coordination. He completed his studies in South Korea, moved to Austria for further study, and then settled in Spain. He supervises admission processes for Malta, South Korea, Japan and several European destinations, and strengthens EduRise Global’s academic network with first-hand knowledge of studying and living abroad.',
    tags: ['Studied in South Korea', 'Austria'] },
  { id: 'raihan', name: 'Raihan Gazi', role: 'Managing Director, Global Partnerships', location: 'United Kingdom', photo: 'assets/img/team/raihan.jpg',
    bio: 'Builds relationships with universities and explores new study destinations. ACCA qualified and runs his own business in the UK.',
    story: 'Raihan Gazi is based in the United Kingdom and leads EduRise Global’s global partnerships and international collaborations. He has completed ACCA and runs his own professional business in the UK. His role is to build relationships with institutions, explore new study destinations and keep EduRise Global well connected across the global education industry.',
    tags: ['ACCA qualified', 'Business owner in the UK'] }
];

const COMMITMENT = {
  quote: 'Studying abroad is one of the most important decisions in a student’s life. Our goal is not just to send students abroad, but to help them build a successful global future.',
  points: ['Honest and realistic advice', 'A transparent process and clear documentation', 'Professional support from an internationally experienced team', 'Continuous guidance from application to departure']
};

/* =====================================================================
   ABOUT (Phase 4) — PDF company profile
   ===================================================================== */
const ABOUT = {
  intro: [
    'EduRise Global is an international education consultancy that guides students toward quality higher education around the world. We help each student choose the right academic pathway, country and university based on their academic background, career goals and financial capacity.',
    'Our support covers the entire process, from career counselling and university selection to admission, visa processing and pre-departure guidance.',
    'EduRise Global is built on honesty, transparency and real international experience. Our leadership team has studied and lived in different countries, so we give practical, realistic advice instead of theory. Our network across Bangladesh, Europe and the United Kingdom keeps us connected with education systems and universities abroad.'
  ],
  vision: 'To become a globally trusted education consultancy that empowers students to access international education and build successful global careers.',
  mission: ['Provide honest and transparent guidance to students', 'Help students choose the best academic pathway for their profile', 'Connect students with globally recognised universities', 'Support students through every step of the study abroad journey']
};

const OFFICES = [
  { tag: 'Head office', country: 'Bangladesh', name: 'Dhaka, Bijoy Nagar', address: '177 Mahtab Center, 6th Floor, Room 01, Bijoy Nagar, Dhaka-1000', map: 'Mahtab Center Bijoy Nagar Dhaka', tbc: false },
  { tag: 'Branch',      country: 'Bangladesh', name: 'Dhaka, Purana Paltan', address: '37/2 Zaman Tower, Culvert Road, Purana Paltan, Dhaka-1000', map: 'Zaman Tower Purana Paltan Dhaka', tbc: true },
  { tag: 'European Affairs', country: 'Spain', name: 'Madrid', address: 'Sta Valle de Oro, 8-02 IZ, 28019 Madrid', map: 'Valle de Oro 28019 Madrid', tbc: false },
  { tag: 'Global Partnerships', country: 'United Kingdom', name: 'Suffolk', address: '24 Suffolk Road Court, Suffolk', map: 'Suffolk Road Court Suffolk', tbc: true }
];

/* =====================================================================
   PROGRAMS (Phase 4, Package 1: fixed program types)
   ===================================================================== */
const PROGRAM_TYPES = [
  { id: 'bachelors', icon: 'cap', title: 'Bachelor’s degree', who: 'After HSC, A-levels or a Diploma',
    text: 'Three to four year undergraduate degrees taught in English or the local language, with first-year and transfer entry.',
    requirements: ['HSC / A-levels or equivalent', 'IELTS 5.5 to 6.0 for most English-taught programs', 'Some universities accept a study gap'],
    destinations: ['korea', 'uk', 'malta', 'italy', 'finland', 'malaysia', 'china'] },
  { id: 'masters', icon: 'award', title: 'Master’s degree', who: 'After a Bachelor’s degree',
    text: 'One to two year postgraduate degrees. Several Korean and Japanese universities offer programs without IELTS.',
    requirements: ['Completed Bachelor’s degree, usually CGPA 2.70+', 'IELTS 5.5 to 6.5, or without IELTS at selected universities', 'Statement of purpose and recommendation letters'],
    destinations: ['korea', 'japan', 'uk', 'malta', 'italy', 'russia', 'finland', 'malaysia', 'china'] },
  { id: 'language', icon: 'globe', title: 'Language programs (KLP / EAP)', who: 'Before or alongside a degree',
    text: 'Korean Language Program (KLP) and English for Academic Purposes (EAP) help students build the language level a degree needs.',
    requirements: ['HSC or Bachelor’s, depending on the next degree', 'No IELTS needed for most language programs', 'Progression to a degree after completion'],
    destinations: ['korea', 'china'] },
  { id: 'diploma', icon: 'doc', title: 'Foundation, Diploma & Certificate', who: 'After SSC or HSC',
    text: 'Shorter, practical programs and foundation years that lead into a Bachelor’s degree, often with credit transfer.',
    requirements: ['SSC / HSC or equivalent', 'Lower English requirements at selected institutions', 'Credit transfer options to a degree'],
    destinations: ['malaysia'] }
];

/* =====================================================================
   SCHOLARSHIPS (Phase 4, Package 1: list written at development time)
   University offers are SAMPLE data from EduRise Facebook posts (TBC).
   ===================================================================== */
const SCHOLARSHIP_OFFERS = [
  { id: 'sch-gachon', university: 'Gachon University', dest: 'korea', levels: ['Master’s'], level: 'Master’s (MBA)', award: '50% tuition waiver', condition: 'First semester, all admitted students', intakeId: 'gachon-r1' },
  { id: 'sch-kyungsung', university: 'Kyungsung University', dest: 'korea', levels: ['Bachelor’s'], level: 'Bachelor’s', award: '30% to 50%', condition: 'First semester, by IELTS score (5.5 / 7.0 / 7.5+)', intakeId: 'kyungsung-r2' },
  { id: 'sch-pyeongtaek', university: 'Pyeongtaek University', dest: 'korea', levels: ['Master’s'], level: 'Master’s', award: '30% to 50%', condition: 'By IELTS or TOEFL score', intakeId: 'pyeongtaek' },
  { id: 'sch-russia', university: 'Russian universities', dest: 'russia', levels: ['Master’s'], level: 'Master’s', award: 'Fully funded places', condition: 'Tuition waiver, stipend, dormitory and insurance', intakeId: 'russia' },
  { id: 'sch-china', university: 'Chinese universities', dest: 'china', levels: ['Bachelor’s', 'Master’s'], level: 'Bachelor’s · Master’s', award: 'Up to 100% tuition', condition: 'CSC and university scholarships', intakeId: 'china' },
  { id: 'sch-jeonbuk', university: 'Jeonbuk National University', dest: 'korea', levels: ['Master’s'], level: 'Master’s', award: 'Up to 80%', condition: 'Selected applicants', intakeId: 'jeonbuk' }
];
const GOV_SCHOLARSHIPS = [
  { code: 'US', name: 'Fulbright Foreign Student Program', country: 'USA', coverage: 'Fully funded', levels: 'Master’s · PhD', url: 'https://foreign.fulbrightonline.org' },
  { code: 'UK', name: 'Chevening Scholarships', country: 'United Kingdom', coverage: 'Fully funded', levels: 'One-year Master’s', url: 'https://www.chevening.org' },
  { code: 'EU', name: 'Erasmus Mundus Joint Master’s', country: 'Europe', coverage: 'Fully funded', levels: 'Joint Master’s', url: 'https://erasmus-plus.ec.europa.eu' },
  { code: 'AU', name: 'Australia Awards', country: 'Australia', coverage: 'Fully funded', levels: 'Bachelor’s · Master’s · PhD', url: 'https://www.dfat.gov.au/people-to-people/australia-awards' },
  { code: 'DE', name: 'DAAD Scholarships', country: 'Germany', coverage: 'Full or partial', levels: 'Master’s · PhD', url: 'https://www.daad.de/en/' },
  { code: 'JP', name: 'MEXT Scholarship', country: 'Japan', coverage: 'Fully funded', levels: 'Bachelor’s · Master’s · PhD', url: 'https://www.studyinjapan.go.jp/en/' },
  { code: 'CN', name: 'Chinese Government Scholarship (CSC)', country: 'China', coverage: 'Fully funded', levels: 'Bachelor’s · Master’s · PhD', url: 'https://www.campuschina.org' },
  { code: 'FI', name: 'Finland Government Scholarship Pool', country: 'Finland', coverage: 'Full or partial', levels: 'Selected programs', url: 'https://www.studyinfinland.fi' },
  { code: 'IT', name: 'Italian Government Scholarships (MAECI)', country: 'Italy', coverage: 'Fully funded', levels: 'Bachelor’s · Master’s · PhD', url: 'https://studyinitaly.esteri.it' },
  { code: 'CA', name: 'Canadian graduate scholarships', country: 'Canada', coverage: 'Varies', levels: 'Master’s · PhD', url: 'https://www.educanada.ca', note: 'Canada has been changing its scholarship programs. Check the current one before applying.' }
];

/* =====================================================================
   POLICIES (Phase 4) — draft wording, final text to be agreed (TBC)
   ===================================================================== */
const POLICIES = [
  { id: 'privacy', title: 'Privacy policy', paragraphs: [
    'We collect the details you send through our forms or WhatsApp, such as your name, phone number, email, qualification and preferred country, only to answer your enquiry and support your application.',
    'We share your documents with universities, scholarship bodies or visa authorities only when you ask us to apply on your behalf. We do not sell your data.',
    'You can ask us to correct or delete your details at any time by contacting us.'] },
  { id: 'terms', title: 'Terms of use', paragraphs: [
    'Content on this website is general guidance and does not create a service agreement. Services, fees and refund terms are confirmed in writing before any payment.',
    'Program details, fees and dates may change. Always confirm the current details with a counsellor before you apply.'] },
  { id: 'disclaimer', title: 'Disclaimer', paragraphs: [
    'Admission requirements, tuition, scholarships, work rights and family accompaniment rules are set by universities and governments, and they can change without notice.',
    'EduRise Global cannot guarantee admission, a scholarship or a visa. Those decisions belong to the university, the scholarship body or the immigration authority.',
    'University and scholarship names are used for information only and do not imply a partnership unless stated.'] }
];

/* =====================================================================
   PACKAGE 2 LISTINGS (Phase 5)
   On the live site staff manage these lists from the admin panel.
   Sample data from EduRise Facebook posts; every item is TBC.
   ===================================================================== */
const LEVELS = ['Foundation', 'Diploma', 'Bachelor’s', 'Master’s', 'Language'];

/* universities: summary cards with an enquiry button (no detail pages in Package 2) */
const UNIVERSITIES = [
  { id: 'gachon', name: 'Gachon University', dest: 'korea', city: 'Seongnam, 20 to 30 minutes from Seoul', levels: ['Master’s'],
    summary: 'Private university near Seoul with an English-taught MBA and an E-visa route.',
    facts: [['English', 'IELTS 5.5'], ['Scholarship', '50% first-semester tuition'], ['Next intake', 'March 2027']] },
  { id: 'kyungsung', name: 'Kyungsung University', dest: 'korea', city: 'Busan', levels: ['Bachelor’s'],
    summary: 'Six Bachelor’s programs including Global Business, Hospitality, Korean Studies and IT Engineering.',
    facts: [['English', 'IELTS 5.5 or TOEFL iBT 71'], ['Scholarship', '30% to 50% by IELTS score'], ['Next intake', 'March 2027']] },
  { id: 'pyeongtaek', name: 'Pyeongtaek University', dest: 'korea', city: 'Pyeongtaek', levels: ['Master’s'],
    summary: 'Fully English-taught Master’s in Business Administration and Environmental Convergence Engineering.',
    facts: [['English', 'IELTS 5.5 / TOEFL 71 / CEFR B2'], ['Scholarship', '30% to 50% by English score'], ['Next intake', 'March 2027']] },
  { id: 'jeonbuk', name: 'Jeonbuk National University', dest: 'korea', city: 'Jeonju', levels: ['Master’s'],
    summary: 'National university with large scholarships for selected Master’s applicants.',
    facts: [['English', 'Depends on the program'], ['Scholarship', 'Up to 80% for selected applicants'], ['Next intake', 'To be announced']] }
];

/* intakes: application windows with automatic status
   s / e = first and last day to apply (Dhaka time); tba = dates not announced yet.
   Closed windows disappear from the site on their own. */
const INTAKES = [
  { id: 'gachon-r1',    dest: 'korea',    title: 'Gachon University · MBA',                        levels: ['Master’s'],   intake: 'March 2027',  round: 'Round 1', s: '2026-10-07', e: '2026-10-14' },
  { id: 'gachon-r2',    dest: 'korea',    title: 'Gachon University · MBA',                        levels: ['Master’s'],   intake: 'March 2027',  round: 'Round 2', s: '2026-11-11', e: '2026-11-18' },
  { id: 'kyungsung-r2', dest: 'korea',    title: 'Kyungsung University · Bachelor’s',              levels: ['Bachelor’s'], intake: 'March 2027',  round: 'Round 2 (incl. transfer)', s: '2026-09-28', e: '2026-10-12' },
  { id: 'pyeongtaek',   dest: 'korea',    title: 'Pyeongtaek University · Master’s',               levels: ['Master’s'],   intake: 'March 2027',  round: 'Spring 2027 admission', tba: true },
  { id: 'russia',       dest: 'russia',   title: 'Russian universities · Fully funded Master’s',   levels: ['Master’s'],   intake: '2027',        round: '2027 scholarship round', tba: true },
  { id: 'finland',      dest: 'finland',  title: 'Finnish universities · Bachelor’s and Master’s', levels: ['Bachelor’s', 'Master’s'], intake: 'January 2027', round: 'January intake', tba: true },
  { id: 'malaysia',     dest: 'malaysia', title: 'Malaysian universities · Foundation to Master’s', levels: ['Foundation', 'Diploma', 'Bachelor’s', 'Master’s'], intake: 'Next intake', round: 'Rolling intakes', tba: true },
  { id: 'china',        dest: 'china',    title: 'Chinese universities · Degree and language',     levels: ['Bachelor’s', 'Master’s', 'Language'], intake: 'September 2027', round: 'September intake', tba: true },
  { id: 'korea-lang',   dest: 'korea',    title: 'Korean universities · KLP and EAP',              levels: ['Language'],   intake: '2027',        round: 'Language programs', tba: true },
  { id: 'jeonbuk',      dest: 'korea',    title: 'Jeonbuk National University · Master’s',         levels: ['Master’s'],   intake: 'Fall 2026',   round: 'Application', s: '2026-05-18', e: '2026-05-29' }
];

/* =====================================================================
   STORIES AND NEWS (Phase 6, Package 2)
   ===================================================================== */

/* Student testimonials. Empty on purpose: only real stories, published with the
   student's written consent, may appear. The homepage section stays hidden until
   at least one story with consent: true exists. Format:
   { id: 't-1', name: 'Student name', destination: 'South Korea', university: 'University name',
     program: 'Master’s in …', quote: 'In the student’s own words', consent: true } */
const TESTIMONIALS = [];

/* News posts. SAMPLE posts written from EduRise's Facebook announcements (TBC). */
const NEWS = [
  { id: 'n-gachon', date: '2026-10-07', tag: 'Intake', title: 'Gachon University MBA: March 2027 applications are open',
    summary: 'Round 1 for the English-taught MBA at Gachon University near Seoul runs from 7 to 14 October 2026, with a 50% first-semester tuition waiver.',
    body: 'Gachon University in Seongnam, 20 to 30 minutes from Seoul, is accepting applications for its March 2027 MBA intake. Round 1 runs from 7 to 14 October 2026 and Round 2 from 11 to 18 November 2026. Admitted students receive a 50% tuition waiver in the first semester. The minimum English requirement is IELTS 5.5. Talk to a counsellor to check your documents before the deadline.' },
  { id: 'n-kyungsung', date: '2026-09-28', tag: 'Intake', title: 'Kyungsung University opens Round 2 for Bachelor’s and transfer students',
    summary: 'Busan-based Kyungsung University is taking first-year and transfer applications for March 2027 until 12 October 2026.',
    body: 'Kyungsung University in Busan offers Bachelor’s programs in Global Business Administration, Global Hospitality Management, Global Korean Studies, International Studies, Global Mechanical Design Engineering and Global IT Engineering. Round 2 applications, including transfer applications, are open from 28 September to 12 October 2026. Scholarships of 30%, 40% or 50% for the first semester are linked to IELTS scores of 5.5, 7.0 and 7.5+.' },
  { id: 'n-russia', date: '2026-09-15', tag: 'Scholarship', title: 'Fully funded Master’s places in Russia for 2027',
    summary: 'Scholarship places cover tuition, a monthly stipend, dormitory accommodation and health insurance.',
    body: 'Russian universities are offering fully funded Master’s places for the 2027 intake in engineering, computer science, business, economics, natural sciences, agriculture and the humanities. Applicants usually need a completed Bachelor’s degree with a CGPA of 2.70 or higher (some programs accept 2.50), and many programs do not require IELTS. A study gap of up to 10 years and an age limit of around 35 apply at most universities.' }
];
