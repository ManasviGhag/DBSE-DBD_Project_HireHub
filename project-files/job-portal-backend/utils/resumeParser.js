import fs from "fs";
import os from "os";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

// Rule-based resume parser — no AI and no API calls, so it works standalone
// and for free. aiResumeParser.js uses it whenever Gemini isn't available.
// Everything here is heuristic: when a field can't be found confidently it
// is left as "" rather than guessed.

/* =========================================================
   TEXT EXTRACTION (PDF / DOCX, with OCR for scanned PDFs)
========================================================= */

// Below this many characters, a PDF almost certainly has no real text layer
// (i.e. it's a scanned/image-only resume), so we try OCR instead.
const MIN_PDF_TEXT_LENGTH = 100;
const MAX_OCR_PAGES = 5; // keep upload time bounded for long scans
const OCR_CACHE_DIR = path.join(os.tmpdir(), "hirehub-tesseract"); // language data (~10MB, downloaded once)

// Renders each PDF page to an image and runs Tesseract OCR on it. The OCR
// libraries are loaded lazily so normal (text-based) uploads never pay for them.
async function ocrPdf(filePath) {
  const [{ pdf }, { createWorker }] = await Promise.all([
    import("pdf-to-img"),
    import("tesseract.js"),
  ]);

  const worker = await createWorker("eng", 1, { cachePath: OCR_CACHE_DIR });
  try {
    let text = "";
    let pageCount = 0;
    for await (const pageImage of await pdf(filePath, { scale: 2 })) {
      const { data } = await worker.recognize(pageImage);
      text += `${data.text}\n\n`;
      if (++pageCount >= MAX_OCR_PAGES) break;
    }
    return text;
  } finally {
    await worker.terminate();
  }
}

export async function extractTextFromResume(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    const text = data.text || "";

    if (text.trim().length >= MIN_PDF_TEXT_LENGTH) return text;

    try {
      const ocrText = await ocrPdf(filePath);
      console.log(
        `[resumeParser] PDF text layer had ${text.trim().length} chars; OCR recovered ${ocrText.trim().length}`
      );
      return ocrText.trim().length > text.trim().length ? ocrText : text;
    } catch (err) {
      // e.g. no network on first run to fetch the OCR language data
      console.error("[resumeParser] OCR fallback failed:", err.message);
      return text;
    }
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || "";
  }

  throw new Error(`Unsupported resume file type: ${ext}`);
}

/* =========================================================
   LINE HELPERS
========================================================= */

const BULLET_RE = /^\s*(?:[•·●▪◦‣∙○■□➢➤►▸✓✔*>]+|[-–—]+(?=\s)|\d{1,2}[.)](?=\s))\s*/;

function toLines(text) {
  // Keep inner runs of spaces: PDF tables/columns come through as 3+ spaces.
  return text.split(/\r?\n/).map((line) => line.trim());
}

function stripBullet(line) {
  return line.replace(BULLET_RE, "").trim();
}

function tidy(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/^[\s,.;:|\-–—]+|[\s,;:|\-–—]+$/g, "")
    .trim();
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function dedupeBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const entryKey = (entry) =>
  Object.values(entry)
    .map((v) => String(v).toLowerCase().replace(/\s+/g, " ").trim())
    .join("|");

/* =========================================================
   SECTION DETECTION
========================================================= */

// Header phrases per section, compared after normalizing (lowercase, letters only).
// "other" headers carry no data we extract — they just end the previous section.
const SECTION_HEADERS = {
  education: [
    "education", "educational qualification", "educational qualifications",
    "educational background", "educational details", "education details",
    "academic background", "academic qualification", "academic qualifications",
    "academic details", "academic profile", "academic record", "academics", "academia",
    "qualification", "qualifications", "summary of qualifications", "scholastic record",
  ],
  experience: [
    "experience", "work experience", "professional experience", "relevant experience",
    "work history", "employment", "employment history", "employment details",
    "career history", "career highlights", "professional background",
    "internship", "internships", "internship experience", "assignments",
    "organizational experience", "organisational experience", "experience details",
  ],
  skills: [
    "skills", "technical skills", "key skills", "core skills", "skill set", "skillset",
    "technical skill set", "skills summary", "core competencies", "competencies",
    "areas of expertise", "technical expertise", "expertise", "technologies", "technology",
    "tools and technologies", "it skills", "computer skills", "soft skills",
  ],
  certifications: [
    "certifications", "certification", "certificates", "certificate",
    "licenses", "licences", "licenses and certifications", "certifications and licenses",
    "courses", "online courses", "courses and certifications", "certifications and courses",
    "trainings", "trainings and certifications", "training and certifications",
    "professional development",
  ],
  other: [
    "objective", "career objective", "summary", "professional summary", "profile",
    "profile summary", "synopsis", "about me", "projects", "academic projects",
    "key projects", "key project handled", "personal projects", "personal details",
    "personal information", "personal profile", "hobbies", "interests",
    "hobbies and interests", "languages", "languages known", "achievements",
    "accomplishments", "awards", "attainments", "extracurricular activities",
    "extra curricular activities", "co curricular activities", "declaration",
    "references", "roles responsibilities", "roles and responsibilities",
    "responsibilities", "strengths", "contact", "contact details", "publications",
    "volunteer experience", "volunteering", "activities",
  ],
};

// Words that also count as a header when followed by a short qualifier,
// e.g. "Experience Summary", "Skills Tools/Languages", "Education Details".
const PREFIX_HEADER_WORDS = {
  education: "education",
  qualifications: "education",
  experience: "experience",
  skills: "skills",
  certifications: "certifications",
  certificates: "certifications",
};

function normalizeHeader(line) {
  return stripBullet(line)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const HEADER_LOOKUP = new Map();
for (const [group, phrases] of Object.entries(SECTION_HEADERS)) {
  for (const phrase of phrases) HEADER_LOOKUP.set(normalizeHeader(phrase), group);
}

function headerGroupOf(line) {
  if (!line || line.length > 40) return null;
  // A trailing comma means a wrapped table cell ("Higher Secondary School" / "Certificate,")
  if (/,\s*$/.test(line)) return null;
  const norm = normalizeHeader(line);
  if (!norm) return null;
  if (HEADER_LOOKUP.has(norm)) return HEADER_LOOKUP.get(norm);

  const words = norm.split(" ");
  if (words.length <= 4 && PREFIX_HEADER_WORDS[words[0]]) return PREFIX_HEADER_WORDS[words[0]];
  return null;
}

// Returns { group, span } if line i starts a header (a header may be wrapped
// over two short lines, e.g. "Educational" / "qualification").
function headerAt(lines, i) {
  const single = headerGroupOf(lines[i]);
  if (single) return { group: single, span: 1 };
  const next = lines[i + 1];
  if (lines[i] && next && lines[i].length <= 25 && next.length <= 25) {
    const joined = headerGroupOf(`${lines[i]} ${next}`);
    if (joined) return { group: joined, span: 2 };
  }
  return null;
}

// Splits the resume into blocks of lines, one per detected section. A line only
// counts as a header if real content follows it (not another header / the end).
function splitSections(text) {
  const lines = toLines(text);
  const blocks = [{ group: null, lines: [] }];

  for (let i = 0; i < lines.length; i++) {
    const header = headerAt(lines, i);
    if (header) {
      let j = i + header.span;
      while (j < lines.length && !lines[j]) j++;
      const followedByContent = j < lines.length && !headerAt(lines, j);
      if (followedByContent) {
        blocks.push({ group: header.group, lines: [] });
        i += header.span - 1;
        continue;
      }
    }
    blocks[blocks.length - 1].lines.push(lines[i]);
  }

  return blocks;
}

function sectionBlocks(text, group) {
  return splitSections(text)
    .filter((block) => block.group === group)
    .map((block) => block.lines)
    .filter((lines) => lines.some(Boolean));
}

/* =========================================================
   SKILLS — dictionary match over the whole resume
========================================================= */

// "Display name|alias|alias". Aliases are case-insensitive unless prefixed
// with "=" (used for words that are also ordinary English, e.g. "=Excel").
// A display name prefixed with "!" is only a label, not itself a search term
// (e.g. "!Go|golang" — the bare word "go" is far too common to match).
const SKILL_DICTIONARY = [
  // Programming languages
  "JavaScript|js|ecmascript|es6", "TypeScript", "Python", "Java", "C++|cpp", "C#|c sharp|csharp",
  "!Go|golang", "=Rust", "!Ruby|ruby programming|ruby language", "PHP", "=Swift", "Kotlin", "Scala", "Perl",
  "R Programming|r programming|r language|rstudio", "MATLAB", "=Dart", "Objective-C|objective c",
  "Visual Basic|=VB|vb6", "VBA|excel vba", "VB.NET|vb .net", "Shell Scripting|shell script|bash|bash scripting",
  "PowerShell", "=Groovy", "Lua", "Haskell", "Elixir", "Erlang", "Clojure", "F#", "COBOL", "Fortran",
  "Assembly Language|assembly language", "Solidity", "=Julia", "SQL", "PL/SQL|plsql", "T-SQL|tsql",
  "NoSQL", "HTML|html5", "CSS|css3", "SASS|scss", "XML", "JSON", "YAML", "GraphQL", "=Apex", "ABAP",

  // Front end
  "!React|=React|react.js|reactjs|react js", "Angular|angularjs|angular.js", "Vue.js|vue|vuejs",
  "Svelte", "Next.js|nextjs|next js", "Nuxt.js|nuxtjs|nuxt", "Redux", "jQuery", "Bootstrap",
  "Tailwind CSS|tailwind|tailwindcss", "Material UI|material-ui|mui", "Chakra UI",
  "Ember.js|emberjs", "Backbone.js|backbonejs", "Webpack", "Vite", "Babel", "=Gatsby", "Three.js",
  "D3.js|d3js", "Chart.js", "AJAX", "Responsive Design|responsive web design",
  "Web Development|web dev", "Frontend Development|front end development|front-end development|frontend developer",
  "Backend Development|back end development|back-end development",
  "Full Stack Development|full stack|fullstack|full-stack", "MERN Stack|mern", "MEAN Stack|mean stack",
  "Web Accessibility|wcag|accessibility", "Progressive Web Apps|pwa", "WebSockets|websocket",
  "REST APIs|rest api|rest apis|restful|restful api|restful apis|rest services",
  "=SOAP", "SOAP UI|soapui", "WSDL", "Microservices|microservice", "gRPC", "OAuth", "JWT",

  // Back end, frameworks and middleware
  "Node.js|nodejs|node js", "Express.js|expressjs|express js", "NestJS|nest.js", "Django", "Flask",
  "FastAPI", "Spring Boot|springboot", "Spring Framework|spring mvc|spring core", "=Hibernate",
  "Laravel", "Symfony", "CodeIgniter", "Ruby on Rails|rails", "ASP.NET|asp .net|asp.net core|asp.net mvc",
  ".NET|dotnet|dot net|.net core|.net framework", "Classic ASP|=ASP", "Entity Framework", "Struts",
  "JSP", "Servlets|servlet", "J2EE|java ee|jakarta ee", "JDBC", "JPA", "Maven", "Gradle",
  "Apache Kafka|kafka", "RabbitMQ", "Redis", "Celery", "Socket.IO", "Socket Programming",
  "Nginx", "Apache Tomcat|tomcat", "IIS", "JBoss|wildfly", "WebLogic", "WebSphere",
  "TIBCO|tibco bw|tibco ems", "MuleSoft|mule esb", "JMS", "Deno",

  // Mobile
  "Android|android development", "iOS|ios development", "Flutter", "React Native",
  "Xamarin", "Ionic", "SwiftUI", "Jetpack Compose", "Cordova|phonegap",

  // Databases and data stores
  "MySQL", "PostgreSQL|postgres", "MongoDB|mongo", "Mongoose", "SQLite", "=Oracle|oracle db|oracle database",
  "SQL Server|ms sql|mssql|microsoft sql server", "MariaDB", "Cassandra", "DynamoDB",
  "Firebase|firestore", "Elasticsearch|elastic search", "Neo4j", "CouchDB", "Couchbase",
  "Snowflake", "BigQuery", "Redshift", "Supabase", "Prisma", "Sequelize", "Teradata",
  "DB2|ibm db2", "Apache Hive|=Hive", "HBase", "Database Management|dbms|databases|database design",
  "Data Modeling|data modelling", "ETL", "Stored Procedures|stored procedure",
  "Microsoft Access|ms access",

  // Cloud
  "AWS|amazon web services", "Microsoft Azure|azure", "Google Cloud|gcp|google cloud platform",
  "AWS Lambda", "EC2|aws ec2", "Amazon S3|aws s3|=S3", "CloudFormation", "Heroku", "Netlify",
  "Vercel", "DigitalOcean", "IBM Cloud", "Oracle Cloud|oci", "Serverless", "Cloud Computing",

  // DevOps, OS and infrastructure
  "Docker", "Kubernetes|k8s", "Jenkins", "Git", "GitHub", "GitLab", "Bitbucket", "SVN|subversion",
  "VSS|visual sourcesafe", "TFS|team foundation server", "Azure DevOps",
  "CI/CD|ci cd|continuous integration|continuous deployment|continuous delivery", "DevOps",
  "Terraform", "Ansible", "=Chef", "=Puppet", "Vagrant", "Helm", "Prometheus", "Grafana",
  "ELK Stack|elk", "Splunk", "Nagios", "Datadog", "New Relic", "OpenShift",
  "Site Reliability Engineering|=SRE", "Linux", "Unix", "Windows Server", "Ubuntu",
  "Red Hat|rhel", "CentOS", "Computer Networks|computer networking|networking",
  "TCP/IP", "DNS", "=HTTP", "Load Balancing", "VMware", "Hyper-V", "Virtualization",

  // Data, analytics and AI
  "Machine Learning|=ML", "Deep Learning", "Artificial Intelligence|=AI", "Data Science",
  "Data Analysis|data analytics", "Data Visualization|data visualisation", "Big Data",
  "NLP|natural language processing", "Computer Vision", "Generative AI|genai|gen ai",
  "LLMs|llm|large language models", "Prompt Engineering", "TensorFlow", "PyTorch", "Keras",
  "scikit-learn|sklearn|scikit learn", "Pandas", "NumPy", "SciPy", "Matplotlib", "Seaborn",
  "Plotly", "OpenCV", "Hugging Face|huggingface", "LangChain", "XGBoost",
  "Apache Spark|pyspark|=Spark", "Hadoop", "Apache Airflow|airflow", "Databricks", "Tableau",
  "Power BI|powerbi", "Looker", "Qlik|qlikview|qlik sense", "Google Analytics",
  "Statistics|statistical analysis", "Jupyter|jupyter notebook", "=SAS", "SPSS", "Alteryx",
  "Data Mining", "Data Warehousing|data warehouse", "Data Engineering", "MLOps",
  "A/B Testing|ab testing", "Time Series Analysis|time series", "Predictive Modeling|predictive modelling",
  "Regression Analysis",

  // Testing and QA
  "Manual Testing", "Automation Testing|test automation|automation test", "Selenium|selenium webdriver|selenium web driver",
  "Cypress", "Playwright", "Puppeteer", "Appium", "JUnit", "TestNG", "PyTest", "=Jest", "Mocha",
  "Jasmine", "Cucumber|bdd", "Postman", "JMeter|apache jmeter", "LoadRunner",
  "QTP|uft|unified functional testing", "Test Director|testdirector",
  "Quality Center|quality centre|hp alm", "JIRA", "Zephyr", "TestRail", "Bugzilla",
  "Rational Quality Manager|=RQM", "Rational Team Concert", "ClearQuest|clear quest",
  "ClearCase|clear case", "Functional Testing", "Regression Testing",
  "Integration Testing|system integration testing|=SIT", "System Testing", "Unit Testing",
  "User Acceptance Testing|=UAT", "Performance Testing|load testing", "API Testing",
  "Mobile Testing", "Cross Browser Testing|cross-browser testing", "Database Testing|db testing",
  "ETL Testing", "Web Application Testing|web testing|website testing|web application testing",
  "Exploratory Testing", "Smoke Testing|sanity testing", "Black Box Testing", "White Box Testing",
  "Test Planning|test plan|test plans", "Test Case Design|test cases|test case",
  "Test Management", "Test Strategy", "Defect Management|defect tracking|bug tracking",
  "STLC", "SDLC", "Traceability Matrix|requirement traceability matrix|=RTM",
  "Service Virtualization",

  // Design
  "Figma", "Adobe XD", "=Sketch", "Adobe Photoshop|photoshop", "Adobe Illustrator|illustrator",
  "Adobe InDesign|indesign", "Adobe Premiere Pro|premiere pro", "Adobe After Effects|after effects",
  "Adobe Creative Suite|creative cloud", "Canva", "CorelDRAW", "Blender", "AutoCAD", "SolidWorks",
  "CATIA", "Revit", "SketchUp", "3ds Max", "=Maya", "UI Design|user interface design|ui designing",
  "UX Design|user experience design|ux research", "UI/UX|ui ux", "Wireframing|wireframes",
  "Prototyping", "InVision", "Zeplin", "Graphic Design", "Typography", "Motion Graphics",
  "Video Editing",

  // Security
  "Cybersecurity|cyber security", "Network Security", "Penetration Testing|pen testing",
  "Ethical Hacking", "Vulnerability Assessment", "OWASP", "SIEM", "Firewalls|firewall",
  "Wireshark", "Nmap", "Burp Suite", "Metasploit", "Kali Linux", "Cryptography",
  "Endpoint Security", "Identity and Access Management|=IAM",

  // Hardware and embedded
  "Arduino", "Raspberry Pi", "IoT|internet of things", "Embedded Systems", "Embedded C",
  "VHDL", "Verilog", "=PLC", "SCADA", "Simulink", "PCB Design",

  // Enterprise platforms
  "=SAP", "SAP ERP", "SAP CRM", "SAP FICO|sap fi|sap fi/co", "SAP MM", "SAP SD", "SAP HANA",
  "Oracle EBS|oracle e-business suite", "Salesforce", "Microsoft Dynamics|dynamics 365",
  "=Workday", "ServiceNow", "Zoho", "!Tally|=Tally|tally erp|tally prime", "QuickBooks", "Xero",
  "Zendesk", "Freshdesk", "HubSpot", "Pega", "Siebel", "Amdocs", "Guidewire", "Crystal Reports",
  "SharePoint", "Power Automate", "Power Apps", "UiPath", "Automation Anywhere", "Blue Prism",
  "RPA|robotic process automation",

  // CS fundamentals
  "Data Structures|data structures and algorithms|=DSA", "Algorithms",
  "Object-Oriented Programming|oop|oops|object oriented programming",
  "Design Patterns", "System Design", "Operating Systems", "Compiler Design",
  "Distributed Systems", "Multithreading", "Competitive Programming", "Version Control",

  // Business, management and soft skills
  "Project Management", "Program Management", "Product Management", "Agile", "Scrum",
  "Kanban", "Waterfall|waterfall model", "V-Model|v model", "Six Sigma|lean six sigma|six-sigma",
  "Lean Manufacturing", "PRINCE2", "ITIL", "Risk Management|risk assessment",
  "Stakeholder Management", "Requirements Analysis|requirement analysis|requirements gathering|requirement gathering",
  "Business Analysis", "Process Improvement", "Change Management", "Vendor Management",
  "Team Management|people management|team leading", "Resource Planning", "Sprint Planning",
  "Budgeting", "Strategic Planning", "Operations Management", "Quality Assurance|=QA",
  "Quality Control", "Quality Audits|quality audit", "Technical Documentation",
  "Technical Writing", "Communication|communication skills|written communication|verbal communication|oral communication",
  "Leadership", "Teamwork|team work|team player", "Problem Solving|problem-solving",
  "Critical Thinking", "Time Management", "Decision Making|decision-making", "Negotiation",
  "Presentation Skills|presentations", "Public Speaking", "Collaboration", "Adaptability",
  "Interpersonal Skills|interpersonal", "Mentoring|mentorship", "Customer Service",
  "Customer Relationship Management|=CRM", "Client Handling|client management|customer handling",
  "Conflict Resolution", "Attention to Detail", "Multitasking|multi-tasking",
  "Analytical Skills|analytical thinking", "Emotional Intelligence", "Coaching",
  "Training and Development", "Event Management",

  // Accounting and finance
  "Accounting", "Bookkeeping", "Financial Analysis", "Financial Reporting",
  "Financial Modeling|financial modelling", "Taxation", "=GST", "=TDS",
  "Auditing|internal audit|statutory audit", "Accounts Payable", "Accounts Receivable",
  "Payroll", "Reconciliation|bank reconciliation", "Cost Accounting", "Forecasting",
  "Valuation", "Investment Banking", "Equity Research", "Risk Analysis", "Credit Analysis",
  "IFRS", "GAAP|us gaap", "Treasury Management", "Invoicing", "Banking",
  "Wealth Management", "Corporate Finance", "MIS Reporting|=MIS",

  // Marketing and sales
  "Digital Marketing", "SEO|search engine optimization|search engine optimisation",
  "Search Engine Marketing|=SEM", "Social Media Marketing|=SMM", "Content Marketing",
  "Content Writing", "Copywriting", "Email Marketing", "Google Ads|google adwords|adwords",
  "Facebook Ads|meta ads", "Marketing Automation", "Market Research", "Brand Management|branding",
  "Marketing Strategy", "Performance Marketing", "Affiliate Marketing", "Influencer Marketing",
  "Public Relations", "Lead Generation", "=Sales", "B2B Sales", "B2C Sales", "Inside Sales",
  "Business Development", "Account Management|key account management", "Cold Calling",
  "Mailchimp", "Hootsuite", "SEMrush", "Ahrefs", "Google Tag Manager", "Customer Acquisition",
  "E-commerce|ecommerce", "Shopify", "WordPress", "Merchandising", "Pre-sales|presales",

  // Office and collaboration tools
  "Microsoft Office|ms office|ms-office", "!Excel|=Excel|ms excel|microsoft excel|advanced excel",
  "Microsoft Word|ms word", "PowerPoint|ms powerpoint|power point", "!Outlook|=Outlook|ms outlook",
  "Google Workspace|g suite|google docs|google sheets", "Microsoft Teams|ms teams", "=Slack",
  "=Notion", "Trello", "=Asana", "=Confluence", "Monday.com", "Visio|ms visio",
  "MS Project|microsoft project",

  // HR, operations and other domains
  "Recruitment|recruiting|talent acquisition", "Onboarding", "HRMS", "Employee Relations",
  "Performance Management", "Compensation and Benefits", "Supply Chain Management|supply chain",
  "Logistics", "Inventory Management", "Procurement", "Warehouse Management",
  "Customer Support", "Technical Support", "Troubleshooting", "Help Desk|helpdesk", "Data Entry",
  "Teaching", "Curriculum Development", "Clinical Research", "Medical Coding",
  "Pharmacovigilance", "Legal Research", "Contract Management", "Content Creation", "Photography",
];

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Word-boundary-style match that also works for terms like "C++", "C#", ".NET".
// Trailing digits are allowed so versioned mentions ("Java8", "HTML5") still match.
function aliasRegex(alias) {
  const caseSensitive = alias.startsWith("=");
  const term = caseSensitive ? alias.slice(1) : alias;
  const body = escapeRegex(term).replace(/\s+/g, "[\\s-]+");
  return new RegExp(`(?<![A-Za-z0-9+#.])${body}(?![A-Za-z+#])`, caseSensitive ? "" : "i");
}

const SKILL_MATCHERS = SKILL_DICTIONARY.map((entry) => {
  const [name, ...aliases] = entry.split("|");
  const labelOnly = name.startsWith("!");
  const displayName = name.replace(/^[=!]/, "");
  const patterns = (labelOnly ? aliases : [name, ...aliases]).map(aliasRegex);
  return { name: displayName, patterns };
});

// The single-letter language "C" gets a stricter, case-sensitive rule so it
// doesn't match initials, grades or "C-74"-style addresses.
const C_LANGUAGE_RE = /(?:^|[\s,;(:/])C(?=\s*(?:[,;)/]|$|\band\b|\n))/m;

export function parseSkillsFromText(text) {
  const found = [];

  for (const { name, patterns } of SKILL_MATCHERS) {
    let firstIndex = -1;
    for (const re of patterns) {
      const match = re.exec(text);
      if (match && (firstIndex === -1 || match.index < firstIndex)) firstIndex = match.index;
    }
    if (firstIndex !== -1) found.push({ name, index: firstIndex });
  }

  const cMatch = C_LANGUAGE_RE.exec(text);
  if (cMatch) found.push({ name: "C", index: cMatch.index });

  // Report skills in the order they first appear in the resume
  return found.sort((a, b) => a.index - b.index).map((f) => f.name);
}

// Very rough heuristic: looks for patterns like "5 years" / "3+ years"
export function parseExperienceYears(text) {
  const matches = text.match(/(\d+)\+?\s*(years|yrs)/gi);
  if (!matches || matches.length === 0) return 0;

  const numbers = matches
    .map((m) => parseInt(m, 10))
    .filter((n) => !Number.isNaN(n));

  return numbers.length ? Math.max(...numbers) : 0;
}

/* =========================================================
   EDUCATION — { degree, institution, year }
========================================================= */

const DEGREE_PATTERNS = [
  /\bbachelor'?s?\s+(?:of|in)\b/i,
  /\bmaster'?s?\s+(?:of|in)\b/i,
  /\bdoctor(?:ate)?\s+(?:of|in)\b/i,
  /\bph\.?\s?d\b\.?/i,
  /\b(?:post[\s-]?graduate|pg)\s+diploma\b/i,
  /\b(?:advanced\s+)?diploma\b/i,
  /\bb\.?\s?tech\b\.?/i,
  /\bm\.?\s?tech\b\.?/i,
  /\bb\.?\s?sc\b\.?/i,
  /\bm\.?\s?sc\b\.?/i,
  /\bb\.?\s?com\b\.?/i,
  /\bm\.?\s?com\b\.?/i,
  /\b(?:bca|mca|bba|mba|pgdm|mbbs|llb|llm|bds|b\.?\s?pharm|m\.?\s?pharm|b\.?\s?arch|b\.?\s?ed|m\.?\s?ed)\b\.?/i,
  /\bB\.\s?E\b\.?/, // B.E / B. E. (case-sensitive: "be" is an ordinary word)
  /\bM\.\s?E\b\.?/,
  /\bB\.\s?A\b\.?/,
  /\bM\.\s?A\b\.?/,
  /\bBE\b(?=\s*(?:in\b|\())/,
  /\b(?:higher\s+|senior\s+)?secondary(?:\s+school)?(?:\s+certificate)?(?:\s+examination)?\b/i,
  /\bh\.?\s?s\.?\s?c\b\.?/i,
  /\bs\.?\s?s\.?\s?c\b\.?/i,
  /\bclass\s+(?:x|xii|10|12)(?:th)?\b/i,
  /\b(?:10|12)th\b(?:\s+(?:standard|grade|std))?/i,
  /\bintermediate\b/i,
  /\bhigh\s+school\b/i,
];

// Where a degree phrase ends: a comma, bracket, column gap, "from/at/with", or a year.
const DEGREE_END_RE = /\s*(?:,|;|\(|\||\s{3,}|\s[–—-]\s|\bfrom\b|\bat\b|\bwith\b|\bduring\b|\b(?:19|20)\d{2}\b)/i;

const INSTITUTION_RE =
  /\b(?:universit(?:y|ies)|college|institute|institution|school|academy|vidyalaya|vidyapeeth|vidyapith|polytechnic|foundation|education\s+society|iit|nit|iiit)\b/i;

// A degree only starts an entry at the beginning of a line (after any bullet)
// or right after a column/field separator — not mid-sentence ("Completed B.E …").
function findDegree(line) {
  const text = stripBullet(line);
  let best = null;
  for (const re of DEGREE_PATTERNS) {
    const match = re.exec(text);
    if (!match) continue;
    const before = text.slice(0, match.index);
    const atFieldStart = before.trim() === "" || /(?:,|\||–|—|:|\s{3,})\s*$/.test(before);
    if (atFieldStart && (!best || match.index < best.index)) {
      best = { index: match.index, end: match.index + match[0].length };
    }
  }
  if (!best) return null;

  const tail = text.slice(best.end);
  const stop = tail.search(DEGREE_END_RE);
  const degreeEnd = best.end + (stop === -1 ? tail.length : stop);
  const degree = tidy(text.slice(best.index, degreeEnd)).slice(0, 100);
  return degree ? { degree, rest: text.slice(degreeEnd) } : null;
}

function startsWithDegree(text) {
  const t = text.trim();
  return DEGREE_PATTERNS.some((re) => {
    const m = re.exec(t);
    return m && m.index === 0;
  });
}

function findInstitution(text) {
  const segments = text.split(/,|;|\s{3,}|\s[|–—-]\s|\bwith\b/i);
  for (const segment of segments) {
    const candidate = tidy(segment.replace(/\([^)]*\)/g, " ").replace(/^\s*(?:from|at|in)\s+/i, ""));
    if (
      candidate &&
      candidate.length <= 90 &&
      INSTITUTION_RE.test(candidate) &&
      !startsWithDegree(candidate)
    ) {
      return candidate;
    }
  }
  return "";
}

function findYear(text) {
  const range = text.match(
    /\b((?:19|20)\d{2})\s*(?:-|–|—|to)\s*((?:19|20)\d{2}|present|current|till\s+date|ongoing|now)\b/i
  );
  if (range) return `${range[1]} - ${range[2]}`;
  const single = text.match(/\b(?:19|20)\d{2}\b/);
  return single ? single[0] : "";
}

// A line ending in "of" / "and" / "&" was wrapped mid-name ("College of" / "Engineering, …")
function joinWrapped(line, nextLine) {
  return /\b(?:of|and|for|the)\s*,?\s*$|&\s*$/i.test(line) && nextLine ? `${line} ${nextLine}` : line;
}

const EDUCATION_WINDOW = 3; // non-empty lines after a degree to search for institution/year

function extractEducation(lines) {
  const starts = [];
  lines.forEach((line, i) => {
    const found = line && findDegree(line);
    if (found) starts.push({ i, ...found });
  });

  return starts.map((start, k) => {
    const nextStart = k + 1 < starts.length ? starts[k + 1].i : lines.length;
    const after = [];
    for (let j = start.i + 1; j < nextStart && after.length < EDUCATION_WINDOW; j++) {
      if (lines[j] && !headerGroupOf(lines[j])) after.push(lines[j]);
    }

    // The line just above can hold the institution (e.g. "XYZ Institute" / "B.E in IT"),
    // as long as it isn't already part of the previous entry's window.
    let before = "";
    const prevStart = k > 0 ? starts[k - 1].i : -Infinity;
    for (let j = start.i - 1; j > prevStart + EDUCATION_WINDOW && j >= start.i - 2; j--) {
      if (lines[j] && !headerGroupOf(lines[j])) {
        before = lines[j];
        break;
      }
    }

    const candidates = [
      joinWrapped(start.rest, after[0]),
      ...after.map((line, n) => joinWrapped(line, after[n + 1])),
      before,
    ];
    const institution = candidates.map(findInstitution).find(Boolean) || "";
    const year = [start.rest, ...after].map(findYear).find(Boolean) || "";

    return { degree: start.degree, institution, year };
  });
}

// Kept under its original name for aiResumeParser.js; now returns structured
// { degree, institution, year } entries instead of raw matching lines.
export function parseEducationLines(text) {
  let entries = sectionBlocks(text, "education").flatMap(extractEducation);
  // No education header, or a scrambled two-column layout where the degree
  // landed outside it: fall back to scanning the whole resume.
  if (!entries.length) entries = extractEducation(toLines(text));
  return dedupeBy(entries, entryKey).slice(0, 8);
}

/* =========================================================
   EXPERIENCE — { title, company, duration, description }
========================================================= */

const MONTH =
  "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\.?";
const DATE_POINT = `(?:${MONTH}[\\s,'’\`-]*(?:(?:19|20)\\d{2}|\\d{2})\\b|\\d{1,2}[/.-](?:19|20)\\d{2}\\b|(?:19|20)\\d{2}\\b)`;
const DATE_END = `(?:${DATE_POINT}|present|current(?:ly)?|till\\s+(?:date|now)|to\\s+date|now|ongoing|today)`;
const DATE_RANGE_RE = new RegExp(
  `\\b(?:${DATE_POINT}\\s*(?:-|–|—|to|till|until)\\s*${DATE_END}|since\\s+${DATE_POINT})`,
  "i"
);

const COMPANY_LABEL_RE = /^(?:client\s*\/\s*company|company(?:\s+name)?|organi[sz]ation|employer|client)\b\s*[:\-–]?\s*/i;
const TITLE_LABEL_RE = /^(?:designation|role|position|job\s+title|title)\b\s*[:\-–]?\s*/i;
const DURATION_LABEL_RE = /^(?:duration|period|tenure|dates?)\b\s*[:\-–]?\s*/i;

// Legal-entity suffixes are strong evidence of a company name.
const STRONG_COMPANY_RE =
  /^(.*?\b(?:pvt\.?\s*ltd|private\s+limited|ltd|limited|inc|llc|llp|corp(?:oration)?|gmbh|plc)\b\.?)/i;
const WEAK_COMPANY_RE =
  /\b(?:technologies|solutions|systems|services|software|labs?|consult(?:ing|ancy|ants)|infotech|bank|group|enterprises|industries|hospital|healthcare|communications|networks|studios?|ventures|agency)\b/i;
const TITLE_RE =
  /\b(?:engineer|developer|intern|manager|analyst|tester|consultant|designer|lead|associate|executive|officer|specialist|architect|administrator|trainee|scientist|head|director|coordinator|accountant|representative|assistant|programmer|technician|teacher|lecturer|professor|advisor|supervisor)s?\b/i;

function companyName(text) {
  const strong = text.match(STRONG_COMPANY_RE);
  return tidy(strong ? strong[1] : text);
}

// Decides whether a short text fragment is a job title, a company, or neither.
function classifyFragment(fragment) {
  let text = tidy(stripBullet(fragment));
  if (!text || text.length > 90) return {};

  if (COMPANY_LABEL_RE.test(text)) return { company: companyName(text.replace(COMPANY_LABEL_RE, "")) };
  if (TITLE_LABEL_RE.test(text)) return { title: tidy(text.replace(TITLE_LABEL_RE, "")) };

  const at = text.split(/\s+(?:at|@)\s+/i);
  if (at.length === 2 && TITLE_RE.test(at[0])) return { title: tidy(at[0]), company: companyName(at[1]) };

  if (STRONG_COMPANY_RE.test(text)) return { company: companyName(text) };
  if (TITLE_RE.test(text) && wordCount(text) <= 6) return { title: text };
  if (WEAK_COMPANY_RE.test(text) && wordCount(text) <= 6) return { company: text };
  return {};
}

function isLabelOnly(line) {
  // Short table labels like "Solution", "Environment/Systems Worked", "Proficiency Forte"
  return wordCount(line) <= 3 && !/[,.:;]/.test(line);
}

function truncate(text, max = 200) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : max)}…`;
}

function extractExperience(lines) {
  const dateLines = [];
  lines.forEach((line, i) => {
    if (line && DATE_RANGE_RE.test(line)) dateLines.push(i);
  });

  return dateLines.map((i, k) => {
    const line = lines[i];
    const match = line.match(DATE_RANGE_RE);
    const duration = tidy(match[0].replace(/\s*(?:-|–|—)\s*/, " - ").replace(/’/g, "'"));
    let title = "";
    let company = "";
    const fill = (found) => {
      if (found.title && !title) title = found.title;
      if (found.company && !company) company = found.company;
    };

    // 1. Other fields on the same line: "Acme Pvt Ltd   Software Engineer   Jan 2020 - Present"
    const rest = (line.slice(0, match.index) + "   " + line.slice(match.index + match[0].length))
      .replace(DURATION_LABEL_RE, "");
    for (const fragment of rest.split(/\s{3,}|\s[|•·–—-]\s|\t/)) {
      const found = classifyFragment(fragment);
      if (found.title && found.company) fill(found);
      else if (/,/.test(fragment) && TITLE_RE.test(fragment) && WEAK_COMPANY_RE.test(fragment)) {
        // "Software Engineer, Acme Technologies"
        const [first, ...others] = fragment.split(",");
        fill(classifyFragment(first));
        fill(classifyFragment(others.join(",")));
      } else fill(found);
    }

    // 2. Up to two lines above (stopping at the previous entry)
    const prevDate = k > 0 ? dateLines[k - 1] : -1;
    let looked = 0;
    for (let j = i - 1; j > prevDate && looked < 2; j--) {
      if (!lines[j]) continue;
      looked++;
      if (wordCount(lines[j]) > 12 || /\.$/.test(lines[j])) break; // a description sentence
      fill(classifyFragment(lines[j]));
    }

    // 3. Following lines: maybe a title, then the description
    const nextDate = k + 1 < dateLines.length ? dateLines[k + 1] : lines.length;
    let j = i + 1;
    while (j < nextDate && !lines[j]) j++;
    if (!title && j < nextDate) {
      const found = classifyFragment(lines[j]);
      if (found.title && !found.company) {
        title = found.title;
        j++;
      }
    }

    const description = [];
    for (; j < nextDate && description.length < 3; j++) {
      const text = stripBullet(lines[j]);
      if (!text) {
        if (description.length) break; // blank line ends the description
        continue;
      }
      // The next entry's company/title lines sit just above its date line
      const nearNext = j >= nextDate - 2 && nextDate < lines.length;
      const classified = classifyFragment(text);
      if (nearNext && (classified.company || classified.title)) break;
      if (COMPANY_LABEL_RE.test(text)) break;
      if (!description.length && isLabelOnly(text)) continue;
      description.push(text);
    }

    return {
      title,
      company,
      duration,
      description: truncate(tidy(description.join(" "))),
    };
  });
}

// Now takes the resume text and returns { title, company, duration, description }
// entries found by date-range detection inside the Experience section(s).
export function parseExperienceEntries(text = "") {
  const entries = sectionBlocks(text, "experience").flatMap(extractExperience);
  return dedupeBy(entries, entryKey).slice(0, 10);
}

/* =========================================================
   CERTIFICATIONS
========================================================= */

const CERTIFICATION_RE = new RegExp(
  [
    "certified", "certification", "certificates?", "licen[cs]e[ds]?", "nptel", "coursera", "udemy",
    "edx", "linkedin learning", "great learning", "simplilearn", "infosys springboard", "hackerrank",
    "freecodecamp", "cisco networking academy", "google career", "microsoft learn",
    "aws (?:cloud practitioner|solutions architect|developer associate)",
    "azure (?:fundamentals|administrator|developer)", "(?:az|dp|pl|ai|sc)-\\d{3}",
    "istqb", "pmp", "capm", "prince2", "itil", "ccna", "ccnp", "ccie", "comptia", "cissp", "cism",
    "ceh", "oscp", "six sigma", "csm", "cspo", "safe agilist", "scrum master", "ocjp", "ocpjp",
    "salesforce administrator", "google analytics individual qualification", "hubspot academy",
    "cfa", "acca", "frm",
  ]
    .map((p) => `\\b${p}\\b`)
    .join("|"),
  "i"
);

function cleanCertification(line) {
  return tidy(stripBullet(line));
}

function looksLikeCertification(line) {
  return (
    line.length >= 4 &&
    line.length <= 150 &&
    wordCount(line) >= 2 &&
    !findDegree(line) && // e.g. "Secondary School Certificate" is education
    !headerGroupOf(line)
  );
}

export function parseCertifications(text) {
  // Inside a Certifications section, every line is an entry
  let certs = sectionBlocks(text, "certifications")
    .flat()
    .map(cleanCertification)
    .filter(looksLikeCertification);

  // Otherwise (or if that section held nothing usable), look for certification phrasing anywhere
  if (!certs.length) {
    certs = toLines(text)
      .map(cleanCertification)
      .filter((line) => CERTIFICATION_RE.test(line) && looksLikeCertification(line));
  }

  return dedupeBy(certs, (c) => c.toLowerCase()).slice(0, 20);
}
