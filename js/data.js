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
  currentPhase: 4                             // links to features from later phases explain when they arrive
};

/* ---------- navigation: one list feeds the header, the mobile drawer and the footer ---------- */
const NAV = [
  { id: 'home',         label: 'Home',         href: 'index.html',        phase: 2 },
  { id: 'destinations', label: 'Destinations', href: 'destinations.html', phase: 4 },
  { id: 'programs',     label: 'Programs',     href: 'programs.html',     phase: 4 },
  { id: 'scholarships', label: 'Scholarships', href: 'scholarships.html', phase: 4 },
  { id: 'services',     label: 'Services',     href: 'services.html',     phase: 4 },
  { id: 'about',        label: 'About',        href: 'about.html',        phase: 4 },
  { id: 'contact',      label: 'Contact',      href: 'contact.html',      phase: 4 }
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
  { name: 'MD Ibna Faysal', role: 'Chief Executive Officer & Country Director', location: 'Dhaka, Bangladesh', photo: 'assets/img/team/ceo.jpg',
    bio: 'Leads EduRise in Bangladesh: student counselling, admissions and service standards. His own studies in Malaysia inspired him to start EduRise.',
    story: 'MD Ibna Faysal leads the overall operations of EduRise Global in Bangladesh and is responsible for student counselling, admission management and the consultancy’s service standards. He studied in Malaysia, where his journey in international education began, and that experience inspired him to establish EduRise Global. Because he faced the same challenges himself, he focuses on honest, practical and student-focused guidance, so that every student gets accurate information and realistic expectations before a life-changing decision.',
    tags: ['Studied in Malaysia'] },
  { name: 'Faysal Ahmed', role: 'Chairman, European Affairs', location: 'Madrid, Spain', photo: 'assets/img/team/faysal.jpg',
    bio: 'Oversees European operations and supervises admissions for Malta, South Korea, Japan and other European destinations.',
    story: 'Faysal Ahmed lives in Spain and oversees EduRise Global’s European operations and international coordination. He completed his studies in South Korea, moved to Austria for further study, and then settled in Spain. He supervises admission processes for Malta, South Korea, Japan and several European destinations, and strengthens EduRise Global’s academic network with first-hand knowledge of studying and living abroad.',
    tags: ['Studied in South Korea', 'Austria'] },
  { name: 'Raihan Gazi', role: 'Managing Director, Global Partnerships', location: 'United Kingdom', photo: 'assets/img/team/raihan.jpg',
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
  { university: 'Gachon University', country: 'South Korea', level: 'Master’s (MBA)', award: '50% tuition waiver', condition: 'First semester, all admitted students', intake: 'March 2027' },
  { university: 'Kyungsung University', country: 'South Korea', level: 'Bachelor’s', award: '30% to 50%', condition: 'First semester, by IELTS score (5.5 / 7.0 / 7.5+)', intake: 'March 2027' },
  { university: 'Pyeongtaek University', country: 'South Korea', level: 'Master’s', award: '30% to 50%', condition: 'By IELTS or TOEFL score', intake: 'March 2027' },
  { university: 'Russian universities', country: 'Russia', level: 'Master’s', award: 'Fully funded places', condition: 'Tuition waiver, stipend, dormitory and insurance', intake: '2027' },
  { university: 'Chinese universities', country: 'China', level: 'Bachelor’s · Master’s', award: 'Up to 100% tuition', condition: 'CSC and university scholarships', intake: 'September / March' }
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
