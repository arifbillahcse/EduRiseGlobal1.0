/* =====================================================================
   i18n.js — English / বাংলা switch (Phase 8, Package 3).

   How it works: the site is written in English. When a visitor picks
   বাংলা, every visible text, placeholder and label that has a Bangla
   version below is swapped, including content drawn later by scripts
   (a MutationObserver watches for it). Switching back restores the
   English exactly. The choice is remembered in the browser.

   To translate more text: add "English text": "বাংলা" to BN.
   The English key must match the text on the page exactly.
   Long-form content (country guides, program details, policies) is
   added per item by staff in the admin panel on the live site. (TBC)
   ===================================================================== */

const BN = {
  /* ---------- shell ---------- */
  'Skip to content': 'মূল অংশে যান',
  'Website demo for client review.': 'ক্লায়েন্ট রিভিউয়ের জন্য ওয়েবসাইট ডেমো।',
  '= information still to be confirmed by EduRise': '= যে তথ্য EduRise এখনো নিশ্চিত করেনি',
  'Dhaka · Madrid · Suffolk': 'ঢাকা · মাদ্রিদ · সাফোক',
  'Home': 'হোম', 'Destinations': 'গন্তব্য দেশ', 'Universities': 'বিশ্ববিদ্যালয়', 'Programs': 'প্রোগ্রাম',
  'Scholarships': 'স্কলারশিপ', 'Services': 'সেবাসমূহ', 'About': 'আমাদের সম্পর্কে', 'Contact': 'যোগাযোগ',
  'Free consultation': 'ফ্রি কনসালটেশন', 'Book a free consultation': 'ফ্রি কনসালটেশন বুক করুন',
  'Explore': 'এক্সপ্লোর', 'Eligibility check': 'যোগ্যতা যাচাই', 'Cost estimator': 'খরচের হিসাব',
  'News': 'খবর', 'Staff dashboard (demo)': 'স্টাফ ড্যাশবোর্ড (ডেমো)',
  'Offices:': 'অফিস:', 'Dhaka (head office) · Madrid, Spain · Suffolk, UK': 'ঢাকা (প্রধান অফিস) · মাদ্রিদ, স্পেন · সাফোক, যুক্তরাজ্য',
  'EduRise Global. All rights reserved.': 'EduRise Global. সর্বস্বত্ব সংরক্ষিত।',
  'Privacy policy': 'গোপনীয়তা নীতি', 'Terms of use': 'ব্যবহারের শর্তাবলি', 'Disclaimer': 'দায়মুক্তি',
  'WhatsApp us': 'হোয়াটসঅ্যাপ করুন', 'Chat on WhatsApp': 'হোয়াটসঅ্যাপে কথা বলুন',
  'Guiding your global future. An international education and career consultancy in Dhaka, with teams in Spain and the United Kingdom.':
    'আপনার বৈশ্বিক ভবিষ্যতের পথপ্রদর্শক। ঢাকাভিত্তিক আন্তর্জাতিক শিক্ষা ও ক্যারিয়ার কনসালটেন্সি, স্পেন ও যুক্তরাজ্যে টিমসহ।',
  'Open menu': 'মেনু খুলুন', 'Close menu': 'মেনু বন্ধ করুন', 'Menu': 'মেনু', 'Breadcrumb': 'পথনির্দেশ',
  'Chat with EduRise on WhatsApp': 'হোয়াটসঅ্যাপে EduRise-এর সাথে কথা বলুন',

  /* ---------- countries ---------- */
  'South Korea': 'দক্ষিণ কোরিয়া', 'Japan': 'জাপান', 'United Kingdom': 'যুক্তরাজ্য', 'Malta': 'মাল্টা', 'Italy': 'ইতালি',
  'Russia': 'রাশিয়া', 'Finland': 'ফিনল্যান্ড', 'Malaysia': 'মালয়েশিয়া', 'China': 'চীন', 'Bangladesh': 'বাংলাদেশ',
  'Dhaka, Bangladesh': 'ঢাকা, বাংলাদেশ', 'Madrid, Spain': 'মাদ্রিদ, স্পেন',

  /* ---------- levels and shared words ---------- */
  'Bachelor’s': 'স্নাতক', 'Master’s': 'স্নাতকোত্তর', 'Foundation': 'ফাউন্ডেশন', 'Diploma': 'ডিপ্লোমা', 'Language': 'ভাষা প্রোগ্রাম',
  'Bachelor’s · Master’s': 'স্নাতক · স্নাতকোত্তর', 'Bachelor’s · Master’s · Language (KLP / EAP)': 'স্নাতক · স্নাতকোত্তর · ভাষা (KLP / EAP)',
  'Bachelor’s · Master’s · Language': 'স্নাতক · স্নাতকোত্তর · ভাষা', 'Foundation · Diploma · Bachelor’s · Master’s': 'ফাউন্ডেশন · ডিপ্লোমা · স্নাতক · স্নাতকোত্তর',
  'Package 2': 'প্যাকেজ ২', 'Package 3': 'প্যাকেজ ৩', 'Read more': 'আরও পড়ুন', 'Show less': 'কম দেখান',
  'Enquire': 'জিজ্ঞাসা করুন', 'Clear': 'মুছুন', 'Compare': 'তুলনা', 'Back': 'পেছনে', 'Next': 'পরবর্তী',
  'Closes today': 'আজ শেষ', 'Closes tomorrow': 'আগামীকাল শেষ', 'Opens tomorrow': 'আগামীকাল শুরু', 'Closed': 'বন্ধ',
  'Dates to be announced': 'তারিখ ঘোষণা করা হবে', 'Ask us': 'জিজ্ঞাসা করুন', 'Without IELTS': 'IELTS ছাড়া', 'Waived': 'মওকুফ',

  /* ---------- homepage ---------- */
  'International Education & Career Consultancy': 'আন্তর্জাতিক শিক্ষা ও ক্যারিয়ার কনসালটেন্সি',
  'Study abroad with advice from people who have': 'বিদেশে পড়াশোনা করুন তাঁদের পরামর্শে, যাঁরা',
  'done it themselves.': 'নিজেরাই তা করেছেন।',
  'EduRise Global helps Bangladeshi students choose the right country, university and program for their results, goals and budget, from the first counselling session to pre-departure.':
    'আপনার ফলাফল, লক্ষ্য ও বাজেট অনুযায়ী সঠিক দেশ, বিশ্ববিদ্যালয় ও প্রোগ্রাম বেছে নিতে EduRise Global সাহায্য করে, প্রথম কাউন্সেলিং থেকে বিদেশযাত্রার প্রস্তুতি পর্যন্ত।',
  'Our services': 'আমাদের সেবাসমূহ',
  '3 countries': '৩টি দেশ', 'Teams in Bangladesh, Spain and the United Kingdom': 'বাংলাদেশ, স্পেন ও যুক্তরাজ্যে আমাদের টিম',
  'Lived experience': 'নিজস্ব অভিজ্ঞতা', 'Leaders who studied in Malaysia, South Korea and Austria': 'মালয়েশিয়া, দক্ষিণ কোরিয়া ও অস্ট্রিয়ায় পড়াশোনা করা নেতৃত্ব',
  'End to end': 'শুরু থেকে শেষ', 'From first counselling to pre-departure': 'প্রথম কাউন্সেলিং থেকে বিদেশযাত্রার প্রস্তুতি পর্যন্ত',
  'Study destination': 'পড়াশোনার গন্তব্য', 'Study destinations': 'পড়াশোনার গন্তব্য', 'Choose a destination': 'একটি দেশ বেছে নিন',
  'Our largest route, with English-score scholarships': 'আমাদের সবচেয়ে বড় রুট, ইংরেজি স্কোরভিত্তিক স্কলারশিপসহ',
  'Selected programs without IELTS': 'নির্বাচিত প্রোগ্রামে IELTS ছাড়া', 'Partnerships managed by our UK team': 'আমাদের যুক্তরাজ্য টিম পরিচালিত পার্টনারশিপ',
  'English-speaking EU country': 'ইংরেজিভাষী ইইউ দেশ', 'English-taught programs in the EU': 'ইইউ-তে ইংরেজি মাধ্যমের প্রোগ্রাম', 'Public universities with low tuition': 'কম টিউশনের পাবলিক বিশ্ববিদ্যালয়',
  'Also: Russia, Finland, Malaysia, China and more': 'আরও: রাশিয়া, ফিনল্যান্ড, মালয়েশিয়া, চীন ও অন্যান্য',
  'Also: Malta, Russia, Malaysia, China and more': 'আরও: মাল্টা, রাশিয়া, মালয়েশিয়া, চীন ও অন্যান্য',
  'What we do': 'আমরা যা করি', 'Support at every step of your journey': 'আপনার যাত্রার প্রতিটি ধাপে সহায়তা',
  'Seven services that cover the whole process. Use all of them, or only the ones you need.': 'পুরো প্রক্রিয়াজুড়ে সাতটি সেবা। সবগুলো বা শুধু প্রয়োজনীয়গুলো নিন।',
  'Career counselling & academic guidance': 'ক্যারিয়ার কাউন্সেলিং ও একাডেমিক নির্দেশনা',
  'Personal guidance based on your academic background, career goals and financial plan.': 'আপনার একাডেমিক ফলাফল, ক্যারিয়ার লক্ষ্য ও আর্থিক পরিকল্পনা অনুযায়ী ব্যক্তিগত নির্দেশনা।',
  'University & program selection': 'বিশ্ববিদ্যালয় ও প্রোগ্রাম নির্বাচন',
  'A shortlist of universities and programs that suit your profile and budget.': 'আপনার প্রোফাইল ও বাজেটের সাথে মানানসই বিশ্ববিদ্যালয় ও প্রোগ্রামের তালিকা।',
  'Admission application support': 'ভর্তি আবেদনে সহায়তা',
  'Help preparing, checking and submitting your application and documents.': 'আবেদন ও কাগজপত্র প্রস্তুত, যাচাই ও জমা দিতে সহায়তা।',
  'Scholarship guidance': 'স্কলারশিপ নির্দেশনা',
  'Finding the scholarships you qualify for and applying for them on time.': 'যেসব স্কলারশিপে আপনি যোগ্য, সেগুলো খুঁজে সময়মতো আবেদন।',
  'Visa application assistance': 'ভিসা আবেদনে সহায়তা',
  'Guidance on preparing and submitting your student visa application.': 'স্টুডেন্ট ভিসার আবেদন প্রস্তুত ও জমা দেওয়ার নির্দেশনা।',
  'Documentation & interview preparation': 'কাগজপত্র ও ইন্টারভিউ প্রস্তুতি',
  'Getting every document right and practising for university and visa interviews.': 'প্রতিটি কাগজ সঠিকভাবে প্রস্তুত করা এবং বিশ্ববিদ্যালয় ও ভিসা ইন্টারভিউয়ের অনুশীলন।',
  'Pre-departure guidance': 'বিদেশযাত্রার আগে নির্দেশনা',
  'Travel, accommodation and what to expect in your first weeks abroad.': 'ভ্রমণ, থাকার ব্যবস্থা এবং বিদেশে প্রথম কয়েক সপ্তাহে কী আশা করবেন।',
  'Not sure what you need?': 'কী দরকার বুঝতে পারছেন না?',
  'Start with a free consultation. We recommend only the services that help your case.': 'একটি ফ্রি কনসালটেশন দিয়ে শুরু করুন। আমরা শুধু সেই সেবাগুলোই সুপারিশ করি যা আপনার কাজে আসবে।',
  'Ask a counsellor': 'কাউন্সেলরকে জিজ্ঞাসা করুন',
  'Current intakes': 'চলমান ইনটেক', 'Application board': 'আবেদনের বোর্ড', 'Check your eligibility': 'আপনার যোগ্যতা যাচাই করুন',
  'Live application windows, soonest deadline first. Status updates on its own, and closed rounds leave the board.':
    'চলমান আবেদনের সময়সূচি, সবচেয়ে কাছের ডেডলাইন আগে। অবস্থা নিজে থেকেই আপডেট হয়, বন্ধ রাউন্ড বোর্ড থেকে সরে যায়।',
  'Departures': 'যাত্রা', 'Destination': 'গন্তব্য', 'University · Program': 'বিশ্ববিদ্যালয় · প্রোগ্রাম', 'Intake': 'ইনটেক', 'Status': 'অবস্থা',
  'Dhaka time (GMT+6) · updates automatically': 'ঢাকা সময় (GMT+6) · স্বয়ংক্রিয়ভাবে আপডেট হয়', 'All intakes →': 'সব ইনটেক →',
  'How it works': 'কীভাবে কাজ করি', 'Six steps from first call to departure': 'প্রথম কল থেকে বিদেশযাত্রা পর্যন্ত ছয়টি ধাপ',
  'A clear path, with one counsellor following your file from start to finish.': 'একটি স্পষ্ট পথ, শুরু থেকে শেষ পর্যন্ত একজন কাউন্সেলর আপনার ফাইল দেখবেন।',
  'Share your results, goals and budget with a counsellor.': 'আপনার ফলাফল, লক্ষ্য ও বাজেট কাউন্সেলরকে জানান।',
  'University selection': 'বিশ্ববিদ্যালয় নির্বাচন', 'We shortlist the countries and universities that fit.': 'মানানসই দেশ ও বিশ্ববিদ্যালয়ের তালিকা করি।',
  'Document preparation': 'কাগজপত্র প্রস্তুতি', 'We guide you through every certificate, letter and form.': 'প্রতিটি সার্টিফিকেট, চিঠি ও ফর্মে আমরা পথ দেখাই।',
  'Application submission': 'আবেদন জমা', 'We submit your application and follow up with the university.': 'আমরা আবেদন জমা দিই এবং বিশ্ববিদ্যালয়ের সাথে যোগাযোগ রাখি।',
  'Admission & visa': 'ভর্তি ও ভিসা', 'Offer letter first, then a carefully prepared visa file.': 'প্রথমে অফার লেটার, তারপর যত্নে প্রস্তুত ভিসা ফাইল।',
  'Fly to your destination': 'গন্তব্যে যাত্রা', 'A pre-departure briefing so you arrive ready.': 'যাত্রার আগে ব্রিফিং, যাতে প্রস্তুত হয়ে পৌঁছান।',
  'Leadership': 'নেতৃত্ব', 'The people who guide your application': 'যাঁরা আপনার আবেদনে পথ দেখান',
  'Each of our leaders has studied or built a career abroad, so the advice you get comes from experience.': 'আমাদের প্রত্যেক নেতা বিদেশে পড়াশোনা বা ক্যারিয়ার গড়েছেন, তাই আপনি পাবেন অভিজ্ঞতা থেকে আসা পরামর্শ।',
  'About EduRise': 'EduRise সম্পর্কে',
  'Chief Executive Officer & Country Director': 'প্রধান নির্বাহী কর্মকর্তা ও কান্ট্রি ডিরেক্টর', 'Chairman, European Affairs': 'চেয়ারম্যান, ইউরোপীয় বিষয়াবলি',
  'Managing Director, Global Partnerships': 'ব্যবস্থাপনা পরিচালক, গ্লোবাল পার্টনারশিপ',
  'Studied in Malaysia': 'মালয়েশিয়ায় পড়াশোনা', 'Studied in South Korea': 'দক্ষিণ কোরিয়ায় পড়াশোনা', 'Austria': 'অস্ট্রিয়া',
  'ACCA qualified': 'ACCA সম্পন্ন', 'Business owner in the UK': 'যুক্তরাজ্যে ব্যবসায়ী',
  'Latest updates': 'সর্বশেষ আপডেট', 'All news': 'সব খবর',
  'New intakes, scholarships and changes to the rules, as soon as we know about them.': 'নতুন ইনটেক, স্কলারশিপ ও নিয়মের পরিবর্তন, জানামাত্রই।',
  'Student stories': 'শিক্ষার্থীদের গল্প', 'In our students’ own words': 'আমাদের শিক্ষার্থীদের নিজের ভাষায়',
  'Our commitment': 'আমাদের প্রতিশ্রুতি',
  'Studying abroad is one of the most important decisions in a student’s life. Our goal is not just to send students abroad, but to help them build a successful global future.':
    'বিদেশে পড়াশোনা একজন শিক্ষার্থীর জীবনের সবচেয়ে গুরুত্বপূর্ণ সিদ্ধান্তগুলোর একটি। আমাদের লক্ষ্য শুধু বিদেশে পাঠানো নয়, বরং একটি সফল বৈশ্বিক ভবিষ্যৎ গড়তে সাহায্য করা।',
  'Honest and realistic advice': 'সৎ ও বাস্তবসম্মত পরামর্শ', 'A transparent process and clear documentation': 'স্বচ্ছ প্রক্রিয়া ও পরিষ্কার কাগজপত্র',
  'Professional support from an internationally experienced team': 'আন্তর্জাতিক অভিজ্ঞ টিমের পেশাদার সহায়তা', 'Continuous guidance from application to departure': 'আবেদন থেকে যাত্রা পর্যন্ত নিরবচ্ছিন্ন নির্দেশনা',
  'Talk to a counsellor this week': 'এই সপ্তাহেই একজন কাউন্সেলরের সাথে কথা বলুন',
  'Most families contact us on WhatsApp. Send a message and a counsellor will reply, usually on the same working day.': 'বেশিরভাগ পরিবার হোয়াটসঅ্যাপে যোগাযোগ করেন। মেসেজ পাঠান, সাধারণত একই কর্মদিবসে একজন কাউন্সেলর উত্তর দেবেন।',
  'Send us a message on WhatsApp and a counsellor will reply, usually on the same working day.': 'হোয়াটসঅ্যাপে মেসেজ পাঠান, সাধারণত একই কর্মদিবসে একজন কাউন্সেলর উত্তর দেবেন।',

  /* ---------- page headers and sections ---------- */
  'Choose where you want to study': 'কোথায় পড়তে চান বেছে নিন',
  'Each country guide covers the study levels we support, typical requirements, a document checklist and the rules to check before you apply.': 'প্রতিটি দেশের গাইডে আছে পড়াশোনার স্তর, সাধারণ যোগ্যতা, কাগজপত্রের তালিকা এবং আবেদনের আগে যাচাই করার নিয়ম।',
  'Filter': 'ফিল্টার', 'Study level': 'পড়াশোনার স্তর', 'All levels': 'সব স্তর', 'Country': 'দেশ', 'All countries': 'সব দেশ',
  'View country guide': 'দেশের গাইড দেখুন', 'Also served': 'আরও যেসব দেশ', 'We also guide applications to': 'এসব দেশেও আবেদনে সহায়তা করি',
  'Ask a counsellor about current intakes for these countries.': 'এসব দেশের চলমান ইনটেক সম্পর্কে কাউন্সেলরকে জিজ্ঞাসা করুন।',
  'Europe': 'ইউরোপ', 'North America': 'উত্তর আমেরিকা', 'Oceania': 'ওশেনিয়া',
  'Not sure which country fits you?': 'কোন দেশ আপনার জন্য উপযুক্ত, নিশ্চিত নন?',
  'Tell us your results, English score and budget. We will suggest the countries where you have a real chance.': 'আপনার ফলাফল, ইংরেজি স্কোর ও বাজেট জানান। যেসব দেশে আপনার সত্যিকারের সুযোগ আছে, আমরা সেগুলো জানাব।',
  'Study levels we support': 'যেসব স্তরে সহায়তা করি', 'Typical requirements': 'সাধারণ যোগ্যতা', 'Academic': 'একাডেমিক', 'CGPA': 'সিজিপিএ', 'Study gap': 'স্টাডি গ্যাপ',
  'Requirements differ by university and program. A counsellor confirms the exact requirements for your shortlist.': 'যোগ্যতা বিশ্ববিদ্যালয় ও প্রোগ্রামভেদে আলাদা। আপনার তালিকার সঠিক যোগ্যতা কাউন্সেলর নিশ্চিত করবেন।',
  'Please check before you apply:': 'আবেদনের আগে যাচাই করুন:',
  'Document checklist': 'কাগজপত্রের তালিকা', 'Tick what you already have.': 'যা আছে তাতে টিক দিন।',
  'Valid passport': 'বৈধ পাসপোর্ট', 'SSC and HSC certificates and transcripts': 'এসএসসি ও এইচএসসি সার্টিফিকেট ও ট্রান্সক্রিপ্ট',
  'Bachelor’s certificate and transcript (for Master’s)': 'স্নাতক সার্টিফিকেট ও ট্রান্সক্রিপ্ট (স্নাতকোত্তরের জন্য)', 'English test result, if required': 'ইংরেজি পরীক্ষার ফলাফল (প্রযোজ্য হলে)',
  'Statement of purpose': 'স্টেটমেন্ট অব পারপাস', 'CV': 'সিভি', 'Two recommendation letters': 'দুটি সুপারিশপত্র',
  'Bank solvency certificate and statement': 'ব্যাংক সলভেন্সি সার্টিফিকেট ও স্টেটমেন্ট', 'Passport-size photographs': 'পাসপোর্ট সাইজের ছবি',
  'Download checklist (PDF)': 'তালিকা ডাউনলোড (PDF)', 'Free profile review': 'ফ্রি প্রোফাইল রিভিউ', 'Send my results': 'আমার ফলাফল পাঠান',
  'Other destinations': 'অন্যান্য গন্তব্য', 'All destinations': 'সব গন্তব্য',
  'Universities & intakes': 'বিশ্ববিদ্যালয় ও ইনটেক', 'Universities and application intakes': 'বিশ্ববিদ্যালয় ও আবেদনের ইনটেক',
  'Universities we currently help students apply to, and the application windows that are open or coming up.': 'যেসব বিশ্ববিদ্যালয়ে আমরা এখন আবেদনে সহায়তা করি, এবং চলমান ও আসন্ন আবেদনের সময়সূচি।',
  'Universities we work with': 'যেসব বিশ্ববিদ্যালয়ের সাথে কাজ করি', 'Filter by country or study level, then send a quick enquiry on WhatsApp.': 'দেশ বা স্তর দিয়ে ফিল্টার করুন, তারপর হোয়াটসঅ্যাপে দ্রুত জিজ্ঞাসা পাঠান।',
  'Next intake': 'পরবর্তী ইনটেক', 'View program details': 'প্রোগ্রামের বিস্তারিত দেখুন', 'Intakes': 'ইনটেক', 'Application intakes': 'আবেদনের ইনটেক',
  'Open and upcoming windows, soonest first. Closed rounds are removed automatically.': 'চলমান ও আসন্ন সময়সূচি, সবচেয়ে কাছেরটি আগে। বন্ধ রাউন্ড নিজে থেকেই সরে যায়।',
  'Apply': 'আবেদন', 'Looking for a university that is not listed?': 'তালিকায় নেই এমন বিশ্ববিদ্যালয় খুঁজছেন?',
  'We work with more universities than we can list here. Tell us what you want to study and we will suggest options.': 'এখানে যত বিশ্ববিদ্যালয় দেখানো আছে, আমরা তার চেয়ে বেশি নিয়ে কাজ করি। কী পড়তে চান জানান, আমরা বিকল্প জানাব।',
'Find the right level of study': 'সঠিক পড়াশোনার স্তর খুঁজুন',
  'From foundation and diploma programs to Bachelor’s and Master’s degrees, plus language programs that prepare you for a degree.': 'ফাউন্ডেশন ও ডিপ্লোমা থেকে স্নাতক ও স্নাতকোত্তর, এবং ডিগ্রির প্রস্তুতির ভাষা প্রোগ্রাম।',
  'Program finder': 'প্রোগ্রাম খুঁজুন', 'Find a program': 'প্রোগ্রাম খুঁজুন', 'Estimate your cost': 'খরচের হিসাব করুন',
  'Search by country, level, teaching language, intake and English requirement.': 'দেশ, স্তর, পড়ানোর ভাষা, ইনটেক ও ইংরেজি যোগ্যতা দিয়ে খুঁজুন।',
  'Search': 'খুঁজুন', 'Taught in': 'পড়ানোর ভাষা', 'Any language': 'যেকোনো ভাষা', 'Any intake': 'যেকোনো ইনটেক',
  'Without IELTS only': 'শুধু IELTS ছাড়া', 'Applications open now': 'এখন আবেদন চলছে', 'Sample programs (TBC)': 'নমুনা প্রোগ্রাম (TBC)',
  'University, city or subject': 'বিশ্ববিদ্যালয়, শহর বা বিষয়',
  'Study levels': 'পড়াশোনার স্তর', 'Which level is right for you?': 'আপনার জন্য কোন স্তর উপযুক্ত?', 'Where you can study': 'কোথায় পড়তে পারবেন',
  'Which program is right for you?': 'আপনার জন্য কোন প্রোগ্রাম উপযুক্ত?', 'English': 'ইংরেজি', 'Tuition': 'টিউশন', 'Scholarship': 'স্কলারশিপ',
  'Scholarships that make studying abroad affordable': 'যে স্কলারশিপ বিদেশে পড়াশোনা সাশ্রয়ী করে',
  'University scholarships we help students apply for, and a guide to the major government scholarships.': 'যেসব বিশ্ববিদ্যালয় স্কলারশিপে আমরা আবেদনে সহায়তা করি, এবং প্রধান সরকারি স্কলারশিপের গাইড।',
  'Through EduRise': 'EduRise-এর মাধ্যমে', 'Current university scholarships': 'চলমান বিশ্ববিদ্যালয় স্কলারশিপ',
  'Many Korean universities set the scholarship by your English score. Higher scores mean a bigger tuition waiver.': 'অনেক কোরিয়ান বিশ্ববিদ্যালয় ইংরেজি স্কোর অনুযায়ী স্কলারশিপ দেয়। স্কোর যত বেশি, টিউশন ছাড় তত বেশি।',
  'Ask about the next round': 'পরবর্তী রাউন্ড সম্পর্কে জিজ্ঞাসা করুন', 'Guide': 'গাইড', 'Major government scholarships': 'প্রধান সরকারি স্কলারশিপ',
  'These are run by governments and foundations, not by EduRise. We help you check eligibility and prepare a strong application.': 'এগুলো সরকার ও ফাউন্ডেশন পরিচালিত, EduRise নয়। আমরা যোগ্যতা যাচাই ও শক্তিশালী আবেদন তৈরিতে সাহায্য করি।',
  'Coverage:': 'সুবিধা:', 'Official website': 'অফিশিয়াল ওয়েবসাইট', 'Fully funded': 'সম্পূর্ণ অর্থায়িত', 'Full or partial': 'সম্পূর্ণ বা আংশিক',
  'Find out which scholarships you qualify for': 'কোন স্কলারশিপে আপনি যোগ্য জেনে নিন',
  'Send your results and English score. We will check your eligibility before you spend time on an application.': 'আপনার ফলাফল ও ইংরেজি স্কোর পাঠান। আবেদনে সময় দেওয়ার আগেই আমরা যোগ্যতা যাচাই করব।',
  'One team stays with you from choosing a program to landing in a new country. Here is what each service includes.': 'প্রোগ্রাম বাছাই থেকে নতুন দেশে পৌঁছানো পর্যন্ত একটি টিম আপনার পাশে থাকে। প্রতিটি সেবায় যা থাকে:',
  'How we work': 'আমরা যেভাবে কাজ করি', 'What we will always tell you': 'যা আমরা সবসময় জানাব',
  'Which requirements you meet today, and which you still need': 'আজ কোন যোগ্যতা পূরণ করেন, আর কোনগুলো এখনো লাগবে',
  'The full cost: tuition, fees, living costs and our service charge': 'পুরো খরচ: টিউশন, ফি, থাকা-খাওয়া ও আমাদের সার্ভিস চার্জ',
  'That no consultancy can guarantee a visa. The decision belongs to the embassy': 'কোনো কনসালটেন্সি ভিসার নিশ্চয়তা দিতে পারে না। সিদ্ধান্ত দূতাবাসের',
  'When a rule has changed, and where to confirm it': 'কোনো নিয়ম বদলালে, এবং কোথায় তা নিশ্চিত করবেন',
  'About EduRise Global': 'EduRise Global সম্পর্কে', 'Honest guidance, built on real international experience': 'সত্যিকারের আন্তর্জাতিক অভিজ্ঞতায় গড়া সৎ নির্দেশনা',
  'An international education consultancy with a network across Bangladesh, Europe and the United Kingdom.': 'বাংলাদেশ, ইউরোপ ও যুক্তরাজ্যজুড়ে নেটওয়ার্কসহ একটি আন্তর্জাতিক শিক্ষা কনসালটেন্সি।',
  'Who we are': 'আমরা কারা', 'Our vision': 'আমাদের ভিশন', 'Our mission': 'আমাদের মিশন',
  'To become a globally trusted education consultancy that empowers students to access international education and build successful global careers.': 'বিশ্বব্যাপী আস্থাভাজন শিক্ষা কনসালটেন্সি হওয়া, যা শিক্ষার্থীদের আন্তর্জাতিক শিক্ষা ও সফল বৈশ্বিক ক্যারিয়ার গড়তে সক্ষম করে।',
  'Provide honest and transparent guidance to students': 'শিক্ষার্থীদের সৎ ও স্বচ্ছ নির্দেশনা দেওয়া', 'Help students choose the best academic pathway for their profile': 'প্রোফাইল অনুযায়ী সেরা একাডেমিক পথ বেছে নিতে সাহায্য করা',
  'Connect students with globally recognised universities': 'বিশ্বস্বীকৃত বিশ্ববিদ্যালয়ের সাথে শিক্ষার্থীদের যুক্ত করা', 'Support students through every step of the study abroad journey': 'বিদেশে পড়াশোনার প্রতিটি ধাপে সহায়তা করা',
  'Leadership team': 'নেতৃত্বের টিম', 'People who have studied and built careers abroad themselves.': 'যাঁরা নিজেরাই বিদেশে পড়াশোনা ও ক্যারিয়ার গড়েছেন।',
  'Offices': 'অফিস', 'Where to find us': 'আমাদের ঠিকানা', 'Open in Google Maps': 'গুগল ম্যাপে খুলুন', 'What students can expect from us': 'শিক্ষার্থীরা আমাদের কাছে যা আশা করতে পারেন',
  'Head office · Bangladesh': 'প্রধান অফিস · বাংলাদেশ', 'Branch · Bangladesh': 'শাখা · বাংলাদেশ', 'European Affairs · Spain': 'ইউরোপীয় বিষয়াবলি · স্পেন', 'Global Partnerships · United Kingdom': 'গ্লোবাল পার্টনারশিপ · যুক্তরাজ্য',
  'Talk to a counsellor': 'কাউন্সেলরের সাথে কথা বলুন', 'Visit our Dhaka office, call or WhatsApp us, or send a message below.': 'আমাদের ঢাকা অফিসে আসুন, কল বা হোয়াটসঅ্যাপ করুন, অথবা নিচে মেসেজ পাঠান।',
'New intakes, scholarships and rule changes for students planning to study abroad.': 'বিদেশে পড়তে আগ্রহী শিক্ষার্থীদের জন্য নতুন ইনটেক, স্কলারশিপ ও নিয়মের পরিবর্তন।',
  'All': 'সব', 'Update': 'আপডেট', 'Policies': 'নীতিমালা', 'Privacy, terms and disclaimer': 'গোপনীয়তা, শর্তাবলি ও দায়মুক্তি',
  'Draft wording for review. The final text will be agreed with EduRise before launch.': 'রিভিউয়ের জন্য খসড়া। চূড়ান্ত লেখা চালুর আগে EduRise-এর সাথে ঠিক করা হবে।',

  /* ---------- forms ---------- */
  'Send us a message': 'আমাদের মেসেজ পাঠান', 'Fields marked * are required. Email is optional, because most families prefer WhatsApp.': '* চিহ্নিত ঘর পূরণ করা আবশ্যক। ইমেইল ঐচ্ছিক, কারণ বেশিরভাগ পরিবার হোয়াটসঅ্যাপ পছন্দ করেন।',
  'Full name': 'পূর্ণ নাম', 'Phone / WhatsApp': 'ফোন / হোয়াটসঅ্যাপ', 'Email (optional)': 'ইমেইল (ঐচ্ছিক)', 'Highest qualification': 'সর্বোচ্চ শিক্ষাগত যোগ্যতা',
  'Select': 'বাছাই করুন', 'Preferred country': 'পছন্দের দেশ', 'Not decided yet': 'এখনো ঠিক করিনি', 'Other': 'অন্যান্য', 'Message': 'মেসেজ', 'Send message': 'মেসেজ পাঠান',
  'Enter your full name.': 'আপনার পূর্ণ নাম লিখুন।', 'Enter a Bangladeshi mobile number, for example 01712-345678.': 'বাংলাদেশি মোবাইল নম্বর লিখুন, যেমন 01712-345678।',
  'Check the email address, or leave it empty.': 'ইমেইল ঠিকানা দেখুন, অথবা ফাঁকা রাখুন।', 'Choose your highest qualification.': 'আপনার সর্বোচ্চ শিক্ষাগত যোগ্যতা বাছাই করুন।',
  'We use your details only to reply to your enquiry.': 'আপনার তথ্য শুধু আপনার জিজ্ঞাসার উত্তর দিতে ব্যবহার করি।',
  'Tell us your results, English score and what you would like to study.': 'আপনার ফলাফল, ইংরেজি স্কোর ও কী পড়তে চান জানান।',
  'Reach us directly': 'সরাসরি যোগাযোগ', 'Phone': 'ফোন', 'WhatsApp': 'হোয়াটসঅ্যাপ', 'Start a chat': 'চ্যাট শুরু করুন', 'Email': 'ইমেইল', 'Office hours': 'অফিস সময়',
  'Saturday to Thursday, 10:00 to 19:00': 'শনিবার থেকে বৃহস্পতিবার, সকাল ১০টা থেকে সন্ধ্যা ৭টা',
  'Quick enquiry': 'দ্রুত জিজ্ঞাসা', 'Ask about this': 'এ বিষয়ে জিজ্ঞাসা করুন', 'Send on WhatsApp': 'হোয়াটসঅ্যাপে পাঠান', 'Open WhatsApp': 'হোয়াটসঅ্যাপ খুলুন',
  'Your enquiry opens in WhatsApp with these details filled in. Press send there to reach a counsellor.': 'এই তথ্যসহ হোয়াটসঅ্যাপ খুলবে। কাউন্সেলরের কাছে পৌঁছাতে সেখানে সেন্ড চাপুন।',
  'Close': 'বন্ধ করুন', 'SSC / O-levels': 'এসএসসি / ও-লেভেল', 'HSC / A-levels': 'এইচএসসি / এ-লেভেল',

  /* ---------- program detail ---------- */
  'Level': 'স্তর', 'Duration': 'মেয়াদ', 'Visa route': 'ভিসার ধরন', 'About this program': 'প্রোগ্রাম সম্পর্কে', 'Major': 'মেজর', 'Available majors': 'যেসব মেজর আছে',
  'Requirements': 'যোগ্যতা', 'Documents': 'কাগজপত্র', 'Fees and costs': 'ফি ও খরচ', 'Item': 'বিষয়', 'Amount': 'পরিমাণ', 'Approx. in taka': 'আনুমানিক টাকায়',
  'Estimate my total cost': 'আমার মোট খরচের হিসাব করুন', 'Application timeline': 'আবেদনের সময়সূচি', 'First semester tuition': 'প্রথম সেমিস্টারের টিউশন',
  'days': 'দিন', 'hours': 'ঘণ্টা', 'min': 'মিনিট', 'until applications close (Dhaka time)': 'আবেদন শেষ হতে বাকি (ঢাকা সময়)', 'until applications open (Dhaka time)': 'আবেদন শুরু হতে বাকি (ঢাকা সময়)',
  'Enquire about this program': 'এই প্রোগ্রাম সম্পর্কে জিজ্ঞাসা করুন', 'Check my eligibility first': 'আগে আমার যোগ্যতা যাচাই করুন',
  'Last verified:': 'সর্বশেষ যাচাই:', 'Related programs': 'সম্পর্কিত প্রোগ্রাম', 'All programs': 'সব প্রোগ্রাম', 'Final amounts follow the university invoice.': 'চূড়ান্ত পরিমাণ বিশ্ববিদ্যালয়ের ইনভয়েস অনুযায়ী হবে।',

  /* ---------- eligibility ---------- */
  'Free eligibility check': 'ফ্রি যোগ্যতা যাচাই', 'Which programs fit your profile?': 'কোন প্রোগ্রাম আপনার প্রোফাইলের সাথে মানানসই?',
  'Five questions, about two minutes. The result is a guide based on published requirements, not an admission decision.': 'পাঁচটি প্রশ্ন, প্রায় দুই মিনিট। ফলাফল প্রকাশিত যোগ্যতার ভিত্তিতে একটি নির্দেশনা, ভর্তির সিদ্ধান্ত নয়।',
  'What is your highest completed qualification?': 'আপনার সর্বোচ্চ সম্পন্ন শিক্ষাগত যোগ্যতা কী?', 'HSC / A-levels or Diploma': 'এইচএসসি / এ-লেভেল বা ডিপ্লোমা',
  'Bachelor’s degree': 'স্নাতক ডিগ্রি', 'Master’s degree': 'স্নাতকোত্তর ডিগ্রি',
  'What was your latest CGPA (out of 4.00)?': 'আপনার সর্বশেষ সিজিপিএ কত (৪.০০-এর মধ্যে)?', 'Below 2.50': '২.৫০-এর নিচে', '2.50 to 2.69': '২.৫০ থেকে ২.৬৯', '2.70 to 2.99': '২.৭০ থেকে ২.৯৯', '3.00 or higher': '৩.০০ বা তার বেশি',
  'Do you have an English test score?': 'আপনার কি ইংরেজি পরীক্ষার স্কোর আছে?', 'Not yet': 'এখনো নেই', 'IELTS 5.5 to 6.0 (or equivalent)': 'IELTS ৫.৫ থেকে ৬.০ (বা সমমান)',
  'IELTS 6.5 or higher': 'IELTS ৬.৫ বা তার বেশি', 'Medium of instruction letter only': 'শুধু মিডিয়াম অব ইন্সট্রাকশন লেটার',
  'What can your family spend per year, including living costs?': 'থাকা-খাওয়াসহ আপনার পরিবার বছরে কত খরচ করতে পারবে?', 'Under BDT 5 lakh': '৫ লাখ টাকার কম',
  'BDT 5 to 10 lakh': '৫ থেকে ১০ লাখ টাকা', 'Over BDT 10 lakh': '১০ লাখ টাকার বেশি', 'Only with a full scholarship': 'শুধু সম্পূর্ণ স্কলারশিপ পেলে',
  'Where would you like to study?': 'কোথায় পড়তে চান?', 'Japan, China or Malaysia': 'জাপান, চীন বা মালয়েশিয়া', 'Europe (Russia, Finland and others)': 'ইউরোপ (রাশিয়া, ফিনল্যান্ড ও অন্যান্য)',
  'Open to suggestions': 'যেকোনো পরামর্শ বিবেচনা করব', 'See my matches': 'আমার মিল দেখুন', 'Your matches': 'আপনার মিল', 'Programs that fit your profile': 'আপনার প্রোফাইলের সাথে মানানসই প্রোগ্রাম',
  'Ranked by how well each program matches your answers.': 'আপনার উত্তরের সাথে কতটা মেলে সে অনুযায়ী সাজানো।', 'match': 'মিল',
  'This is a guide based on published requirements. It is not an admission decision.': 'এটি প্রকাশিত যোগ্যতার ভিত্তিতে নির্দেশনা, ভর্তির সিদ্ধান্ত নয়।',
  'Start again': 'আবার শুরু করুন', 'Discuss my results': 'আমার ফলাফল নিয়ে কথা বলুন',
  '✓ Matches your qualification': '✓ আপনার যোগ্যতার সাথে মেলে', '✓ No IELTS needed': '✓ IELTS লাগবে না', '✓ CGPA accepted': '✓ সিজিপিএ গ্রহণযোগ্য',
  '✓ Within your budget': '✓ আপনার বাজেটের মধ্যে', '✕ Likely above your budget': '✕ সম্ভবত বাজেটের বেশি', '✓ Full scholarship available': '✓ সম্পূর্ণ স্কলারশিপ আছে', '✕ No full scholarship': '✕ সম্পূর্ণ স্কলারশিপ নেই',

  /* ---------- cost estimator ---------- */
  'How much will studying abroad cost?': 'বিদেশে পড়াশোনায় কত খরচ হবে?',
  'Pick a program and see estimated tuition, fees and living costs in taka. Adjust the scholarship and living style to compare.': 'একটি প্রোগ্রাম বেছে নিন এবং টাকায় আনুমানিক টিউশন, ফি ও থাকা-খাওয়ার খরচ দেখুন। তুলনার জন্য স্কলারশিপ ও জীবনযাত্রার ধরন বদলান।',
  'Your plan': 'আপনার পরিকল্পনা', 'Program': 'প্রোগ্রাম', 'How many years to estimate': 'কত বছরের হিসাব', 'First year': 'প্রথম বছর', '2 years': '২ বছর', '3 years': '৩ বছর', '4 years': '৪ বছর',
  'No scholarship': 'স্কলারশিপ ছাড়া', 'Living style': 'জীবনযাত্রার ধরন', 'Careful budget': 'হিসেবি বাজেট', 'Typical student': 'সাধারণ শিক্ষার্থী', 'Comfortable': 'স্বাচ্ছন্দ্যময়',
  'Include one-time fees (application, entrance, visa)': 'এককালীন ফি যোগ করুন (আবেদন, ভর্তি, ভিসা)', 'Estimated total': 'আনুমানিক মোট', 'One-time fees': 'এককালীন ফি',
  'This is an estimate, not a quote.': 'এটি আনুমানিক হিসাব, কোটেশন নয়।', 'Discuss this estimate': 'এই হিসাব নিয়ে কথা বলুন',
  'It does not include flights, visa medicals, insurance or our service charge.': 'এতে বিমান ভাড়া, ভিসা মেডিকেল, বীমা বা আমাদের সার্ভিস চার্জ ধরা নেই।',
  /* ---------- destinations route map ---------- */
  'Photo credits': 'ছবির কৃতজ্ঞতা', 'Destination photos are from Wikimedia Commons and are used under the licences below.': 'গন্তব্যের ছবিগুলো উইকিমিডিয়া কমন্স থেকে নেওয়া, নিচের লাইসেন্সের অধীনে ব্যবহৃত।', 'Photo by': 'ছবি:',
  'Routes from Dhaka': 'ঢাকা থেকে রুট', 'Open intakes': 'চলমান ইনটেক', 'Scholarship offers': 'স্কলারশিপ অফার', 'Ask us': 'জিজ্ঞাসা করুন',
  'Fully funded scholarship places for Master’s programs at Russian universities, with English-taught options.': 'রাশিয়ার বিশ্ববিদ্যালয়ে স্নাতকোত্তর প্রোগ্রামে সম্পূর্ণ ফান্ডেড স্কলারশিপ আসন, ইংরেজি মাধ্যমের সুযোগসহ।',
  'English-taught Bachelor’s and Master’s programs in one of Europe’s strongest education systems.': 'ইউরোপের অন্যতম শক্তিশালী শিক্ষাব্যবস্থায় ইংরেজি মাধ্যমে স্নাতক ও স্নাতকোত্তর প্রোগ্রাম।',
  'An affordable route from Foundation to Master’s, with credit transfer options and lower English requirements at selected universities.': 'ফাউন্ডেশন থেকে স্নাতকোত্তর পর্যন্ত সাশ্রয়ী পথ, নির্বাচিত বিশ্ববিদ্যালয়ে ক্রেডিট ট্রান্সফার ও কম ইংরেজি যোগ্যতার সুযোগসহ।',
  'Degree and Chinese language programs, with Chinese Government (CSC) and university scholarship options and two intakes a year.': 'ডিগ্রি ও চীনা ভাষা প্রোগ্রাম, চীন সরকার (CSC) ও বিশ্ববিদ্যালয়ের স্কলারশিপসহ, বছরে দুটি ইনটেক।',
  /* ---------- homepage sections in the DOCX order ---------- */
  'Explore your study destination': 'আপনার পড়াশোনার গন্তব্য খুঁজে নিন',
  'The countries we currently help students apply to. Open a guide for study levels, requirements and the documents you need.': 'যেসব দেশে আমরা এখন আবেদনে সহায়তা করি। পড়াশোনার স্তর, যোগ্যতা ও প্রয়োজনীয় কাগজপত্র জানতে গাইড খুলুন।',
  'Language (KLP / EAP)': 'ভাষা (KLP / EAP)', 'Foundation': 'ফাউন্ডেশন', 'Diploma': 'ডিপ্লোমা', 'Language': 'ভাষা',
  'Moscow': 'মস্কো', 'Helsinki': 'হেলসিঙ্কি', 'Kuala Lumpur': 'কুয়ালালামপুর', 'Beijing': 'বেইজিং',
  'Our programs': 'আমাদের প্রোগ্রাম', 'Find the right program for you': 'আপনার জন্য সঠিক প্রোগ্রাম খুঁজুন', 'Explore programs': 'প্রোগ্রামগুলো দেখুন',
  'After HSC, A-levels or a Diploma': 'এইচএসসি, এ-লেভেল বা ডিপ্লোমার পর', 'After a Bachelor’s degree': 'স্নাতক ডিগ্রির পর',
  'Language programs (KLP / EAP)': 'ভাষা প্রোগ্রাম (KLP / EAP)', 'Before or alongside a degree': 'ডিগ্রির আগে বা সাথে',
  'Foundation, Diploma & Certificate': 'ফাউন্ডেশন, ডিপ্লোমা ও সার্টিফিকেট', 'After SSC or HSC': 'এসএসসি বা এইচএসসির পর',
  'University and government offers': 'বিশ্ববিদ্যালয় ও সরকারি অফার', 'Tuition and living costs in taka': 'টাকায় টিউশন ও থাকা-খাওয়ার খরচ',
  'Why choose EduRise Global': 'কেন EduRise Global', 'Your trusted study abroad partner': 'বিদেশে পড়াশোনায় আপনার বিশ্বস্ত সঙ্গী',
  'Honest, transparent guidance from a team that has studied and lived abroad.': 'বিদেশে পড়াশোনা ও বসবাস করা একটি টিমের সৎ ও স্বচ্ছ পরামর্শ।',
  'Honest, realistic advice': 'সৎ ও বাস্তবসম্মত পরামর্শ',
  'We tell you what is possible for your profile, including when a plan is not a good fit.': 'আপনার প্রোফাইলে কী সম্ভব তা আমরা স্পষ্ট বলি, কোনো পরিকল্পনা উপযুক্ত না হলে সেটাও।',
  'Leaders who studied abroad': 'বিদেশে পড়াশোনা করা নেতৃত্ব',
  'Our leadership studied in Malaysia, South Korea and Austria, so our guidance is practical, not theoretical.': 'আমাদের নেতৃত্ব মালয়েশিয়া, দক্ষিণ কোরিয়া ও অস্ট্রিয়ায় পড়াশোনা করেছেন, তাই আমাদের পরামর্শ বাস্তবভিত্তিক, শুধু তাত্ত্বিক নয়।',
  'The right pathway for you': 'আপনার জন্য সঠিক পথ',
  'Country, university and program chosen around your results, career goals and budget.': 'আপনার ফলাফল, ক্যারিয়ার লক্ষ্য ও বাজেট অনুযায়ী দেশ, বিশ্ববিদ্যালয় ও প্রোগ্রাম বাছাই।',
  'Transparent process': 'স্বচ্ছ প্রক্রিয়া',
  'Clear steps and clear documentation, so you always know where your application stands.': 'স্পষ্ট ধাপ ও স্পষ্ট কাগজপত্র, যাতে আপনার আবেদনের অবস্থা সবসময় জানেন।',
  'Bangladesh, Europe and the UK': 'বাংলাদেশ, ইউরোপ ও যুক্তরাজ্য',
  'An international network that keeps us connected with education systems and universities.': 'আন্তর্জাতিক নেটওয়ার্ক, যা আমাদের বিভিন্ন দেশের শিক্ষাব্যবস্থা ও বিশ্ববিদ্যালয়ের সাথে যুক্ত রাখে।',
  'With you until departure': 'বিদেশযাত্রা পর্যন্ত আপনার পাশে',
  'Continuous guidance from the first counselling session to pre-departure.': 'প্রথম কাউন্সেলিং থেকে বিদেশযাত্রার প্রস্তুতি পর্যন্ত নিরবচ্ছিন্ন সহায়তা।',
  'Scholarship highlights': 'স্কলারশিপের হাইলাইট', 'All scholarships': 'সব স্কলারশিপ',
  'Current offers from universities we work with. Figures are sample data until EduRise confirms them.': 'আমাদের সহযোগী বিশ্ববিদ্যালয়গুলোর চলমান অফার। EduRise নিশ্চিত না করা পর্যন্ত সংখ্যাগুলো নমুনা তথ্য।',
  'Applications': 'আবেদন', 'Ask about this offer': 'এই অফার সম্পর্কে জিজ্ঞাসা করুন', 'Full details': 'বিস্তারিত দেখুন',
  'Fully funded places': 'সম্পূর্ণ ফান্ডেড আসন', '50% tuition waiver': '৫০% টিউশন মওকুফ', 'First semester, all admitted students': 'প্রথম সেমিস্টার, ভর্তি হওয়া সব শিক্ষার্থী',
  'Master’s (MBA)': 'স্নাতকোত্তর (MBA)', 'March 2027': 'মার্চ ২০২৭',
  'Get your free study abroad consultation': 'বিদেশে পড়াশোনার ফ্রি কনসালটেশন নিন',
  'Tell us a little about yourself and a counsellor will reply, usually on the same working day. Most families talk to us on WhatsApp.': 'আপনার সম্পর্কে একটু জানান, সাধারণত একই কর্মদিবসে একজন কাউন্সেলর উত্তর দেবেন। বেশিরভাগ পরিবার আমাদের সাথে হোয়াটসঅ্যাপে কথা বলে।',
  'Call': 'কল করুন', 'Head office': 'প্রধান অফিস', 'Request a call back': 'কল ব্যাক চান', 'Send my enquiry': 'জিজ্ঞাসা পাঠান',
  'Send by email': 'ইমেইলে পাঠান', 'Please call me back.': 'অনুগ্রহ করে কল ব্যাক করুন।',
  'A counsellor will call you on': 'একজন কাউন্সেলর আপনাকে এই নম্বরে কল করবেন:', '. For a faster reply, send it on WhatsApp too.': '। দ্রুত উত্তরের জন্য হোয়াটসঅ্যাপেও পাঠান।',
  'Find us': 'আমাদের ঠিকানা', 'Our offices on the map': 'ম্যাপে আমাদের অফিস', 'Visit us in Dhaka, or meet our teams in Spain and the United Kingdom.': 'ঢাকায় আমাদের অফিসে আসুন, অথবা স্পেন ও যুক্তরাজ্যে আমাদের টিমের সাথে দেখা করুন।',
  'Directions': 'পথনির্দেশ', 'Choose an office': 'একটি অফিস বেছে নিন',
  'Dhaka, Bijoy Nagar': 'ঢাকা, বিজয়নগর', 'Dhaka, Purana Paltan': 'ঢাকা, পুরানা পল্টন', 'Madrid': 'মাদ্রিদ', 'Suffolk': 'সাফোক',
  /* ---------- homepage hero boarding pass ---------- */
  'Read full story': 'পুরো গল্প পড়ুন',
  'Successful students': 'সফল শিক্ষার্থী', 'Partnered with': 'অংশীদারিত্ব', 'Top universities': 'শীর্ষ বিশ্ববিদ্যালয়ের সাথে', 'Visa guidance': 'ভিসা নির্দেশনা', '& support': 'ও সহায়তা', 'Expert counsellors': 'অভিজ্ঞ কাউন্সেলর', 'You can trust': 'যাঁদের ওপর ভরসা করা যায়', 'Why students choose EduRise': 'শিক্ষার্থীরা কেন EduRise বেছে নেয়',
  'Jan': 'জানু', 'Feb': 'ফেব্রু', 'Mar': 'মার্চ', 'Apr': 'এপ্রিল', 'May': 'মে', 'Jun': 'জুন', 'Jul': 'জুলাই', 'Aug': 'আগস্ট', 'Sep': 'সেপ্টে', 'Oct': 'অক্টো', 'Nov': 'নভে', 'Dec': 'ডিসে',
  'Intake calendar': 'ইনটেক ক্যালেন্ডার', 'Swipe for more months →': 'আরও মাস দেখতে পাশে সরান →', 'Destination · program': 'গন্তব্য · প্রোগ্রাম', 'Today': 'আজ', 'Open': 'খোলা', 'Closing soon': 'শীঘ্রই শেষ', 'Opens soon': 'শীঘ্রই শুরু', 'Dates TBA': 'তারিখ পরে জানানো হবে', 'Studies start': 'ক্লাস শুরু', 'All intakes →': 'সব ইনটেক →',
  'Boarding pass': 'বোর্ডিং পাস', 'From': 'যাত্রা', 'To': 'গন্তব্য', 'Dhaka': 'ঢাকা', 'Why go': 'কেন যাবেন',
  'Seoul': 'সিউল', 'Tokyo': 'টোকিও', 'London': 'লন্ডন', 'Valletta': 'ভ্যালেটা', 'Rome': 'রোম',
  'On WhatsApp or in Dhaka': 'হোয়াটসঅ্যাপে বা ঢাকায়', 'Visa support': 'ভিসা সহায়তা', 'Documents to departure': 'কাগজপত্র থেকে যাত্রা পর্যন্ত',
  /* ---------- 404 and accessibility labels (Phase 8) ---------- */
  'Contact and language': 'যোগাযোগ ও ভাষা', 'Latest news': 'সাম্প্রতিক খবর',
  'Error 404': 'ত্রুটি ৪০৪', 'We could not find that page': 'পেজটি খুঁজে পাওয়া যায়নি',
  'The link may be old or mistyped. Try one of these instead, or message us on WhatsApp.': 'লিংকটি পুরনো বা ভুল হতে পারে। নিচের যেকোনোটি চেষ্টা করুন, অথবা হোয়াটসঅ্যাপে মেসেজ দিন।',
  'Go to the homepage': 'হোমপেজে যান', 'See destinations': 'গন্তব্য দেশগুলো দেখুন', 'Contact us': 'যোগাযোগ করুন'
};

/* patterns for text that contains numbers or names: [regex, Bangla with $1, $2…]
   numbers are shown in Bangla digits; captured names are translated if BN has them */
const BN_PATTERNS = [
  [/^Open · (\d+) days left$/, 'খোলা · $1 দিন বাকি'],
  [/^(\d+) application windows? open now$/, 'এখন $1টি আবেদন চলছে'],
  [/^See all (\d+) open and upcoming offers$/, 'খোলা ও আসন্ন $1টি অফার দেখুন'],
  [/^Step (\d+)$/, 'ধাপ $1'],
  [/^Today · (\d+) ([A-Z][a-z]{2}) (\d{4})$/, 'আজ · $1 $2 $3'],
  [/^(\d+) open$/, '$1টি চলমান'],
  [/^Map: (.+) office$/, 'ম্যাপ: $1 অফিস'],
  [/^Opens in (\d+) days$/, '$1 দিন পর শুরু'],
  [/^(\d+) results?$/, '$1টি ফলাফল'],
  [/^(\d+) programs?$/, '$1টি প্রোগ্রাম'],
  [/^Question (\d+) of (\d+)$/, 'প্রশ্ন $1 / $2'],
  [/^Explore (.+)$/, '$1 সম্পর্কে জানুন'],
  [/^Study in (.+)$/, '$1-এ পড়াশোনা'],
  [/^Ask about (.+)$/, '$1 সম্পর্কে জিজ্ঞাসা করুন'],
  [/^Why students choose (.+)$/, 'শিক্ষার্থীরা কেন $1 বেছে নেয়'],
  [/^✓ Meets IELTS ([\d.]+)$/, '✓ IELTS $1 পূরণ করে'],
  [/^✕ Needs IELTS ([\d.]+)$/, '✕ IELTS $1 লাগবে'],
  [/^✕ Needs CGPA ([\d.]+)$/, '✕ সিজিপিএ $1 লাগবে'],
  [/^Up to (\d+)%$/, 'সর্বোচ্চ $1%'],
  [/^Thank you, (.+)$/, 'ধন্যবাদ, $1']
];

const I18n = (() => {
  const DIGITS = '০১২৩৪৫৬৭৮৯';
  const bnDigits = s => String(s).replace(/\d/g, d => DIGITS[d]);
  const ATTRS = ['placeholder', 'aria-label', 'title'];
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE']);
  const original = new WeakMap();   // text node → English text
  const shown = new WeakMap();      // text node → Bangla we wrote (to spot later script updates)
  let lang = 'en', observer = null, busy = false;

  function translate(text) {
    const key = text.trim();
    if (!key) return null;
    if (BN[key] !== undefined) return text.replace(key, BN[key]);
    for (const [re, out] of BN_PATTERNS) {
      const m = key.match(re);
      if (m) return text.replace(key, out.replace(/\$(\d)/g, (_, i) => BN[m[i]] || bnDigits(m[i])));
    }
    return null;
  }
  function doText(node) {
    const el = node.parentElement;
    if (!el || SKIP.has(el.tagName) || el.closest('[data-no-i18n]')) return;
    // a script changed this text since we translated it: treat the new text as English
    if (shown.has(node) && node.nodeValue !== shown.get(node)) { original.delete(node); shown.delete(node); }
    const en = original.has(node) ? original.get(node) : node.nodeValue;
    const bn = translate(en);
    if (bn === null) return;
    original.set(node, en); shown.set(node, bn);
    if (node.nodeValue !== bn) node.nodeValue = bn;
  }
  function doAttrs(el) {
    ATTRS.forEach(a => {
      if (!el.hasAttribute || !el.hasAttribute(a)) return;
      const store = 'data-en-' + a;
      const en = el.getAttribute(store) || el.getAttribute(a);
      const bn = translate(en);
      if (bn === null) return;
      el.setAttribute(store, en);
      el.setAttribute(a, bn);
    });
  }
  function walk(root) {
    if (root.nodeType === 3) return doText(root);
    if (root.nodeType !== 1) return;
    doAttrs(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) doText(n); else doAttrs(n); }
  }
  function restore() {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) { if (original.has(n) && n.nodeValue === shown.get(n)) n.nodeValue = original.get(n); original.delete(n); shown.delete(n); }
      else ATTRS.forEach(a => { const s = 'data-en-' + a; if (n.hasAttribute(s)) { n.setAttribute(a, n.getAttribute(s)); n.removeAttribute(s); } });
    }
  }
  function observe(on) {
    if (observer) { observer.disconnect(); observer = null; }
    if (!on) return;
    observer = new MutationObserver(list => {
      if (busy) return;
      busy = true;
      list.forEach(m => {
        if (m.type === 'childList') m.addedNodes.forEach(walk);
        else if (m.type === 'characterData') doText(m.target);
        else if (m.type === 'attributes') doAttrs(m.target);
      });
      observer.takeRecords();
      busy = false;
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  function set(next) {
    lang = next === 'bn' ? 'bn' : 'en';
    document.documentElement.lang = lang;
    $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    store.set('edurise-lang', lang);
    busy = true;
    if (lang === 'bn') { walk(document.body); observe(true); }
    else { observe(false); restore(); }
    busy = false;
  }
  function init() {
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-lang]');
      if (b) set(b.dataset.lang);
    });
    set(store.get('edurise-lang', 'en'));
  }
  return { init, set, get lang() { return lang; } };
})();
