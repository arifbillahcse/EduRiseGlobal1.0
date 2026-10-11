/* =====================================================================
   data.js — site settings and content. No logic here.
   Grows phase by phase; fields are added, never renamed.
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
  social: {
    facebook: 'https://www.facebook.com/EduRiseGlobalConsultancy',
    instagram: '',                            // TBC
    linkedin: ''                              // TBC
  },
  whatsappGreeting: 'Hello EduRise Global, I would like a free consultation about studying abroad.',
  currentPhase: 3                             // links to pages from later phases explain when they arrive
};

/* ---------- navigation: one list feeds the header, the mobile drawer and the footer ----------
   phase = the build phase in which the page becomes available */
const NAV = [
  { id: 'home',         label: 'Home',         href: '#home',         phase: 2 },
  { id: 'destinations', label: 'Destinations', href: '#destinations', phase: 4 },
  { id: 'programs',     label: 'Programs',     href: '#programs',     phase: 4 },
  { id: 'scholarships', label: 'Scholarships', href: '#scholarships', phase: 4 },
  { id: 'services',     label: 'Services',     href: '#services',     phase: 4 },
  { id: 'about',        label: 'About',        href: '#about',        phase: 4 },
  { id: 'contact',      label: 'Contact',      href: '#contact',      phase: 4 }
];

/* ---------- footer: destinations EduRise promotes (PDF profile + Facebook posts) ---------- */
const FOOTER_DESTINATIONS = ['South Korea', 'Japan', 'United Kingdom', 'Malta', 'Italy', 'Russia', 'Finland', 'Malaysia'];

/* ---------- footer: policy pages ---------- */
const LEGAL = [
  { label: 'Privacy policy', href: '#privacy',    phase: 4 },
  { label: 'Terms of use',   href: '#terms',      phase: 4 },
  { label: 'Disclaimer',     href: '#disclaimer', phase: 4 }
];

/* =====================================================================
   HOMEPAGE CONTENT (Phase 3)
   Sources: PDF company profile (services, leadership, commitment),
   previous website (6-step process), Facebook posts (destinations).
   ===================================================================== */

/* hero: destination cards (code = airport/city code) */
const HERO_DESTINATIONS = [
  { code: 'ICN', country: 'South Korea',    city: 'Seoul',    programs: 'Bachelor’s · Master’s · KLP · EAP', note: 'Our largest route, with English-score scholarships' },
  { code: 'TYO', country: 'Japan',          city: 'Tokyo',    programs: 'Master’s programs',                 note: 'Selected programs without IELTS' },
  { code: 'LON', country: 'United Kingdom', city: 'London',   programs: 'Bachelor’s · Master’s',             note: 'Partnerships managed by our UK team' },
  { code: 'MLA', country: 'Malta',          city: 'Valletta', programs: 'Bachelor’s · Master’s',             note: 'English-speaking EU country' },
  { code: 'ROM', country: 'Italy',          city: 'Rome',     programs: 'Bachelor’s · Master’s',             note: 'Public universities with low tuition' }
];
const HERO_MORE_DESTINATIONS = 'Russia, Finland, Malaysia, China and more';

/* hero: trust points */
const TRUST_POINTS = [
  { title: '3 countries',      text: 'Teams in Bangladesh, Spain and the United Kingdom' },
  { title: 'Lived experience', text: 'Leaders who studied in Malaysia, South Korea and Austria' },
  { title: 'End to end',       text: 'From first counselling to pre-departure' }
];

/* services (PDF: "Our Core Services") — icon = id in partials/icons.html */
const SERVICES = [
  { icon: 'user',     title: 'Career counselling & academic guidance', text: 'Personal guidance based on your academic background, career goals and financial plan.' },
  { icon: 'cap',      title: 'University & program selection',         text: 'A shortlist of universities and programs that suit your profile and budget.' },
  { icon: 'doc',      title: 'Admission application support',         text: 'Help preparing, checking and submitting your application and documents.' },
  { icon: 'award',    title: 'Scholarship guidance',                   text: 'Finding the scholarships you qualify for and applying for them on time.' },
  { icon: 'passport', title: 'Visa application assistance',            text: 'Guidance on preparing and submitting your student visa application.' },
  { icon: 'check',    title: 'Documentation & interview preparation',  text: 'Getting every document right and practising for university and visa interviews.' },
  { icon: 'plane',    title: 'Pre-departure guidance',                 text: 'Travel, accommodation and what to expect in your first weeks abroad.' }
];

/* process (previous website: six steps) */
const PROCESS = [
  { title: 'Free consultation',      text: 'Share your results, goals and budget with a counsellor.' },
  { title: 'University selection',   text: 'We shortlist the countries and universities that fit.' },
  { title: 'Document preparation',   text: 'We guide you through every certificate, letter and form.' },
  { title: 'Application submission', text: 'We submit your application and follow up with the university.' },
  { title: 'Admission & visa',       text: 'Offer letter first, then a carefully prepared visa file.' },
  { title: 'Fly to your destination', text: 'A pre-departure briefing so you arrive ready.' }
];

/* leadership (PDF: "Leadership Team") */
const TEAM = [
  { name: 'MD Ibna Faysal', role: 'Chief Executive Officer & Country Director', location: 'Dhaka, Bangladesh', photo: 'assets/img/team/ceo.jpg',
    bio: 'Leads EduRise in Bangladesh: student counselling, admissions and service standards. His own studies in Malaysia inspired him to start EduRise.',
    tags: ['Studied in Malaysia'] },
  { name: 'Faysal Ahmed', role: 'Chairman, European Affairs', location: 'Madrid, Spain', photo: 'assets/img/team/faysal.jpg',
    bio: 'Oversees European operations and supervises admissions for Malta, South Korea, Japan and other European destinations.',
    tags: ['Studied in South Korea', 'Austria'] },
  { name: 'Raihan Gazi', role: 'Managing Director, Global Partnerships', location: 'United Kingdom', photo: 'assets/img/team/raihan.jpg',
    bio: 'Builds relationships with universities and explores new study destinations. ACCA qualified and runs his own business in the UK.',
    tags: ['ACCA qualified'] }
];

/* our commitment (PDF) */
const COMMITMENT = {
  quote: 'Studying abroad is one of the most important decisions in a student’s life. Our goal is not just to send students abroad, but to help them build a successful global future.',
  points: ['Honest and realistic advice', 'A transparent process and clear documentation', 'Professional support from an internationally experienced team', 'Continuous guidance from application to departure']
};

/* ---------- build progress (development aid; remove at launch) ---------- */
const BUILD_PLAN = [
  { phase: 1, title: 'Design foundation and style guide', done: true },
  { phase: 2, title: 'Header, navigation, footer, WhatsApp button', done: true },
  { phase: 3, title: 'Homepage: hero, services, process, leadership, commitment', done: true },
  { phase: 4, title: 'Destinations, programs, scholarships, about, contact, policies' },
  { phase: 5, title: 'Listings with filters, enquiry forms, intake list (Package 2)' },
  { phase: 6, title: 'Testimonials, news, admin preview (Package 2)' },
  { phase: 7, title: 'Program details, application board, eligibility quiz (Package 3)' },
  { phase: 8, title: 'Bangla, lead list, downloads, final QA (Package 3)' }
];
