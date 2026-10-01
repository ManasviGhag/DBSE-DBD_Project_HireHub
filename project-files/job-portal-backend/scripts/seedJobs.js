// One-time seed: creates demo recruiter accounts and ~150 diverse job postings
// (a first batch of ~100, plus a second batch of AI roles and non-full-time jobs).
//
//   npm run seed:jobs
//
// Safe to re-run: recruiters are skipped if their email already exists, and a
// job is skipped if that recruiter already has a posting with the same title
// and location. All seed recruiters use an @seed.hirehub.com email so the data
// is easy to find and remove later, e.g. in mongosh:
//   const ids = db.users.find({ email: /@seed\.hirehub\.com$/ }).map(u => u._id)
//   db.jobs.deleteMany({ postedBy: { $in: ids } }); db.users.deleteMany({ _id: { $in: ids } })

import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Job from "../models/Job.js";

const SEED_PASSWORD = "Seed@12345";

/* ---------------------------------------------------------
   Role templates: domain skills, salary band and duties
--------------------------------------------------------- */

// salary: [min, max] in LPA for a mid-level (2–4 yrs) hire.
// skills: first two are always included; the rest rotate per posting so the
// same role at different companies doesn't get an identical list.
const ROLES = {
  frontend: {
    title: "Frontend Developer",
    salary: [8, 14],
    skills: ["javascript", "react", "html", "css", "typescript", "redux", "next.js", "tailwind css", "jest", "webpack", "rest apis", "git"],
    mission: "build fast, accessible web interfaces used by thousands of customers every day",
    duties: ["turn Figma designs into responsive, reusable React components", "work with backend engineers on clean API contracts", "own front-end performance and accessibility", "write unit and integration tests for the UI"],
  },
  backend: {
    title: "Backend Developer",
    salary: [9, 16],
    skills: ["node.js", "sql", "express.js", "mongodb", "postgresql", "rest apis", "redis", "docker", "microservices", "aws", "kafka", "git"],
    mission: "design and scale the services and APIs behind our product",
    duties: ["design REST APIs and data models", "improve reliability and latency of core services", "write well-tested, maintainable server-side code", "take part in code reviews and on-call rotations"],
  },
  backendJava: {
    title: "Java Developer",
    salary: [9, 15],
    skills: ["java", "spring boot", "sql", "hibernate", "microservices", "rest apis", "mysql", "maven", "junit", "kafka", "docker"],
    mission: "build robust backend systems on the JVM",
    duties: ["develop Spring Boot microservices", "optimise SQL queries and data access layers", "integrate with internal and third-party APIs", "write JUnit tests and support production releases"],
  },
  fullstack: {
    title: "Full Stack Developer",
    salary: [10, 17],
    skills: ["javascript", "react", "node.js", "mongodb", "express.js", "typescript", "sql", "rest apis", "docker", "aws", "git", "html", "css"],
    mission: "ship features end to end, from database to UI",
    duties: ["build product features across the React front end and Node.js back end", "design MongoDB and SQL schemas", "set up CI pipelines and deploy to the cloud", "collaborate closely with product and design"],
  },
  mobile: {
    title: "Mobile App Developer",
    salary: [9, 15],
    skills: ["flutter", "dart", "android", "kotlin", "ios", "swift", "firebase", "rest apis", "react native", "git"],
    mission: "build smooth, reliable mobile apps for Android and iOS",
    duties: ["develop and release features for our mobile apps", "integrate APIs, push notifications and analytics", "fix crashes and improve app start-up time", "publish builds to the Play Store and App Store"],
  },
  android: {
    title: "Android Developer",
    salary: [8, 14],
    skills: ["android", "kotlin", "java", "jetpack compose", "firebase", "rest apis", "sqlite", "git", "mvvm"],
    mission: "craft a fast, delightful Android experience",
    duties: ["build new screens with Jetpack Compose", "improve offline support and app performance", "write unit and UI tests", "work with designers on polished interactions"],
  },
  dataAnalyst: {
    title: "Data Analyst",
    salary: [6, 11],
    skills: ["sql", "excel", "power bi", "python", "tableau", "pandas", "statistics", "data visualization", "google sheets"],
    mission: "turn data into decisions for business teams",
    duties: ["build dashboards and recurring reports", "write SQL to answer ad-hoc business questions", "track KPIs and flag anomalies early", "present insights to non-technical stakeholders"],
  },
  dataScientist: {
    title: "Data Scientist",
    salary: [12, 22],
    skills: ["python", "machine learning", "sql", "pandas", "scikit-learn", "statistics", "numpy", "xgboost", "a/b testing", "deep learning"],
    mission: "build models that improve products and operations",
    duties: ["frame business problems as modelling problems", "build, validate and monitor ML models", "design and analyse A/B experiments", "communicate results to leadership"],
  },
  mlEngineer: {
    title: "Machine Learning Engineer",
    salary: [14, 26],
    skills: ["python", "pytorch", "machine learning", "tensorflow", "mlops", "docker", "aws", "nlp", "llms", "kubernetes", "fastapi"],
    mission: "take ML models from notebooks to production",
    duties: ["build training and inference pipelines", "deploy and monitor models in production", "fine-tune and evaluate NLP / LLM models", "optimise model latency and cost"],
  },
  dataEngineer: {
    title: "Data Engineer",
    salary: [12, 20],
    skills: ["python", "sql", "apache spark", "apache airflow", "aws", "data warehousing", "kafka", "snowflake", "databricks", "etl"],
    mission: "build reliable data pipelines that the whole company depends on",
    duties: ["build batch and streaming pipelines", "model data in the warehouse", "own data quality checks and alerting", "partner with analysts and data scientists"],
  },
  devops: {
    title: "DevOps Engineer",
    salary: [10, 18],
    skills: ["docker", "kubernetes", "aws", "ci/cd", "terraform", "jenkins", "linux", "ansible", "prometheus", "grafana", "git"],
    mission: "make deployments boring and infrastructure dependable",
    duties: ["maintain CI/CD pipelines", "manage Kubernetes clusters and cloud infrastructure as code", "set up monitoring, logging and alerting", "improve security and cost efficiency"],
  },
  cloud: {
    title: "Cloud Engineer",
    salary: [10, 19],
    skills: ["aws", "microsoft azure", "terraform", "linux", "networking", "docker", "kubernetes", "python", "cloudformation", "google cloud"],
    mission: "design and run secure, scalable cloud environments for our clients",
    duties: ["design cloud architectures on AWS and Azure", "migrate on-premise workloads to the cloud", "automate provisioning with Terraform", "troubleshoot networking and access issues"],
  },
  security: {
    title: "Security Analyst",
    salary: [9, 16],
    skills: ["cybersecurity", "network security", "siem", "vulnerability assessment", "penetration testing", "linux", "firewalls", "owasp", "incident response"],
    mission: "protect our systems and customer data",
    duties: ["monitor security alerts and investigate incidents", "run vulnerability scans and track remediation", "review cloud and application configurations", "support compliance audits"],
  },
  uiux: {
    title: "UI/UX Designer",
    salary: [7, 13],
    skills: ["figma", "ui design", "ux design", "wireframing", "prototyping", "user research", "adobe xd", "design systems", "usability testing"],
    mission: "design intuitive experiences our users love",
    duties: ["run user research and usability tests", "create wireframes, flows and high-fidelity prototypes", "maintain the design system", "work hand in hand with engineers through delivery"],
  },
  graphicDesigner: {
    title: "Graphic Designer",
    salary: [4, 8],
    skills: ["adobe photoshop", "adobe illustrator", "canva", "graphic design", "typography", "branding", "adobe indesign", "motion graphics"],
    mission: "create visuals that make brands stand out",
    duties: ["design social media creatives and campaign assets", "build brand guidelines for clients", "prepare print-ready files", "collaborate with copywriters and marketers"],
  },
  productManager: {
    title: "Product Manager",
    salary: [16, 28],
    skills: ["product management", "agile", "jira", "stakeholder management", "data analysis", "roadmapping", "user research", "sql"],
    mission: "own a product area from discovery to launch",
    duties: ["define the roadmap with engineering and design", "write clear PRDs and user stories", "use data and customer feedback to prioritise", "drive launches and measure outcomes"],
  },
  projectManager: {
    title: "Project Manager",
    salary: [12, 20],
    skills: ["project management", "agile", "scrum", "jira", "risk management", "stakeholder management", "ms project", "budgeting"],
    mission: "deliver complex projects on time and on budget",
    duties: ["plan scope, timelines and resourcing", "run stand-ups, reviews and status reporting", "manage risks, dependencies and change requests", "keep clients and leadership aligned"],
  },
  businessAnalyst: {
    title: "Business Analyst",
    salary: [7, 13],
    skills: ["business analysis", "requirements analysis", "sql", "excel", "jira", "process improvement", "power bi", "documentation"],
    mission: "bridge business needs and technology solutions",
    duties: ["gather and document requirements", "map current and future-state processes", "write user stories and acceptance criteria", "support UAT and rollout"],
  },
  scrumMaster: {
    title: "Scrum Master",
    salary: [12, 19],
    skills: ["scrum", "agile", "jira", "kanban", "confluence", "coaching", "stakeholder management"],
    mission: "help delivery teams work better together",
    duties: ["facilitate sprint ceremonies", "remove impediments for the team", "coach teams on agile practices", "track delivery metrics and drive improvements"],
  },
  qaManual: {
    title: "QA Engineer",
    salary: [5, 9],
    skills: ["manual testing", "test case design", "jira", "regression testing", "sql", "api testing", "postman", "sdlc", "stlc"],
    mission: "make sure every release is something we're proud of",
    duties: ["write and execute test cases", "log and track defects in JIRA", "run regression and smoke tests before releases", "test APIs with Postman"],
  },
  qaAutomation: {
    title: "QA Automation Engineer",
    salary: [8, 15],
    skills: ["selenium", "java", "automation testing", "testng", "api testing", "cucumber", "jenkins", "playwright", "rest assured", "git"],
    mission: "build test automation that lets us ship with confidence",
    duties: ["build and maintain automation frameworks", "automate UI and API regression suites", "integrate tests into CI pipelines", "analyse failures and improve test stability"],
  },
  digitalMarketing: {
    title: "Digital Marketing Executive",
    salary: [4, 8],
    skills: ["digital marketing", "seo", "google ads", "social media marketing", "google analytics", "content marketing", "email marketing", "meta ads"],
    mission: "grow our audience and pipeline through digital channels",
    duties: ["plan and run paid campaigns on Google and Meta", "track campaign performance and optimise spend", "manage social media calendars", "coordinate with content and design teams"],
  },
  seo: {
    title: "SEO Specialist",
    salary: [5, 9],
    skills: ["seo", "google analytics", "google search console", "keyword research", "content marketing", "semrush", "ahrefs", "wordpress"],
    mission: "grow organic traffic and rankings",
    duties: ["run keyword research and technical SEO audits", "optimise on-page content and site structure", "build link-building plans", "report on organic growth"],
  },
  contentWriter: {
    title: "Content Writer",
    salary: [3.5, 7],
    skills: ["content writing", "copywriting", "seo", "wordpress", "research", "editing", "social media"],
    mission: "tell our story clearly and compellingly",
    duties: ["write blogs, landing pages and product copy", "edit and fact-check content", "optimise articles for search", "work with marketers on campaigns"],
  },
  salesExec: {
    title: "Sales Executive",
    salary: [3.5, 7],
    skills: ["sales", "lead generation", "cold calling", "negotiation", "crm", "communication", "b2b sales"],
    mission: "win new customers and grow revenue",
    duties: ["prospect and qualify new leads", "run product demos and follow-ups", "negotiate and close deals", "keep the CRM up to date"],
  },
  bdm: {
    title: "Business Development Manager",
    salary: [8, 15],
    skills: ["business development", "b2b sales", "negotiation", "account management", "salesforce", "lead generation", "presentation skills"],
    mission: "open new markets and build strategic partnerships",
    duties: ["identify and pursue new business opportunities", "build relationships with key decision makers", "own the pipeline and revenue targets", "prepare proposals and pricing"],
  },
  hrRecruiter: {
    title: "HR Recruiter",
    salary: [3.5, 7],
    skills: ["recruitment", "talent acquisition", "sourcing", "linkedin recruiter", "interviewing", "communication", "onboarding"],
    mission: "find and hire great people",
    duties: ["source candidates through job boards and LinkedIn", "screen and schedule interviews", "manage offers and onboarding", "maintain a healthy talent pipeline"],
  },
  hrGeneralist: {
    title: "HR Generalist",
    salary: [5, 9],
    skills: ["employee relations", "hrms", "payroll", "onboarding", "performance management", "compliance", "excel"],
    mission: "support our people through every stage of their journey",
    duties: ["manage onboarding and exit formalities", "handle employee queries and relations", "coordinate payroll inputs and attendance", "support performance review cycles"],
  },
  accountant: {
    title: "Accountant",
    salary: [4, 7],
    skills: ["accounting", "tally", "gst", "tds", "excel", "reconciliation", "accounts payable", "bookkeeping"],
    mission: "keep our books accurate and compliant",
    duties: ["maintain ledgers and day-to-day entries", "prepare GST and TDS filings", "reconcile bank and vendor accounts", "support monthly closing and audits"],
  },
  financialAnalyst: {
    title: "Financial Analyst",
    salary: [7, 13],
    skills: ["financial analysis", "financial modeling", "excel", "forecasting", "budgeting", "power bi", "valuation", "accounting"],
    mission: "guide business decisions with sharp financial analysis",
    duties: ["build forecasts and budget models", "analyse variances and unit economics", "prepare management reports", "support fundraising and investor reporting"],
  },
  operationsExec: {
    title: "Operations Executive",
    salary: [3.5, 6.5],
    skills: ["operations management", "excel", "vendor management", "process improvement", "communication", "mis reporting", "inventory management"],
    mission: "keep day-to-day operations running smoothly",
    duties: ["coordinate with vendors and internal teams", "track operational KPIs and SLAs", "maintain MIS reports", "identify and fix process bottlenecks"],
  },
  supplyChain: {
    title: "Supply Chain Analyst",
    salary: [6, 11],
    skills: ["supply chain management", "logistics", "inventory management", "excel", "sap", "procurement", "forecasting", "sql"],
    mission: "make our supply chain faster and leaner",
    duties: ["analyse inventory and demand data", "optimise routes and warehouse flows", "work with procurement on vendor performance", "build dashboards for operations leadership"],
  },
  customerSupport: {
    title: "Customer Support Executive",
    salary: [2.8, 5],
    skills: ["customer service", "communication", "zendesk", "problem solving", "crm", "email support", "multitasking"],
    mission: "give our customers fast, friendly help",
    duties: ["resolve customer queries over chat, email and phone", "escalate technical issues with clear notes", "maintain help-centre articles", "hit response-time and satisfaction targets"],
  },
  mechanical: {
    title: "Mechanical Design Engineer",
    salary: [5, 10],
    skills: ["autocad", "solidworks", "catia", "gd&t", "manufacturing processes", "quality control", "lean manufacturing"],
    mission: "design precision components for industrial customers",
    duties: ["create 3D models and manufacturing drawings", "support prototyping and production trials", "work on cost and quality improvements", "coordinate with suppliers on tooling"],
  },
  qualityMfg: {
    title: "Quality Engineer",
    salary: [5, 9],
    skills: ["quality control", "six sigma", "root cause analysis", "iso 9001", "spc", "lean manufacturing", "excel"],
    mission: "raise quality standards across our plants",
    duties: ["run inspections and process audits", "lead root-cause analysis on defects", "maintain ISO documentation", "drive Six Sigma improvement projects"],
  },
  electrical: {
    title: "Electrical Engineer",
    salary: [5, 10],
    skills: ["electrical design", "autocad", "plc", "scada", "solar pv", "power systems", "matlab"],
    mission: "engineer clean-energy systems that power homes and industry",
    duties: ["design electrical layouts for solar installations", "configure PLC and SCADA monitoring", "support site commissioning", "prepare technical documentation"],
  },
  embedded: {
    title: "Embedded Systems Engineer",
    salary: [8, 14],
    skills: ["embedded c", "c", "microcontrollers", "iot", "rtos", "arduino", "pcb design", "python"],
    mission: "build the firmware inside our smart devices",
    duties: ["write firmware for microcontroller-based devices", "integrate sensors and communication modules", "debug hardware with oscilloscopes and analysers", "work with the hardware team on new boards"],
  },
  curriculum: {
    title: "Curriculum Developer",
    salary: [4.5, 8],
    skills: ["curriculum development", "instructional design", "content writing", "teaching", "assessment design", "powerpoint"],
    mission: "create learning content students actually enjoy",
    duties: ["design course outlines and lesson plans", "write assessments and practice material", "review content with subject experts", "use learner data to improve courses"],
  },
  teacher: {
    title: "Online Tutor (Mathematics)",
    salary: [3, 6],
    skills: ["teaching", "mathematics", "communication", "online teaching", "lesson planning", "google workspace"],
    mission: "help students fall in love with maths",
    duties: ["teach live online classes for grades 6–10", "resolve student doubts after class", "track student progress and share feedback with parents", "contribute to practice worksheets"],
  },
  clinicalData: {
    title: "Clinical Data Analyst",
    salary: [6, 11],
    skills: ["clinical research", "sql", "excel", "data analysis", "medical terminology", "sas", "data quality"],
    mission: "turn clinical data into better patient outcomes",
    duties: ["clean and validate clinical datasets", "build reports for care teams", "work with doctors on data definitions", "maintain data-privacy standards"],
  },
  healthOps: {
    title: "Healthcare Operations Associate",
    salary: [3, 5.5],
    skills: ["operations management", "customer service", "excel", "medical billing", "communication", "crm"],
    mission: "keep patient journeys smooth from booking to follow-up",
    duties: ["coordinate appointments with partner clinics", "handle patient and insurer queries", "track operational SLAs", "maintain accurate records"],
  },
  technicalWriter: {
    title: "Technical Writer",
    salary: [6, 11],
    skills: ["technical writing", "documentation", "markdown", "api documentation", "confluence", "git"],
    mission: "make our products easy to understand",
    duties: ["write user guides and API documentation", "work with engineers to document new features", "maintain the help centre and release notes", "improve docs based on user feedback"],
  },

  // --- Batch 2: trending AI and automation roles ---
  // Core skills use names the resume parser recognises so match scoring works.
  aiAnalyst: {
    title: "AI Analyst",
    salary: [8, 14],
    skills: ["generative ai", "data analysis", "python", "sql", "prompt engineering", "llm evaluation", "power bi", "statistics", "a/b testing", "excel"],
    mission: "find where AI can help the business and measure whether it actually does",
    duties: ["identify and size AI use cases with business teams", "analyse model outputs and usage data to measure accuracy and ROI", "build dashboards tracking AI adoption, cost and quality", "write clear evaluation reports with recommendations"],
  },
  aiMlEngineer: {
    title: "AI/ML Engineer",
    salary: [13, 24],
    skills: ["machine learning", "llms", "python", "pytorch", "hugging face", "rag", "vector databases", "fastapi", "embeddings", "docker", "aws"],
    mission: "build AI features that run reliably inside our products",
    duties: ["build retrieval-augmented generation (RAG) and classification pipelines", "choose, fine-tune and evaluate models for each use case", "ship AI services behind well-tested APIs", "monitor model quality, latency and cost in production"],
  },
  promptEngineer: {
    title: "Prompt Engineer",
    salary: [8, 15],
    skills: ["prompt engineering", "llms", "python", "llm evaluation", "technical writing", "structured outputs", "few-shot prompting", "a/b testing", "json"],
    mission: "get consistently great results out of large language models",
    duties: ["design, test and version prompts and system instructions", "build evaluation sets and score outputs for accuracy and tone", "reduce hallucinations with structured outputs and grounding", "document prompt patterns for engineering and product teams"],
  },
  aiProductManager: {
    title: "AI Product Manager",
    salary: [18, 32],
    skills: ["product management", "generative ai", "llm evaluation", "roadmapping", "user research", "responsible ai", "sql", "agile", "a/b testing", "stakeholder management"],
    mission: "turn AI capabilities into products customers trust and pay for",
    duties: ["decide which problems AI should and shouldn't solve", "define quality bars and evaluation metrics with ML engineers", "write PRDs covering model behaviour, failure cases and guardrails", "launch AI features and track adoption, accuracy and cost"],
  },
  aiEthics: {
    title: "AI Ethics & Data Privacy Analyst",
    salary: [9, 16],
    skills: ["risk management", "artificial intelligence", "data privacy", "responsible ai", "dpdp act", "gdpr", "ai governance", "bias testing", "compliance", "technical documentation"],
    mission: "make sure our AI systems are fair, explainable and compliant",
    duties: ["run privacy and AI risk assessments on new features", "test models for bias and document their limitations", "keep practices aligned with India's DPDP Act and GDPR", "train teams on responsible-AI and data-handling policies"],
  },
  genAiDev: {
    title: "Generative AI Developer",
    salary: [12, 22],
    skills: ["generative ai", "llms", "python", "langchain", "rag", "vector databases", "fastapi", "typescript", "prompt engineering", "llamaindex", "streamlit", "docker"],
    mission: "build chat, search and content tools powered by large language models",
    duties: ["build LLM-powered apps with RAG, tool calling and streaming", "integrate vector databases such as pgvector or Pinecone", "add guardrails, caching and fallbacks for reliability", "prototype quickly and harden what works for production"],
  },
  aiResearch: {
    title: "AI Research Associate",
    salary: [10, 18],
    skills: ["deep learning", "pytorch", "python", "nlp", "transformers", "statistics", "research", "experiment tracking", "linear algebra", "jupyter"],
    mission: "explore new modelling ideas and turn the promising ones into real gains",
    duties: ["reproduce and extend results from recent papers", "design and run controlled experiments on models and datasets", "analyse results and write internal research notes", "hand off validated ideas to the engineering team"],
  },
  rpa: {
    title: "Automation (RPA) Engineer",
    salary: [7, 13],
    skills: ["rpa", "uipath", "power automate", "python", "automation anywhere", "sql", "vba", "api integration", "process improvement", "n8n"],
    mission: "automate repetitive back-office work so teams can focus on what matters",
    duties: ["map manual processes and pick the best automation candidates", "build and deploy bots with UiPath and Power Automate", "integrate bots with ERPs, email and internal APIs", "monitor bot runs and fix failures quickly"],
  },
  mlops: {
    title: "MLOps Engineer",
    salary: [13, 23],
    skills: ["mlops", "kubernetes", "python", "docker", "mlflow", "ci/cd", "aws", "model monitoring", "terraform", "kubeflow", "prometheus"],
    mission: "build the platform that trains, deploys and monitors our models",
    duties: ["automate model training, versioning and deployment pipelines", "run GPU workloads on Kubernetes efficiently", "set up drift, latency and cost monitoring for live models", "help data scientists ship models without friction"],
  },
  aiAgentDev: {
    title: "AI Agent Developer",
    salary: [12, 22],
    skills: ["llms", "python", "ai agents", "tool calling", "langchain", "typescript", "api integration", "prompt engineering", "workflow automation", "evaluation"],
    mission: "build AI agents that complete multi-step tasks for our users",
    duties: ["design agent workflows with tool calling and memory", "connect agents to internal APIs and databases safely", "build evaluation harnesses that measure agent reliability", "add human-in-the-loop review for high-risk actions"],
  },
  computerVision: {
    title: "Computer Vision Engineer",
    salary: [12, 21],
    skills: ["computer vision", "opencv", "python", "pytorch", "yolo", "deep learning", "image processing", "onnx", "edge deployment", "c++"],
    mission: "teach machines to spot defects, objects and anomalies in images",
    duties: ["build detection and classification models on image data", "curate and label training datasets", "optimise models for cameras and edge devices", "integrate vision models with production systems"],
  },
  aiTrainer: {
    title: "AI Model Trainer",
    salary: [5, 9],
    skills: ["generative ai", "critical thinking", "rlhf", "data annotation", "attention to detail", "content writing", "research", "llms", "google workspace"],
    mission: "improve AI models by writing, reviewing and rating their responses",
    duties: ["write high-quality example responses for model training", "rate and compare model outputs against clear guidelines", "flag factual errors, bias and unsafe content", "suggest improvements to the labelling guidelines"],
  },
  conversationalAI: {
    title: "Conversational AI Designer",
    salary: [8, 14],
    skills: ["nlp", "ux design", "conversation design", "chatbots", "llms", "prompt engineering", "dialogflow", "user research", "copywriting", "figma"],
    mission: "design chatbots and voice assistants that actually help people",
    duties: ["map user intents and conversation flows", "write bot responses and fallback handling", "analyse chat transcripts to improve resolution rates", "work with engineers to tune LLM-based assistants"],
  },
  aiContent: {
    title: "AI Content Specialist",
    salary: [4, 8],
    skills: ["generative ai", "content writing", "prompt engineering", "copywriting", "seo", "editing", "fact-checking", "midjourney", "brand voice"],
    mission: "produce more great content by pairing human editors with AI tools",
    duties: ["create first drafts with AI tools and edit them to brand standard", "fact-check and polish AI-assisted copy", "build prompt libraries for campaigns and clients", "track content performance and iterate"],
  },
  aiSecurity: {
    title: "AI Security Engineer",
    salary: [12, 22],
    skills: ["cybersecurity", "llms", "penetration testing", "owasp", "python", "threat modeling", "prompt injection testing", "cloud security", "red teaming"],
    mission: "keep our AI systems and the data they touch safe from attack",
    duties: ["red-team LLM features for prompt injection and data leakage", "threat-model AI pipelines and third-party model APIs", "build guardrails and security tests into CI", "respond to and document AI-related security incidents"],
  },
};

/* ---------------------------------------------------------
   Recruiters and what each one posts
--------------------------------------------------------- */

// Each job: [roleKey, level, type, location]  — level: intern | junior | mid | senior | lead
// location "HQ" means the company's home city.
const RECRUITERS = [
  {
    name: "Ananya Krishnan",
    company: "Nimbus Softworks Pvt Ltd",
    industry: "Software products",
    hq: "Bengaluru",
    blurb: "Nimbus Softworks builds workflow software used by 2,000+ mid-sized businesses.",
    jobs: [
      ["frontend", "mid", "full-time", "HQ"], ["frontend", "senior", "full-time", "HQ"],
      ["backend", "mid", "full-time", "HQ"], ["backend", "lead", "full-time", "HQ"],
      ["fullstack", "junior", "full-time", "Hyderabad"], ["fullstack", "intern", "internship", "HQ"],
      ["devops", "mid", "full-time", "HQ"], ["qaAutomation", "mid", "full-time", "HQ"],
      ["productManager", "senior", "full-time", "HQ"], ["uiux", "mid", "full-time", "HQ"],
      ["technicalWriter", "mid", "contract", "Remote"], ["mobile", "mid", "remote", "Remote"],
    ],
  },
  {
    name: "Rohit Malhotra",
    company: "PaySetu Fintech Pvt Ltd",
    industry: "Fintech",
    hq: "Mumbai",
    blurb: "PaySetu powers UPI and payment-gateway services for 40,000+ merchants across India.",
    jobs: [
      ["backendJava", "mid", "full-time", "HQ"], ["backendJava", "senior", "full-time", "Pune"],
      ["android", "mid", "full-time", "HQ"], ["security", "mid", "full-time", "HQ"],
      ["dataAnalyst", "junior", "full-time", "HQ"], ["financialAnalyst", "mid", "full-time", "HQ"],
      ["productManager", "mid", "full-time", "HQ"], ["qaManual", "junior", "full-time", "Pune"],
      ["customerSupport", "junior", "full-time", "HQ"], ["devops", "senior", "remote", "Remote"],
    ],
  },
  {
    name: "Sneha Iyer",
    company: "CartKart Commerce Pvt Ltd",
    industry: "E-commerce",
    hq: "Bengaluru",
    blurb: "CartKart is a fast-growing online marketplace for home and lifestyle products.",
    jobs: [
      ["frontend", "junior", "full-time", "HQ"], ["backend", "senior", "full-time", "HQ"],
      ["dataScientist", "mid", "full-time", "HQ"], ["seo", "mid", "full-time", "HQ"],
      ["digitalMarketing", "junior", "full-time", "Delhi"], ["supplyChain", "mid", "full-time", "Delhi"],
      ["operationsExec", "junior", "full-time", "Gurgaon"], ["customerSupport", "junior", "part-time", "HQ"],
      ["graphicDesigner", "junior", "internship", "HQ"],
    ],
  },
  {
    name: "Vikram Sethi",
    company: "Meridian Advisory LLP",
    industry: "Management consulting",
    hq: "Gurgaon",
    blurb: "Meridian Advisory helps enterprises plan and deliver digital transformation programmes.",
    jobs: [
      ["businessAnalyst", "mid", "full-time", "HQ"], ["businessAnalyst", "junior", "full-time", "Mumbai"],
      ["projectManager", "senior", "full-time", "HQ"], ["financialAnalyst", "senior", "full-time", "Mumbai"],
      ["dataAnalyst", "mid", "contract", "HQ"], ["scrumMaster", "mid", "contract", "Bengaluru"],
    ],
  },
  {
    name: "Dr. Kavya Reddy",
    company: "MediLoop Health Technologies",
    industry: "Healthcare technology",
    hq: "Hyderabad",
    blurb: "MediLoop connects patients, clinics and diagnostic labs on a single care platform.",
    jobs: [
      ["fullstack", "mid", "full-time", "HQ"], ["mobile", "junior", "full-time", "HQ"],
      ["clinicalData", "mid", "full-time", "HQ"], ["clinicalData", "junior", "internship", "HQ"],
      ["healthOps", "junior", "full-time", "HQ"], ["healthOps", "mid", "full-time", "Chennai"],
      ["qaManual", "mid", "full-time", "HQ"], ["productManager", "lead", "full-time", "HQ"],
    ],
  },
  {
    name: "Arjun Desai",
    company: "Pixel & Pine Design Studio",
    industry: "Design agency",
    hq: "Pune",
    blurb: "Pixel & Pine is a boutique studio designing brands and digital products for startups.",
    jobs: [
      ["uiux", "junior", "full-time", "HQ"], ["uiux", "senior", "remote", "Remote"],
      ["graphicDesigner", "mid", "part-time", "HQ"], ["contentWriter", "junior", "contract", "Remote"],
    ],
  },
  {
    name: "Suresh Patil",
    company: "Sahyadri Precision Manufacturing Ltd",
    industry: "Manufacturing",
    hq: "Pune",
    blurb: "Sahyadri Precision manufactures machined components for the automotive and aerospace sectors.",
    jobs: [
      ["mechanical", "junior", "full-time", "HQ"], ["mechanical", "senior", "full-time", "HQ"],
      ["qualityMfg", "mid", "full-time", "HQ"], ["supplyChain", "mid", "full-time", "Chennai"],
      ["accountant", "mid", "full-time", "HQ"],
    ],
  },
  {
    name: "Meera Nair",
    company: "VidyaPath Learning Pvt Ltd",
    industry: "Ed-tech",
    hq: "Hyderabad",
    blurb: "VidyaPath runs live online classes and test prep for over a million school students.",
    jobs: [
      ["curriculum", "mid", "full-time", "HQ"], ["teacher", "junior", "part-time", "Remote"],
      ["teacher", "mid", "part-time", "Remote"], ["frontend", "mid", "full-time", "HQ"],
      ["android", "junior", "internship", "HQ"], ["digitalMarketing", "mid", "full-time", "HQ"],
      ["salesExec", "junior", "full-time", "Delhi"], ["dataAnalyst", "junior", "internship", "HQ"],
    ],
  },
  {
    name: "Karthik Subramanian",
    company: "CloudKite Infra Solutions",
    industry: "Cloud & IT services",
    hq: "Chennai",
    blurb: "CloudKite is an AWS and Azure partner managing cloud infrastructure for 150+ clients.",
    jobs: [
      ["cloud", "mid", "full-time", "HQ"], ["cloud", "senior", "full-time", "Hyderabad"],
      ["devops", "junior", "full-time", "HQ"], ["devops", "lead", "full-time", "Bengaluru"],
      ["security", "senior", "full-time", "HQ"], ["backend", "mid", "contract", "Remote"],
      ["projectManager", "mid", "full-time", "HQ"],
    ],
  },
  {
    name: "Priya Banerjee",
    company: "InsightGrid Analytics",
    industry: "Data & analytics",
    hq: "Bengaluru",
    blurb: "InsightGrid builds analytics and machine-learning solutions for retail and banking clients.",
    jobs: [
      ["dataScientist", "senior", "full-time", "HQ"], ["mlEngineer", "mid", "full-time", "HQ"],
      ["mlEngineer", "senior", "remote", "Remote"], ["dataEngineer", "mid", "full-time", "Hyderabad"],
      ["dataEngineer", "lead", "full-time", "HQ"], ["dataAnalyst", "mid", "full-time", "Pune"],
      ["dataScientist", "intern", "internship", "HQ"],
    ],
  },
  {
    name: "Amit Choudhary",
    company: "ShipRight Logistics Pvt Ltd",
    industry: "Logistics",
    hq: "Delhi",
    blurb: "ShipRight runs same-day and next-day delivery for e-commerce brands in 60 cities.",
    jobs: [
      ["operationsExec", "mid", "full-time", "HQ"], ["supplyChain", "senior", "full-time", "HQ"],
      ["customerSupport", "mid", "full-time", "Gurgaon"], ["backend", "mid", "full-time", "Gurgaon"],
      ["hrGeneralist", "mid", "full-time", "HQ"], ["accountant", "junior", "full-time", "HQ"],
    ],
  },
  {
    name: "Neha Kapoor",
    company: "Brightline Media & Marketing",
    industry: "Marketing agency",
    hq: "Mumbai",
    blurb: "Brightline is a full-service digital agency running campaigns for consumer brands.",
    jobs: [
      ["digitalMarketing", "senior", "full-time", "HQ"], ["seo", "junior", "full-time", "HQ"],
      ["contentWriter", "mid", "full-time", "HQ"], ["contentWriter", "intern", "internship", "Remote"],
      ["graphicDesigner", "mid", "full-time", "HQ"],
    ],
  },
  {
    name: "Rahul Verma",
    company: "TalentBridge HR Services",
    industry: "Staffing & HR",
    hq: "Delhi",
    blurb: "TalentBridge provides recruitment and HR outsourcing to fast-growing companies.",
    jobs: [
      ["hrRecruiter", "junior", "full-time", "HQ"], ["hrRecruiter", "mid", "remote", "Remote"],
      ["hrGeneralist", "senior", "full-time", "Gurgaon"],
    ],
  },
  {
    name: "Lakshmi Venkatesh",
    company: "GreenGrid Energy Systems",
    industry: "Clean energy",
    hq: "Chennai",
    blurb: "GreenGrid designs and installs rooftop solar and battery-storage systems.",
    jobs: [
      ["electrical", "junior", "full-time", "HQ"], ["electrical", "senior", "full-time", "HQ"],
      ["embedded", "mid", "full-time", "Bengaluru"], ["bdm", "mid", "full-time", "HQ"],
      ["salesExec", "mid", "full-time", "Hyderabad"],
    ],
  },
  {
    name: "Farhan Sheikh",
    company: "Kuber Capital Advisors",
    industry: "Financial services",
    hq: "Mumbai",
    blurb: "Kuber Capital is a wealth and asset-management firm serving 25,000+ investors.",
    jobs: [
      ["financialAnalyst", "junior", "full-time", "HQ"], ["accountant", "mid", "full-time", "HQ"],
      ["bdm", "senior", "full-time", "Delhi"], ["dataAnalyst", "mid", "full-time", "HQ"],
      ["salesExec", "junior", "part-time", "Pune"],
    ],
  },
];

/* ---------------------------------------------------------
   Batch 2: extra postings by the same recruiters, keyed by company
--------------------------------------------------------- */

// Skews toward part-time, internship, contract and remote (batch 1 was mostly
// full-time) and adds trending AI / automation roles. Same spec format as above.
const BATCH_2 = {
  "Nimbus Softworks Pvt Ltd": [
    ["genAiDev", "mid", "remote", "Remote"], ["promptEngineer", "intern", "internship", "HQ"],
    ["aiAgentDev", "mid", "contract", "Pune"], ["aiProductManager", "senior", "full-time", "HQ"],
    ["technicalWriter", "junior", "part-time", "HQ"],
  ],
  "PaySetu Fintech Pvt Ltd": [
    ["aiEthics", "mid", "contract", "HQ"], ["conversationalAI", "mid", "remote", "Remote"],
    ["rpa", "intern", "internship", "HQ"], ["customerSupport", "junior", "part-time", "Pune"],
  ],
  "CartKart Commerce Pvt Ltd": [
    ["aiAnalyst", "mid", "remote", "Remote"], ["aiContent", "junior", "part-time", "HQ"],
    ["dataAnalyst", "intern", "internship", "HQ"],
  ],
  "Meridian Advisory LLP": [
    ["aiAnalyst", "senior", "contract", "HQ"], ["rpa", "mid", "contract", "Mumbai"],
    ["businessAnalyst", "intern", "internship", "HQ"], ["aiEthics", "senior", "remote", "Remote"],
  ],
  "MediLoop Health Technologies": [
    ["conversationalAI", "junior", "contract", "HQ"], ["aiEthics", "junior", "part-time", "HQ"],
    ["aiMlEngineer", "intern", "internship", "HQ"], ["aiTrainer", "mid", "remote", "Remote"],
  ],
  "Pixel & Pine Design Studio": [
    ["conversationalAI", "intern", "internship", "HQ"], ["uiux", "mid", "part-time", "HQ"],
  ],
  "Sahyadri Precision Manufacturing Ltd": [
    ["computerVision", "senior", "contract", "HQ"], ["mechanical", "intern", "internship", "HQ"],
  ],
  "VidyaPath Learning Pvt Ltd": [
    ["aiContent", "mid", "contract", "Remote"], ["aiTrainer", "junior", "part-time", "Remote"],
    ["promptEngineer", "mid", "remote", "Remote"], ["curriculum", "junior", "part-time", "HQ"],
  ],
  "CloudKite Infra Solutions": [
    ["mlops", "mid", "remote", "Remote"], ["aiSecurity", "mid", "contract", "HQ"],
    ["cloud", "intern", "internship", "HQ"], ["aiAgentDev", "senior", "remote", "Remote"],
  ],
  "InsightGrid Analytics": [
    ["aiResearch", "junior", "contract", "HQ"], ["aiResearch", "intern", "internship", "Hyderabad"],
    ["aiMlEngineer", "senior", "remote", "Remote"], ["genAiDev", "mid", "contract", "Hyderabad"],
    ["aiAnalyst", "junior", "part-time", "HQ"],
  ],
  "ShipRight Logistics Pvt Ltd": [
    ["rpa", "senior", "remote", "Remote"], ["customerSupport", "junior", "part-time", "HQ"],
  ],
  "Brightline Media & Marketing": [
    ["aiContent", "mid", "remote", "Remote"], ["promptEngineer", "junior", "part-time", "HQ"],
  ],
  "TalentBridge HR Services": [
    ["hrRecruiter", "intern", "internship", "HQ"], ["hrRecruiter", "mid", "part-time", "Gurgaon"],
    ["aiTrainer", "mid", "contract", "Remote"],
  ],
  "GreenGrid Energy Systems": [
    ["embedded", "intern", "internship", "Bengaluru"], ["computerVision", "mid", "remote", "Remote"],
  ],
  "Kuber Capital Advisors": [
    ["aiAnalyst", "mid", "contract", "HQ"], ["financialAnalyst", "intern", "internship", "HQ"],
    ["accountant", "junior", "part-time", "Delhi"],
  ],
};

/* ---------------------------------------------------------
   Turning a [role, level, type, location] spec into a Job
--------------------------------------------------------- */

const LEVELS = {
  intern: { prefix: "", suffix: " Intern", experience: [0], pay: 0.25 },
  junior: { prefix: "Junior ", suffix: "", experience: [0, 1, 1], pay: 0.6 },
  mid: { prefix: "", suffix: "", experience: [2, 3, 4], pay: 1 },
  senior: { prefix: "Senior ", suffix: "", experience: [5, 6, 7], pay: 1.6 },
  lead: { prefix: "Lead ", suffix: "", experience: [8, 9, 10], pay: 2.3 },
};

const LEVEL_LINES = {
  intern: "This is a 6-month internship for students or recent graduates, with a strong chance of a full-time offer.",
  junior: "Freshers and early-career candidates with solid fundamentals and a willingness to learn are welcome.",
  mid: "You have a few years of hands-on experience and can own features or projects independently.",
  senior: "You bring deep experience, set the bar for quality, and mentor junior team members.",
  lead: "You will lead a team, shape technical and business direction, and hire and grow people.",
};

const TYPE_LINES = {
  "full-time": "This is a full-time role",
  "part-time": "This is a part-time role (about 20–25 hours a week)",
  internship: "This is a paid internship",
  contract: "This is a 6–12 month contract role with possible extension",
  remote: "This is a fully remote role",
};

const roundHalf = (n) => Math.max(0.5, Math.round(n * 2) / 2);
const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

function salaryFor(role, level, type, index) {
  // Small deterministic variation so similar roles don't all show identical pay
  const wobble = 1 + ((index % 5) - 2) * 0.05;
  let factor = LEVELS[level].pay * wobble;
  if (type === "part-time") factor *= 0.5;
  const low = roundHalf(role.salary[0] * factor);
  const high = Math.max(low + 0.5, roundHalf(role.salary[1] * factor));
  const note = level === "intern" ? " (stipend)" : type === "part-time" ? " (part-time)" : "";
  return `₹${fmt(low)}–${fmt(high)} LPA${note}`;
}

function skillsFor(role, index) {
  const [core1, core2, ...extras] = role.skills;
  const count = 2 + (index % 3); // 2–4 extra skills
  const picked = [];
  for (let k = 0; k < count && k < extras.length; k++) {
    picked.push(extras[(index + k * 2) % extras.length]);
  }
  return [...new Set([core1, core2, ...picked])];
}

function buildJob(recruiter, [roleKey, specLevel, type, location], index) {
  const role = ROLES[roleKey];
  if (!role) throw new Error(`Unknown role "${roleKey}" for ${recruiter.company}`);
  const level = type === "internship" ? "intern" : specLevel; // internships always get intern title/stipend
  const lvl = LEVELS[level];
  const title = `${lvl.prefix}${role.title}${lvl.suffix}`;
  const city = type === "remote" ? "Remote" : location === "HQ" ? recruiter.hq : location;
  const [d1, d2, d3, d4] = role.duties;

  const description = [
    `${recruiter.blurb} We're hiring a ${title} to ${role.mission}.`,
    `In this role you will ${d1}, ${d2}, ${d3} and ${d4}.`,
    LEVEL_LINES[level],
    `${TYPE_LINES[type]}${city === "Remote" ? "" : `, based in ${city}`}.`,
  ].join("\n\n");

  return {
    title,
    company: recruiter.company,
    location: city,
    type,
    description,
    requiredSkills: skillsFor(role, index),
    experienceRequired: lvl.experience[index % lvl.experience.length],
    salaryRange: salaryFor(role, level, type, index),
    status: "open",
  };
}

/* ---------------------------------------------------------
   Run
--------------------------------------------------------- */

async function seed() {
  await connectDB();

  let recruitersCreated = 0;
  let recruitersSkipped = 0;
  let jobsCreated = 0;
  let jobsSkipped = 0;
  const perRecruiter = [];
  let jobIndex = 0;

  for (const [i, spec] of RECRUITERS.entries()) {
    const email = `recruiter${String(i + 1).padStart(2, "0")}@seed.hirehub.com`;

    let recruiter = await User.findOne({ email });
    if (recruiter) {
      recruitersSkipped++;
    } else {
      recruiter = await User.create({
        name: spec.name,
        email,
        password: await bcrypt.hash(SEED_PASSWORD, 10), // same hashing as authController.register
        role: "recruiter",
        company: spec.company,
        industry: spec.industry,
        location: spec.hq,
      });
      recruitersCreated++;
    }

    let created = 0;
    for (const jobSpec of spec.jobs) {
      const job = buildJob(spec, jobSpec, jobIndex++);
      const exists = await Job.exists({ postedBy: recruiter._id, title: job.title, location: job.location });
      if (exists) {
        jobsSkipped++;
        continue;
      }
      await Job.create({ ...job, postedBy: recruiter._id });
      created++;
    }
    jobsCreated += created;
    perRecruiter.push({ email, company: spec.company, created, total: spec.jobs.length });
  }

  // Batch 2 reuses the recruiters above; same duplicate check (title + location per recruiter).
  let batch2Created = 0;
  let batch2Skipped = 0;
  for (const [company, jobSpecs] of Object.entries(BATCH_2)) {
    const i = RECRUITERS.findIndex((r) => r.company === company);
    if (i === -1) throw new Error(`BATCH_2 company "${company}" is not a seed recruiter`);
    const email = `recruiter${String(i + 1).padStart(2, "0")}@seed.hirehub.com`;
    const recruiter = await User.findOne({ email });

    for (const jobSpec of jobSpecs) {
      const job = buildJob(RECRUITERS[i], jobSpec, jobIndex++);
      job.description = job.description.replace(/hiring a (?=[AEIOU])/, "hiring an "); // "an AI Analyst"
      const exists = await Job.exists({ postedBy: recruiter._id, title: job.title, location: job.location });
      if (exists) {
        batch2Skipped++;
        continue;
      }
      await Job.create({ ...job, postedBy: recruiter._id });
      batch2Created++;
    }
  }

  console.log("\n=== Seed summary ===");
  console.log(`Recruiters: ${recruitersCreated} created, ${recruitersSkipped} skipped (already existed)`);
  console.log(`Jobs:       ${jobsCreated} created, ${jobsSkipped} skipped (already existed)`);
  console.log(`Batch 2:    ${batch2Created} created, ${batch2Skipped} skipped (already existed)`);
  console.log("\nJobs per recruiter (created / in seed list):");
  for (const row of perRecruiter) {
    console.log(`  ${row.company.padEnd(38)} ${String(row.created).padStart(2)} / ${String(row.total).padStart(2)}   ${row.email}`);
  }
  console.log(`\nSeed recruiters can log in with password: ${SEED_PASSWORD}`);
}

seed()
  .catch((err) => {
    console.error("[seedJobs] failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
