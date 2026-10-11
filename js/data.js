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
  currentPhase: 2                             // links to pages from later phases explain when they arrive
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

/* ---------- build progress (development aid; remove at launch) ---------- */
const BUILD_PLAN = [
  { phase: 1, title: 'Design foundation and style guide', done: true },
  { phase: 2, title: 'Header, navigation, footer, WhatsApp button', done: true },
  { phase: 3, title: 'Homepage: hero, services, process, leadership, commitment' },
  { phase: 4, title: 'Destinations, programs, scholarships, about, contact, policies' },
  { phase: 5, title: 'Listings with filters, enquiry forms, intake list (Package 2)' },
  { phase: 6, title: 'Testimonials, news, admin preview (Package 2)' },
  { phase: 7, title: 'Program details, application board, eligibility quiz (Package 3)' },
  { phase: 8, title: 'Bangla, lead list, downloads, final QA (Package 3)' }
];
