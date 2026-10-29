import {
  Sparkles, LayoutDashboard, Inbox, CalendarCheck, MessageCircle, Users,
  Building2, Megaphone, Wrench, CircleUser, ShieldAlert, Star, GraduationCap,
  BookOpen, FileText, Gift, Settings, Briefcase, Trophy,
} from 'lucide-react';

// Shared bilingual content for every dashboard guide (Admin, Super Admin,
// Student, Agent, University). Everything here describes real, current
// behavior of the app (route prefixes, model fields, who can delete what,
// which middleware gates a role) — cross-checked against the actual
// routes/controllers, not aspirational copy.
export const buildChapters = (role) => {
  switch (role) {
    case 'student':
      return buildStudentChapters();
    case 'agent':
      return buildAgentChapters();
    case 'university':
      return buildUniversityChapters();
    default:
      return buildAdminChapters(role);
  }
};

// `isSuperAdmin` unlocks the sections that only apply to that power tier
// (delete permissions, role management, the final "Super Admin Only"
// chapter) — 'developer' is a full super_admin alias (plus more), so it
// gets the same unlocked content, just under its own label.
const buildAdminChapters = (role) => {
  const isDeveloper = role === 'developer';
  const isSuperAdmin = role === 'super_admin' || isDeveloper;
  const roleLabelEn = isDeveloper ? 'Developer' : isSuperAdmin ? 'Super Admin' : 'Admin';
  const roleLabelBn = isDeveloper ? 'ডেভেলপার' : isSuperAdmin ? 'সুপার অ্যাডমিন' : 'অ্যাডমিন';

  // Delete permission is super_admin-only across almost every module in
  // this app (see e.g. backend/routes/*Routes.js — every DELETE route is
  // `authorize('super_admin')`). Centralized here so every chapter states
  // it correctly for the role currently viewing the guide.
  const deleteNote = isSuperAdmin
    ? {
        type: 'tip',
        en: `As ${roleLabelEn}, you're the only one who can permanently delete anything here — Admins can only create and edit. Deleting is final, there's no undo, so double-check before confirming.`,
        bn: `${roleLabelBn} হিসেবে আপনিই একমাত্র যিনি এখানে যেকোনো কিছু স্থায়ীভাবে ডিলিট করতে পারেন — অ্যাডমিনরা শুধু তৈরি ও এডিট করতে পারে। ডিলিট করলে তা আর ফিরে আসে না, তাই কনফার্ম করার আগে ভালো করে দেখে নিন।`,
      }
    : {
        type: 'warning',
        en: 'Deleting anything here is Super Admin-only. As Admin you can create, edit, and update everything, but if something genuinely needs to be removed, ask a Super Admin to do it.',
        bn: 'এখানে যেকোনো কিছু ডিলিট করার অনুমতি শুধু সুপার অ্যাডমিনের আছে। অ্যাডমিন হিসেবে আপনি সব কিছু তৈরি ও এডিট করতে পারবেন, কিন্তু সত্যিই কিছু মুছে ফেলার দরকার হলে একজন সুপার অ্যাডমিনকে বলুন।',
      };

  const chapters = [
    {
      id: 'welcome',
      icon: Sparkles,
      titleEn: 'Welcome to the Control Panel',
      titleBn: 'কন্ট্রোল প্যানেলে স্বাগতম',
      summaryEn: 'What this dashboard is, and how to find your way around it.',
      summaryBn: 'এই ড্যাশবোর্ডটি কী, আর এখানে কীভাবে চলাফেরা করবেন।',
      sections: [
        {
          headingEn: 'What is this?',
          headingBn: 'এটা কী?',
          bodyEn: [
            `This Control Panel is where the Just Go Study team runs everything behind the public website: student applications, universities and courses, the content and marketing tools, and the calculators students use on the site. You're signed in as ${roleLabelEn}.`,
            'Every page you can reach from the left sidebar is real, live data, not a demo. Changes you save here appear on the public site right away.',
          ],
          bodyBn: [
            `এই কন্ট্রোল প্যানেল থেকেই Just Go Study টিম পাবলিক ওয়েবসাইটের পেছনের সব কাজ চালায় — শিক্ষার্থীদের আবেদন, বিশ্ববিদ্যালয় ও কোর্স, কনটেন্ট ও মার্কেটিং টুলস, এবং সাইটে থাকা ক্যালকুলেটরগুলো। আপনি এখন সাইন-ইন করে আছেন ${roleLabelBn} হিসেবে।`,
            'বাম পাশের সাইডবার থেকে যে পেজগুলোতে যেতে পারবেন সেগুলো সবই আসল, লাইভ ডেটা, কোনো ডেমো না। এখানে সেভ করা পরিবর্তন সাথে সাথেই পাবলিক সাইটে দেখা যাবে।',
          ],
        },
        {
          headingEn: 'Finding your way around',
          headingBn: 'কীভাবে চলাফেরা করবেন',
          bodyEn: [
            '• Left sidebar — every page you have access to, grouped by category (Menu, Academic Data, Content & Marketing, Tools, Account). Click the collapse arrow at the top of the sidebar to shrink it to icons-only if you want more screen space.',
            '• Top bar — a "Back" button to the main site, a live Bangladesh-time clock, a notification bell, a Help button (opens the Contact page), and your profile menu on the far right.',
            '• Breadcrumb — next to the Back button, it shows exactly which section and page you\'re on.',
            '• This guide itself lives in the sidebar under General, so you can always come back to it.',
          ],
          bodyBn: [
            '• বাম সাইডবার — আপনার অ্যাক্সেস থাকা প্রতিটি পেজ, ক্যাটাগরি অনুযায়ী সাজানো (Menu, Academic Data, Content & Marketing, Tools, Account)। বেশি জায়গা লাগলে সাইডবারের উপরের কোলাপ্স বাটনে ক্লিক করে শুধু আইকন-ভিউতে ছোট করে নিতে পারেন।',
            '• টপ বার — মূল সাইটে ফিরে যাওয়ার "Back" বাটন, লাইভ বাংলাদেশ সময়ের ঘড়ি, নোটিফিকেশন বেল, একটি Help বাটন (Contact পেজ খোলে), আর ডান পাশে আপনার প্রোফাইল মেনু।',
            '• ব্রেডক্রাম্ব — Back বাটনের পাশে, এটা দেখায় আপনি ঠিক কোন সেকশন আর পেজে আছেন।',
            '• এই গাইডটিও সাইডবারে General সেকশনে থাকে, তাই যেকোনো সময় আবার এখানে ফিরে আসতে পারবেন।',
          ],
        },
      ],
    },
    {
      id: 'home',
      icon: LayoutDashboard,
      titleEn: 'Dashboard Home & Notifications',
      titleBn: 'ড্যাশবোর্ড হোম ও নোটিফিকেশন',
      summaryEn: 'What the overview page and the bell icon are telling you.',
      summaryBn: 'ওভারভিউ পেজ আর বেল আইকন আপনাকে কী জানাচ্ছে।',
      sections: [
        {
          headingEn: 'The Home page',
          headingBn: 'হোম পেজ',
          bodyEn: [
            'Click "Home" at the top of the sidebar any time to get back to the overview — quick counts and recent activity across applications, users, and appointments.',
          ],
          bodyBn: [
            'যেকোনো সময় সাইডবারের উপরে "Home"-এ ক্লিক করলে আপনি ওভারভিউ পেজে ফিরে যাবেন — আবেদন, ইউজার আর অ্যাপয়েন্টমেন্টের সংক্ষিপ্ত সংখ্যা ও সাম্প্রতিক কার্যকলাপ দেখাবে।',
          ],
        },
        {
          headingEn: 'The notification bell',
          headingBn: 'নোটিফিকেশন বেল',
          bodyEn: [
            'The bell in the top bar automatically surfaces things that need your attention: new pending applications, agents waiting for approval, and recently accepted/rejected applications. Click any notification to jump straight to it.',
            '• "Mark all read" clears the red counter without hiding the list.',
            '• The trash icon clears the whole list from view (it comes back once new activity happens).',
            '• The refresh icon re-checks for anything new right now, instead of waiting for the next automatic refresh.',
          ],
          bodyBn: [
            'টপ বারের বেল আইকনটি স্বয়ংক্রিয়ভাবে আপনার নজরে আনার মতো জিনিসগুলো দেখায়: নতুন পেন্ডিং আবেদন, অনুমোদনের অপেক্ষায় থাকা এজেন্ট, এবং সম্প্রতি অ্যাক্সেপ্ট/রিজেক্ট হওয়া আবেদন। যেকোনো নোটিফিকেশনে ক্লিক করলে সরাসরি সেখানে চলে যাবেন।',
            '• "Mark all read" লাল কাউন্টারটি সরিয়ে দেয়, কিন্তু লিস্ট লুকায় না।',
            '• ট্র্যাশ আইকনে ক্লিক করলে পুরো লিস্ট দৃশ্য থেকে সরে যায় (নতুন কিছু হলে আবার দেখা যাবে)।',
            '• রিফ্রেশ আইকনে ক্লিক করলে এখনই নতুন কিছু আছে কিনা তা চেক করে, পরবর্তী অটো-রিফ্রেশের জন্য অপেক্ষা করতে হয় না।',
          ],
        },
      ],
    },
    {
      id: 'applications',
      icon: Inbox,
      titleEn: 'Applications',
      titleBn: 'অ্যাপ্লিকেশন',
      summaryEn: 'Reviewing and moving forward student applications.',
      summaryBn: 'শিক্ষার্থীদের আবেদন রিভিউ করা ও এগিয়ে নেওয়া।',
      sections: [
        {
          headingEn: 'What you\'ll find on the Applications page',
          headingBn: 'Applications পেজে যা পাবেন',
          bodyEn: [
            'Every application a student has submitted for a course, with the student, the course, and the university attached. Each application moves through a status, shown as a colored label:',
            '• Pending — just submitted, not looked at yet.',
            '• Under Review — you or a colleague is actively checking it.',
            '• Accepted / Rejected — a decision has been made.',
            '• Visa Applied → Visa Approved → Departed — once accepted, these track the student through the visa process. Students who reach "Visa Approved" or "Departed" are what shows up as real placements on the homepage\'s recent-placements ticker.',
          ],
          bodyBn: [
            'একজন শিক্ষার্থী কোনো কোর্সের জন্য যত আবেদন করেছে, সেগুলো এখানে পাবেন — শিক্ষার্থী, কোর্স এবং বিশ্ববিদ্যালয়ের তথ্যসহ। প্রতিটি আবেদন একটি স্ট্যাটাসের মধ্য দিয়ে যায়, রঙিন লেবেল হিসেবে দেখানো হয়:',
            '• Pending — মাত্র জমা দেওয়া হয়েছে, এখনো দেখা হয়নি।',
            '• Under Review — আপনি বা আপনার কোনো সহকর্মী এখন এটা দেখছেন।',
            '• Accepted / Rejected — সিদ্ধান্ত নেওয়া হয়ে গেছে।',
            '• Visa Applied → Visa Approved → Departed — অ্যাক্সেপ্ট হওয়ার পর, এই স্ট্যাটাসগুলো শিক্ষার্থীর ভিসা প্রসেস ট্র্যাক করে। যেসব শিক্ষার্থী "Visa Approved" বা "Departed"-এ পৌঁছায়, তারাই হোমপেজের সাম্প্রতিক প্লেসমেন্ট টিকারে আসল প্লেসমেন্ট হিসেবে দেখানো হয়।',
          ],
        },
        {
          headingEn: 'Day to day',
          headingBn: 'দৈনন্দিন কাজ',
          bodyEn: [
            'Open an application, read the details, and update its status as it moves forward. New applications also show up in your notification bell so nothing sits unnoticed.',
          ],
          bodyBn: [
            'একটি আবেদন খুলুন, বিস্তারিত পড়ুন, এবং এটি এগিয়ে যাওয়ার সাথে সাথে স্ট্যাটাস আপডেট করুন। নতুন আবেদন আপনার নোটিফিকেশন বেলেও দেখা যায়, তাই কোনোটাই খেয়াল না করে থেকে যায় না।',
          ],
        },
      ],
    },
    {
      id: 'appointments-consultations',
      icon: CalendarCheck,
      titleEn: 'Appointments & Consultations',
      titleBn: 'অ্যাপয়েন্টমেন্ট ও কনসালটেশন',
      summaryEn: 'These are two different things — here\'s the difference.',
      summaryBn: 'এই দুটো একদম আলাদা জিনিস — পার্থক্যটা এখানে।',
      sections: [
        {
          headingEn: 'Appointments',
          headingBn: 'অ্যাপয়েন্টমেন্ট',
          bodyEn: [
            'Booked from the public "Book Appointment" page, for a meeting with an Agent, an Educator, or a University Representative. Status moves from Pending to Confirmed to Completed, or Cancelled if it doesn\'t happen. Manage them from the Appointments page.',
          ],
          bodyBn: [
            'এগুলো পাবলিক "Book Appointment" পেজ থেকে বুক করা হয়, একজন Agent, Educator, বা University Representative-এর সাথে মিটিংয়ের জন্য। স্ট্যাটাস Pending থেকে Confirmed হয়ে Completed-এ যায়, অথবা মিটিং না হলে Cancelled হয়। এগুলো ম্যানেজ করুন Appointments পেজ থেকে।',
          ],
        },
        {
          headingEn: 'Consultations',
          headingBn: 'কনসালটেশন',
          bodyEn: [
            'Simpler leads — someone filled out the "Free Counselling" form on the homepage asking to be contacted. Status just moves from Pending to Contacted to Closed. Manage them from the Consultations page. Think of Appointments as "booked a slot" and Consultations as "asked to be called".',
          ],
          bodyBn: [
            'এগুলো তুলনামূলক সহজ লিড — কেউ হোমপেজের "Free Counselling" ফর্ম পূরণ করে যোগাযোগ করার অনুরোধ জানিয়েছে। স্ট্যাটাস শুধু Pending থেকে Contacted হয়ে Closed-এ যায়। ম্যানেজ করুন Consultations পেজ থেকে। সহজ ভাবে বুঝলে, Appointments মানে "একটা সময় বুক করেছে" আর Consultations মানে "কল করতে বলেছে"।',
          ],
        },
      ],
    },
    {
      id: 'users',
      icon: Users,
      titleEn: 'Users & Agent Approvals',
      titleBn: 'ইউজার ও এজেন্ট অনুমোদন',
      summaryEn: 'Verifying accounts, approving agents, and who can change roles.',
      summaryBn: 'অ্যাকাউন্ট ভেরিফাই করা, এজেন্ট অনুমোদন, আর কে রোল পরিবর্তন করতে পারে।',
      sections: [
        {
          headingEn: 'Everyone who has an account',
          headingBn: 'যাদের অ্যাকাউন্ট আছে সবাই',
          bodyEn: [
            'Students, agents, universities, educators, and other staff, all in one list on the Users page. From here you can verify an account and approve or reject someone\'s agent application — an agent can\'t start working with students until their agent account has been approved here.',
          ],
          bodyBn: [
            'শিক্ষার্থী, এজেন্ট, বিশ্ববিদ্যালয়, শিক্ষক, এবং অন্যান্য স্টাফ — সবাই Users পেজে একটি লিস্টে। এখান থেকে আপনি একটি অ্যাকাউন্ট ভেরিফাই করতে পারেন এবং কারো এজেন্ট হওয়ার আবেদন অনুমোদন বা প্রত্যাখ্যান করতে পারেন — একজন এজেন্ট এখানে তার এজেন্ট অ্যাকাউন্ট অনুমোদিত না হওয়া পর্যন্ত শিক্ষার্থীদের সাথে কাজ শুরু করতে পারবে না।',
          ],
        },
        isSuperAdmin
          ? {
              headingEn: `Changing roles and deleting a user — ${roleLabelEn} only`,
              headingBn: `রোল পরিবর্তন ও ইউজার ডিলিট — শুধু ${roleLabelBn}`,
              bodyEn: [
                `You're the only role that can change what someone's account type is (e.g. promote a student to admin) or permanently delete a user. This is intentional: staff/permission structure is a ${roleLabelEn} decision, not something another Admin can hand out. Use it carefully.`,
              ],
              bodyBn: [
                `আপনিই একমাত্র যিনি কারো অ্যাকাউন্ট টাইপ পরিবর্তন করতে পারেন (যেমন একজন শিক্ষার্থীকে অ্যাডমিনে উন্নীত করা) বা একজন ইউজারকে স্থায়ীভাবে ডিলিট করতে পারেন। এটা ইচ্ছাকৃতভাবেই এমন: স্টাফ/পারমিশন স্ট্রাকচার ${roleLabelBn}-এর সিদ্ধান্ত, অন্য কোনো অ্যাডমিন এটা দিতে পারে না। সতর্কতার সাথে ব্যবহার করুন।`,
              ],
              note: isDeveloper
                ? {
                    type: 'tip',
                    en: 'One thing that\'s yours alone, even Super Admin can\'t do this: only a Developer account can grant someone Developer status, and only a Developer can change or delete an existing Developer account. A Super Admin can manage everyone else, including other Super Admins, but not a Developer.',
                    bn: 'একটা জিনিস শুধু আপনারই, সুপার অ্যাডমিনও এটা পারে না: শুধু একটা Developer অ্যাকাউন্টই কাউকে Developer স্ট্যাটাস দিতে পারে, আর শুধু একজন Developer-ই আরেকটা Developer অ্যাকাউন্ট পরিবর্তন বা ডিলিট করতে পারে। একজন সুপার অ্যাডমিন বাকি সবাইকে ম্যানেজ করতে পারে, অন্য সুপার অ্যাডমিনদেরও, কিন্তু একজন Developer-কে না।',
                  }
                : undefined,
            }
          : {
              headingEn: 'What\'s Super Admin-only here',
              headingBn: 'এখানে যা শুধু সুপার অ্যাডমিনের জন্য',
              bodyEn: [
                'Changing a user\'s account type/role and permanently deleting a user are both Super Admin-only. As Admin, you can verify accounts and approve/reject agents, but role changes and deletions need a Super Admin.',
              ],
              bodyBn: [
                'একজন ইউজারের অ্যাকাউন্ট টাইপ/রোল পরিবর্তন করা এবং স্থায়ীভাবে ইউজার ডিলিট করা — দুটোই শুধু সুপার অ্যাডমিনের কাজ। অ্যাডমিন হিসেবে আপনি অ্যাকাউন্ট ভেরিফাই ও এজেন্ট অনুমোদন/প্রত্যাখ্যান করতে পারবেন, কিন্তু রোল পরিবর্তন ও ডিলিটের জন্য একজন সুপার অ্যাডমিন লাগবে।',
              ],
            },
      ],
    },
    {
      id: 'academic-data',
      icon: Building2,
      titleEn: 'Academic Data',
      titleBn: 'একাডেমিক ডেটা',
      summaryEn: 'Universities, Courses, Study Programs, and Destinations.',
      summaryBn: 'বিশ্ববিদ্যালয়, কোর্স, স্টাডি প্রোগ্রাম, আর ডেস্টিনেশন।',
      sections: [
        {
          headingEn: 'Universities & Courses',
          headingBn: 'বিশ্ববিদ্যালয় ও কোর্স',
          bodyEn: [
            'The Universities page holds every partner university\'s profile (name, country, logo, ranking). The Courses page holds the actual programs offered, each linked to a university, with details like IELTS requirement and tuition — these are what feed the public Courses/Universities pages and course detail pages.',
          ],
          bodyBn: [
            'Universities পেজে প্রতিটি পার্টনার বিশ্ববিদ্যালয়ের প্রোফাইল থাকে (নাম, দেশ, লোগো, র‍্যাঙ্কিং)। Courses পেজে আসল কোর্স/প্রোগ্রামগুলো থাকে, প্রতিটি একটি বিশ্ববিদ্যালয়ের সাথে যুক্ত, IELTS রিকোয়ারমেন্ট আর টিউশন ফি-র মতো তথ্যসহ — এগুলোই পাবলিক Courses/Universities পেজ ও কোর্স ডিটেইল পেজে দেখানো হয়।',
          ],
        },
        {
          headingEn: 'Study Programs',
          headingBn: 'স্টাডি প্রোগ্রাম',
          bodyEn: [
            'The Study Abroad page manages the wider study-programs catalog used across the site\'s Study Abroad section — including which programs the IELTS Band Calculator tool suggests to a student based on their score.',
          ],
          bodyBn: [
            'Study Abroad পেজ ওয়েবসাইটের Study Abroad সেকশনজুড়ে ব্যবহৃত বিস্তৃত স্টাডি-প্রোগ্রাম ক্যাটালগ ম্যানেজ করে — এর মধ্যে আছে IELTS Band Calculator টুল কোন প্রোগ্রামগুলো একজন শিক্ষার্থীর স্কোরের ভিত্তিতে সাজেস্ট করে, তাও।',
          ],
        },
        {
          headingEn: 'Destinations vs Calculator Defaults — don\'t mix these up',
          headingBn: 'Destinations বনাম Calculator Defaults — গুলিয়ে ফেলবেন না',
          bodyEn: [
            '• The Destinations page manages each country\'s content page — description, region, average tuition/living cost — what a student reads on a destination page.',
            '• Calculator Defaults (see the Tools chapter) is a separate set of numbers — living cost per year, visa fee, part-time hourly rate, visa timeline — that specifically power the ROI Estimator, Visa Tracker, Comparison Tool, and Cost Calculator. Same countries, two different sets of information, edited in two different places.',
          ],
          bodyBn: [
            '• Destinations পেজ প্রতিটি দেশের কনটেন্ট পেজ ম্যানেজ করে — বর্ণনা, অঞ্চল, গড় টিউশন/লিভিং কস্ট — একজন শিক্ষার্থী ডেস্টিনেশন পেজে যা পড়ে।',
            '• Calculator Defaults (Tools চ্যাপ্টারে দেখুন) হলো আলাদা একগুচ্ছ সংখ্যা — বছরে লিভিং কস্ট, ভিসা ফি, পার্ট-টাইম ঘণ্টাপ্রতি আয়, ভিসা টাইমলাইন — যা নির্দিষ্টভাবে ROI Estimator, Visa Tracker, Comparison Tool, আর Cost Calculator চালায়। একই দেশ, কিন্তু দুটো আলাদা তথ্যভাণ্ডার, দুটো আলাদা জায়গায় এডিট করতে হয়।',
          ],
          note: deleteNote,
        },
      ],
    },
    {
      id: 'content',
      icon: Megaphone,
      titleEn: 'Content & Marketing',
      titleBn: 'কনটেন্ট ও মার্কেটিং',
      summaryEn: 'Everything that shapes what visitors see and how leads are captured.',
      summaryBn: 'ভিজিটররা কী দেখে আর লিড কীভাবে ধরা হয়, সবকিছু এখানেই।',
      sections: [
        {
          headingEn: 'Site content',
          headingBn: 'সাইট কনটেন্ট',
          bodyEn: [
            '• News & Vlogs — articles/videos shown on the Student Resources page.',
            '• Success Stories — the stories shown on the Our Success page.',
            '• Testimonials — student quotes shown around the site.',
            '• Newsletter — the list of people subscribed to updates.',
          ],
          bodyBn: [
            '• News & Vlogs — Student Resources পেজে দেখানো আর্টিকেল/ভিডিও।',
            '• Success Stories — Our Success পেজে দেখানো গল্পগুলো।',
            '• Testimonials — সাইটজুড়ে দেখানো শিক্ষার্থীদের মতামত।',
            '• Newsletter — যারা আপডেট পাওয়ার জন্য সাবস্ক্রাইব করেছে তাদের লিস্ট।',
          ],
        },
        {
          headingEn: 'Marketing tools',
          headingBn: 'মার্কেটিং টুলস',
          bodyEn: [
            '• Banners — the strip shown at the top of every public page.',
            '• Popup Campaigns — popups that appear after a delay, when someone\'s about to leave the page, or after they scroll down.',
            '• FAQs — the questions/answers shown in FAQ sections.',
            '• Coupons — discount codes students can enter.',
            '• Referrals — reward tracking for students who invite other students to join; when your team marks a referral as rewarded with a coupon, it automatically creates a real, usable discount code for that person.',
            '• Events & Webinars — shown publicly on the site\'s Events page.',
            '• SEO Meta — a custom page title and description you can set for each page, used when that page shows up in Google search results.',
            '• Lead Magnets — downloadable resources that ask a visitor for their email before downloading, then automatically send a couple of follow-up emails over the next several days.',
            '• Quiz Leads — everyone who completed the "Which Country Fits You?" quiz and asked to get their result by email.',
            '• Marketing Analytics — a dashboard rolling all of the above up into one view.',
          ],
          bodyBn: [
            '• Banners — প্রতিটি পাবলিক পেজের উপরে দেখানো স্ট্রিপ।',
            '• Popup Campaigns — যেসব পপআপ কিছুক্ষণ পর, কেউ পেজ ছেড়ে যাওয়ার মুহূর্তে, বা স্ক্রল করলে দেখা যায়।',
            '• FAQs — FAQ সেকশনে দেখানো প্রশ্ন/উত্তর।',
            '• Coupons — শিক্ষার্থীরা যে ডিসকাউন্ট কোড ব্যবহার করতে পারে।',
            '• Referrals — যেসব শিক্ষার্থী অন্য শিক্ষার্থীকে যোগ দিতে আমন্ত্রণ জানায় তাদের রিওয়ার্ড ট্র্যাকিং; আপনার টিম একটি রেফারেলকে কুপন-রিওয়ার্ড হিসেবে চিহ্নিত করলে, স্বয়ংক্রিয়ভাবে সেই মানুষটির জন্য একটি আসল, ব্যবহারযোগ্য ডিসকাউন্ট কোড তৈরি হয়ে যায়।',
            '• Events & Webinars — সাইটের Events পেজে পাবলিকলি দেখানো হয়।',
            '• SEO Meta — প্রতিটি পেজের জন্য আলাদা টাইটেল ও বর্ণনা সেট করা যায়, গুগল সার্চ রেজাল্টে পেজটি দেখানোর সময় এটাই ব্যবহার হয়।',
            '• Lead Magnets — ডাউনলোডযোগ্য রিসোর্স, যা ডাউনলোডের আগে ভিজিটরের ইমেইল চায়, তারপর পরবর্তী কয়েকদিনে স্বয়ংক্রিয়ভাবে কয়েকটি ফলো-আপ ইমেইল পাঠায়।',
            '• Quiz Leads — যারা "Which Country Fits You?" কুইজ শেষ করে ইমেইলে রেজাল্ট পেতে চেয়েছে তাদের সবাই।',
            '• Marketing Analytics — উপরের সবকিছু একসাথে একটি ভিউতে দেখানো ড্যাশবোর্ড।',
          ],
          note: deleteNote,
        },
      ],
    },
    {
      id: 'tools',
      icon: Wrench,
      titleEn: 'Tools',
      titleBn: 'টুলস',
      summaryEn: 'Calculator Defaults, Flashcards, Exam Prep, Tabs, Language Club.',
      summaryBn: 'ক্যালকুলেটর ডিফল্ট, ফ্ল্যাশকার্ড, এক্সাম প্রেপ, ট্যাবস, ল্যাঙ্গুয়েজ ক্লাব।',
      sections: [
        {
          headingEn: 'Calculator Defaults',
          headingBn: 'ক্যালকুলেটর ডিফল্ট',
          bodyEn: [
            'The Calculator Defaults page holds the per-country numbers — living cost per year, part-time hourly rate, visa fee, visa timeline steps — that directly power the public ROI Estimator, Visa Tracker, Comparison Tool, and Cost Calculator. If a number looks wrong on one of those tools, this is where to fix it.',
          ],
          bodyBn: [
            'Calculator Defaults পেজে প্রতিটি দেশের সংখ্যাগুলো থাকে — বছরে লিভিং কস্ট, পার্ট-টাইম ঘণ্টাপ্রতি আয়, ভিসা ফি, ভিসা টাইমলাইনের ধাপ — যা সরাসরি পাবলিক ROI Estimator, Visa Tracker, Comparison Tool, আর Cost Calculator চালায়। এসব টুলে কোনো সংখ্যা ভুল দেখালে, এখানেই ঠিক করতে হবে।',
          ],
        },
        {
          headingEn: 'Flashcards, Exam Prep, Language Club',
          headingBn: 'ফ্ল্যাশকার্ড, এক্সাম প্রেপ, ল্যাঙ্গুয়েজ ক্লাব',
          bodyEn: [
            '• Flashcards — the cards shown in Language Club\'s Flashcards feature.',
            '• Exam Prep — content for the IELTS/PTE/TOEFL/GRE-GMAT pages under Language Club.',
            '• Language Club — the languages and learning content in the Language Club section itself.',
          ],
          bodyBn: [
            '• Flashcards — Language Club-এর Flashcards ফিচারে দেখানো কার্ডগুলো।',
            '• Exam Prep — Language Club-এর অধীনে IELTS/PTE/TOEFL/GRE-GMAT পেজের কনটেন্ট।',
            '• Language Club — Language Club সেকশনের ভাষা ও লার্নিং কনটেন্ট।',
          ],
        },
        {
          headingEn: 'Manage Tabs',
          headingBn: 'ম্যানেজ ট্যাবস',
          bodyEn: [
            'The Manage Tabs page controls the tabs on a country\'s detail page (Overview, Universities, Cost, Visa) — what shows up and in what order.',
          ],
          bodyBn: [
            'Manage Tabs পেজ একটি দেশের ডিটেইল পেজের ট্যাবগুলো (Overview, Universities, Cost, Visa) নিয়ন্ত্রণ করে — কী দেখানো হবে আর কোন ক্রমে।',
          ],
          note: deleteNote,
        },
      ],
    },
    {
      id: 'account',
      icon: CircleUser,
      titleEn: 'Your Profile & Getting Help',
      titleBn: 'আপনার প্রোফাইল ও সাহায্য',
      summaryEn: 'Updating your own info, and where to ask for help.',
      summaryBn: 'নিজের তথ্য আপডেট করা, আর কোথায় সাহায্য চাইবেন।',
      sections: [
        {
          headingEn: 'My Profile',
          headingBn: 'মাই প্রোফাইল',
          bodyEn: [
            'Click your avatar in the top-right corner, then "My Profile", to update your own name, avatar, and email.',
          ],
          bodyBn: [
            'উপরে ডান কোণে আপনার অ্যাভাটারে ক্লিক করে "My Profile"-এ যান, নিজের নাম, অ্যাভাটার আর ইমেইল আপডেট করতে।',
          ],
        },
        {
          headingEn: 'Need help?',
          headingBn: 'সাহায্য দরকার?',
          bodyEn: [
            'The Help button (question-mark icon) in the top bar, or "Help Desk" in the sidebar, both open the Contact page. Come back to this guide any time from the sidebar under General.',
          ],
          bodyBn: [
            'টপ বারের Help বাটন (প্রশ্নবোধক আইকন), অথবা সাইডবারের "Help Desk" — দুটোই Contact পেজ খোলে। যেকোনো সময় সাইডবারের General সেকশন থেকে এই গাইডে আবার ফিরে আসতে পারবেন।',
          ],
        },
        {
          headingEn: isDeveloper ? 'Reviewing what Admin/Super Admin have asked for' : 'Want something changed or added?',
          headingBn: isDeveloper ? 'Admin/Super Admin যা চেয়েছে তা রিভিউ করা' : 'কিছু পরিবর্তন বা যোগ করতে চান?',
          bodyEn: isDeveloper
            ? [
                '"Requests" in the sidebar under General is your inbox for every update, change, or new-feature request that Admin and Super Admin have sent in — the same shared board they see under "Request a Feature", just relabeled for you since you\'re the one it\'s sent to, not a sender.',
              ]
            : [
                '"Request a Feature" in the sidebar under General is where you send an update, change, or new-feature request straight to the person who maintains the site. Write a title and a short description of what you need — everyone in Admin/Super Admin can see the same list, so it doubles as a shared board of what\'s been asked for and what\'s already done.',
              ],
          bodyBn: isDeveloper
            ? [
                'সাইডবারের General সেকশনে "Requests" হলো Admin আর Super Admin-এর পাঠানো প্রতিটি আপডেট, পরিবর্তন, বা নতুন-ফিচারের অনুরোধের ইনবক্স — একই শেয়ার্ড বোর্ড যা তারা "Request a Feature"-এর নিচে দেখে, শুধু আপনার জন্য রিলেবেল করা, কারণ এটা আপনার কাছেই পাঠানো হয়, আপনি পাঠাচ্ছেন না।',
              ]
            : [
                'সাইডবারের General সেকশনে "Request a Feature" থেকে সাইট মেইনটেইন করা মানুষটির কাছে সরাসরি কোনো আপডেট, পরিবর্তন, বা নতুন ফিচারের অনুরোধ পাঠাতে পারবেন। একটি টাইটেল আর সংক্ষিপ্ত বিবরণ লিখুন — Admin/Super Admin-এর সবাই একই লিস্ট দেখতে পায়, তাই এটা কী চাওয়া হয়েছে আর কী হয়ে গেছে তার একটা শেয়ার্ড বোর্ড হিসেবেও কাজ করে।',
              ],
        },
      ],
    },
  ];

  if (isSuperAdmin) {
    chapters.push({
      id: 'super-admin-only',
      icon: ShieldAlert,
      titleEn: `${roleLabelEn}: Extra Powers & Responsibility`,
      titleBn: `${roleLabelBn}: অতিরিক্ত ক্ষমতা ও দায়িত্ব`,
      summaryEn: 'What only you can do, and why it\'s worth being careful.',
      summaryBn: 'শুধু আপনি যা করতে পারেন, আর কেন সাবধান থাকা দরকার।',
      sections: [
        {
          headingEn: `What sets ${roleLabelEn} apart from Admin`,
          headingBn: `${roleLabelBn} অ্যাডমিন থেকে আলাদা কেন`,
          bodyEn: [
            'Admin and you see the same sidebar and can create/edit the same things. The difference is entirely about permanent, hard-to-undo actions:',
            '• Permanently deleting anything — universities, courses, users, banners, coupons, testimonials, and basically anything else with a delete button. Admins can\'t delete; they can only turn something off/hide it, where that option exists.',
            '• Changing what type of account someone has — promoting someone to Admin, or changing any account\'s type.',
            '• Deleting a user\'s account entirely.',
          ],
          bodyBn: [
            `অ্যাডমিন আর আপনি একই সাইডবার দেখেন এবং একই জিনিস তৈরি/এডিট করতে পারেন। পার্থক্যটা সম্পূর্ণভাবে স্থায়ী, ফিরিয়ে আনা যায় না এমন কাজে:`,
            '• যেকোনো কিছু স্থায়ীভাবে ডিলিট করা — বিশ্ববিদ্যালয়, কোর্স, ইউজার, ব্যানার, কুপন, টেস্টিমোনিয়াল, এবং মূলত ডিলিট বাটন থাকা যেকোনো কিছু। অ্যাডমিনরা ডিলিট করতে পারে না; যেখানে সে অপশন আছে সেখানে শুধু বন্ধ/লুকিয়ে রাখতে পারে।',
            '• কারো অ্যাকাউন্ট কী ধরনের তা পরিবর্তন করা — কাউকে অ্যাডমিনে উন্নীত করা, বা যেকোনো অ্যাকাউন্টের টাইপ পরিবর্তন করা।',
            '• একজন ইউজারের অ্যাকাউন্ট সম্পূর্ণভাবে ডিলিট করা।',
          ],
        },
        isDeveloper && {
          headingEn: 'What sets Developer apart from Super Admin',
          headingBn: 'ডেভেলপার সুপার অ্যাডমিন থেকেও আলাদা কেন',
          bodyEn: [
            'On top of everything Super Admin can do, Developer has one more layer, specifically about Developer accounts themselves:',
            '• Only a Developer can grant Developer status to someone — a Super Admin cannot promote anyone to Developer.',
            '• Only a Developer can change or delete an existing Developer account. A Super Admin can manage every other account, including other Super Admins, but a Developer account is locked against them.',
            '• The "Requests" page in your sidebar is where every update/change/new-feature request from Admin and Super Admin lands — it\'s the same shared board they see under "Request a Feature", just under your own link.',
          ],
          bodyBn: [
            'সুপার অ্যাডমিন যা যা করতে পারে তার উপরে, Developer-এর একটা অতিরিক্ত স্তর আছে, নির্দিষ্টভাবে Developer অ্যাকাউন্ট নিয়ে:',
            '• শুধু একজন Developer-ই কাউকে Developer স্ট্যাটাস দিতে পারে — একজন সুপার অ্যাডমিন কাউকে Developer-এ উন্নীত করতে পারে না।',
            '• শুধু একজন Developer-ই একটি বিদ্যমান Developer অ্যাকাউন্ট পরিবর্তন বা ডিলিট করতে পারে। একজন সুপার অ্যাডমিন অন্য সব অ্যাকাউন্ট ম্যানেজ করতে পারে, অন্য সুপার অ্যাডমিনদেরও, কিন্তু একটি Developer অ্যাকাউন্ট তাদের থেকে সুরক্ষিত।',
            '• আপনার সাইডবারের "Requests" পেজেই Admin আর Super Admin-এর পাঠানো প্রতিটি আপডেট/পরিবর্তন/নতুন-ফিচারের অনুরোধ আসে — এটা একই শেয়ার্ড বোর্ড যা তারা "Request a Feature"-এর নিচে দেখে, শুধু আপনার নিজের লিংকে।',
          ],
        },
        {
          headingEn: 'A quick word of caution',
          headingBn: 'একটু সতর্কতার কথা',
          bodyEn: [
            'None of the deletions in this system can be undone — once you delete something, it\'s gone for good. Before deleting anything, especially a university, course, or user with real history attached, it\'s worth being certain.',
          ],
          bodyBn: [
            'এই সিস্টেমে কোনো ডিলিট করা জিনিস আর ফিরিয়ে আনা যায় না — একবার কিছু ডিলিট করলে সেটা চিরতরে চলে যায়। কিছু ডিলিট করার আগে, বিশেষ করে আসল হিস্ট্রি যুক্ত থাকা কোনো বিশ্ববিদ্যালয়, কোর্স, বা ইউজার — নিশ্চিত হয়ে নেওয়াই ভালো।',
          ],
        },
      ].filter(Boolean),
    });
  }

  return chapters;
};

// ─── Student ────────────────────────────────────────────────────────────
const buildStudentChapters = () => [
  {
    id: 'welcome',
    icon: Sparkles,
    titleEn: 'Welcome to Your Dashboard',
    titleBn: 'আপনার ড্যাশবোর্ডে স্বাগতম',
    summaryEn: 'What this dashboard is for, and how to get around it.',
    summaryBn: 'এই ড্যাশবোর্ডটি কীসের জন্য, আর এখানে কীভাবে চলাফেরা করবেন।',
    sections: [
      {
        headingEn: 'What is this?',
        headingBn: 'এটা কী?',
        bodyEn: [
          'This is your personal space on Just Go Study — search for courses and universities, apply, track every application, save your favorites, and manage your profile, all from one place.',
        ],
        bodyBn: [
          'এটা Just Go Study-তে আপনার ব্যক্তিগত জায়গা — কোর্স ও বিশ্ববিদ্যালয় খুঁজুন, আবেদন করুন, প্রতিটি আবেদন ট্র্যাক করুন, প্রিয় জিনিসগুলো সেভ করুন, আর প্রোফাইল ম্যানেজ করুন — সবকিছু একই জায়গা থেকে।',
        ],
      },
      {
        headingEn: 'The sidebar',
        headingBn: 'সাইডবার',
        bodyEn: [
          '• Home — your overview and personalized recommendations.',
          '• My Applications — every application you\'ve submitted and its status.',
          '• Browse Courses / Universities — the full public catalog.',
          '• Favorites — courses/universities you\'ve saved to look at again.',
          '• News & Vlogs — articles and videos to help with your study-abroad decision.',
          '• My Profile — your account details.',
        ],
        bodyBn: [
          '• Home — আপনার ওভারভিউ আর পার্সোনালাইজড সাজেশন।',
          '• My Applications — আপনার জমা দেওয়া প্রতিটি আবেদন ও এর স্ট্যাটাস।',
          '• Browse Courses / Universities — সম্পূর্ণ পাবলিক ক্যাটালগ।',
          '• Favorites — যেসব কোর্স/বিশ্ববিদ্যালয় পরে আবার দেখার জন্য সেভ করেছেন।',
          '• News & Vlogs — স্টাডি অ্যাব্রড সিদ্ধান্ত নিতে সাহায্য করবে এমন আর্টিকেল ও ভিডিও।',
          '• My Profile — আপনার অ্যাকাউন্টের তথ্য।',
        ],
      },
    ],
  },
  {
    id: 'preferences',
    icon: Settings,
    titleEn: 'Study Preferences & Recommendations',
    titleBn: 'স্টাডি প্রেফারেন্স ও সাজেশন',
    summaryEn: 'Tell us what you want, and Home will suggest matching courses.',
    summaryBn: 'আপনি কী চান বলুন, আর Home আপনাকে মিলে যাওয়া কোর্স সাজেস্ট করবে।',
    sections: [
      {
        headingEn: 'Setting your preferences',
        headingBn: 'প্রেফারেন্স সেট করা',
        bodyEn: [
          'On your Home page, the "Recommended For You" card links to your Study Preferences page. Set your preferred countries, degree level, budget, and intake season there.',
          'Once saved, Home compares your preferences against real course data and shows you programs that actually match — not a generic list.',
        ],
        bodyBn: [
          'আপনার Home পেজে "Recommended For You" কার্ডটি আপনার Study Preferences পেজের সাথে লিংক করা। এখানে আপনার পছন্দের দেশ, ডিগ্রি লেভেল, বাজেট, আর ইনটেক সিজন সেট করুন।',
          'সেভ করার পর, Home আপনার প্রেফারেন্সকে আসল কোর্স ডেটার সাথে মিলিয়ে দেখায় এমন প্রোগ্রাম যা সত্যিই মিলে যায় — কোনো সাধারণ লিস্ট না।',
        ],
      },
    ],
  },
  {
    id: 'browse',
    icon: BookOpen,
    titleEn: 'Browsing Courses & Universities',
    titleBn: 'কোর্স ও বিশ্ববিদ্যালয় খোঁজা',
    summaryEn: 'Search, filter, and compare before you apply.',
    summaryBn: 'আবেদন করার আগে খুঁজুন, ফিল্টার করুন, তুলনা করুন।',
    sections: [
      {
        headingEn: 'Finding the right fit',
        headingBn: 'সঠিকটা খুঁজে বের করা',
        bodyEn: [
          'Browse Courses and Universities search the full public catalog. Open any course or university to see its full details, requirements, and tuition.',
          'Don\'t know where to start? The public site also has free planning tools — a "Which Country Fits You?" quiz, an IELTS Band Calculator, a Visa Tracker, an ROI Estimator, and Comparison Tools — reachable from the main site\'s Study Abroad → Tools menu.',
        ],
        bodyBn: [
          'Browse Courses আর Universities সম্পূর্ণ পাবলিক ক্যাটালগ খোঁজে। যেকোনো কোর্স বা বিশ্ববিদ্যালয় খুলে এর সম্পূর্ণ বিবরণ, রিকোয়ারমেন্ট, আর টিউশন ফি দেখুন।',
          'কোথা থেকে শুরু করবেন বুঝতে পারছেন না? পাবলিক সাইটে ফ্রি প্ল্যানিং টুলসও আছে — "Which Country Fits You?" কুইজ, IELTS Band Calculator, Visa Tracker, ROI Estimator, আর Comparison Tools — মূল সাইটের Study Abroad → Tools মেনু থেকে যাওয়া যায়।',
        ],
      },
    ],
  },
  {
    id: 'favorites',
    icon: Star,
    titleEn: 'Favorites',
    titleBn: 'ফেভারিটস',
    summaryEn: 'Save courses and universities to compare or apply to later.',
    summaryBn: 'পরে তুলনা করার বা আবেদন করার জন্য কোর্স ও বিশ্ববিদ্যালয় সেভ করুন।',
    sections: [
      {
        headingEn: 'How it works',
        headingBn: 'কীভাবে কাজ করে',
        bodyEn: [
          'While browsing, click the star icon on a course or university to save it. Everything you\'ve saved lives on the Favorites page, where you can also remove anything you\'re no longer considering.',
        ],
        bodyBn: [
          'ব্রাউজ করার সময়, কোনো কোর্স বা বিশ্ববিদ্যালয়ের স্টার আইকনে ক্লিক করলে সেটা সেভ হয়ে যায়। যা যা সেভ করেছেন সবকিছু Favorites পেজে থাকে, যেখান থেকে আর বিবেচনা করছেন না এমন কিছু সরিয়েও ফেলতে পারবেন।',
        ],
      },
    ],
  },
  {
    id: 'applying',
    icon: FileText,
    titleEn: 'Applying to a Course',
    titleBn: 'কোনো কোর্সে আবেদন করা',
    summaryEn: 'Personal info, academic info, documents, submit.',
    summaryBn: 'ব্যক্তিগত তথ্য, একাডেমিক তথ্য, ডকুমেন্ট, সাবমিট।',
    sections: [
      {
        headingEn: 'The application form',
        headingBn: 'আবেদন ফর্ম',
        bodyEn: [
          'From a course or university page, click "Apply Now". The form has four steps:',
          '• Personal Info — name, passport number, date of birth, phone, address.',
          '• Academic Info — highest qualification, institution, CGPA, passing year, IELTS score.',
          '• Documents — upload your certificates/transcripts (PDF, JPG, or PNG, up to 5MB each). You can also enter a coupon code here if you have one.',
          '• Preview & Submit — check everything, then submit.',
        ],
        bodyBn: [
          'কোনো কোর্স বা বিশ্ববিদ্যালয়ের পেজ থেকে "Apply Now"-এ ক্লিক করুন। ফর্মটিতে চারটি ধাপ আছে:',
          '• Personal Info — নাম, পাসপোর্ট নাম্বার, জন্মতারিখ, ফোন, ঠিকানা।',
          '• Academic Info — সর্বোচ্চ যোগ্যতা, প্রতিষ্ঠান, CGPA, পাসিং ইয়ার, IELTS স্কোর।',
          '• Documents — আপনার সার্টিফিকেট/ট্রান্সক্রিপ্ট আপলোড করুন (PDF, JPG, বা PNG, প্রতিটি সর্বোচ্চ 5MB)। এখানে কুপন কোড থাকলে সেটাও দিতে পারবেন।',
          '• Preview & Submit — সবকিছু চেক করে সাবমিট করুন।',
        ],
      },
    ],
  },
  {
    id: 'applications',
    icon: Inbox,
    titleEn: 'Tracking Your Applications',
    titleBn: 'আপনার আবেদন ট্র্যাক করা',
    summaryEn: 'What each status on My Applications actually means.',
    summaryBn: 'My Applications-এ প্রতিটি স্ট্যাটাসের আসল অর্থ কী।',
    sections: [
      {
        headingEn: 'Status, step by step',
        headingBn: 'স্ট্যাটাস, ধাপে ধাপে',
        bodyEn: [
          '• Pending — submitted, waiting to be looked at.',
          '• Under Review — our team is actively checking it.',
          '• Accepted / Rejected — a decision has been made.',
          '• Visa Applied → Visa Approved → Departed — once accepted, these track you through the visa process, right up to actually leaving for your destination.',
          'You\'ll also get a notification (the bell icon) whenever one of your applications changes status.',
        ],
        bodyBn: [
          '• Pending — জমা দেওয়া হয়েছে, দেখার অপেক্ষায়।',
          '• Under Review — আমাদের টিম সক্রিয়ভাবে যাচাই করছে।',
          '• Accepted / Rejected — সিদ্ধান্ত নেওয়া হয়ে গেছে।',
          '• Visa Applied → Visa Approved → Departed — অ্যাক্সেপ্ট হওয়ার পর, এই স্ট্যাটাসগুলো আপনার ভিসা প্রসেস ট্র্যাক করে, একদম গন্তব্যে রওনা হওয়া পর্যন্ত।',
          'আপনার কোনো আবেদনের স্ট্যাটাস বদলালে নোটিফিকেশনও (বেল আইকন) পাবেন।',
        ],
      },
    ],
  },
  {
    id: 'referral',
    icon: Gift,
    titleEn: 'Refer a Friend',
    titleBn: 'বন্ধুকে রেফার করুন',
    summaryEn: 'Your personal invite link, right on the Home page.',
    summaryBn: 'আপনার নিজস্ব ইনভাইট লিংক, Home পেজেই আছে।',
    sections: [
      {
        headingEn: 'How it works',
        headingBn: 'কীভাবে কাজ করে',
        bodyEn: [
          'Your Home page has a referral card with your personal link (you can copy it or share it straight to WhatsApp). Anyone who registers through it is tracked against your account, and our team reviews and rewards genuine referrals.',
        ],
        bodyBn: [
          'আপনার Home পেজে একটি রেফারেল কার্ড আছে যেখানে আপনার নিজস্ব লিংক পাবেন (কপি করতে পারেন বা সরাসরি WhatsApp-এ শেয়ার করতে পারেন)। এই লিংক দিয়ে যে কেউ রেজিস্টার করলে তা আপনার অ্যাকাউন্টের সাথে ট্র্যাক হয়, আর আমাদের টিম আসল রেফারেল যাচাই করে রিওয়ার্ড দেয়।',
        ],
      },
    ],
  },
  {
    id: 'profile',
    icon: CircleUser,
    titleEn: 'My Profile',
    titleBn: 'মাই প্রোফাইল',
    summaryEn: 'Keep your account details up to date.',
    summaryBn: 'আপনার অ্যাকাউন্টের তথ্য হালনাগাদ রাখুন।',
    sections: [
      {
        headingEn: 'What you can update',
        headingBn: 'যা যা আপডেট করতে পারবেন',
        bodyEn: [
          'Your name, avatar, and email. If you need help with anything else, use the Help button in the top bar to reach Contact.',
        ],
        bodyBn: [
          'আপনার নাম, অ্যাভাটার, আর ইমেইল। অন্য কিছুতে সাহায্য দরকার হলে, টপ বারের Help বাটন ব্যবহার করে Contact-এ যান।',
        ],
      },
    ],
  },
];

// ─── Agent ──────────────────────────────────────────────────────────────
const buildAgentChapters = () => [
  {
    id: 'welcome',
    icon: Sparkles,
    titleEn: 'Welcome, Agent',
    titleBn: 'স্বাগতম, এজেন্ট',
    summaryEn: 'What this dashboard is, and the one thing you need before it all works.',
    summaryBn: 'এই ড্যাশবোর্ডটি কী, আর সবকিছু কাজ করার আগে যে একটা জিনিস দরকার।',
    sections: [
      {
        headingEn: 'What is this?',
        headingBn: 'এটা কী?',
        bodyEn: [
          'As an agent, you help students find the right course and university and guide their application through. This dashboard is where you manage the students you work with and track their applications.',
        ],
        bodyBn: [
          'একজন এজেন্ট হিসেবে, আপনি শিক্ষার্থীদের সঠিক কোর্স ও বিশ্ববিদ্যালয় খুঁজে পেতে এবং তাদের আবেদন এগিয়ে নিতে সাহায্য করেন। এই ড্যাশবোর্ড থেকেই আপনি যেসব শিক্ষার্থীর সাথে কাজ করছেন তাদের ম্যানেজ করবেন আর তাদের আবেদন ট্র্যাক করবেন।',
        ],
      },
      {
        headingEn: 'Before anything else: approval',
        headingBn: 'সবার আগে: অনুমোদন',
        bodyEn: [
          'Your agent account needs to be approved by an Admin or Super Admin before Applications and My Students will work — until then those pages return an "Agent account not approved yet" error. This is automatic and by design, it protects students from unverified agents.',
          'While you wait, fill in your Profile completely (see below) — it\'s the information Admin reviews when deciding to approve you.',
        ],
        bodyBn: [
          'আপনার এজেন্ট অ্যাকাউন্ট একজন অ্যাডমিন বা সুপার অ্যাডমিন কর্তৃক অনুমোদিত না হওয়া পর্যন্ত Applications আর My Students কাজ করবে না — ততক্ষণ পর্যন্ত এই পেজগুলো "Agent account not approved yet" এরর দেখাবে। এটা স্বয়ংক্রিয় এবং ইচ্ছাকৃতভাবেই এমন, এটা যাচাই না হওয়া এজেন্টদের থেকে শিক্ষার্থীদের সুরক্ষা দেয়।',
          'অপেক্ষা করার সময়, আপনার Profile সম্পূর্ণভাবে পূরণ করুন (নিচে দেখুন) — এটাই সেই তথ্য যা অ্যাডমিন আপনাকে অনুমোদন দেওয়ার সময় দেখেন।',
        ],
        note: {
          type: 'warning',
          en: 'If Applications or My Students shows an error, this is almost always why. Contact the team through Help Desk if you believe you\'ve been waiting too long.',
          bn: 'Applications বা My Students-এ এরর দেখালে, প্রায় সবসময় এটাই কারণ। অনেকদিন অপেক্ষা করছেন মনে হলে Help Desk-এর মাধ্যমে টিমের সাথে যোগাযোগ করুন।',
        },
      },
    ],
  },
  {
    id: 'profile',
    icon: CircleUser,
    titleEn: 'My Profile',
    titleBn: 'মাই প্রোফাইল',
    summaryEn: 'Your professional info and office address.',
    summaryBn: 'আপনার পেশাগত তথ্য ও অফিসের ঠিকানা।',
    sections: [
      {
        headingEn: 'What to fill in',
        headingBn: 'কী পূরণ করবেন',
        bodyEn: [
          'Professional Information and Office Address — keep both accurate and complete. This is what Admin sees when reviewing your approval, and what students see when deciding to work with you.',
        ],
        bodyBn: [
          'Professional Information আর Office Address — দুটোই সঠিক ও সম্পূর্ণ রাখুন। অ্যাডমিন আপনার অনুমোদন যাচাই করার সময় এটাই দেখেন, আর শিক্ষার্থীরা আপনার সাথে কাজ করার সিদ্ধান্ত নেওয়ার সময়ও এটাই দেখে।',
        ],
      },
    ],
  },
  {
    id: 'students',
    icon: Users,
    titleEn: 'My Students',
    titleBn: 'মাই স্টুডেন্টস',
    summaryEn: 'The students you\'re working with.',
    summaryBn: 'যেসব শিক্ষার্থীর সাথে আপনি কাজ করছেন।',
    sections: [
      {
        headingEn: 'Managing your student list',
        headingBn: 'আপনার শিক্ষার্থী তালিকা ম্যানেজ করা',
        bodyEn: [
          'My Students lists everyone you\'re currently guiding. From here you can jump straight to a student\'s applications to see where things stand.',
        ],
        bodyBn: [
          'My Students-এ আপনি বর্তমানে যাদের গাইড করছেন তাদের সবার তালিকা থাকে। এখান থেকে সরাসরি একজন শিক্ষার্থীর আবেদনে গিয়ে বর্তমান অবস্থা দেখতে পারবেন।',
        ],
      },
    ],
  },
  {
    id: 'applications',
    icon: Briefcase,
    titleEn: 'Applications',
    titleBn: 'অ্যাপ্লিকেশন',
    summaryEn: 'Every application from your students, in one place.',
    summaryBn: 'আপনার শিক্ষার্থীদের প্রতিটি আবেদন, এক জায়গায়।',
    sections: [
      {
        headingEn: 'What you\'ll see',
        headingBn: 'যা দেখবেন',
        bodyEn: [
          'A summary at the top (total, pending, under review, and so on), then the full list. Status moves from Pending to Under Review to Accepted/Rejected, and once accepted, on through Visa Applied → Visa Approved → Departed.',
          'Use this page to follow up with students whose applications are stuck at Pending or Under Review the longest.',
        ],
        bodyBn: [
          'উপরে একটি সারসংক্ষেপ (মোট, পেন্ডিং, আন্ডার রিভিউ, ইত্যাদি), তারপর সম্পূর্ণ তালিকা। স্ট্যাটাস Pending থেকে Under Review হয়ে Accepted/Rejected-এ যায়, আর অ্যাক্সেপ্ট হলে এরপর Visa Applied → Visa Approved → Departed পর্যন্ত এগোয়।',
          'যেসব শিক্ষার্থীর আবেদন সবচেয়ে বেশি সময় Pending বা Under Review-তে আটকে আছে, তাদের সাথে ফলো-আপ করতে এই পেজ ব্যবহার করুন।',
        ],
      },
    ],
  },
  {
    id: 'browse-referral',
    icon: Trophy,
    titleEn: 'Browsing & Your Referral Rank',
    titleBn: 'ব্রাউজিং ও আপনার রেফারেল র‍্যাঙ্ক',
    summaryEn: 'Courses/Universities for research, plus a leaderboard on Home.',
    summaryBn: 'রিসার্চের জন্য Courses/Universities, আর Home-এ একটি লিডারবোর্ড।',
    sections: [
      {
        headingEn: 'Courses & Universities',
        headingBn: 'কোর্স ও বিশ্ববিদ্যালয়',
        bodyEn: [
          'The same public catalog students browse — useful for researching the right fit before you recommend a course to someone.',
        ],
        bodyBn: [
          'শিক্ষার্থীরা যে একই পাবলিক ক্যাটালগ ব্রাউজ করে — কাউকে কোনো কোর্স সাজেস্ট করার আগে সঠিক অপশন খুঁজতে কাজে লাগে।',
        ],
      },
      {
        headingEn: 'Referral Leaderboard',
        headingBn: 'রেফারেল লিডারবোর্ড',
        bodyEn: [
          'Your Home page also has a referral leaderboard — you get your own referral link too (copy or share to WhatsApp), and it ranks agents by real referral counts. No fabricated ranks; if you haven\'t referred anyone yet it honestly shows 0.',
        ],
        bodyBn: [
          'আপনার Home পেজেও একটি রেফারেল লিডারবোর্ড আছে — আপনিও নিজের রেফারেল লিংক পাবেন (কপি করুন বা WhatsApp-এ শেয়ার করুন), আর এটা এজেন্টদের আসল রেফারেল সংখ্যা অনুযায়ী র‍্যাঙ্ক করে। কোনো বানানো র‍্যাঙ্ক নেই; এখনো কাউকে রেফার না করলে সততার সাথেই 0 দেখাবে।',
        ],
      },
    ],
  },
];

// ─── University ─────────────────────────────────────────────────────────
const buildUniversityChapters = () => [
  {
    id: 'welcome',
    icon: Sparkles,
    titleEn: 'Welcome',
    titleBn: 'স্বাগতম',
    summaryEn: 'How your institution\'s presence on Just Go Study works.',
    summaryBn: 'Just Go Study-তে আপনার প্রতিষ্ঠানের উপস্থিতি কীভাবে কাজ করে।',
    sections: [
      {
        headingEn: 'What is this?',
        headingBn: 'এটা কী?',
        bodyEn: [
          'Your account is linked to your institution\'s profile on Just Go Study. From here, you manage your university\'s public profile, list the courses/programs you offer, and review the applications students submit to them.',
        ],
        bodyBn: [
          'আপনার অ্যাকাউন্ট Just Go Study-তে আপনার প্রতিষ্ঠানের প্রোফাইলের সাথে যুক্ত। এখান থেকে আপনি আপনার বিশ্ববিদ্যালয়ের পাবলিক প্রোফাইল ম্যানেজ করবেন, আপনার অফার করা কোর্স/প্রোগ্রাম তালিকাভুক্ত করবেন, এবং শিক্ষার্থীদের জমা দেওয়া আবেদন রিভিউ করবেন।',
        ],
      },
    ],
  },
  {
    id: 'profile',
    icon: Building2,
    titleEn: 'University Profile',
    titleBn: 'ইউনিভার্সিটি প্রোফাইল',
    summaryEn: 'Basic Information + Detailed Information — this is your public listing.',
    summaryBn: 'Basic Information + Detailed Information — এটাই আপনার পাবলিক লিস্টিং।',
    sections: [
      {
        headingEn: 'Keep it accurate',
        headingBn: 'সঠিক রাখুন',
        bodyEn: [
          'Basic Information (name, country, logo, ranking, and so on) and Detailed Information together make up what a student sees on your university\'s public page. The more complete and accurate this is, the more confidently students can shortlist you.',
        ],
        bodyBn: [
          'Basic Information (নাম, দেশ, লোগো, র‍্যাঙ্কিং, ইত্যাদি) আর Detailed Information একসাথে মিলে আপনার বিশ্ববিদ্যালয়ের পাবলিক পেজে একজন শিক্ষার্থী যা দেখে তা তৈরি করে। এটা যত সম্পূর্ণ ও সঠিক থাকবে, শিক্ষার্থীরা তত আত্মবিশ্বাসের সাথে আপনাকে শর্টলিস্ট করতে পারবে।',
        ],
      },
    ],
  },
  {
    id: 'courses',
    icon: GraduationCap,
    titleEn: 'Our Courses',
    titleBn: 'আওয়ার কোর্সেস',
    summaryEn: 'Add and manage the programs you offer.',
    summaryBn: 'আপনার অফার করা প্রোগ্রামগুলো যোগ ও ম্যানেজ করুন।',
    sections: [
      {
        headingEn: 'Listing a course',
        headingBn: 'একটি কোর্স তালিকাভুক্ত করা',
        bodyEn: [
          'Our Courses shows every program linked to your university. You can add new ones directly — tuition, IELTS requirement, and other details go here, and they show up on the public Courses page and your course detail pages right away.',
        ],
        bodyBn: [
          'Our Courses আপনার বিশ্ববিদ্যালয়ের সাথে যুক্ত প্রতিটি প্রোগ্রাম দেখায়। আপনি সরাসরি নতুন প্রোগ্রাম যোগ করতে পারেন — টিউশন ফি, IELTS রিকোয়ারমেন্ট, আর অন্যান্য বিবরণ এখানে দিন, আর এগুলো সাথে সাথেই পাবলিক Courses পেজ ও কোর্স ডিটেইল পেজে দেখা যাবে।',
        ],
      },
    ],
  },
  {
    id: 'applications',
    icon: Inbox,
    titleEn: 'Applications',
    titleBn: 'অ্যাপ্লিকেশন',
    summaryEn: 'Review students who applied to your courses, and move them forward.',
    summaryBn: 'আপনার কোর্সে আবেদনকারী শিক্ষার্থীদের রিভিউ করুন, এগিয়ে নিন।',
    sections: [
      {
        headingEn: 'Reviewing an application',
        headingBn: 'একটি আবেদন রিভিউ করা',
        bodyEn: [
          'Every student who applied to one of your courses shows up here with their submitted details and documents. Change the status as you make a decision:',
          '• Pending → Under Review while you\'re checking it.',
          '• Accepted or Rejected once you\'ve decided.',
          '• If accepted, it can continue through Visa Applied → Visa Approved → Departed as the student moves through the visa process.',
        ],
        bodyBn: [
          'আপনার কোনো কোর্সে আবেদনকারী প্রতিটি শিক্ষার্থী তাদের জমা দেওয়া তথ্য ও ডকুমেন্টসহ এখানে দেখা যাবে। সিদ্ধান্ত নেওয়ার সাথে সাথে স্ট্যাটাস পরিবর্তন করুন:',
          '• Pending → Under Review, যখন আপনি যাচাই করছেন।',
          '• Accepted বা Rejected, সিদ্ধান্ত নেওয়ার পর।',
          '• অ্যাক্সেপ্ট হলে, শিক্ষার্থী ভিসা প্রসেসের মধ্য দিয়ে যাওয়ার সাথে সাথে এটা Visa Applied → Visa Approved → Departed পর্যন্ত এগোতে পারে।',
        ],
      },
    ],
  },
  {
    id: 'browse',
    icon: BookOpen,
    titleEn: 'Browse All',
    titleBn: 'ব্রাউজ অল',
    summaryEn: 'See how your listings compare to the rest of the catalog.',
    summaryBn: 'পুরো ক্যাটালগের তুলনায় আপনার লিস্টিং কেমন দেখাচ্ছে দেখুন।',
    sections: [
      {
        headingEn: 'The full public catalog',
        headingBn: 'সম্পূর্ণ পাবলিক ক্যাটালগ',
        bodyEn: [
          'Browse All opens the same course catalog students see, so you can check how your programs look and compare alongside everyone else\'s.',
        ],
        bodyBn: [
          'Browse All শিক্ষার্থীরা যে একই কোর্স ক্যাটালগ দেখে সেটাই খোলে, যাতে আপনি দেখতে পারেন আপনার প্রোগ্রামগুলো কেমন দেখাচ্ছে আর অন্যদের সাথে তুলনায় কেমন।',
        ],
      },
    ],
  },
];
