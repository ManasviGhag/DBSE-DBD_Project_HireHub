import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { jsPDF } from "jspdf";
import loginPhoto from "./assets/login-photo.png";
import {
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
  useLocation,
  useSearchParams,
  useParams,
  Navigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  login,
  registerUser,
  uploadResume,
  deleteResume,
  updateResumeDetails,
  getProfile,
  getMatches,
  getApplications,
  getJobs,
  createJob,
  getRecruiterStats,
  applyToJob,
  withdrawApplication,
  getSavedJobs,
  saveJob,
  unsaveJob,
  updateProfile,
  getInterviews,
  resumeFileUrl,
  updateJob,
  updateApplicationStatus,
  getRecruiterApplicants,
  scheduleInterview,
  updateInterview,
  submitInterviewFeedback,
  createOffer,
  getOfferForApplication,
  getCandidateOffers,
  resendOffer,
} from "./api";
import {
  BriefcaseBusiness,
  Search,
  MapPin,
  Sparkles,
  FileText,
  Target,
  Users,
  ShieldCheck,
  CalendarDays,
  BarChart3,
  ArrowRight,
  Upload,
  ChevronRight,
  CheckCircle2,
  Plus,
  UserRound,
  SlidersHorizontal,
  LogOut,
  Menu,
  X,
  BrainCircuit,
  UserSearch,
  Clock3,
  Wrench,
  GraduationCap,
  Award,
  Trash2,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Video,
  Phone,
  Building2,
  Mail,
  Linkedin,
  Github,
  Pencil,
  Bell,
  ExternalLink,
} from "lucide-react";

/* =========================================================
   MOCK DATA
========================================================= */

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "NovaTech",
    location: "Hyderabad",
    type: "Full-time",
    salary: "₹8–12 LPA",
    skills: ["React", "JavaScript", "CSS"],
    score: 94,
  },
  {
    id: 2,
    title: "Backend Engineer",
    company: "CloudNest",
    location: "Bengaluru",
    type: "Full-time",
    salary: "₹10–16 LPA",
    skills: ["Node.js", "Express", "MongoDB"],
    score: 89,
  },
  {
    id: 3,
    title: "Data Analyst",
    company: "InsightWorks",
    location: "Remote",
    type: "Full-time",
    salary: "₹7–11 LPA",
    skills: ["SQL", "Python", "Power BI"],
    score: 84,
  },
  {
    id: 4,
    title: "UI/UX Designer",
    company: "PixelCraft",
    location: "Hyderabad",
    type: "Hybrid",
    salary: "₹6–10 LPA",
    skills: ["Figma", "UX", "Prototyping"],
    score: 78,
  },
  {
    id: 5,
    title: "Software Developer",
    company: "TechSphere",
    location: "Bengaluru",
    type: "Full-time",
    salary: "₹9–14 LPA",
    skills: ["Java", "Spring Boot", "SQL"],
    score: 91,
  },
  {
    id: 6,
    title: "Web Developer",
    company: "WebNova",
    location: "Hyderabad",
    type: "Full-time",
    salary: "₹6–10 LPA",
    skills: ["HTML", "CSS", "JavaScript"],
    score: 86,
  },
  {
    id: 7,
    title: "AI / ML Engineer",
    company: "NeuralWorks",
    location: "Bengaluru",
    type: "Full-time",
    salary: "₹12–20 LPA",
    skills: ["Python", "Machine Learning", "TensorFlow"],
    score: 93,
  },
  {
    id: 8,
    title: "Graphic Designer",
    company: "CreativeLab",
    location: "Hyderabad",
    type: "Hybrid",
    salary: "₹5–8 LPA",
    skills: ["Photoshop", "Illustrator", "Branding"],
    score: 80,
  },
  {
    id: 9,
    title: "Product Manager",
    company: "LaunchPoint",
    location: "Bengaluru",
    type: "Full-time",
    salary: "₹14–22 LPA",
    skills: ["Product Strategy", "Roadmaps", "Agile"],
    score: 88,
  },
  {
    id: 10,
    title: "Project Manager",
    company: "BuildRight",
    location: "Hyderabad",
    type: "Full-time",
    salary: "₹10–16 LPA",
    skills: ["Project Management", "Agile", "Jira"],
    score: 85,
  },
  {
    id: 11,
    title: "Accountant",
    company: "FinCore",
    location: "Bengaluru",
    type: "Full-time",
    salary: "₹5–8 LPA",
    skills: ["Accounting", "Tally", "GST"],
    score: 82,
  },
  {
    id: 12,
    title: "Financial Analyst",
    company: "CapitalEdge",
    location: "Hyderabad",
    type: "Full-time",
    salary: "₹7–12 LPA",
    skills: ["Excel", "Financial Modeling", "SQL"],
    score: 87,
  },
  {
    id: 13,
    title: "Digital Marketing Specialist",
    company: "GrowthGrid",
    location: "Bengaluru",
    type: "Hybrid",
    salary: "₹6–10 LPA",
    skills: ["SEO", "Google Ads", "Analytics"],
    score: 83,
  },
  {
    id: 14,
    title: "Sales Executive",
    company: "MarketBridge",
    location: "Hyderabad",
    type: "Full-time",
    salary: "₹4–8 LPA",
    skills: ["Sales", "CRM", "Communication"],
    score: 79,
  },
  {
    id: 15,
    title: "Mechanical Engineer",
    company: "CoreMotion",
    location: "Bengaluru",
    type: "Full-time",
    salary: "₹6–11 LPA",
    skills: ["AutoCAD", "SolidWorks", "Manufacturing"],
    score: 81,
  },
  {
    id: 16,
    title: "Electrical Engineer",
    company: "PowerGrid Solutions",
    location: "Hyderabad",
    type: "Full-time",
    salary: "₹6–11 LPA",
    skills: ["Electrical Design", "AutoCAD", "MATLAB"],
    score: 84,
  },
  {
    id: 17,
    title: "Healthcare Operations Associate",
    company: "MediCare Plus",
    location: "Bengaluru",
    type: "Full-time",
    salary: "₹5–9 LPA",
    skills: ["Healthcare", "Operations", "Communication"],
    score: 77,
  },
  {
    id: 18,
    title: "Pharma Associate",
    company: "LifeScience Labs",
    location: "Hyderabad",
    type: "Full-time",
    salary: "₹5–9 LPA",
    skills: ["Pharma", "Quality Control", "Research"],
    score: 80,
  },
  {
    id: 19,
    title: "Graduate Software Intern",
    company: "NextGen Systems",
    location: "Bengaluru",
    type: "Full-time",
    salary: "₹3–5 LPA",
    skills: ["JavaScript", "React", "Git"],
    score: 88,
  },
  {
    id: 20,
    title: "Business Intern",
    company: "FutureWorks",
    location: "Hyderabad",
    type: "Hybrid",
    salary: "₹2–4 LPA",
    skills: ["Research", "Excel", "Communication"],
    score: 76,
  },
];

const features = [
  {
    icon: FileText,
    title: "AI Resume Parsing",
    text: "Upload your resume and automatically extract skills, education, experience and certifications.",
  },
  {
    icon: Target,
    title: "Smart Job Matching",
    text: "Get a skill-based match score and discover opportunities that fit your profile.",
  },
  {
    icon: CalendarDays,
    title: "Interview Scheduling",
    text: "Keep interviews organized with a simple schedule and status tracker.",
  },
  {
    icon: BarChart3,
    title: "Recruiter Analytics",
    text: "See applications, shortlisted candidates and hiring activity in one place.",
  },
];

const jobsMenuData = [
  {
    category: "Top Locations",
    options: ["Jobs in Hyderabad", "Jobs in Bengaluru"],
  },
  {
    category: "Software & IT",
    options: ["Software Developer Jobs", "Web Developer Jobs"],
  },
  {
    category: "Data & AI",
    options: ["Data Analyst Jobs", "AI / ML Jobs"],
  },
  {
    category: "Design & Creative",
    options: ["UI/UX Designer Jobs", "Graphic Designer Jobs"],
  },
  {
    category: "Product & Management",
    options: ["Product Manager Jobs", "Project Manager Jobs"],
  },
  {
    category: "Finance & Accounting",
    options: ["Accountant Jobs", "Financial Analyst Jobs"],
  },
  {
    category: "Marketing & Sales",
    options: ["Digital Marketing Jobs", "Sales Executive Jobs"],
  },
  {
    category: "Engineering & Core",
    options: ["Mechanical Engineer Jobs", "Electrical Engineer Jobs"],
  },
  {
    category: "Healthcare & Life Sciences",
    options: ["Healthcare Jobs", "Pharma Jobs"],
  },
  {
    category: "Fresher & Internships",
    options: ["Fresher Jobs", "Internship Jobs"],
  },
];

const jobSearchAliases = {
  fresher: ["graduate software intern", "business intern"],
  internship: ["graduate software intern", "business intern"],
  healthcare: ["healthcare operations associate"],
  pharma: ["pharma associate"],
  "digital marketing": ["digital marketing specialist"],
  "ai / ml": ["ai / ml engineer"],
};

/* =========================================================
   AUTH HELPERS
========================================================= */

const AUTH_KEY = "hirehub_auth";

function getAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY)) || null;
  } catch {
    return null;
  }
}

function saveAuth({ token, user }) {
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      isAuthenticated: true,
      token,
      role: user.role,
      name: user.name,
      email: user.email,
    })
  );
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

function getDashboardPath(role) {
  const normalized = (role || "").toLowerCase();
  // Overview now lives on Home, so dashboards open on their first tab.
  if (normalized === "recruiter") return "/recruiter/jobs";
  if (normalized === "admin") return "/admin";
  return "/jobs";
}

// Where to land right after login: Home for candidates/recruiters
// (their overview), the dashboard for everyone else.
function getPostLoginPath(role) {
  const normalized = (role || "").toLowerCase();
  if (normalized === "candidate" || normalized === "recruiter") return "/";
  return getDashboardPath(role);
}

// Reads the user id out of the JWT payload already stored via saveAuth.
// Doesn't change what saveAuth stores — just decodes what's already there.
function getUserIdFromToken(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.id || null;
  } catch {
    return null;
  }
}

/* =========================================================
   PROTECTED ROUTE
========================================================= */

function ProtectedRoute({ children, roles }) {
  const auth = getAuth();

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles) {
    const normalizedRoles = roles.map((r) => r.toLowerCase());
    if (!normalizedRoles.includes((auth.role || "").toLowerCase())) {
      return <Navigate to={getDashboardPath(auth.role)} replace />;
    }
  }

  return children;
}

/* =========================================================
   AI HERO VISUAL
========================================================= */

function AIHeroVisual() {
  return (
    <div className="ai-hero-visual">
      <div className="hero-glow glow-one" />
      <div className="hero-glow glow-two" />

      <motion.div
        className="ai-orb"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 4, -4, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="orb-ring orb-ring-one" />
        <div className="orb-ring orb-ring-two" />
        <div className="orb-core">
          <BrainCircuit size={27} />
          <strong>AI</strong>
        </div>
      </motion.div>

      <motion.div
        className="resume-analysis-card"
        animate={{ y: [0, -8, 0], rotate: [-2, -1, -2] }}
        transition={{ duration: 4.5, repeat: Infinity }}
      >
        <div className="mini-card-heading">
          <span className="mini-icon">
            <FileText size={15} />
          </span>

          <div>
            <strong>Your Resume</strong>
            <small>AI analyzing</small>
          </div>
        </div>

        <div className="resume-skills">
          <span>✓ Python</span>
          <span>✓ React</span>
          <span>✓ SQL</span>
          <span>✓ Communication</span>
        </div>

        <div className="analyzing-bar">
          <i />
        </div>

        <small className="analyzing-text">Analyzing...</small>
      </motion.div>

      <motion.div
        className="job-match-card match-one"
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
      >
        <div className="job-match-icon blue">
          <BriefcaseBusiness size={16} />
        </div>

        <div className="job-match-info">
          <strong>Backend Developer</strong>
          <small>CloudNest · Bengaluru</small>
        </div>

        <b>94% Match</b>
      </motion.div>

      <motion.div
        className="job-match-card match-two"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, delay: 0.8 }}
      >
        <div className="job-match-icon purple">
          <Target size={16} />
        </div>

        <div className="job-match-info">
          <strong>Frontend Developer</strong>
          <small>NovaTech · Hyderabad</small>
        </div>

        <b>89% Match</b>
      </motion.div>

      <motion.div
        className="job-match-card match-three"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1.2 }}
      >
        <div className="job-match-icon pink">
          <BarChart3 size={16} />
        </div>

        <div className="job-match-info">
          <strong>Data Analyst</strong>
          <small>InsightWorks · Remote</small>
        </div>

        <b>87% Match</b>
      </motion.div>

      <div className="floating-shape shape-ball" />
      <div className="floating-shape shape-ring" />

      <motion.div
        className="hero-arrow"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        ↗
      </motion.div>

      <motion.div
        className="laptop"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <div className="laptop-screen-frame">
          <div className="laptop-screen">
            <div className="screen-glow" />

            <div className="screen-logo">
              <span>HireHub</span>
              <small>Match • Apply • Grow</small>
            </div>

            <div className="screen-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>

        <div className="laptop-base">
          <div className="keyboard">
            {Array.from({ length: 48 }).map((_, i) => (
              <i key={i} />
            ))}
          </div>

          <div className="trackpad" />
        </div>
      </motion.div>

      <div className="build-card">
        <BarChart3 size={17} />

        <div>
          <strong>Build Your Future</strong>
          <small>One step at a time</small>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   NAVBAR
========================================================= */

function JobsMegaMenu({
  activeCategory,
  setActiveCategory,
  onSelect,
}) {
  const active =
    jobsMenuData.find(
      (item) => item.category === activeCategory
    ) || jobsMenuData[0];

  return (
    <div className="jobs-mega-menu">
      <div className="jobs-menu-heading">
        <div>
          <span>EXPLORE JOBS</span>
          <strong>Find opportunities that fit you</strong>
        </div>

        <button onClick={() => onSelect("")}>
          View all Jobs <ArrowRight size={15} />
        </button>
      </div>

      <div className="jobs-menu-body">
        <div className="jobs-menu-categories">
          {jobsMenuData.map((item) => (
            <button
              key={item.category}
              className={
                activeCategory === item.category
                  ? "active"
                  : ""
              }
              onMouseEnter={() =>
                setActiveCategory(item.category)
              }
              onClick={() =>
                setActiveCategory(item.category)
              }
            >
              <span>{item.category}</span>
              <ChevronRight size={15} />
            </button>
          ))}
        </div>

        <div className="jobs-menu-options">
          <div className="jobs-menu-options-title">
            <span>{active.category}</span>
            <small>Browse available roles</small>
          </div>

          <div className="jobs-option-grid">
            {active.options.map((option) => (
              <button
                key={option}
                onClick={() => onSelect(option)}
              >
                <span>{option}</span>
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);

  const [auth, setAuth] = useState(getAuth());

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setAuth(getAuth());
    setOpen(false);
  }, [location.pathname]);

  const logout = () => {
    clearAuth();
    setAuth(null);
    setOpen(false);
    navigate("/");
  };

  const protectedNavigate = (path) => {
    setOpen(false);

    if (!getAuth()?.isAuthenticated) {
      navigate("/login");
      return;
    }

    navigate(path);
  };

  const isAuthenticated = auth?.isAuthenticated;
  // Stored role comes from the backend in lowercase ("candidate", "recruiter")
  const isCandidate =
    (auth?.role || "").toLowerCase() === "candidate";
  const isRecruiter =
    (auth?.role || "").toLowerCase() === "recruiter";

  // Highlights the role's portal link on its dashboard pages. /jobs is
  // left to the "Jobs" link so two links are never active together.
  const isRecruiterPortalPage =
    location.pathname.startsWith("/recruiter/");
  const isCandidatePortalPage =
    ["/applications", "/interviews", "/profile"].includes(location.pathname);

  return (
    <header className="navbar">
      <Link
        to="/"
        className="brand"
        onClick={() => setOpen(false)}
      >
        <span className="brand-icon">
          <BriefcaseBusiness size={21} />
        </span>

        <span>
          <strong>HireHub</strong>
          <small>Jobs Today, Brighter Tomorrows</small>
        </span>
      </Link>

      <nav className={open ? "nav-links open" : "nav-links"}>
        <NavLink
          to="/"
          onClick={() => setOpen(false)}
        >
          Home
        </NavLink>

        {/* =================================================
            JOBS — candidates and logged-out visitors only
        ================================================= */}
        {/* /jobs is a protected route, so logged-out visitors are sent to /login */}
        {!isRecruiter && (
          <NavLink
            to="/jobs"
            onClick={() => setOpen(false)}
          >
            Jobs
          </NavLink>
        )}

        {/* =================================================
            ROLE-BASED NAVIGATION
        ================================================= */}

        {/* PUBLIC USER
            Show BOTH options before login */}
        {!isAuthenticated && (
          <>
            <button
              onClick={() =>
                protectedNavigate("/candidate")
              }
            >
              For Candidates
            </button>

            <button
              onClick={() =>
                protectedNavigate("/recruiter")
              }
            >
              For Recruiters
            </button>
          </>
        )}

        {/* CANDIDATE
            Show ONLY For Candidates */}
        {isAuthenticated && isCandidate && (
          <button
            className={isCandidatePortalPage ? "active" : undefined}
            onClick={() =>
              protectedNavigate(getDashboardPath(auth.role))
            }
          >
            For Candidates
          </button>
        )}

        {/* RECRUITER
            Show ONLY For Recruiters */}
        {isAuthenticated && isRecruiter && (
          <button
            className={isRecruiterPortalPage ? "active" : undefined}
            onClick={() =>
              protectedNavigate(getDashboardPath(auth.role))
            }
          >
            For Recruiters
          </button>
        )}

        <NavLink
          to="/about"
          onClick={() => setOpen(false)}
        >
          About
        </NavLink>
      </nav>

      {/* =================================================
          RIGHT SIDE AUTH ACTIONS
      ================================================= */}
      <div className="nav-actions">
        {!isAuthenticated ? (
          <>
            <Link
              className="btn btn-outline small"
              to="/login"
            >
              Login
            </Link>

            <Link
              className="btn small"
              to="/register"
            >
              Get Started
            </Link>
          </>
        ) : (
          <>
            <button
              className="btn btn-outline small"
              onClick={() =>
                navigate(getDashboardPath(auth.role))
              }
            >
              Dashboard
            </button>

            <button
              className="btn small"
              onClick={logout}
            >
              Logout
            </button>
          </>
        )}
      </div>

      {/* =================================================
          MOBILE MENU
      ================================================= */}
      <button
        className="mobile-menu"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
/* =========================================================
   HOME
========================================================= */

function Home() {
  // Re-render on every navigation (e.g. logout → "/") so the role check stays fresh.
  useLocation();
  const role =(getAuth()?.isAuthenticated ? getAuth().role : "") || "";
  const normalizedRole = role.toLowerCase();

  if (normalizedRole === "candidate") return <CandidateHome />;
  if (normalizedRole === "recruiter") return <RecruiterHome />;

  return <LandingHome />;
}

function LandingHome() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const requireLogin = (path) => {
    if (!getAuth()?.isAuthenticated) {
      navigate("/login");
      return;
    }

    navigate(path);
  };

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="eyebrow"
          >
            <Sparkles size={16} />
            Smarter hiring with AI
          </motion.div>

          <motion.h1
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
          >
            Your Next <span>Opportunity</span>
            <br />
            Starts Here
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.18,
            }}
          >
            HireHub connects candidates and recruiters
            through AI-powered resume parsing,
            intelligent job matching and smarter hiring.
          </motion.p>

          <div className="hero-tabs">
            <button
              className="active"
              onClick={() =>
                requireLogin("/jobs")
              }
            >
              Find Jobs
            </button>

            <button
              onClick={() =>
                requireLogin("/recruiter")
              }
            >
              Find Talent
            </button>

            <button
              onClick={() =>
                requireLogin("/jobs")
              }
            >
              Explore Jobs
            </button>
          </div>

          <div className="search-box">
            <div>
              <Search size={19} />

              <input
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                placeholder="Job title, skills or company"
              />
            </div>

            <div>
              <MapPin size={19} />
              <input placeholder="Location" />
            </div>

            <button
              onClick={() => {
                if (
                  !getAuth()?.isAuthenticated
                ) {
                  navigate("/login");
                  return;
                }

                navigate(
                  `/jobs?q=${encodeURIComponent(
                    query
                  )}`
                );
              }}
            >
              Search Jobs
            </button>
          </div>

          <div className="popular">
            <b>Popular:</b>

            {[
              "Software Engineer",
              "Data Analyst",
              "Product Manager",
              "UI/UX Designer",
            ].map((x) => (
              <button
                key={x}
                onClick={() => {
                  if (
                    !getAuth()?.isAuthenticated
                  ) {
                    navigate("/login");
                    return;
                  }

                  navigate(
                    `/jobs?q=${encodeURIComponent(
                      x
                    )}`
                  );
                }}
              >
                {x}
              </button>
            ))}
          </div>

          <div className="hero-trust">
            <CheckCircle2 size={16} />

            <span>
              Explore the platform freely. Login only
              when you're ready to take action.
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <AIHeroVisual />
        </div>
      </section>

      <section className="stats">
        {[
          [
            "10K+",
            "Active Job Listings",
            BriefcaseBusiness,
          ],
          [
            "5K+",
            "Trusted Recruiters",
            Users,
          ],
          [
            "20K+",
            "Resumes Parsed",
            FileText,
          ],
          [
            "95%",
            "Job Match Accuracy",
            Sparkles,
          ],
        ].map(([n, t, I]) => (
          <div className="stat" key={t}>
            <span>
              <I size={21} />
            </span>

            <div>
              <strong>{n}</strong>
              <small>{t}</small>
            </div>
          </div>
        ))}
      </section>

      <section className="section" id="features">
        <div className="section-head">
          <div>
            <label>FEATURES</label>
            <h2>Everything You Need in One Place</h2>
            <p>
              A simple platform for candidates,
              recruiters and administrators.
            </p>
          </div>

          <div className="mini-orb">✦</div>
        </div>

        <div className="feature-grid">
          {features.map((f, i) => (
            <motion.div
              whileHover={{ y: -7 }}
              className="feature-card"
              key={f.title}
            >
              <span className="feature-icon">
                <f.icon />
              </span>

              <h3>{f.title}</h3>
              <p>{f.text}</p>

              <button
                onClick={() =>
                  navigate(
                    i === 0
                      ? "/login"
                      : i === 1
                      ? "/login"
                      : i === 2
                      ? "/login"
                      : "/login"
                  )
                }
              >
                Explore <ArrowRight size={15} />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section audience-section">
        <div className="section-head">
          <div>
            <label>BUILT FOR EVERYONE</label>
            <h2>
              One Platform. Two Powerful Experiences.
            </h2>
            <p>
              HireHub makes finding opportunities and
              finding talent simpler.
            </p>
          </div>
        </div>

        <div className="audience-grid">
          <div className="audience-card candidate-audience">
            <div className="audience-icon">
              <UserRound size={25} />
            </div>

            <span className="audience-label">
              FOR CANDIDATES
            </span>

            <h3>Find work that fits you.</h3>

            <p>
              Build your profile, let AI understand
              your skills and discover opportunities
              that actually match your experience.
            </p>

            <div className="audience-list">
              <div>
                <CheckCircle2 size={17} />
                Upload and parse your resume
              </div>

              <div>
                <CheckCircle2 size={17} />
                Get AI-powered job matches
              </div>

              <div>
                <CheckCircle2 size={17} />
                Apply and track applications
              </div>

              <div>
                <CheckCircle2 size={17} />
                Manage interviews
              </div>
            </div>

            <button
              className="btn"
              onClick={() =>
                navigate("/register")
              }
            >
              Join as Candidate{" "}
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="audience-card recruiter-audience">
            <div className="audience-icon">
              <UserSearch size={25} />
            </div>

            <span className="audience-label">
              FOR RECRUITERS
            </span>

            <h3>Build your next great team.</h3>

            <p>
              Find skilled candidates and interns
              faster using matching, candidate ranking
              and recruitment analytics.
            </p>

            <div className="audience-list">
              <div>
                <CheckCircle2 size={17} />
                Post jobs and internships
              </div>

              <div>
                <CheckCircle2 size={17} />
                Search skilled candidates
              </div>

              <div>
                <CheckCircle2 size={17} />
                Compare candidate match scores
              </div>

              <div>
                <CheckCircle2 size={17} />
                Schedule and manage interviews
              </div>
            </div>

            <button
              className="btn"
              onClick={() =>
                navigate("/register")
              }
            >
              Join as Recruiter{" "}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <section className="section split">
        <div className="glass-panel">
          <label>HOW IT WORKS</label>
          <h2>From resume to right-fit job.</h2>

          <p>
            HireHub brings the important parts of
            recruitment together into a single
            intelligent workflow.
          </p>

          <div className="steps">
            {[
              "Create your profile",
              "Upload your resume",
              "AI extracts your skills",
              "See your match score",
              "Apply & schedule interviews",
            ].map((s, i) => (
              <div className="step" key={s}>
                <b>
                  {String(i + 1).padStart(2, "0")}
                </b>

                <span>{s}</span>

                <CheckCircle2 size={18} />
              </div>
            ))}
          </div>
        </div>

        <div className="image-panel">
          <div className="live-badge">
            <span />
            AI-powered matching
          </div>

          <div className="how-image">
            <div className="how-image-orb">
              <BrainCircuit size={42} />
            </div>

            <div className="how-image-text">
              <strong>
                Resume → Skills → Match
              </strong>

              <span>
                Let HireHub do the hard work.
              </span>
            </div>
          </div>

          <div className="image-caption">
            <b>
              Great teams start with great matches.
            </b>

            <span>
              Connect talent with opportunity.
            </span>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="final-cta-glow" />

        <div>
          <label>READY TO GET STARTED?</label>

          <h2>
            Your next opportunity is closer than you
            think.
          </h2>

          <p>
            Create your HireHub account and start
            discovering smarter opportunities today.
          </p>
        </div>

        <div className="final-cta-actions">
          <button
            className="btn"
            onClick={() =>
              navigate("/register")
            }
          >
            Get Started <ArrowRight size={17} />
          </button>

          <button
            className="btn btn-outline"
            onClick={() =>
              navigate("/login")
            }
          >
            Login
          </button>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   ABOUT
========================================================= */

function About() {
  const navigate = useNavigate();

  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-copy">
          <span className="about-kicker">
            ABOUT HIREHUB
          </span>

          <h1>
            Making the right career connection{" "}
            <span>simpler.</span>
          </h1>

          <p>
            HireHub brings candidates and recruiters
            together through one intelligent
            recruitment platform built around skills,
            matching and better hiring decisions.
          </p>

          <div className="about-hero-actions">
            <button
              className="btn"
              onClick={() =>
                navigate("/register")
              }
            >
              Get Started <ArrowRight size={17} />
            </button>

            <button
              className="btn btn-outline"
              onClick={() =>
                navigate("/jobs")
              }
            >
              Explore Jobs
            </button>
          </div>
        </div>

        <div className="about-visual">
          <div className="about-visual-orb">
            <BrainCircuit size={46} />
          </div>

          <div className="about-float about-float-one">
            <CheckCircle2 size={17} />
            <span>Smart matching</span>
          </div>

          <div className="about-float about-float-two">
            <Users size={17} />
            <span>Talent + opportunity</span>
          </div>

          <div className="about-visual-center">
            <strong>HireHub</strong>
            <small>Match · Apply · Grow</small>
          </div>
        </div>
      </section>

      <section className="about-story">
        <div>
          <span className="about-kicker">
            OUR PURPOSE
          </span>

          <h2>
            One platform for the people behind every
            great hire.
          </h2>
        </div>

        <p>
          Searching for a job and finding the right
          candidate can feel disconnected. HireHub is
          designed to bring those experiences closer
          together, helping candidates showcase what
          they can do and helping recruiters discover
          relevant talent faster.
        </p>
      </section>

      <section className="about-pillars">
        {[
          [
            Sparkles,
            "AI-powered",
            "Use intelligent resume parsing and skill-based matching to make recruitment more focused.",
          ],
          [
            Target,
            "Match-focused",
            "Surface opportunities and candidates based on fit instead of relying only on keywords.",
          ],
          [
            ShieldCheck,
            "Built for clarity",
            "Keep applications, hiring activity and recruitment workflows organized in one place.",
          ],
        ].map(([Icon, title, text]) => (
          <div
            className="about-pillar"
            key={title}
          >
            <span>
              <Icon size={22} />
            </span>

            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>

      <section className="about-audience">
        <div className="about-audience-card">
          <span className="about-audience-icon">
            <UserRound size={23} />
          </span>

          <span className="about-kicker">
            FOR CANDIDATES
          </span>

          <h2>
            Show your skills. Find your fit.
          </h2>

          <p>
            Create your profile, upload your resume,
            discover relevant roles and keep track of
            your journey from application to interview.
          </p>
        </div>

        <div className="about-audience-card recruiter">
          <span className="about-audience-icon">
            <UserSearch size={23} />
          </span>

          <span className="about-kicker">
            FOR RECRUITERS
          </span>

          <h2>
            Find talent. Hire with confidence.
          </h2>

          <p>
            Post opportunities, discover skilled
            candidates, compare matches and keep your
            hiring activity moving from one dashboard.
          </p>
        </div>
      </section>

      <section className="about-cta">
        <div>
          <span className="about-kicker">
            START WITH HIREHUB
          </span>

          <h2>
            Ready to build your next opportunity?
          </h2>

          <p>
            Whether you are looking for your next role
            or your next great hire, start here.
          </p>
        </div>

        <button
          className="btn"
          onClick={() =>
            navigate("/register")
          }
        >
          Join HireHub <ArrowRight size={17} />
        </button>
      </section>
    </main>
  );
}

/* =========================================================
   JOBS
========================================================= */

function Jobs() {
  const [filter, setFilter] = useState("All");
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [liveJobs, setLiveJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      setJobsLoading(true);
      setJobsError("");
      try {
        const data = await getJobs();
        if (!cancelled) setLiveJobs(data.jobs || []);
      } catch (err) {
        if (!cancelled) {
          setJobsError(err.message || "Could not load jobs.");
        }
      } finally {
        if (!cancelled) setJobsLoading(false);
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  const query = searchParams.get("q") || "";
  const viewAll =
    searchParams.get("view") === "all";

  useEffect(() => {
    if (viewAll) {
      setFilter("All");
    }
  }, [viewAll]);

  const searchTerm = viewAll
    ? ""
    : query
        .toLowerCase()
        .replace(/^jobs in\s+/, "")
        .replace(/\s+jobs$/, "")
        .trim();

  const shown = liveJobs.filter((j) => {
    const matchesFilter =
      filter === "All" ||
      (j.type || "").toLowerCase() === filter.toLowerCase();

    if (!searchTerm) return matchesFilter;

    const searchableText = [
      j.title,
      j.company,
      j.location,
      j.type,
      j.salaryRange,
      ...(j.requiredSkills || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const fullQuery = query
      .toLowerCase()
      .trim();

    const aliases =
      jobSearchAliases[fullQuery] || [];

    const matchesDirectly =
      searchableText.includes(searchTerm);

    const matchesAlias = aliases.some(
      (alias) =>
        searchableText.includes(alias)
    );

    return (
      matchesFilter &&
      (matchesDirectly || matchesAlias)
    );
  });

  return (
    <main className="page">
      <div className="page-hero">
        <label>DISCOVER</label>
        <h1>Find your next role.</h1>
        <p>
          Search opportunities and see how well your
          skills match.
        </p>
      </div>

      <div className="job-toolbar">
        <div className="toolbar-search">
          <Search />

          <input
            value={viewAll ? "" : query}
            onChange={(e) => {
              const value = e.target.value;

              if (value.trim()) {
                setSearchParams(
                  { q: value },
                  { replace: true }
                );
              } else {
                setSearchParams(
                  {},
                  { replace: true }
                );
              }
            }}
            placeholder="Search jobs, skills or companies"
          />
        </div>

        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value)
          }
        >
          <option>All</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="internship">Internship</option>
          <option value="contract">Contract</option>
          <option value="remote">Remote</option>
        </select>

        <button className="filter-btn">
          <SlidersHorizontal />
          Filters
        </button>
      </div>

      <div className="jobs-grid">
        {jobsLoading ? (
          <div className="empty-state">
            <h3>Loading jobs…</h3>
          </div>
        ) : jobsError ? (
          <div className="empty-state">
            <h3>Couldn't load jobs</h3>
            <p>{jobsError}</p>
          </div>
        ) : shown.length > 0 ? (
          shown.map((j) => (
            <JobCard
              key={j._id}
              job={j}
            />
          ))
        ) : (
          <div className="empty-state">
            <h3>
              No matching jobs found.
            </h3>

            <p>
              Try another job title, skill,
              company or location.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function JobCard({ job }) {
  const typeLabel = job.type
    ? job.type.charAt(0).toUpperCase() + job.type.slice(1)
    : "";

  return (
    <motion.article
      whileHover={{ y: -5 }}
      className="job-card"
    >
      <div className="job-top">
        <div className="company-logo">
          {job.company?.[0]}
        </div>

        <span className="match-pill">
          {typeLabel}
        </span>
      </div>

      <h3>{job.title}</h3>

      <p className="company">
        {job.company} · {job.location}
      </p>

      <div className="job-meta">
        <span>{typeLabel}</span>
        <span>{job.salaryRange || "Salary not specified"}</span>
      </div>

      <div className="skills">
        {(job.requiredSkills || []).map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>

      <Link
        className="btn full"
        to={`/jobs/${job._id}`}
      >
        View Job <ArrowRight size={16} />
      </Link>
    </motion.article>
  );
}

function JobDetails() {
  const { id } = useParams();
  const auth = getAuth();
  const token = auth?.token;
  const isCandidate = isCandidateRole(auth);

  const [job, setJob] = useState(null);
  const [matchScore, setMatchScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const { savedJobIds, appliedJobIds, busyJobId, toggleSave, apply } =
    useCandidateJobActions(isCandidate ? token : null);

  useEffect(() => {
    let cancelled = false;

    async function loadJob() {
      setLoading(true);
      setLoadError("");

      try {
        // No single-job endpoint: load the open jobs and pick this one.
        const data = await getJobs();
        const found = (data.jobs || []).find((j) => j._id === id) || null;
        if (cancelled) return;
        setJob(found);

        if (found && isCandidate && token) {
          const profileResult = await getProfile(token);
          if (profileResult.latestResume) {
            const matchesResult = await getMatches(token);
            const match = (matchesResult.matches || []).find(
              (m) => m.job._id === id
            );
            if (!cancelled) setMatchScore(match ? match.matchScore : null);
          }
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message || "Could not load this job.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadJob();

    return () => {
      cancelled = true;
    };
  }, [id, isCandidate, token]);

  let content;

  if (loading) {
    content = <p className="candidate-empty-state">Loading job…</p>;
  } else if (loadError) {
    content = <p className="candidate-load-error">{loadError}</p>;
  } else if (!job) {
    content = (
      <div className="cp-card cp-empty">
        <h3>This job isn't available</h3>
        <p>It may have been closed or removed by the recruiter.</p>
        <Link className="btn small" to="/jobs">
          Browse jobs
        </Link>
      </div>
    );
  } else {
    const saved = savedJobIds.has(job._id);
    const applied = appliedJobIds.has(job._id);
    const busy = busyJobId === job._id;

    content = (
      <>
        <section className="cp-card cp-detail-head">
          <div className="cp-detail-title">
            <div className="candidate-company-mark cp-mark-lg">
              {job.company?.[0]}
            </div>

            <div>
              <label>JOB OPPORTUNITY</label>
              <h1>{job.title}</h1>
              <p>
                <Building2 size={14} /> {job.company}
                {job.location && (
                  <>
                    {" · "}
                    <MapPin size={14} /> {job.location}
                  </>
                )}
              </p>
            </div>

            {matchScore !== null && (
              <span className="cp-match lg">{matchScore}% match</span>
            )}
          </div>

          <div className="cp-chips">
            <span>{workTypeLabel(job)}</span>
            {job.salaryRange && <span>{job.salaryRange}</span>}
            <span>{experienceLabel(job.experienceRequired)}</span>
            <span>Posted {formatDate(job.createdAt)}</span>
          </div>

          {isCandidate && (
            <div className="cp-actions">
              <button
                type="button"
                className="btn small"
                onClick={() => apply(job)}
                disabled={applied || busy}
              >
                {applied ? (
                  <>
                    <CheckCircle2 size={16} /> Applied
                  </>
                ) : (
                  <>
                    Apply Now <ArrowRight size={16} />
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn small btn-outline"
                onClick={() => toggleSave(job)}
                disabled={busy}
              >
                {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {saved ? "Saved" : "Save"}
              </button>
            </div>
          )}
        </section>

        <section className="cp-card">
          <h2 className="cp-section-title">Job description</h2>
          <p className="cp-body-text">{job.description}</p>
        </section>

        <div className="cp-two-col">
          <section className="cp-card">
            <h2 className="cp-section-title">Required skills</h2>
            {job.requiredSkills?.length ? (
              <div className="skills">
                {job.requiredSkills.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            ) : (
              <p className="candidate-empty-state">No specific skills listed.</p>
            )}
          </section>

          <section className="cp-card">
            <h2 className="cp-section-title">Experience required</h2>
            <p className="cp-body-text">
              {job.experienceRequired
                ? `${job.experienceRequired}+ years of experience`
                : "No prior experience required — freshers can apply."}
            </p>
          </section>
        </div>
      </>
    );
  }

  const body = (
    <div className="candidate-space cp-page">
      <Link className="cp-back" to="/jobs">
        <ArrowLeft size={16} /> Back to jobs
      </Link>
      {content}
    </div>
  );

  return isCandidate ? (
    <DashboardLayout role="Candidate">{body}</DashboardLayout>
  ) : (
    <main className="page">{body}</main>
  );
}

/* =========================================================
   AUTH
========================================================= */

function Auth({ register = false }) {
  const navigate = useNavigate();

  const [role, setRole] =
    useState("Candidate");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const enteredName = name.trim();
    const enteredEmail = email.trim();

    if (!enteredName) {
      alert("Please enter your name.");
      return;
    }

    if (!enteredEmail) {
      alert("Please enter your email.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    if (
      register &&
      password !== confirmPassword
    ) {
      alert("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const data = register
        ? await registerUser({
            name: enteredName,
            email: enteredEmail,
            password,
            role: role.toLowerCase(),
          })
        : await login({
            email: enteredEmail,
            password,
          });

      saveAuth(data);
      navigate(getPostLoginPath(data.user.role));
    } catch (err) {
      alert(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Login wraps the form card in the two-panel layout; Register renders it as before.
  const Shell = register ? React.Fragment : LoginShell;

  return (
    <main className={register ? "auth-page" : "auth-page login-v2"}>
      <Shell>
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="auth-card"
      >
        <div className="auth-brand">
          {register && (
            <span className="brand-icon">
              <BriefcaseBusiness />
            </span>
          )}

          <h2>
            {register ? (
              "Create your HireHub account"
            ) : (
              <>
                Welcome <strong>back</strong>
              </>
            )}
          </h2>

          <p>
            {register
              ? "Choose your role and start building your future."
              : "Sign in to your account below."}
          </p>
        </div>

        <div className="role-title">
          Continue as
        </div>

        <div className="role-switch">
          {[
            "Candidate",
            "Recruiter",
            "Admin",
          ].map((r) => (
            <button
              type="button"
              className={
                role === r
                  ? "active"
                  : ""
              }
              onClick={() =>
                setRole(r)
              }
              key={r}
            >
              {r === "Candidate" && (
                <UserRound size={16} />
              )}

              {r === "Recruiter" && (
                <Users size={16} />
              )}

              {r === "Admin" && (
                <ShieldCheck size={16} />
              )}

              {r}
            </button>
          ))}
        </div>

        <label>
          {register
            ? "Full name"
            : "Name / Username"}

          <input
            type="text"
            placeholder={
              register
                ? "Enter your full name"
                : "Enter your name or username"
            }
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />
        </label>

        <label>
          Email

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </label>

        <label>
          Password

          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />
        </label>

        {register && (
          <label>
            Confirm password

            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
            />
          </label>
        )}

        <button
          type="button"
          className="btn full"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? "Please wait..."
            : register
            ? "Create Account"
            : "Login"}

          <ArrowRight size={17} />
        </button>

        <p className="auth-demo-note">
          Your account is created and stored securely
          on the HireHub server.
        </p>

        <p className="auth-foot">
          {register
            ? "Already have an account? "
            : "Don't have an account? "}

          <Link
            to={
              register
                ? "/login"
                : "/register"
            }
          >
            {register
              ? "Login"
              : "Create one"}
          </Link>
        </p>
      </motion.div>
      </Shell>
    </main>
  );
}

// Login page: split screen — form panel (children) on the left, photo on the right.
function LoginShell({ children }) {
  return (
    <div className="login-v2-shell">
      <div className="login-v2-form-side">{children}</div>

      <div className="login-v2-photo">
        <img src={loginPhoto} alt="Person working on a laptop" />
      </div>
    </div>
  );
}

/* =========================================================
   CANDIDATE
========================================================= */

const EDUCATION_FIELDS = [
  ["degree", "Degree"],
  ["institution", "Institution"],
  ["year", "Year"],
];

const EXPERIENCE_FIELDS = [
  ["title", "Title"],
  ["company", "Company"],
  ["duration", "Duration"],
  ["description", "Description"],
];

// Edit mode for the AI-extracted "Resume Insights" on the Overview page.
function ResumeInsightsEditor({ resume, onCancel, onSave }) {
  const blankRow = (fields) => Object.fromEntries(fields.map(([key]) => [key, ""]));
  const copyRows = (rows, fields) =>
    (rows || []).map((row) =>
      Object.fromEntries(fields.map(([key]) => [key, row[key] || ""]))
    );

  const [skills, setSkills] = useState((resume.parsedSkills || []).join(", "));
  const [education, setEducation] = useState(copyRows(resume.education, EDUCATION_FIELDS));
  const [experience, setExperience] = useState(copyRows(resume.experience, EXPERIENCE_FIELDS));
  const [certifications, setCertifications] = useState(
    (resume.certifications || []).join("\n")
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({
        parsedSkills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        education,
        experience,
        certifications: certifications.split("\n").map((c) => c.trim()).filter(Boolean),
      });
    } catch (err) {
      setError(err.message || "Could not save your changes.");
      setSaving(false);
    }
  }

  const renderRows = (title, rows, setRows, fields) => (
    <fieldset className="resume-edit-group">
      <legend>{title}</legend>
      {rows.map((row, index) => (
        <div className="resume-edit-row" key={index}>
          {fields.map(([key, label]) => (
            <input
              key={key}
              value={row[key]}
              placeholder={label}
              aria-label={`${title} ${index + 1} ${label}`}
              className={key === "description" ? "wide" : ""}
              onChange={(e) =>
                setRows((prev) =>
                  prev.map((r, i) => (i === index ? { ...r, [key]: e.target.value } : r))
                )
              }
            />
          ))}
          <button
            type="button"
            className="resume-edit-remove"
            aria-label={`Remove ${title.toLowerCase()} entry ${index + 1}`}
            onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
          >
            <X size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="candidate-text-action resume-edit-add"
        onClick={() => setRows((prev) => [...prev, blankRow(fields)])}
      >
        <Plus size={14} /> Add {title.toLowerCase()}
      </button>
    </fieldset>
  );

  return (
    <form className="resume-edit-form" onSubmit={handleSubmit}>
      {error && <p className="candidate-load-error">{error}</p>}

      <label className="resume-edit-group">
        <span className="resume-edit-label">Skills (comma-separated)</span>
        <input
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="e.g. React, Node.js, SQL"
        />
      </label>

      {renderRows("Education", education, setEducation, EDUCATION_FIELDS)}
      {renderRows("Experience", experience, setExperience, EXPERIENCE_FIELDS)}

      <label className="resume-edit-group">
        <span className="resume-edit-label">Certifications (one per line)</span>
        <textarea
          rows={3}
          value={certifications}
          onChange={(e) => setCertifications(e.target.value)}
        />
      </label>

      <div className="resume-edit-actions">
        <button type="button" className="btn small btn-outline" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn small" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

// Candidate overview, shown on Home ("/") for logged-in candidates.
function CandidateHome() {
  const auth = getAuth();
  const token = auth?.token;

  const candidateName =
    auth?.name || "Candidate";

  const initials = candidateName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [profileData, setProfileData] = useState(null);
  const [matches, setMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [editingInsights, setEditingInsights] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [offers, setOffers] = useState([]);
  const [viewingOffer, setViewingOffer] = useState(null);
  const [savedJobsCount, setSavedJobsCount] = useState(null);

  const hasResume = Boolean(profileData?.latestResume);

  // Offer letters drive the congratulations banner; loaded separately so a
  // failure here never blocks the rest of the dashboard.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getCandidateOffers(token)
      .then((result) => {
        if (!cancelled) setOffers(result.offers || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Saved-jobs count for the stats tile; same fail-safe loading as offers.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getSavedJobs(token)
      .then((result) => {
        if (!cancelled) setSavedJobsCount((result.savedJobs || []).length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);
  const completion = profileCompletion(
    profileData?.profile,
    profileData?.latestResume
  );

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError("");

      try {
        const [profileResult, applicationsResult] = await Promise.all([
          getProfile(token),
          getApplications(token),
        ]);

        if (cancelled) return;

        setProfileData(profileResult);
        setApplications(applicationsResult.applications || []);

        if (profileResult.latestResume) {
          const matchesResult = await getMatches(token);
          if (!cancelled) {
            setMatches(matchesResult.matches || []);
          }
        } else {
          setMatches([]);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err.message || "Could not load your dashboard."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleResumeChange(event) {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);

    try {
      await uploadResume(file, token);

      const [profileResult, matchesResult] = await Promise.all([
        getProfile(token),
        getMatches(token),
      ]);

      setProfileData(profileResult);
      setMatches(matchesResult.matches || []);
    } catch (err) {
      alert(
        err.message || "Resume upload failed. Please try again."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  // Saves the candidate's corrections, then refreshes profile + matches the
  // same way an upload does (edited skills change match scores).
  async function handleSaveInsights(payload) {
    await updateResumeDetails(payload, token);

    const [profileResult, matchesResult] = await Promise.all([
      getProfile(token),
      getMatches(token),
    ]);

    setProfileData(profileResult);
    setMatches(matchesResult.matches || []);
    setEditingInsights(false);
  }

  async function handleRemoveResume() {
    if (!token) return;
    if (
      !window.confirm(
        "Remove your resume? Your extracted skills, experience and job matches will be cleared."
      )
    ) {
      return;
    }

    setRemoving(true);

    try {
      await deleteResume(token);

      const profileResult = await getProfile(token);
      setProfileData(profileResult);

      if (profileResult.latestResume) {
        const matchesResult = await getMatches(token);
        setMatches(matchesResult.matches || []);
      } else {
        setMatches([]);
      }
    } catch (err) {
      alert(
        err.message || "Could not remove resume. Please try again."
      );
    } finally {
      setRemoving(false);
    }
  }

  const applicationsCount = applications.length;
  const interviewsCount = applications.filter(
    (a) => a.status === "interview"
  ).length;
  const bestMatchScore = matches.length
    ? matches[0].matchScore
    : null;

  const resumeButtonLabel = uploading
    ? "Uploading..."
    : hasResume
    ? "Update Resume"
    : "Upload Resume";

  const candidateStats = [
    [
      String(applicationsCount),
      "Applications",
      FileText,
      applicationsCount ? `${applicationsCount} total` : "None yet",
    ],
    [
      String(interviewsCount),
      "Interviews",
      CalendarDays,
      interviewsCount ? "Scheduled" : "None yet",
    ],
    [
      savedJobsCount === null ? "—" : String(savedJobsCount),
      "Saved Jobs",
      BriefcaseBusiness,
      savedJobsCount ? "Bookmarked for later" : "None yet",
    ],
    [
      bestMatchScore !== null ? `${bestMatchScore}%` : "—",
      "Best Match",
      Sparkles,
      !hasResume
        ? "Upload resume first"
        : bestMatchScore !== null
        ? "Top opportunity"
        : "No jobs yet",
    ],
  ];

  const applicationSteps = [
    [
      "Applied",
      String(applicationsCount),
      "Your applications",
      applicationsCount ? "complete" : "active",
    ],
    [
      "Under Review",
      String(
        applications.filter((a) => a.status === "applied").length
      ),
      "Recruiters reviewing",
      "active",
    ],
    [
      "Shortlisted",
      String(
        applications.filter((a) => a.status === "shortlisted").length
      ),
      "Great progress",
      "active",
    ],
    [
      "Interview",
      String(interviewsCount),
      "Coming up next",
      "active",
    ],
  ];

  return (
    <main className="home-candidate">
      <div className="candidate-space">
        <motion.div
          className="candidate-welcome"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div>
            <label>YOUR CAREER SPACE</label>

            <h1>
              Good morning, {candidateName} 👋
            </h1>

            <p>
              Discover better opportunities,
              strengthen your profile and keep your
              career moving.
            </p>

            {loadError && (
              <p className="candidate-load-error">
                {loadError}
              </p>
            )}
          </div>

          <label className="btn candidate-upload">
            <Upload size={17} />
            {resumeButtonLabel}
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleResumeChange}
              disabled={uploading}
            />
          </label>
        </motion.div>

        {offers.map((offer) => (
          <section className="offer-banner" key={offer._id}>
            <span className="offer-banner-icon" aria-hidden="true">🎉</span>
            <p>
              <strong>Congratulations, {offer.candidate?.name || candidateName}!</strong>{" "}
              You've been selected for <strong>{offer.position}</strong> at{" "}
              <strong>{offer.company}</strong>. Your offer letter is ready.
            </p>
            <button type="button" className="btn small" onClick={() => setViewingOffer(offer)}>
              View Offer Letter
            </button>
          </section>
        ))}

        {viewingOffer && (
          <OfferLetterDialog
            letter={offerToLetter(viewingOffer)}
            onClose={() => setViewingOffer(null)}
          />
        )}

        <motion.div
          className="candidate-stat-strip"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
        >
          {candidateStats.map(
            ([value, title, Icon, note], index) => (
              <motion.div
                className="candidate-stat"
                key={title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + index * 0.07 }}
                whileHover={{ y: -4 }}
              >
                <span className="candidate-stat-icon">
                  <Icon size={19} />
                </span>

                <div>
                  <strong>{value}</strong>
                  <small>{title}</small>
                  <em>{note}</em>
                </div>
              </motion.div>
            )
          )}
        </motion.div>

        <div className="candidate-workspace">
          <div className="candidate-primary">
            {hasResume ? (
              <motion.section
                className="candidate-profile-boost profile-boost-v2"
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18, duration: 0.5 }}
              >
                <div className="profile-boost-v2-orb">
                  <div className="candidate-boost-orb">
                    <FileText size={26} />
                  </div>
                  <span className="profile-boost-v2-verified">
                    <CheckCircle2 size={14} />
                  </span>
                </div>

                <div className="profile-boost-v2-main">
                  <label>PROFILE BOOST</label>

                  <h2 className="profile-boost-v2-title">
                    Your resume is{" "}
                    <span className="profile-boost-v2-accent">
                      AI-ready
                    </span>
                    <Sparkles
                      size={17}
                      className="profile-boost-v2-sparkle"
                    />
                  </h2>

                  <p className="profile-boost-v2-sub">
                    Your skills and experience are ready to match
                    you with relevant job opportunities.
                  </p>

                  <div className="profile-boost-v2-file">
                    <span className="profile-boost-v2-file-icon">
                      <FileText size={14} />
                    </span>
                    <span
                      className="profile-boost-v2-file-name"
                      title={profileData.latestResume.fileName}
                    >
                      {profileData.latestResume.fileName}
                    </span>
                    <span className="profile-boost-v2-pill">
                      AI Matching Ready
                    </span>
                  </div>

                  <div className="profile-boost-v2-actions">
                    <label className="profile-boost-v2-replace">
                      <Upload size={15} />
                      {uploading ? "Uploading..." : "Replace Resume"}
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleResumeChange}
                        disabled={uploading}
                      />
                    </label>

                    <button
                      type="button"
                      className="profile-boost-v2-remove"
                      onClick={handleRemoveResume}
                      disabled={uploading || removing}
                    >
                      <Trash2 size={15} />
                      {removing ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>

                <div className="profile-boost-v2-flow">
                  {[
                    [FileText, "Resume Analyzed", true],
                    ["AI", "Skills Extracted", true],
                    [BriefcaseBusiness, "Relevant Job Matches", matches.length > 0],
                  ].map(([Icon, stepLabel, done], index) => (
                    <div className="profile-boost-v2-step-wrap" key={stepLabel}>
                      {index > 0 && (
                        <span className="profile-boost-v2-arrow" />
                      )}
                      <div
                        className={`profile-boost-v2-step${
                          done ? " done" : ""
                        }`}
                      >
                        <div
                          className={`profile-boost-v2-step-icon${
                            index === 2 ? " stacked" : ""
                          }`}
                        >
                          {Icon === "AI" ? (
                            <span className="profile-boost-v2-ai">AI</span>
                          ) : (
                            <Icon size={20} />
                          )}
                          <span className="profile-boost-v2-check">
                            {done && <CheckCircle2 size={13} />}
                          </span>
                        </div>
                        <small>{stepLabel}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            ) : (
              <motion.section
                className="candidate-profile-boost"
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18, duration: 0.5 }}
              >
                <div className="candidate-boost-orb">
                  <FileText size={26} />
                </div>

                <div className="candidate-boost-copy">
                  <label>PROFILE BOOST</label>

                  <h2>Complete your profile</h2>

                  <p>
                    Upload your resume to unlock stronger job
                    recommendations and improve your match quality.
                  </p>
                </div>

                <label className="candidate-outline-action">
                  <Upload size={16} />
                  {uploading ? "Uploading..." : "Upload"}
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleResumeChange}
                    disabled={uploading}
                  />
                </label>
              </motion.section>
            )}

            {hasResume && (
              <motion.section
                className="candidate-resume-insights resume-insight-section"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.5 }}
              >
                <div className="candidate-section-heading compact">
                  <div>
                    <label>EXTRACTED FROM YOUR RESUME</label>
                    <h2>Resume Insights</h2>
                  </div>
                  {!editingInsights && (
                    <button
                      type="button"
                      className="candidate-text-action resume-edit-toggle"
                      onClick={() => setEditingInsights(true)}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                  )}
                </div>

                {editingInsights ? (
                  <ResumeInsightsEditor
                    resume={profileData.latestResume}
                    onCancel={() => setEditingInsights(false)}
                    onSave={handleSaveInsights}
                  />
                ) : (
                <>
                <div className="candidate-resume-insights-grid resume-insight-grid">
                  <div className="candidate-resume-insight-block resume-insight-card">
                    <div className="resume-insight-head">
                      <span className="resume-insight-icon">
                        <Wrench size={18} />
                      </span>
                      <strong>Skills</strong>
                    </div>
                    {profileData.latestResume.parsedSkills?.length ? (
                      <div className="resume-insight-tags">
                        {profileData.latestResume.parsedSkills.map(
                          (skill, i) => (
                            <span key={i}>{skill}</span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="candidate-empty-state resume-insight-empty">
                        No recognizable skills found in this resume.
                      </p>
                    )}
                  </div>

                  <div className="candidate-resume-insight-block resume-insight-card">
                    <div className="resume-insight-head">
                      <span className="resume-insight-icon">
                        <BriefcaseBusiness size={18} />
                      </span>
                      <strong>Experience</strong>
                    </div>
                    {profileData.latestResume.experience?.length ? (
                      <ul className="resume-insight-rows">
                        {profileData.latestResume.experience.map(
                          (entry, i) => (
                            <li key={i}>
                              {entry.title && <b>{entry.title}</b>}
                              {(entry.company || entry.duration) && (
                                <small>
                                  {[entry.company, entry.duration]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </small>
                              )}
                              {entry.description && (
                                <p>{entry.description}</p>
                              )}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="candidate-empty-state resume-insight-empty">
                        No work experience detected.
                      </p>
                    )}
                  </div>

                  <div className="candidate-resume-insight-block resume-insight-card">
                    <div className="resume-insight-head">
                      <span className="resume-insight-icon">
                        <GraduationCap size={18} />
                      </span>
                      <strong>Education</strong>
                    </div>
                    {profileData.latestResume.education?.length ? (
                      <ul className="resume-insight-rows">
                        {profileData.latestResume.education.map(
                          (entry, i) => (
                            <li key={i}>
                              {entry.degree && <b>{entry.degree}</b>}
                              {(entry.institution || entry.year) && (
                                <small>
                                  {[entry.institution, entry.year]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </small>
                              )}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="candidate-empty-state resume-insight-empty">
                        No education details detected.
                      </p>
                    )}
                  </div>

                  <div className="candidate-resume-insight-block resume-insight-card">
                    <div className="resume-insight-head">
                      <span className="resume-insight-icon">
                        <Award size={18} />
                      </span>
                      <strong>Certifications</strong>
                    </div>
                    {profileData.latestResume.certifications?.length ? (
                      <ul className="resume-insight-rows">
                        {profileData.latestResume.certifications.map(
                          (line, i) => (
                            <li key={i}>
                              <b>{line}</b>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="candidate-empty-state resume-insight-empty">
                        No certifications detected.
                      </p>
                    )}
                  </div>
                </div>

                <p className="candidate-resume-insights-note resume-insight-note">
                  Extracted automatically from your uploaded resume —
                  double-check for accuracy, especially on unusually
                  formatted documents.
                </p>
                </>
                )}
              </motion.section>
            )}

            <motion.section
              className="candidate-matches"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              <div className="candidate-section-heading">
                <div>
                  <label>AI MATCHES</label>
                  <h2>Recommended for You</h2>
                  <p>
                    Opportunities ranked around
                    your skills and experience.
                  </p>
                </div>

                <Link to="/jobs">
                  View all <ArrowRight size={16} />
                </Link>
              </div>

              <div className="candidate-job-list">
                {loading ? (
                  <p className="candidate-empty-state">
                    Loading recommendations…
                  </p>
                ) : !hasResume ? (
                  <p className="candidate-empty-state">
                    Upload your resume to get AI-matched
                    job recommendations.
                  </p>
                ) : matches.length === 0 ? (
                  <p className="candidate-empty-state">
                    No matching jobs yet — check back soon.
                  </p>
                ) : (
                  matches.slice(0, 4).map(
                    ({ job, matchScore }, index) => (
                      <motion.div
                        className="candidate-job-item"
                        key={job._id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.32 + index * 0.08,
                        }}
                        whileHover={{ x: 5 }}
                      >
                        <div className="candidate-company-mark">
                          {job.company?.[0]}
                        </div>

                        <div className="candidate-job-info">
                          <strong>{job.title}</strong>

                          <span>
                            {job.company} · {job.location}
                          </span>

                          <small>
                            {(job.requiredSkills || []).join(
                              " · "
                            )}
                          </small>
                        </div>

                        <div className="candidate-job-match">
                          <b>{matchScore}%</b>
                          <span>match</span>
                        </div>

                        <Link
                          className="candidate-job-arrow"
                          to={`/jobs/${job._id}`}
                        >
                          <ChevronRight size={19} />
                        </Link>
                      </motion.div>
                    )
                  )
                )}
              </div>
            </motion.section>
          </div>

          <aside className="candidate-sidebar">
            <motion.section
              className="candidate-profile-card"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="candidate-profile-top">
                <div className="candidate-avatar-large">
                  {initials}
                </div>

                <div>
                  <label>PROFILE</label>
                  <h3>{candidateName}</h3>
                </div>

                <strong>{completion}%</strong>
              </div>

              <div className="candidate-progress">
                <motion.i
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{
                    delay: 0.55,
                    duration: 0.9,
                    ease: "easeOut",
                  }}
                />
              </div>

              <p>
                Add certifications and experience
                to improve your match quality.
              </p>

              <div className="candidate-profile-items">
                <span>
                  {hasResume ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <Clock3 size={15} />
                  )}
                  Resume uploaded
                </span>

                <span>
                  {profileData?.latestResume?.parsedSkills?.length ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <Clock3 size={15} />
                  )}
                  Skills added
                </span>

                <span>
                  {profileData?.latestResume?.certifications?.length ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <Clock3 size={15} />
                  )}
                  Certifications
                </span>
              </div>

              <button className="candidate-text-action">
                Complete profile
                <ArrowRight size={16} />
              </button>
            </motion.section>

            <motion.section
              className="candidate-journey-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.5 }}
            >
              <div className="candidate-section-heading compact">
                <div>
                  <label>YOUR JOURNEY</label>
                  <h2>Application progress</h2>
                </div>
              </div>

              <div className="candidate-timeline">
                {applicationSteps.map(
                  ([title, count, text, state], index) => (
                    <div
                      className={`candidate-timeline-step ${state}`}
                      key={title}
                    >
                      <span className="timeline-dot">
                        {index + 1}
                      </span>

                      <div>
                        <strong>{title}</strong>
                        <small>
                          {count} · {text}
                        </small>
                      </div>
                    </div>
                  )
                )}
              </div>
            </motion.section>
          </aside>
        </div>

        <motion.div
          className="candidate-ai-note"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.5 }}
        >
          <div className="candidate-ai-spark">
            <Sparkles size={18} />
          </div>

          <div>
            <strong>AI Career Tip</strong>
            <span>
              Adding one more certification could
              improve your profile strength and unlock
              better matches.
            </span>
          </div>

          <ArrowRight size={18} />
        </motion.div>
      </div>
    </main>
  );
}

/* =========================================================
   CANDIDATE PAGES — shared helpers
========================================================= */

function isCandidateRole(auth) {
  return (auth?.role || "").toLowerCase() === "candidate";
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

// The Job model has no separate work-mode field, so derive it from
// the job type ("remote") and the free-text location.
function jobWorkMode(job) {
  const text = `${job.type || ""} ${job.location || ""}`.toLowerCase();
  if (text.includes("remote")) return "Remote";
  if (text.includes("hybrid")) return "Hybrid";
  return "On-site";
}

function workTypeLabel(job) {
  const type = capitalize(job.type || "full-time");
  const mode = jobWorkMode(job);
  return type.toLowerCase() === mode.toLowerCase() ? mode : `${type} · ${mode}`;
}

function experienceLabel(years) {
  return years ? `${years}+ yrs experience` : "Fresher friendly";
}

// salaryRange is free text like "8-12 LPA"; use its largest number.
function salaryUpperLpa(salaryRange) {
  const numbers = (salaryRange || "").match(/\d+(\.\d+)?/g);
  return numbers ? Math.max(...numbers.map(Number)) : null;
}

// Share of the candidate's profile that's filled in, 0–100 (all items weighted equally).
function profileCompletion(profile, latestResume) {
  const has = (value) => Boolean(value && String(value).trim());
  const items = [
    Boolean(latestResume),
    Boolean(latestResume?.parsedSkills?.length),
    has(profile?.title),
    has(profile?.phone),
    has(profile?.location),
    has(profile?.linkedin),
    has(profile?.github),
    has(profile?.about),
  ];
  return Math.round((items.filter(Boolean).length / items.length) * 100);
}

function initialsOf(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Saved/applied state shared by the candidate Jobs and Job Details pages.
function useCandidateJobActions(token) {
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [busyJobId, setBusyJobId] = useState(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    Promise.all([getSavedJobs(token), getApplications(token)])
      .then(([savedResult, applicationsResult]) => {
        if (cancelled) return;
        setSavedJobs(savedResult.savedJobs || []);
        setAppliedJobIds(
          new Set(
            (applicationsResult.applications || [])
              .map((a) => a.job?._id)
              .filter(Boolean)
          )
        );
      })
      .catch((err) => {
        console.error("[useCandidateJobActions]", err);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const savedJobIds = new Set(savedJobs.map((entry) => entry.job._id));

  async function toggleSave(job) {
    setBusyJobId(job._id);
    try {
      if (savedJobIds.has(job._id)) {
        await unsaveJob(job._id, token);
      } else {
        await saveJob(job._id, token);
      }
      const result = await getSavedJobs(token);
      setSavedJobs(result.savedJobs || []);
    } catch (err) {
      alert(err.message || "Could not update saved jobs.");
    } finally {
      setBusyJobId(null);
    }
  }

  async function apply(job) {
    setBusyJobId(job._id);
    try {
      await applyToJob(job._id, token);
      setAppliedJobIds((prev) => new Set(prev).add(job._id));
    } catch (err) {
      alert(err.message || "Could not submit application.");
    } finally {
      setBusyJobId(null);
    }
  }

  return { savedJobs, savedJobIds, appliedJobIds, busyJobId, toggleSave, apply };
}

function CandidateJobCard({
  job,
  matchScore,
  savedAt,
  saved,
  applied,
  busy,
  onToggleSave,
  onApply,
}) {
  const closed = job.status === "closed";

  return (
    <article className="cp-job-card">
      <div className="cp-job-card-top">
        <div className="candidate-company-mark">{job.company?.[0]}</div>

        <div className="cp-job-card-heading">
          <Link to={`/jobs/${job._id}`}>{job.title}</Link>
          <span>{job.company}</span>
        </div>

        {matchScore !== undefined && (
          <span className="cp-match">{matchScore}% match</span>
        )}

        <button
          type="button"
          className={`cp-save-btn${saved ? " saved" : ""}`}
          onClick={() => onToggleSave(job)}
          disabled={busy}
          title={saved ? "Remove from saved jobs" : "Save job"}
          aria-label={saved ? "Remove from saved jobs" : "Save job"}
        >
          {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
        </button>
      </div>

      <div className="cp-job-meta">
        {job.location && (
          <span>
            <MapPin size={13} /> {job.location}
          </span>
        )}
        <span>
          <BriefcaseBusiness size={13} /> {workTypeLabel(job)}
        </span>
        {job.salaryRange && <span>{job.salaryRange}</span>}
        <span>
          <Clock3 size={13} /> {experienceLabel(job.experienceRequired)}
        </span>
      </div>

      {job.requiredSkills?.length > 0 && (
        <div className="skills cp-skills">
          {job.requiredSkills.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      )}

      <div className="cp-job-card-foot">
        <small>
          Posted {formatDate(job.createdAt)}
          {savedAt && ` · Saved ${formatDate(savedAt)}`}
        </small>

        <button
          type="button"
          className="btn small"
          onClick={() => onApply(job)}
          disabled={applied || busy || closed}
        >
          {applied ? "Applied" : closed ? "Closed" : "Apply"}
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   CANDIDATE — JOBS
========================================================= */

const DEFAULT_JOB_FILTERS = {
  type: "all",
  workMode: "all",
  experience: "all",
  minSalary: "0",
  location: "",
  skill: "",
};

const EXPERIENCE_FILTERS = [
  ["all", "Any experience"],
  ["0-1", "Fresher (0–1 yrs)"],
  ["1-3", "1–3 yrs"],
  ["3-5", "3–5 yrs"],
  ["5+", "5+ yrs"],
];

const SALARY_FILTERS = [
  ["0", "Any salary"],
  ["3", "3+ LPA"],
  ["6", "6+ LPA"],
  ["10", "10+ LPA"],
  ["15", "15+ LPA"],
];

function matchesExperience(years, bucket) {
  switch (bucket) {
    case "0-1":
      return years <= 1;
    case "1-3":
      return years >= 1 && years <= 3;
    case "3-5":
      return years >= 3 && years <= 5;
    case "5+":
      return years >= 5;
    default:
      return true;
  }
}

// Candidate-facing jobs page (rendered at /jobs for candidates).
function CandidateJobs() {
  const auth = getAuth();
  const token = auth?.token;
  const [searchParams] = useSearchParams();

  // Keep the navbar's /jobs?q=... links working for candidates too.
  const urlQuery =
    searchParams.get("view") === "all" ? "" : searchParams.get("q") || "";

  const [allJobs, setAllJobs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [hasResume, setHasResume] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [tab, setTab] = useState("all");
  const [queryInput, setQueryInput] = useState(urlQuery);
  const [locationInput, setLocationInput] = useState("");
  const [search, setSearch] = useState({ query: urlQuery, location: "" });
  const [filters, setFilters] = useState(DEFAULT_JOB_FILTERS);
  const [sortBy, setSortBy] = useState("newest");

  const { savedJobs, savedJobIds, appliedJobIds, busyJobId, toggleSave, apply } =
    useCandidateJobActions(token);

  useEffect(() => {
    setQueryInput(urlQuery);
    setSearch((prev) => ({ ...prev, query: urlQuery }));
  }, [urlQuery]);

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      setLoading(true);
      setLoadError("");

      try {
        const [jobsResult, profileResult] = await Promise.all([
          getJobs(),
          getProfile(token),
        ]);
        if (cancelled) return;

        setAllJobs(jobsResult.jobs || []);
        setHasResume(Boolean(profileResult.latestResume));

        if (profileResult.latestResume) {
          const matchesResult = await getMatches(token);
          if (!cancelled) setMatches(matchesResult.matches || []);
        } else {
          setMatches([]);
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message || "Could not load jobs.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const matchScores = new Map(
    matches.map(({ job, matchScore }) => [job._id, matchScore])
  );

  function matchesSearch(job) {
    const query = search.query.trim().toLowerCase();
    const location = search.location.trim().toLowerCase();

    if (query) {
      const text = [job.title, job.company, ...(job.requiredSkills || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!text.includes(query)) return false;
    }

    if (location && !(job.location || "").toLowerCase().includes(location)) {
      return false;
    }

    return true;
  }

  function matchesFilters(job) {
    if (filters.type !== "all" && job.type !== filters.type) return false;
    if (filters.workMode !== "all" && jobWorkMode(job) !== filters.workMode) {
      return false;
    }
    if (!matchesExperience(job.experienceRequired || 0, filters.experience)) {
      return false;
    }

    const minSalary = Number(filters.minSalary);
    if (minSalary) {
      const upper = salaryUpperLpa(job.salaryRange);
      if (upper === null || upper < minSalary) return false;
    }

    const location = filters.location.trim().toLowerCase();
    if (location && !(job.location || "").toLowerCase().includes(location)) {
      return false;
    }

    const skill = filters.skill.trim().toLowerCase();
    if (
      skill &&
      !(job.requiredSkills || []).some((s) => s.toLowerCase().includes(skill))
    ) {
      return false;
    }

    return true;
  }

  const sorters = {
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    title: (a, b) => a.title.localeCompare(b.title),
    match: (a, b) =>
      (matchScores.get(b._id) || 0) - (matchScores.get(a._id) || 0),
  };

  const recommended = matches.filter(
    (m) => m.matchScore > 0 && matchesSearch(m.job)
  );
  const browseJobs = allJobs
    .filter((job) => matchesSearch(job) && matchesFilters(job))
    .sort(sorters[sortBy] || sorters.newest);
  const savedShown = savedJobs.filter((entry) => matchesSearch(entry.job));

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const renderCard = (job, extra = {}) => (
    <CandidateJobCard
      key={job._id}
      job={job}
      matchScore={hasResume ? matchScores.get(job._id) : undefined}
      saved={savedJobIds.has(job._id)}
      applied={appliedJobIds.has(job._id)}
      busy={busyJobId === job._id}
      onToggleSave={toggleSave}
      onApply={apply}
      {...extra}
    />
  );

  const recommendedEmpty = !hasResume ? (
    <p className="candidate-empty-state">
      <Link to="/">Upload your resume</Link> to get AI-matched job
      recommendations.
    </p>
  ) : (
    <p className="candidate-empty-state">
      No jobs match your skills yet{search.query || search.location ? " for this search" : ""}
      {" "}— check back soon.
    </p>
  );

  return (
    <DashboardLayout role="Candidate">
      <div className="candidate-space cp-page">
        <div className="cp-page-head">
          <div>
            <label>JOBS</label>
            <h1>Find your next role</h1>
            <p>Search open roles, save the ones you like and apply in one click.</p>
          </div>
        </div>

        <form
          className="cp-card cp-search"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch({ query: queryInput, location: locationInput });
          }}
        >
          <div className="cp-search-field">
            <Search size={17} />
            <input
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Job title, skills or company"
            />
          </div>

          <div className="cp-search-field">
            <MapPin size={17} />
            <input
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Location"
            />
          </div>

          <button type="submit" className="btn small">
            <Search size={16} /> Search
          </button>
        </form>

        <div className="cp-tabs" role="tablist">
          {[
            ["all", "All Jobs", allJobs.length],
            ["recommended", "Recommended", recommended.length],
            ["saved", "Saved", savedJobs.length],
          ].map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={tab === key ? "active" : ""}
              onClick={() => setTab(key)}
            >
              {label}
              <span>{count}</span>
            </button>
          ))}
        </div>

        {loadError && <p className="candidate-load-error">{loadError}</p>}

        {loading ? (
          <p className="candidate-empty-state">Loading jobs…</p>
        ) : tab === "recommended" ? (
          <section>
            <div className="cp-section-head">
              <div>
                <label>AI MATCHES</label>
                <h2>Recommended for You</h2>
              </div>
            </div>
            {recommended.length ? (
              <div className="cp-job-grid">
                {recommended.map(({ job }) => renderCard(job))}
              </div>
            ) : (
              recommendedEmpty
            )}
          </section>
        ) : tab === "saved" ? (
          <section>
            <div className="cp-section-head">
              <div>
                <label>BOOKMARKED</label>
                <h2>Saved Jobs</h2>
              </div>
            </div>
            {savedShown.length ? (
              <div className="cp-job-grid">
                {savedShown.map((entry) =>
                  renderCard(entry.job, { savedAt: entry.savedAt })
                )}
              </div>
            ) : (
              <p className="candidate-empty-state">
                {savedJobs.length
                  ? "No saved jobs match this search."
                  : "You haven't saved any jobs yet — use the bookmark icon on a job to save it."}
              </p>
            )}
          </section>
        ) : (
          <>
            <section className="cp-block">
              <div className="cp-section-head">
                <div>
                  <label>AI MATCHES</label>
                  <h2>Recommended for You</h2>
                </div>
                {recommended.length > 3 && (
                  <button
                    type="button"
                    className="candidate-text-action"
                    onClick={() => setTab("recommended")}
                  >
                    View all {recommended.length} <ArrowRight size={15} />
                  </button>
                )}
              </div>
              {recommended.length ? (
                <div className="cp-job-grid">
                  {recommended.slice(0, 3).map(({ job }) => renderCard(job))}
                </div>
              ) : (
                recommendedEmpty
              )}
            </section>

            <section className="cp-block">
              <div className="cp-section-head">
                <div>
                  <label>ALL OPENINGS</label>
                  <h2>Browse All Jobs</h2>
                </div>
              </div>

              <div className="cp-browse">
                <aside className="cp-card cp-filters">
                  <div className="cp-filters-head">
                    <strong>
                      <SlidersHorizontal size={15} /> Filters
                    </strong>
                    <button
                      type="button"
                      onClick={() => setFilters(DEFAULT_JOB_FILTERS)}
                    >
                      Clear
                    </button>
                  </div>

                  <label>
                    Job type
                    <select
                      value={filters.type}
                      onChange={(e) => updateFilter("type", e.target.value)}
                    >
                      <option value="all">All types</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="internship">Internship</option>
                      <option value="contract">Contract</option>
                      <option value="remote">Remote</option>
                    </select>
                  </label>

                  <label>
                    Work mode
                    <select
                      value={filters.workMode}
                      onChange={(e) => updateFilter("workMode", e.target.value)}
                    >
                      <option value="all">Any</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </label>

                  <label>
                    Experience level
                    <select
                      value={filters.experience}
                      onChange={(e) => updateFilter("experience", e.target.value)}
                    >
                      {EXPERIENCE_FILTERS.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Salary range
                    <select
                      value={filters.minSalary}
                      onChange={(e) => updateFilter("minSalary", e.target.value)}
                    >
                      {SALARY_FILTERS.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Location
                    <input
                      value={filters.location}
                      onChange={(e) => updateFilter("location", e.target.value)}
                      placeholder="e.g. Bengaluru"
                    />
                  </label>

                  <label>
                    Skills
                    <input
                      value={filters.skill}
                      onChange={(e) => updateFilter("skill", e.target.value)}
                      placeholder="e.g. React"
                    />
                  </label>
                </aside>

                <div className="cp-results">
                  <div className="cp-results-head">
                    <span>
                      {browseJobs.length}{" "}
                      {browseJobs.length === 1 ? "job" : "jobs"} found
                    </span>

                    <label>
                      Sort by
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="title">Title (A–Z)</option>
                        {hasResume && <option value="match">Best match</option>}
                      </select>
                    </label>
                  </div>

                  {browseJobs.length ? (
                    <div className="cp-job-list">
                      {browseJobs.map((job) => renderCard(job))}
                    </div>
                  ) : (
                    <p className="candidate-empty-state">
                      No jobs match these filters. Try clearing a few.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// /jobs shows the candidate dashboard version to candidates and the
// existing jobs page to everyone else.
function JobsRoute() {
  return isCandidateRole(getAuth()) ? <CandidateJobs /> : <Jobs />;
}

/* =========================================================
   CANDIDATE — APPLICATIONS
========================================================= */

const APPLICATION_STATUS_LABELS = {
  applied: "Applied",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  interview: "Interview",
  rejected: "Rejected",
  hired: "🎉 Hired",
};

const APPLICATION_STAGES = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Final Decision",
];

const APPLICATION_STAGE_INDEX = {
  applied: 0,
  under_review: 1,
  shortlisted: 2,
  interview: 3,
  rejected: 4,
  hired: 4,
};

function StatusChip({ status, labels }) {
  return (
    <span className={`cp-status cp-status-${status}`}>
      {labels[status] || capitalize(status)}
    </span>
  );
}

function CandidateApplications() {
  const auth = getAuth();
  const token = auth?.token;
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("id");

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all");
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadApplications() {
      setLoading(true);
      setLoadError("");
      try {
        const result = await getApplications(token);
        if (!cancelled) setApplications(result.applications || []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message || "Could not load your applications.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const countOf = (status) =>
    applications.filter((a) => a.status === status).length;

  const summary = [
    [applications.length, "Applications", FileText],
    [countOf("under_review"), "Under Review", Clock3],
    [countOf("interview"), "Interviews", CalendarDays],
    [countOf("hired"), "Selected", Award],
  ];

  const filterTabs = [
    ["all", "All"],
    ["under_review", "Under Review"],
    ["shortlisted", "Shortlisted"],
    ["interview", "Interview"],
    ["rejected", "Rejected"],
  ];

  const shown =
    filter === "all"
      ? applications
      : applications.filter((a) => a.status === filter);

  const selected = selectedId
    ? applications.find((a) => a._id === selectedId)
    : null;

  const openApplication = (id) => setSearchParams({ id });
  const closeApplication = () => setSearchParams({});

  async function handleWithdraw(application) {
    if (
      !window.confirm(
        `Withdraw your application for ${
          application.job?.title || "this job"
        }? This can't be undone.`
      )
    ) {
      return;
    }

    setWithdrawing(true);
    try {
      await withdrawApplication(application._id, token);
      setApplications((prev) => prev.filter((a) => a._id !== application._id));
      closeApplication();
    } catch (err) {
      alert(err.message || "Could not withdraw application.");
    } finally {
      setWithdrawing(false);
    }
  }

  let content;

  if (loading) {
    content = <p className="candidate-empty-state">Loading applications…</p>;
  } else if (selectedId) {
    content = !selected ? (
      <div className="cp-card cp-empty">
        <h3>Application not found</h3>
        <p>It may have been withdrawn.</p>
      </div>
    ) : (
      <ApplicationDetail
        application={selected}
        withdrawing={withdrawing}
        onWithdraw={() => handleWithdraw(selected)}
      />
    );
  } else {
    content = (
      <>
        <div className="candidate-stat-strip">
          {summary.map(([value, title, Icon]) => (
            <div className="candidate-stat" key={title}>
              <span className="candidate-stat-icon">
                <Icon size={19} />
              </span>
              <div>
                <strong>{value}</strong>
                <small>{title}</small>
              </div>
            </div>
          ))}
        </div>

        <div className="cp-tabs" role="tablist">
          {filterTabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={filter === key ? "active" : ""}
              onClick={() => setFilter(key)}
            >
              {label}
              <span>
                {key === "all" ? applications.length : countOf(key)}
              </span>
            </button>
          ))}
        </div>

        {shown.length ? (
          <div className="cp-list">
            {shown.map((application) => (
              <article className="cp-card cp-list-item" key={application._id}>
                <div className="candidate-company-mark">
                  {application.job?.company?.[0] || "?"}
                </div>

                <div className="cp-list-main">
                  <strong>{application.job?.title || "Job no longer available"}</strong>
                  <span>
                    {[
                      application.job?.company,
                      application.job?.location,
                      application.job && capitalize(application.job.type),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  <small>Applied on {formatDate(application.createdAt)}</small>
                </div>

                <StatusChip
                  status={application.status}
                  labels={APPLICATION_STATUS_LABELS}
                />

                <button
                  type="button"
                  className="btn small btn-outline"
                  onClick={() => openApplication(application._id)}
                >
                  View Application
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="cp-card cp-empty">
            <h3>
              {applications.length
                ? "No applications with this status"
                : "You haven't applied to any jobs yet"}
            </h3>
            {!applications.length && (
              <Link className="btn small" to="/jobs">
                Browse jobs
              </Link>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <DashboardLayout role="Candidate">
      <div className="candidate-space cp-page">
        {selectedId ? (
          <button type="button" className="cp-back" onClick={closeApplication}>
            <ArrowLeft size={16} /> Back to applications
          </button>
        ) : (
          <div className="cp-page-head">
            <div>
              <label>APPLICATIONS</label>
              <h1>Your applications</h1>
              <p>Track every role you've applied to and where it stands.</p>
            </div>
          </div>
        )}

        {loadError && <p className="candidate-load-error">{loadError}</p>}
        {content}
      </div>
    </DashboardLayout>
  );
}

function ApplicationDetail({ application, withdrawing, onWithdraw }) {
  const { job, resume, status } = application;
  const currentStage = APPLICATION_STAGE_INDEX[status] ?? 0;
  const finalLabel =
    status === "hired" ? "Selected" : status === "rejected" ? "Not selected" : null;
  const resumeUrl = resume ? resumeFileUrl(resume.filePath) : null;

  const [offer, setOffer] = useState(null);
  const [viewingOffer, setViewingOffer] = useState(false);

  useEffect(() => {
    setOffer(null);
    if (status !== "hired") return;
    let cancelled = false;
    getOfferForApplication(application._id, getAuth()?.token)
      .then((result) => {
        if (!cancelled) setOffer(result.offer || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [application._id, status]);

  return (
    <>
      <section className="cp-card cp-detail-head">
        <div className="cp-detail-title">
          <div className="candidate-company-mark cp-mark-lg">
            {job?.company?.[0] || "?"}
          </div>

          <div>
            <label>APPLICATION</label>
            <h1>{job?.title || "Job no longer available"}</h1>
            {job && (
              <p>
                <Building2 size={14} /> {job.company}
                {job.location && (
                  <>
                    {" · "}
                    <MapPin size={14} /> {job.location}
                  </>
                )}
                {job.type && ` · ${capitalize(job.type)}`}
              </p>
            )}
          </div>

          <StatusChip status={status} labels={APPLICATION_STATUS_LABELS} />
        </div>

        <div className="cp-chips">
          <span>Applied {formatDate(application.createdAt)}</span>
          <span>Last updated {formatDate(application.updatedAt)}</span>
          {job && (
            <Link to={`/jobs/${job._id}`} className="cp-chip-link">
              View job <ExternalLink size={13} />
            </Link>
          )}
        </div>
      </section>

      <section className="cp-card">
        <h2 className="cp-section-title">Application progress</h2>
        <ol className="cp-stages">
          {APPLICATION_STAGES.map((label, index) => {
            const state =
              index < currentStage
                ? "done"
                : index === currentStage
                ? status === "rejected"
                  ? "current rejected"
                  : "current"
                : "";
            return (
              <li key={label} className={`cp-stage ${state}`}>
                <span className="cp-stage-dot">
                  {index < currentStage ? <CheckCircle2 size={15} /> : index + 1}
                </span>
                <strong>{label}</strong>
                {index === 4 && finalLabel && <small>{finalLabel}</small>}
              </li>
            );
          })}
        </ol>
      </section>

      {status === "hired" && offer && (
        <section className="cp-card offer-hired">
          <h2 className="cp-section-title">🎉 You're Hired!</h2>
          <p>
            Congratulations! You've been selected for the role of{" "}
            <strong>{offer.position}</strong> at <strong>{offer.company}</strong>. Your
            offer letter is ready.
          </p>
          <div className="offer-sent-actions">
            <button type="button" className="btn small" onClick={() => setViewingOffer(true)}>
              View Offer Letter
            </button>
            <button
              type="button"
              className="btn small btn-outline"
              onClick={() => downloadOfferLetter(offerToLetter(offer))}
            >
              Download Offer Letter
            </button>
          </div>
          {viewingOffer && (
            <OfferLetterDialog letter={offerToLetter(offer)} onClose={() => setViewingOffer(false)} />
          )}
        </section>
      )}

      <section className="cp-card">
        <h2 className="cp-section-title">Resume submitted</h2>
        {resume ? (
          <div className="cp-file-row">
            <span className="profile-boost-v2-file-icon">
              <FileText size={14} />
            </span>
            <span className="cp-file-name">{resume.fileName}</span>
            {resumeUrl && (
              <a
                className="candidate-text-action cp-inline-link"
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
              >
                View Resume <ExternalLink size={13} />
              </a>
            )}
          </div>
        ) : resume === null ? (
          // Populate returns null when the linked resume was later deleted
          <p className="candidate-empty-state">
            The resume sent with this application has since been replaced or
            removed, so it can't be shown here.
          </p>
        ) : (
          <p className="candidate-empty-state">
            No resume was attached — you applied before uploading one.
          </p>
        )}
      </section>

      <div className="cp-danger-row">
        <button
          type="button"
          className="cp-danger-btn"
          onClick={onWithdraw}
          disabled={withdrawing}
        >
          <Trash2 size={15} />
          {withdrawing ? "Withdrawing..." : "Withdraw Application"}
        </button>
      </div>
    </>
  );
}

/* =========================================================
   OFFER LETTERS — shared by recruiter and candidate views
========================================================= */

const EMPLOYMENT_TYPE_LABELS = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  internship: "Internship",
  contract: "Contract",
  remote: "Remote",
};

function employmentTypeLabel(value) {
  return EMPLOYMENT_TYPE_LABELS[value] || capitalize(value);
}

// A saved OfferLetter → the plain values the letter view renders.
function offerToLetter(offer) {
  return {
    company: offer.company,
    position: offer.position,
    candidateName: offer.candidate?.name || "Candidate",
    workLocation: offer.workLocation,
    employmentType: offer.employmentType,
    joiningDate: offer.joiningDate,
    salary: offer.salary,
    reportingTo: offer.reportingTo,
    offerExpiry: offer.offerExpiry,
    additionalTerms: offer.additionalTerms,
    recruiterName: offer.recruiter?.name || "Hiring Team",
    issuedOn: offer.createdAt,
  };
}

function offerLetterDetails(letter) {
  return [
    ["Position", letter.position],
    ["Work Location", letter.workLocation],
    ["Employment Type", employmentTypeLabel(letter.employmentType)],
    ["Joining Date", formatDate(letter.joiningDate)],
    ["Salary / Stipend", letter.salary],
    ["Reporting To", letter.reportingTo],
  ].filter(([, value]) => value);
}

function offerLetterIntro(letter) {
  return `We are delighted to offer you the position of ${letter.position} at ${letter.company}. After reviewing your application and interviews, we are confident you will be a great addition to our team. The key terms of your employment are summarised below.`;
}

function offerLetterAcceptance(letter) {
  return letter.offerExpiry
    ? `Please confirm your acceptance of this offer on or before ${formatDate(letter.offerExpiry)}, after which it will lapse.`
    : "Please confirm your acceptance of this offer at your earliest convenience.";
}

// Same content as <OfferLetterView>, laid out as an A4 PDF for the download.
function offerLetterPdf(letter) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const width = pageWidth - margin * 2;
  let y = margin;

  const setFont = (size, style = "normal") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    return size * 0.3528 * 1.5; // line height in mm (pt → mm, 1.5 spacing)
  };
  const ensureSpace = (height) => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };
  // Wrapped paragraph; flows onto a new page when it reaches the bottom margin.
  const write = (text, { size = 11, style = "normal", align = "left", gap = 4 } = {}) => {
    const lineHeight = setFont(size, style);
    const x = align === "center" ? pageWidth / 2 : align === "right" ? pageWidth - margin : margin;
    for (const line of doc.splitTextToSize(String(text), width)) {
      ensureSpace(lineHeight);
      doc.text(line, x, y, { align, baseline: "top" });
      y += lineHeight;
    }
    y += gap;
  };

  write(letter.company.toUpperCase(), { size: 18, style: "bold", align: "center", gap: 2 });
  write("OFFER LETTER", { size: 13, style: "bold", align: "center", gap: 3 });
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;
  write(`Date: ${formatDate(letter.issuedOn)}`, { size: 10, align: "right", gap: 6 });

  write(`Dear ${letter.candidateName},`);
  write(offerLetterIntro(letter));

  for (const [label, value] of offerLetterDetails(letter)) {
    const lineHeight = setFont(11, "bold");
    const labelText = `${label}:`;
    const labelWidth = doc.getTextWidth(labelText) + 2;
    setFont(11);
    doc.splitTextToSize(String(value), width - labelWidth).forEach((line, i) => {
      ensureSpace(lineHeight);
      if (i === 0) {
        setFont(11, "bold");
        doc.text(labelText, margin, y, { baseline: "top" });
        setFont(11);
      }
      doc.text(line, margin + labelWidth, y, { baseline: "top" });
      y += lineHeight;
    });
  }
  y += 4;

  if (letter.additionalTerms) {
    write("Additional Terms:", { style: "bold", gap: 1 });
    write(letter.additionalTerms);
  }

  write(offerLetterAcceptance(letter));
  write("We look forward to welcoming you to the team.", { gap: 10 });

  write("Sincerely,", { gap: 1 });
  write(letter.recruiterName, { style: "bold", gap: 0 });
  write(letter.company, { gap: 0 });

  return doc;
}

function downloadOfferLetter(letter) {
  const slug = `${letter.company}-${letter.position}`.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  offerLetterPdf(letter).save(`Offer-Letter-${slug || "HireHub"}.pdf`);
}

function OfferLetterView({ letter }) {
  return (
    <article className="offer-letter">
      <header className="offer-letter-head">
        <strong>{letter.company}</strong>
        <h2>OFFER LETTER</h2>
        <span>Date: {formatDate(letter.issuedOn)}</span>
      </header>

      <p>Dear {letter.candidateName},</p>
      <p>{offerLetterIntro(letter)}</p>

      <dl className="offer-letter-terms">
        {offerLetterDetails(letter).map(([label, value]) => (
          <React.Fragment key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </React.Fragment>
        ))}
      </dl>

      {letter.additionalTerms && (
        <>
          <h3>Additional Terms</h3>
          <p className="offer-letter-terms-text">{letter.additionalTerms}</p>
        </>
      )}

      <p>{offerLetterAcceptance(letter)}</p>
      <p>We look forward to welcoming you to the team.</p>

      <p className="offer-letter-sign">
        Sincerely,
        <br />
        <strong>{letter.recruiterName}</strong>
        <br />
        {letter.company}
      </p>
    </article>
  );
}

// Rendered into <body> so animated (transformed) ancestors can't clip it.
function OfferModal({ title, onClose, children, footer }) {
  return createPortal(
    <div className="offer-overlay" onClick={onClose}>
      <div
        className="offer-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="offer-modal-head">
          <h2>{title}</h2>
          <button type="button" className="offer-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="offer-modal-body">{children}</div>
        {footer && <div className="offer-modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

// Read-only letter with a download action — used by both recruiter and candidate.
function OfferLetterDialog({ letter, onClose }) {
  return (
    <OfferModal
      title="Offer Letter"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn small btn-outline" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn small" onClick={() => downloadOfferLetter(letter)}>
            <FileText size={15} /> Download
          </button>
        </>
      }
    >
      <OfferLetterView letter={letter} />
    </OfferModal>
  );
}

/* =========================================================
   CANDIDATE — INTERVIEWS
========================================================= */

const INTERVIEW_STATUS_LABELS = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

const INTERVIEW_MODE_LABELS = {
  online: "Online",
  "in-person": "In person",
  phone: "Phone call",
};

const INTERVIEW_MODE_ICONS = {
  online: Video,
  "in-person": Building2,
  phone: Phone,
};

// Fixed, generic tips — the same for every interview.
const INTERVIEW_PREP_TIPS = [
  "Re-read the job description and note how your skills and projects line up with each requirement.",
  "Prepare two or three short examples of work you've done — what the problem was, what you did, and the result.",
  "Keep a copy of your resume handy and have a couple of questions ready to ask the interviewer.",
];

function interviewModeNote(interview) {
  if (interview.mode === "in-person") {
    return interview.location || "Location will be shared by the recruiter.";
  }
  if (interview.mode === "phone") {
    return "The recruiter will call you at the scheduled time.";
  }
  return "HireHub doesn't host video calls — the recruiter will share the meeting link with you directly.";
}

function InterviewCalendar({ interviews, onSelect }) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingBlanks = month.getDay();
  const today = new Date();

  const byDay = new Map();
  interviews.forEach((interview) => {
    const date = new Date(interview.scheduledAt);
    if (date.getFullYear() === year && date.getMonth() === monthIndex) {
      const day = date.getDate();
      byDay.set(day, [...(byDay.get(day) || []), interview]);
    }
  });

  const cells = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <section className="cp-card cp-calendar">
      <div className="cp-calendar-head">
        <button
          type="button"
          onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}
          aria-label="Previous month"
        >
          <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />
        </button>
        <strong>
          {month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </strong>
        <button
          type="button"
          onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="cp-calendar-grid">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="cp-calendar-dow">
            {d}
          </span>
        ))}

        {cells.map((day, i) => {
          if (!day) return <span key={`blank-${i}`} />;

          const dayInterviews = byDay.get(day);
          const isToday =
            today.getFullYear() === year &&
            today.getMonth() === monthIndex &&
            today.getDate() === day;

          return dayInterviews ? (
            <button
              key={day}
              type="button"
              className={`cp-calendar-day marked${isToday ? " today" : ""}`}
              onClick={() => onSelect(dayInterviews[0]._id)}
              title={dayInterviews
                .map((iv) => `${iv.job?.title || "Interview"} · ${formatTime(iv.scheduledAt)}`)
                .join("\n")}
            >
              {day}
            </button>
          ) : (
            <span
              key={day}
              className={`cp-calendar-day${isToday ? " today" : ""}`}
            >
              {day}
            </span>
          );
        })}
      </div>
    </section>
  );
}

function CandidateInterviews() {
  const auth = getAuth();
  const token = auth?.token;
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("id");

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadInterviews() {
      setLoading(true);
      setLoadError("");
      try {
        const result = await getInterviews(token);
        if (!cancelled) setInterviews(result.interviews || []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message || "Could not load your interviews.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInterviews();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const now = Date.now();
  // Upcoming = still scheduled and in the future; completed/cancelled
  // interviews are "past" regardless of their date.
  const isUpcoming = (iv) =>
    iv.status === "scheduled" && new Date(iv.scheduledAt).getTime() > now;
  const upcoming = interviews
    .filter(isUpcoming)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  const past = interviews
    .filter((iv) => !isUpcoming(iv))
    .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));

  const nextInterview = upcoming.find((iv) => iv.status === "scheduled");
  const withinDay =
    nextInterview &&
    new Date(nextInterview.scheduledAt).getTime() - now <= 24 * 60 * 60 * 1000;

  const selected = selectedId
    ? interviews.find((iv) => iv._id === selectedId)
    : null;

  const openInterview = (id) => setSearchParams({ id });
  const closeInterview = () => setSearchParams({});

  const renderRow = (interview, isPast) => {
    const ModeIcon = INTERVIEW_MODE_ICONS[interview.mode] || Video;
    return (
      <article className="cp-card cp-list-item" key={interview._id}>
        <span className="candidate-stat-icon">
          <ModeIcon size={18} />
        </span>

        <div className="cp-list-main">
          <strong>{interview.job?.title || "Interview"}</strong>
          <span>
            {[interview.job?.company, interview.type].filter(Boolean).join(" · ")}
          </span>
          <small>
            {formatDate(interview.scheduledAt)} · {formatTime(interview.scheduledAt)} ·{" "}
            {INTERVIEW_MODE_LABELS[interview.mode] || capitalize(interview.mode)}
          </small>
        </div>

        <StatusChip status={interview.status} labels={INTERVIEW_STATUS_LABELS} />

        <button
          type="button"
          className="candidate-text-action cp-inline-link"
          onClick={() => openInterview(interview._id)}
        >
          {isPast ? "View Feedback" : "View Details"} <ArrowRight size={14} />
        </button>
      </article>
    );
  };

  let content;

  if (loading) {
    content = <p className="candidate-empty-state">Loading interviews…</p>;
  } else if (selectedId) {
    content = !selected ? (
      <div className="cp-card cp-empty">
        <h3>Interview not found</h3>
      </div>
    ) : (
      <InterviewDetail interview={selected} />
    );
  } else {
    content = (
      <>
        {withinDay && (
          <div className="cp-reminder">
            <Bell size={17} />
            <span>
              Reminder: your interview for{" "}
              <b>{nextInterview.job?.title || "a role"}</b> is on{" "}
              {formatDate(nextInterview.scheduledAt)} at{" "}
              {formatTime(nextInterview.scheduledAt)} — within the next 24 hours.
            </span>
          </div>
        )}

        <div className="cp-interview-top">
          {nextInterview ? (
            <section className="cp-card cp-next-interview">
              <label>UPCOMING INTERVIEW</label>
              <h2>{nextInterview.job?.title || "Interview"}</h2>
              <p className="cp-next-company">
                <Building2 size={14} /> {nextInterview.job?.company}
              </p>

              <div className="cp-next-grid">
                <div>
                  <small>Date</small>
                  <strong>{formatDate(nextInterview.scheduledAt)}</strong>
                </div>
                <div>
                  <small>Time</small>
                  <strong>{formatTime(nextInterview.scheduledAt)}</strong>
                </div>
                <div>
                  <small>Mode</small>
                  <strong>
                    {INTERVIEW_MODE_LABELS[nextInterview.mode] ||
                      capitalize(nextInterview.mode)}
                  </strong>
                </div>
                {nextInterview.interviewerName && (
                  <div>
                    <small>Interviewer</small>
                    <strong>{nextInterview.interviewerName}</strong>
                  </div>
                )}
              </div>

              <p className="cp-mode-note">{interviewModeNote(nextInterview)}</p>

              <button
                type="button"
                className="btn small"
                onClick={() => openInterview(nextInterview._id)}
              >
                View Details <ArrowRight size={15} />
              </button>
            </section>
          ) : (
            <section className="cp-card cp-empty cp-next-interview">
              <CalendarDays size={26} />
              <h3>No upcoming interviews</h3>
              <p>
                When a recruiter schedules an interview with you, it will show up
                here.
              </p>
            </section>
          )}

          <InterviewCalendar interviews={interviews} onSelect={openInterview} />
        </div>

        <section className="cp-block">
          <div className="cp-section-head">
            <div>
              <label>COMING UP</label>
              <h2>Upcoming interviews</h2>
            </div>
          </div>
          {upcoming.length ? (
            <div className="cp-list">
              {upcoming.map((iv) => renderRow(iv, false))}
            </div>
          ) : (
            <p className="candidate-empty-state">Nothing scheduled yet.</p>
          )}
        </section>

        <section className="cp-block">
          <div className="cp-section-head">
            <div>
              <label>HISTORY</label>
              <h2>Past interviews</h2>
            </div>
          </div>
          {past.length ? (
            <div className="cp-list">{past.map((iv) => renderRow(iv, true))}</div>
          ) : (
            <p className="candidate-empty-state">No past interviews yet.</p>
          )}
        </section>
      </>
    );
  }

  return (
    <DashboardLayout role="Candidate">
      <div className="candidate-space cp-page">
        {selectedId ? (
          <button type="button" className="cp-back" onClick={closeInterview}>
            <ArrowLeft size={16} /> Back to interviews
          </button>
        ) : (
          <div className="cp-page-head">
            <div>
              <label>INTERVIEWS</label>
              <h1>Your interviews</h1>
              <p>Everything recruiters have scheduled with you, in one place.</p>
            </div>
          </div>
        )}

        {loadError && <p className="candidate-load-error">{loadError}</p>}
        {content}
      </div>
    </DashboardLayout>
  );
}

function InterviewDetail({ interview }) {
  const isPast = new Date(interview.scheduledAt).getTime() <= Date.now();
  const ModeIcon = INTERVIEW_MODE_ICONS[interview.mode] || Video;

  const facts = [
    ["Status", <StatusChip key="s" status={interview.status} labels={INTERVIEW_STATUS_LABELS} />],
    ["Date", formatDate(interview.scheduledAt)],
    ["Time", formatTime(interview.scheduledAt)],
    ["Type", interview.type || "General interview"],
    ["Mode", INTERVIEW_MODE_LABELS[interview.mode] || capitalize(interview.mode)],
    interview.interviewerName && ["Interviewer", interview.interviewerName],
    interview.mode === "in-person" && [
      "Location",
      interview.location || "To be shared by the recruiter",
    ],
  ].filter(Boolean);

  return (
    <>
      <section className="cp-card cp-detail-head">
        <div className="cp-detail-title">
          <span className="candidate-stat-icon cp-mark-lg">
            <ModeIcon size={22} />
          </span>
          <div>
            <label>INTERVIEW</label>
            <h1>{interview.job?.title || "Interview"}</h1>
            {interview.job?.company && (
              <p>
                <Building2 size={14} /> {interview.job.company}
                {interview.job.location && (
                  <>
                    {" · "}
                    <MapPin size={14} /> {interview.job.location}
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        <dl className="cp-facts">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <p className="cp-mode-note">{interviewModeNote(interview)}</p>
      </section>

      <div className="cp-two-col">
        <section className="cp-card">
          <h2 className="cp-section-title">
            {isPast ? "Feedback" : "Notes from the recruiter"}
          </h2>
          <p className="cp-body-text">
            {interview.notes ||
              (isPast
                ? "No feedback has been shared for this interview yet."
                : "No notes were added for this interview.")}
          </p>
        </section>

        <section className="cp-card">
          <h2 className="cp-section-title">What to prepare</h2>
          <ul className="cp-checklist">
            {INTERVIEW_PREP_TIPS.map((tip) => (
              <li key={tip}>
                <CheckCircle2 size={15} />
                {tip}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

/* =========================================================
   CANDIDATE — PROFILE
========================================================= */

const PERSONAL_FIELDS = [
  ["name", "Full name", UserRound],
  ["title", "Title", GraduationCap],
  ["phone", "Phone", Phone],
  ["location", "Location", MapPin],
  ["linkedin", "LinkedIn", Linkedin],
  ["github", "GitHub", Github],
];

function externalHref(value) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function CandidateProfile() {
  const auth = getAuth();
  const token = auth?.token;

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [editing, setEditing] = useState(null); // "personal" | "about" | null
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setLoadError("");
      try {
        const result = await getProfile(token);
        if (!cancelled) setProfileData(result);
      } catch (err) {
        if (!cancelled) setLoadError(err.message || "Could not load your profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const profile = profileData?.profile || {};
  const latestResume = profileData?.latestResume || null;
  const hasResume = Boolean(latestResume);
  const displayName = profile.name || auth?.name || "Candidate";
  const completion = profileCompletion(profile, latestResume);

  function startEditing(section) {
    setDraft({
      name: profile.name || "",
      title: profile.title || "",
      phone: profile.phone || "",
      location: profile.location || "",
      linkedin: profile.linkedin || "",
      github: profile.github || "",
      about: profile.about || "",
    });
    setEditing(section);
  }

  async function handleSave(event) {
    event.preventDefault();

    const fields =
      editing === "about"
        ? ["about"]
        : PERSONAL_FIELDS.map(([key]) => key);
    const payload = Object.fromEntries(fields.map((key) => [key, draft[key]]));

    if ("name" in payload && !payload.name.trim()) {
      alert("Name can't be empty.");
      return;
    }

    setSaving(true);
    try {
      const result = await updateProfile(payload, token);
      setProfileData((prev) => ({ ...prev, profile: result.profile }));
      setEditing(null);

      // Keep the stored display name in sync (used by the dashboard greeting).
      const current = getAuth();
      if (current && result.profile?.name) {
        localStorage.setItem(
          AUTH_KEY,
          JSON.stringify({ ...current, name: result.profile.name })
        );
      }
    } catch (err) {
      alert(err.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  // Same upload/replace/remove flow as the Overview page's Profile Boost card.
  async function handleResumeChange(event) {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    try {
      await uploadResume(file, token);
      setProfileData(await getProfile(token));
    } catch (err) {
      alert(err.message || "Resume upload failed. Please try again.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleRemoveResume() {
    if (!token) return;
    if (
      !window.confirm(
        "Remove your resume? Your extracted skills, experience and job matches will be cleared."
      )
    ) {
      return;
    }

    setRemoving(true);
    try {
      await deleteResume(token);
      setProfileData(await getProfile(token));
    } catch (err) {
      alert(err.message || "Could not remove resume. Please try again.");
    } finally {
      setRemoving(false);
    }
  }

  const editActions = (
    <div className="cp-edit-actions">
      <button
        type="button"
        className="btn small btn-outline"
        onClick={() => setEditing(null)}
        disabled={saving}
      >
        Cancel
      </button>
      <button type="submit" className="btn small" disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );

  const editButton = (section) => (
    <button
      type="button"
      className="candidate-text-action cp-edit-btn"
      onClick={() => startEditing(section)}
      disabled={Boolean(editing)}
    >
      <Pencil size={14} /> Edit
    </button>
  );

  const resumeUrl = latestResume ? resumeFileUrl(latestResume.filePath) : null;

  return (
    <DashboardLayout role="Candidate">
      <div className="candidate-space cp-page">
        {loadError && <p className="candidate-load-error">{loadError}</p>}

        {loading ? (
          <p className="candidate-empty-state">Loading profile…</p>
        ) : (
          <>
            <section className="cp-card cp-profile-head">
              <div className="candidate-avatar-large cp-avatar">
                {initialsOf(displayName)}
              </div>

              <div className="cp-profile-id">
                <label>PROFILE</label>
                <h1>{displayName}</h1>
                <p>
                  {profile.title || "Add a title, e.g. Computer Science Student"}
                  {profile.location && (
                    <>
                      {" · "}
                      <MapPin size={14} /> {profile.location}
                    </>
                  )}
                </p>
              </div>

              <div className="cp-profile-completion">
                <div>
                  <small>Profile completion</small>
                  <strong>{completion}%</strong>
                </div>
                <div className="candidate-progress">
                  <motion.i
                    initial={{ width: 0 }}
                    animate={{ width: `${completion}%` }}
                    transition={{ delay: 0.2, duration: 0.9, ease: "easeOut" }}
                  />
                </div>
              </div>
            </section>

            <div className="cp-profile-layout">
              <div className="cp-profile-main">
                <form className="cp-card" onSubmit={handleSave}>
                  <div className="cp-card-head">
                    <h2 className="cp-section-title">Personal Information</h2>
                    {editing !== "personal" && editButton("personal")}
                  </div>

                  {editing === "personal" ? (
                    <>
                      <div className="cp-form-grid">
                        {PERSONAL_FIELDS.map(([key, label]) => (
                          <label key={key}>
                            {label}
                            <input
                              value={draft[key]}
                              onChange={(e) =>
                                setDraft((prev) => ({ ...prev, [key]: e.target.value }))
                              }
                              placeholder={
                                key === "linkedin"
                                  ? "linkedin.com/in/your-name"
                                  : key === "github"
                                  ? "github.com/your-name"
                                  : key === "title"
                                  ? "e.g. Computer Science Student"
                                  : ""
                              }
                            />
                          </label>
                        ))}
                        <label>
                          Email
                          <input value={profile.email || ""} disabled />
                        </label>
                      </div>
                      {editActions}
                    </>
                  ) : (
                    <dl className="cp-facts cp-facts-grid">
                      {[
                        ...PERSONAL_FIELDS,
                        ["email", "Email", Mail],
                      ].map(([key, label, Icon]) => {
                        const value = profile[key];
                        const isLink = (key === "linkedin" || key === "github") && value;
                        return (
                          <div key={key}>
                            <dt>
                              <Icon size={14} /> {label}
                            </dt>
                            <dd>
                              {isLink ? (
                                <a
                                  href={externalHref(value)}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {value}
                                </a>
                              ) : (
                                value || <span className="cp-muted">Not added</span>
                              )}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  )}
                </form>

                <form className="cp-card" onSubmit={handleSave}>
                  <div className="cp-card-head">
                    <h2 className="cp-section-title">About</h2>
                    {editing !== "about" && editButton("about")}
                  </div>

                  {editing === "about" ? (
                    <>
                      <textarea
                        className="cp-textarea"
                        rows={5}
                        value={draft.about}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, about: e.target.value }))
                        }
                        placeholder="A few lines about you, what you're studying and the kind of role you're looking for."
                      />
                      {editActions}
                    </>
                  ) : (
                    <p className="cp-body-text">
                      {profile.about || (
                        <span className="cp-muted">
                          Tell recruiters a little about yourself.
                        </span>
                      )}
                    </p>
                  )}
                </form>

                <section className="cp-card">
                  <h2 className="cp-section-title">Skills</h2>
                  {latestResume?.parsedSkills?.length ? (
                    <div className="skills">
                      {latestResume.parsedSkills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="candidate-empty-state">
                      {hasResume
                        ? "No recognizable skills found in your resume."
                        : "Upload your resume to extract your skills automatically."}
                    </p>
                  )}
                </section>
              </div>

              <aside className="cp-profile-side">
                <section className="cp-card">
                  <h2 className="cp-section-title">Resume</h2>

                  {hasResume ? (
                    <>
                      <div className="profile-boost-v2-file">
                        <span className="profile-boost-v2-file-icon">
                          <FileText size={14} />
                        </span>
                        <span
                          className="profile-boost-v2-file-name"
                          title={latestResume.fileName}
                        >
                          {latestResume.fileName}
                        </span>
                        <span className="profile-boost-v2-pill">
                          AI Matching Ready
                        </span>
                      </div>

                      <p className="cp-muted cp-small">
                        Uploaded {formatDate(latestResume.createdAt)}
                      </p>

                      {resumeUrl && (
                        <a
                          className="candidate-text-action cp-inline-link"
                          href={resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Resume <ExternalLink size={13} />
                        </a>
                      )}

                      <div className="profile-boost-v2 cp-resume-actions">
                        <label className="profile-boost-v2-replace">
                          <Upload size={15} />
                          {uploading ? "Uploading..." : "Replace Resume"}
                          <input
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleResumeChange}
                            disabled={uploading}
                          />
                        </label>

                        <button
                          type="button"
                          className="profile-boost-v2-remove"
                          onClick={handleRemoveResume}
                          disabled={uploading || removing}
                        >
                          <Trash2 size={15} />
                          {removing ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="candidate-empty-state">
                        No resume uploaded yet.
                      </p>
                      <label className="candidate-outline-action cp-upload">
                        <Upload size={16} />
                        {uploading ? "Uploading..." : "Upload"}
                        <input
                          type="file"
                          accept=".pdf,.docx"
                          onChange={handleResumeChange}
                          disabled={uploading}
                        />
                      </label>
                    </>
                  )}
                </section>

                <section className="cp-card">
                  <h2 className="cp-section-title">Profile checklist</h2>
                  <div className="candidate-profile-items">
                    <span>
                      {hasResume ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
                      Resume uploaded
                    </span>

                    <span>
                      {latestResume?.parsedSkills?.length ? (
                        <CheckCircle2 size={15} />
                      ) : (
                        <Clock3 size={15} />
                      )}
                      Skills added
                    </span>

                    <span>
                      {latestResume?.certifications?.length ? (
                        <CheckCircle2 size={15} />
                      ) : (
                        <Clock3 size={15} />
                      )}
                      Certifications
                    </span>
                  </div>
                </section>
              </aside>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

/* =========================================================
   RECRUITER
========================================================= */

/* =========================================================
   POST JOB MODAL (Recruiter)
========================================================= */

// Pass `job` to edit an existing posting instead of creating a new one.
function PostJobModal({ onClose, onPosted, job = null }) {
  const auth = getAuth();
  const isEdit = Boolean(job);

  const [title, setTitle] = useState(job?.title || "");
  const [company, setCompany] = useState(job?.company || auth?.company || "");
  const [location, setLocation] = useState(job?.location || "");
  const [type, setType] = useState(job?.type || "full-time");
  const [description, setDescription] = useState(job?.description || "");
  const [skillsInput, setSkillsInput] = useState(
    (job?.requiredSkills || []).join(", ")
  );
  const [experienceRequired, setExperienceRequired] = useState(
    job?.experienceRequired ?? 0
  );
  const [salaryRange, setSalaryRange] = useState(job?.salaryRange || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !company.trim() || !description.trim()) {
      setError("Title, company and description are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    const payload = {
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      type,
      description: description.trim(),
      requiredSkills: skillsInput
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
      experienceRequired: Number(experienceRequired) || 0,
      salaryRange: salaryRange.trim(),
    };

    try {
      if (isEdit) {
        await updateJob(job._id, payload, auth?.token);
      } else {
        await createJob(payload, auth?.token);
      }

      onPosted();
    } catch (err) {
      setError(
        err.message ||
          (isEdit
            ? "Could not save changes. Please try again."
            : "Could not post job. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 15, 25, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "28px",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "88vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: 0 }}>{isEdit ? "Edit Job" : "Post a New Job"}</h2>

        {error && (
          <p style={{ color: "#d0342c", margin: 0, fontSize: "14px" }}>
            {error}
          </p>
        )}

        <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          Job title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Frontend Developer"
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          Company
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Acme Corp"
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          Location
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Hyderabad or Remote"
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          Job type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          Description
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will this person do?"
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          Required skills (comma-separated)
          <input
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="e.g. react, javascript, css"
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          Experience required (years)
          <input
            type="number"
            min="0"
            value={experienceRequired}
            onChange={(e) => setExperienceRequired(e.target.value)}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          Salary range (optional)
          <input
            type="text"
            value={salaryRange}
            onChange={(e) => setSalaryRange(e.target.value)}
            placeholder="e.g. 8-12 LPA"
          />
        </label>

        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button
            type="button"
            className="btn"
            onClick={handleSubmit}
            disabled={submitting}
            style={{ flex: 1 }}
          >
            {submitting
              ? isEdit
                ? "Saving..."
                : "Posting..."
              : isEdit
              ? "Save Changes"
              : "Post Job"}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   RECRUITER — shared helpers
========================================================= */

const RECRUITER_STATUS_LABELS = {
  ...APPLICATION_STATUS_LABELS,
  hired: "Hired",
  withdrawn: "Withdrawn",
};

const INTERVIEW_TYPES = ["Screening", "Technical", "HR", "Managerial", "Final"];

const FEEDBACK_RECOMMENDATIONS = ["Strong Hire", "Hire", "Maybe", "No Hire"];

function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(value);
}

function isUpcomingInterview(interview) {
  return (
    interview.status === "scheduled" &&
    new Date(interview.scheduledAt).getTime() > Date.now()
  );
}

// Same 5-stage indicator the candidate sees, driven by the real status.
function ApplicationStageTrack({ status }) {
  const currentStage = APPLICATION_STAGE_INDEX[status] ?? 0;
  const finalLabel =
    status === "hired" ? "Hired" : status === "rejected" ? "Rejected" : null;

  return (
    <ol className="cp-stages">
      {APPLICATION_STAGES.map((label, index) => {
        const state =
          index < currentStage
            ? "done"
            : index === currentStage
            ? status === "rejected"
              ? "current rejected"
              : "current"
            : "";
        return (
          <li key={label} className={`cp-stage ${state}`}>
            <span className="cp-stage-dot">
              {index < currentStage ? <CheckCircle2 size={15} /> : index + 1}
            </span>
            <strong>{label}</strong>
            {index === 4 && finalLabel && <small>{finalLabel}</small>}
          </li>
        );
      })}
    </ol>
  );
}

function ResumeSummary({ resume, fallbackSkills = [] }) {
  const skills = resume?.parsedSkills?.length ? resume.parsedSkills : fallbackSkills;
  const resumeUrl = resume ? resumeFileUrl(resume.filePath) : null;

  return (
    <>
      <section className="cp-card">
        <h2 className="cp-section-title">Skills</h2>
        {skills.length ? (
          <div className="skills">
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        ) : (
          <p className="candidate-empty-state">No skills on file yet.</p>
        )}
      </section>

      <section className="cp-card">
        <h2 className="cp-section-title">Education</h2>
        {resume?.education?.length ? (
          <ul className="resume-insight-rows">
            {resume.education.map((entry, i) => (
              <li key={i}>
                {entry.degree && <b>{entry.degree}</b>}
                {(entry.institution || entry.year) && (
                  <small>
                    {[entry.institution, entry.year].filter(Boolean).join(" · ")}
                  </small>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="candidate-empty-state">No education details on file.</p>
        )}
      </section>

      <section className="cp-card">
        <h2 className="cp-section-title">Resume</h2>
        {resume ? (
          <div className="cp-file-row">
            <span className="profile-boost-v2-file-icon">
              <FileText size={14} />
            </span>
            <span className="cp-file-name">{resume.fileName}</span>
            {resumeUrl && (
              <a
                className="candidate-text-action cp-inline-link"
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
              >
                View Resume <ExternalLink size={13} />
              </a>
            )}
          </div>
        ) : (
          <p className="candidate-empty-state">
            This candidate hasn't uploaded a resume.
          </p>
        )}
      </section>
    </>
  );
}

/* =========================================================
   RECRUITER — OVERVIEW
========================================================= */

// Recruiter overview, shown on Home ("/") for logged-in recruiters.
function RecruiterHome() {
  const auth = getAuth();
  const token = auth?.token;
  const recruiterName = auth?.name || "Recruiter";

  const [stats, setStats] = useState({ perJob: [], totals: null });
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showPostJob, setShowPostJob] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  async function loadOverview() {
    setLoadError("");
    try {
      const [statsResult, applicationsResult, interviewsResult] =
        await Promise.all([
          getRecruiterStats(token),
          getApplications(token),
          getInterviews(token),
        ]);
      setStats({
        perJob: statsResult.perJob || [],
        totals: statsResult.totals || null,
      });
      setApplications(applicationsResult.applications || []);
      setInterviews(interviewsResult.interviews || []);
    } catch (err) {
      setLoadError(err.message || "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const totals = stats.totals;
  const kpis = [
    [totals?.totalActiveOpenings, "Active Jobs", BriefcaseBusiness],
    [totals?.totalApplicants, "Total Applicants", Users],
    [totals?.totalInterviews, "Interviews", CalendarDays],
    [totals?.totalHires, "Hires", Award],
  ];

  const recentApplications = applications.slice(0, 5);
  const upcomingInterviews = interviews.filter(isUpcomingInterview).slice(0, 3);

  return (
    <main className="home-recruiter">
      <div className="recruiter-command cp-page">
        <div className="recruiter-command-head">
          <div>
            <label>HIRING COMMAND CENTER</label>
            <h1>Build your next great team, {recruiterName}.</h1>
            <p>
              Track openings, review applicants and move candidates through
              your hiring pipeline.
            </p>
          </div>

          <div className="recruiter-head-actions">
            <button
              className="btn recruiter-post-btn"
              onClick={() => setShowPostJob(true)}
            >
              <Plus size={17} />
              Post a New Job
            </button>
          </div>
        </div>

        {postSuccess && (
          <p className="cp-success">
            Job posted successfully — it's now visible to matching candidates.
          </p>
        )}
        {loadError && <p className="candidate-load-error">{loadError}</p>}

        <div className="recruiter-kpi-grid">
          {kpis.map(([value, title, Icon]) => (
            <div className="recruiter-kpi" key={title}>
              <div className="recruiter-kpi-top">
                <span>
                  <Icon size={18} />
                </span>
              </div>
              <strong>{loading || value === undefined ? "—" : value}</strong>
              <label>{title}</label>
            </div>
          ))}
        </div>

        <div className="cp-rec-grid">
          <section className="cp-card">
            <div className="cp-card-head">
              <h2 className="cp-section-title">Recent Applications</h2>
              <Link className="candidate-text-action cp-inline-link" to="/recruiter/applications">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <p className="candidate-empty-state">Loading…</p>
            ) : recentApplications.length ? (
              <div className="cp-mini-list">
                {recentApplications.map((app) => (
                  <Link
                    key={app._id}
                    className="cp-mini-row"
                    to={`/recruiter/applications?id=${app._id}`}
                  >
                    <span className="cp-mini-avatar">
                      {initialsOf(app.candidate?.name) || "?"}
                    </span>
                    <span className="cp-mini-main">
                      <strong>{app.candidate?.name || "Candidate"}</strong>
                      <small>
                        {app.job?.title || "Job removed"} · {timeAgo(app.createdAt)}
                      </small>
                    </span>
                    <StatusChip status={app.status} labels={RECRUITER_STATUS_LABELS} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="candidate-empty-state">No applications yet.</p>
            )}
          </section>

          <section className="cp-card">
            <div className="cp-card-head">
              <h2 className="cp-section-title">Upcoming Interviews</h2>
              <Link className="candidate-text-action cp-inline-link" to="/recruiter/interviews">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <p className="candidate-empty-state">Loading…</p>
            ) : upcomingInterviews.length ? (
              <div className="cp-mini-list">
                {upcomingInterviews.map((iv) => (
                  <Link
                    key={iv._id}
                    className="cp-mini-row"
                    to={`/recruiter/interviews?id=${iv._id}`}
                  >
                    <span className="cp-mini-date">
                      <b>{new Date(iv.scheduledAt).getDate()}</b>
                      <small>
                        {new Date(iv.scheduledAt).toLocaleDateString("en-IN", {
                          month: "short",
                        })}
                      </small>
                    </span>
                    <span className="cp-mini-main">
                      <strong>{iv.candidate?.name || "Candidate"}</strong>
                      <small>
                        {iv.job?.title} · {formatTime(iv.scheduledAt)} ·{" "}
                        {INTERVIEW_MODE_LABELS[iv.mode] || capitalize(iv.mode)}
                      </small>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="candidate-empty-state">No upcoming interviews.</p>
            )}
          </section>

          <section className="cp-card cp-rec-span">
            <div className="cp-card-head">
              <h2 className="cp-section-title">Your Jobs</h2>
              <Link className="candidate-text-action cp-inline-link" to="/recruiter/jobs">
                Manage Jobs <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <p className="candidate-empty-state">Loading…</p>
            ) : stats.perJob.length ? (
              <div className="cp-mini-list">
                {stats.perJob.slice(0, 5).map((entry) => (
                  <div key={entry.jobId} className="cp-mini-row">
                    <span className="candidate-company-mark">
                      {entry.job?.company?.[0]}
                    </span>
                    <span className="cp-mini-main">
                      <strong>{entry.job?.title}</strong>
                      <small>
                        {entry.applicantsCount}{" "}
                        {entry.applicantsCount === 1 ? "applicant" : "applicants"}
                      </small>
                    </span>
                    <span className={`cp-status cp-status-job-${entry.job?.status}`}>
                      {entry.job?.status === "open" ? "Open" : "Closed"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="candidate-empty-state">
                You haven't posted any jobs yet — click "Post a New Job" to add
                your first opening.
              </p>
            )}
          </section>
        </div>
      </div>

      {showPostJob && (
        <PostJobModal
          onClose={() => setShowPostJob(false)}
          onPosted={() => {
            setShowPostJob(false);
            setPostSuccess(true);
            loadOverview();
            setTimeout(() => setPostSuccess(false), 4000);
          }}
        />
      )}
    </main>
  );
}

/* =========================================================
   RECRUITER — JOBS
========================================================= */

function RecruiterJobs() {
  const auth = getAuth();
  const token = auth?.token;
  const navigate = useNavigate();

  const [perJob, setPerJob] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null); // { job } to edit, {} to post new
  const [busyJobId, setBusyJobId] = useState(null);

  async function loadJobs() {
    setLoadError("");
    try {
      const result = await getRecruiterStats(token);
      setPerJob(result.perJob || []);
    } catch (err) {
      setLoadError(err.message || "Could not load your jobs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function setJobStatus(job, status) {
    if (
      status === "closed" &&
      !window.confirm(
        `Close "${job.title}"? It will stop appearing to candidates. Existing applications are kept.`
      )
    ) {
      return;
    }

    setBusyJobId(job._id);
    try {
      await updateJob(job._id, { status }, token);
      await loadJobs();
    } catch (err) {
      alert(err.message || "Could not update the job.");
    } finally {
      setBusyJobId(null);
    }
  }

  const openCount = perJob.filter((e) => e.job?.status === "open").length;
  const shown = perJob.filter(
    (entry) => filter === "all" || entry.job?.status === filter
  );

  return (
    <DashboardLayout role="Recruiter">
      <div className="recruiter-command cp-page">
        <div className="cp-page-head cp-page-head-row">
          <div>
            <label>JOBS</label>
            <h1>Your job postings</h1>
            <p>Every role you've posted, with where its applicants stand.</p>
          </div>
          <button className="btn recruiter-post-btn" onClick={() => setModal({})}>
            <Plus size={17} /> Post New Job
          </button>
        </div>

        <div className="cp-tabs" role="tablist">
          {[
            ["all", "All", perJob.length],
            ["open", "Open", openCount],
            ["closed", "Closed", perJob.length - openCount],
          ].map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={filter === key ? "active" : ""}
              onClick={() => setFilter(key)}
            >
              {label}
              <span>{count}</span>
            </button>
          ))}
        </div>

        {loadError && <p className="candidate-load-error">{loadError}</p>}

        {loading ? (
          <p className="candidate-empty-state">Loading jobs…</p>
        ) : shown.length ? (
          <div className="cp-list">
            {shown.map((entry) => {
              const { job } = entry;
              const busy = busyJobId === job._id;
              return (
                <article className="cp-card cp-rec-job" key={job._id}>
                  <div className="cp-rec-job-head">
                    <div className="candidate-company-mark">{job.company?.[0]}</div>
                    <div className="cp-list-main">
                      <strong>{job.title}</strong>
                      <span>
                        {[job.company, job.location, workTypeLabel(job)]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                      <small>Posted {formatDate(job.createdAt)}</small>
                    </div>
                    <span className={`cp-status cp-status-job-${job.status}`}>
                      {job.status === "open" ? "Open" : "Closed"}
                    </span>
                  </div>

                  <div className="cp-rec-counts">
                    {[
                      ["Applicants", entry.applicantsCount],
                      ["Under Review", entry.underReviewCount],
                      ["Shortlisted", entry.shortlistedCount],
                      ["Interview", entry.interviewsCount],
                    ].map(([label, count]) => (
                      <div key={label}>
                        <strong>{count ?? 0}</strong>
                        <small>{label}</small>
                      </div>
                    ))}
                  </div>

                  <div className="cp-rec-job-actions">
                    <button
                      type="button"
                      className="btn small btn-outline"
                      onClick={() => navigate(`/recruiter/applications?job=${job._id}`)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="btn small btn-outline"
                      onClick={() => setModal({ job })}
                      disabled={busy}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    {job.status === "open" ? (
                      <button
                        type="button"
                        className="cp-danger-btn"
                        onClick={() => setJobStatus(job, "closed")}
                        disabled={busy}
                      >
                        {busy ? "Closing..." : "Close"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn small"
                        onClick={() => setJobStatus(job, "open")}
                        disabled={busy}
                      >
                        {busy ? "Reopening..." : "Reopen"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="cp-card cp-empty">
            <h3>
              {perJob.length ? "No jobs in this view" : "You haven't posted any jobs yet"}
            </h3>
            {!perJob.length && (
              <button className="btn small" onClick={() => setModal({})}>
                <Plus size={15} /> Post your first job
              </button>
            )}
          </div>
        )}
      </div>

      {modal && (
        <PostJobModal
          job={modal.job || null}
          onClose={() => setModal(null)}
          onPosted={() => {
            setModal(null);
            loadJobs();
          }}
        />
      )}
    </DashboardLayout>
  );
}

/* =========================================================
   RECRUITER — APPLICATIONS
========================================================= */

function dateInputFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// "YYYY-MM-DD" from a date input → ISO string at local midnight (not UTC midnight).
function dateInputToIso(value) {
  return value ? new Date(`${value}T00:00:00`).toISOString() : null;
}

// Shown on a hired application: create → preview → send an offer letter,
// then View / Download / Resend once it exists.
function HiringActions({ application, token }) {
  const auth = getAuth();
  const { job, candidate } = application;

  const [offer, setOffer] = useState(null);
  const [loadingOffer, setLoadingOffer] = useState(true);
  const [fullJob, setFullJob] = useState(null); // includes salaryRange
  const [step, setStep] = useState(null); // null | "form" | "preview" | "view"
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getOfferForApplication(application._id, token)
      .then((result) => {
        if (!cancelled) setOffer(result.offer || null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingOffer(false);
      });

    // The application's populated job omits salaryRange; the stats endpoint has the full job.
    getRecruiterStats(token)
      .then((result) => {
        if (cancelled) return;
        const row = (result.perJob || []).find((r) => r.job?._id === job?._id);
        if (row) setFullJob(row.job);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [application._id, job?._id, token]);

  const candidateName = candidate?.name || "Candidate";
  const position = job?.title || "";

  function openForm() {
    const source = fullJob || job || {};
    setForm({
      joiningDate: "",
      employmentType: source.type || "full-time",
      salary: source.salaryRange || "",
      reportingTo: "",
      offerExpiry: dateInputFromNow(7),
      additionalTerms: "",
    });
    setFormError("");
    setStep("form");
  }

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const draftLetter = form && {
    company: job?.company || "",
    position,
    candidateName,
    workLocation: job?.location || "",
    employmentType: form.employmentType,
    joiningDate: dateInputToIso(form.joiningDate),
    salary: form.salary.trim(),
    reportingTo: form.reportingTo.trim(),
    offerExpiry: dateInputToIso(form.offerExpiry),
    additionalTerms: form.additionalTerms.trim(),
    recruiterName: auth?.name || "Hiring Team",
    issuedOn: new Date(),
  };

  function goToPreview() {
    if (!form.joiningDate || !form.offerExpiry || !form.salary.trim()) {
      setFormError("Joining date, salary/stipend and offer expiry are required.");
      return;
    }
    setFormError("");
    setStep("preview");
  }

  async function sendOffer() {
    setSending(true);
    setFormError("");
    try {
      const result = await createOffer(
        {
          applicationId: application._id,
          position: draftLetter.position,
          company: draftLetter.company,
          joiningDate: draftLetter.joiningDate,
          employmentType: draftLetter.employmentType,
          workLocation: draftLetter.workLocation,
          salary: draftLetter.salary,
          reportingTo: draftLetter.reportingTo,
          offerExpiry: draftLetter.offerExpiry,
          additionalTerms: draftLetter.additionalTerms,
        },
        token
      );
      setOffer(result.offer);
      setStep(null);
    } catch (err) {
      setFormError(err.message || "Could not send the offer letter.");
    } finally {
      setSending(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const result = await resendOffer(offer._id, token);
      setOffer(result.offer);
    } catch (err) {
      alert(err.message || "Could not resend the offer letter.");
    } finally {
      setResending(false);
    }
  }

  const readOnlyField = (label, value) => (
    <label className="offer-field">
      {label}
      <input type="text" value={value || "—"} readOnly disabled />
    </label>
  );

  return (
    <section className="cp-card offer-hiring">
      <h2 className="cp-section-title">🎉 Hiring Actions</h2>
      <div className="offer-hiring-row">
        <div>
          <strong>{candidateName}</strong>
          <span>{position || "Job removed"}</span>
        </div>

        {loadingOffer ? (
          <span className="cp-muted">Checking offer letter…</span>
        ) : offer ? (
          <div className="offer-sent">
            <span className="offer-sent-badge">
              <CheckCircle2 size={15} /> OFFER LETTER SENT — Sent on {formatDate(offer.sentAt)}
            </span>
            <div className="offer-sent-actions">
              <button type="button" className="btn small btn-outline" onClick={() => setStep("view")}>
                View Letter
              </button>
              <button
                type="button"
                className="btn small btn-outline"
                onClick={() => downloadOfferLetter(offerToLetter(offer))}
              >
                Download
              </button>
              <button type="button" className="btn small" disabled={resending} onClick={handleResend}>
                {resending ? "Resending…" : "Resend"}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn small" onClick={openForm} disabled={!job}>
            <FileText size={15} /> Create Offer Letter
          </button>
        )}
      </div>

      {step === "form" && form && (
        <OfferModal
          title="Create Offer Letter"
          onClose={() => setStep(null)}
          footer={
            <>
              <button type="button" className="btn small btn-outline" onClick={() => setStep(null)}>
                Cancel
              </button>
              <button type="button" className="btn small" onClick={goToPreview}>
                Preview Letter
              </button>
            </>
          }
        >
          {formError && <p className="offer-error">{formError}</p>}
          <div className="offer-form">
            {readOnlyField("Candidate", candidateName)}
            {readOnlyField("Position", position)}
            {readOnlyField("Company", job?.company)}
            {readOnlyField("Work Location", job?.location)}
            <label className="offer-field">
              Joining Date *
              <input type="date" value={form.joiningDate} onChange={update("joiningDate")} />
            </label>
            <label className="offer-field">
              Employment Type
              <select value={form.employmentType} onChange={update("employmentType")}>
                {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="offer-field">
              Salary / Stipend *
              <input
                type="text"
                value={form.salary}
                onChange={update("salary")}
                placeholder="e.g. 12 LPA"
              />
            </label>
            <label className="offer-field">
              Reporting To (optional)
              <input
                type="text"
                value={form.reportingTo}
                onChange={update("reportingTo")}
                placeholder="e.g. Priya Sharma, Engineering Manager"
              />
            </label>
            <label className="offer-field">
              Offer Expiry *
              <input type="date" value={form.offerExpiry} onChange={update("offerExpiry")} />
            </label>
            <label className="offer-field offer-field-wide">
              Additional Terms (optional)
              <textarea
                rows={3}
                value={form.additionalTerms}
                onChange={update("additionalTerms")}
                placeholder="e.g. 6-month probation period, relocation support…"
              />
            </label>
          </div>
        </OfferModal>
      )}

      {step === "preview" && draftLetter && (
        <OfferModal
          title="Preview Offer Letter"
          onClose={() => !sending && setStep(null)}
          footer={
            <>
              <button
                type="button"
                className="btn small btn-outline"
                disabled={sending}
                onClick={() => setStep("form")}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button type="button" className="btn small" disabled={sending} onClick={sendOffer}>
                {sending ? "Sending…" : "Send Offer Letter"}
              </button>
            </>
          }
        >
          {formError && <p className="offer-error">{formError}</p>}
          <OfferLetterView letter={draftLetter} />
        </OfferModal>
      )}

      {step === "view" && offer && (
        <OfferLetterDialog letter={offerToLetter(offer)} onClose={() => setStep(null)} />
      )}
    </section>
  );
}

const APPLICANT_EXPERIENCE_FILTERS = [
  ["all", "Any experience"],
  ["fresher", "Fresher (0 yrs)"],
  ["0-1", "0–1 yrs"],
  ["1-3", "1–3 yrs"],
  ["3+", "3+ yrs"],
];

// Candidate's experienceYears (missing = 0) against a bucket; buckets don't overlap.
function matchesApplicantExperience(years, bucket) {
  const y = Number(years) || 0;
  if (bucket === "fresher") return y === 0;
  if (bucket === "0-1") return y > 0 && y <= 1;
  if (bucket === "1-3") return y > 1 && y <= 3;
  if (bucket === "3+") return y > 3;
  return true;
}

function RecruiterApplications() {
  const auth = getAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("id");
  const jobFilter = searchParams.get("job");

  const [applications, setApplications] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getApplications(token), getRecruiterApplicants(token)])
      .then(([applicationsResult, applicantsResult]) => {
        if (cancelled) return;
        setApplications(applicationsResult.applications || []);
        setApplicants(applicantsResult.applicants || []);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || "Could not load applications.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const inJob = jobFilter
    ? applications.filter((a) => a.job?._id === jobFilter)
    : applications;
  const jobTitle = jobFilter
    ? inJob[0]?.job?.title || "this job"
    : null;

  const jobOptions = new Map();
  applications.forEach((a) => {
    if (a.job) jobOptions.set(a.job._id, a.job.title);
  });

  // The Job dropdown drives the existing ?job= param, so links from the Jobs page still preselect it.
  const setJobFilter = (value) =>
    setSearchParams(value === "all" ? {} : { job: value });

  const query = search.trim().toLowerCase();
  const shown = inJob.filter(
    (a) =>
      (!query ||
        `${a.candidate?.name || ""} ${a.candidate?.email || ""}`
          .toLowerCase()
          .includes(query)) &&
      (stageFilter === "all" || a.status === stageFilter) &&
      matchesApplicantExperience(a.candidate?.experienceYears, experienceFilter)
  );

  const selected = selectedId
    ? applications.find((a) => a._id === selectedId)
    : null;
  const selectedApplicant = selected
    ? applicants.find((row) => row.candidate._id === selected.candidate?._id)
    : null;

  async function changeStatus(application, status, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;

    setUpdating(true);
    try {
      const result = await updateApplicationStatus(application._id, status, token);
      // The status endpoint's candidate omits experienceYears; keep it for the Experience filter.
      setApplications((prev) =>
        prev.map((a) =>
          a._id === application._id
            ? {
                ...result.application,
                candidate: result.application.candidate && {
                  ...a.candidate,
                  ...result.application.candidate,
                },
              }
            : a
        )
      );
    } catch (err) {
      alert(err.message || "Could not update the application.");
    } finally {
      setUpdating(false);
    }
  }

  let content;

  if (loading) {
    content = <p className="candidate-empty-state">Loading applications…</p>;
  } else if (selectedId) {
    if (!selected) {
      content = (
        <div className="cp-card cp-empty">
          <h3>Application not found</h3>
          <p>The candidate may have withdrawn it.</p>
        </div>
      );
    } else {
      const { status } = selected;
      const closed = status === "rejected" || status === "hired";
      const candidateName = selected.candidate?.name || "this candidate";

      content = (
        <>
          <section className="cp-card cp-detail-head">
            <div className="cp-detail-title">
              <span className="candidate-avatar-large cp-mark-lg">
                {initialsOf(selected.candidate?.name) || "?"}
              </span>
              <div>
                <label>APPLICATION</label>
                <h1>{selected.candidate?.name || "Candidate"}</h1>
                <p>
                  <BriefcaseBusiness size={14} /> {selected.job?.title || "Job removed"}
                  {selected.candidate?.email && (
                    <>
                      {" · "}
                      <Mail size={14} /> {selected.candidate.email}
                    </>
                  )}
                </p>
              </div>
              <StatusChip status={status} labels={RECRUITER_STATUS_LABELS} />
            </div>

            <div className="cp-chips">
              <span>Applied {formatDate(selected.createdAt)}</span>
              <span>Last updated {formatDate(selected.updatedAt)}</span>
              {typeof selected.matchScore === "number" && (
                <span>{selected.matchScore}% skill match</span>
              )}
            </div>

            {!closed && (
              <div className="cp-actions">
                {status === "applied" && (
                  <button
                    type="button"
                    className="btn small btn-outline"
                    disabled={updating}
                    onClick={() => changeStatus(selected, "under_review")}
                  >
                    <Clock3 size={15} /> Mark Under Review
                  </button>
                )}
                {(status === "applied" || status === "under_review") && (
                  <button
                    type="button"
                    className="btn small"
                    disabled={updating}
                    onClick={() => changeStatus(selected, "shortlisted")}
                  >
                    <CheckCircle2 size={15} /> Shortlist
                  </button>
                )}
                <button
                  type="button"
                  className={`btn small${status === "shortlisted" ? "" : " btn-outline"}`}
                  disabled={updating}
                  onClick={() =>
                    navigate(`/recruiter/interviews?schedule=${selected._id}`)
                  }
                >
                  <CalendarDays size={15} /> Schedule Interview
                </button>
                {status === "interview" && (
                  <button
                    type="button"
                    className="btn small"
                    disabled={updating}
                    onClick={() =>
                      changeStatus(selected, "hired", `Mark ${candidateName} as hired?`)
                    }
                  >
                    <Award size={15} /> Hire
                  </button>
                )}
                <button
                  type="button"
                  className="cp-danger-btn"
                  disabled={updating}
                  onClick={() =>
                    changeStatus(
                      selected,
                      "rejected",
                      `Reject ${candidateName}'s application? They'll see this on their Applications page.`
                    )
                  }
                >
                  Reject
                </button>
              </div>
            )}
          </section>

          <section className="cp-card">
            <h2 className="cp-section-title">Application progress</h2>
            <ApplicationStageTrack status={status} />
          </section>

          {status === "hired" && (
            <HiringActions key={selected._id} application={selected} token={token} />
          )}

          <div className="cp-two-col">
            <ResumeSummary
              resume={selected.resume || selectedApplicant?.latestResume || null}
              fallbackSkills={selected.candidate?.skills || []}
            />
          </div>
        </>
      );
    }
  } else {
    content = (
      <>
        {jobFilter && (
          <div className="cp-filter-banner">
            Showing applications for <b>{jobTitle}</b>
            <button type="button" onClick={() => setSearchParams({})}>
              Show all jobs
            </button>
          </div>
        )}

        <div className="cp-card cp-search cp-rec-filters">
          <div className="cp-search-field">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              aria-label="Search by candidate name or email"
            />
          </div>

          <select
            value={jobFilter || "all"}
            onChange={(e) => setJobFilter(e.target.value)}
            aria-label="Job"
          >
            <option value="all">All jobs</option>
            {[...jobOptions].map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            aria-label="Stage"
          >
            <option value="all">All stages</option>
            {Object.entries(RECRUITER_STATUS_LABELS)
              .filter(([key]) => key !== "withdrawn")
              .map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
          </select>

          <select
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
            aria-label="Experience"
          >
            {APPLICANT_EXPERIENCE_FILTERS.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <p className="cp-count">
          {shown.length} {shown.length === 1 ? "application" : "applications"}
        </p>

        {shown.length ? (
          <div className="cp-list">
            {shown.map((app) => (
              <button
                type="button"
                key={app._id}
                className="cp-card cp-list-item cp-row-button"
                onClick={() =>
                  setSearchParams(
                    jobFilter ? { id: app._id, job: jobFilter } : { id: app._id }
                  )
                }
              >
                <span className="cp-mini-avatar lg">
                  {initialsOf(app.candidate?.name) || "?"}
                </span>
                <span className="cp-list-main">
                  <strong>{app.candidate?.name || "Candidate"}</strong>
                  <span>{app.job?.title || "Job removed"}</span>
                  <small>Applied {formatDate(app.createdAt)}</small>
                </span>
                <StatusChip status={app.status} labels={RECRUITER_STATUS_LABELS} />
                <ChevronRight size={17} className="cp-muted" />
              </button>
            ))}
          </div>
        ) : (
          <div className="cp-card cp-empty">
            <h3>
              {inJob.length
                ? "No applications match these filters"
                : "No applications yet"}
            </h3>
          </div>
        )}
      </>
    );
  }

  return (
    <DashboardLayout role="Recruiter">
      <div className="recruiter-command cp-page">
        {selectedId ? (
          <button
            type="button"
            className="cp-back"
            onClick={() => setSearchParams(jobFilter ? { job: jobFilter } : {})}
          >
            <ArrowLeft size={16} /> Back to applications
          </button>
        ) : (
          <div className="cp-page-head">
            <div>
              <label>APPLICATIONS</label>
              <h1>Applications</h1>
              <p>Review each application and move it through your pipeline.</p>
            </div>
          </div>
        )}

        {loadError && <p className="candidate-load-error">{loadError}</p>}
        {content}
      </div>
    </DashboardLayout>
  );
}

/* =========================================================
   RECRUITER — INTERVIEWS
========================================================= */

const EMPTY_SCHEDULE_FORM = {
  applicationId: "",
  date: "",
  time: "",
  type: "Technical",
  mode: "online",
  meetingLink: "",
  location: "",
  interviewerName: "",
  notes: "",
};

function toDateInput(value) {
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeInput(value) {
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function RecruiterInterviews() {
  const auth = getAuth();
  const token = auth?.token;
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("id");
  const scheduleFor = searchParams.get("schedule");

  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(Boolean(scheduleFor));
  const [form, setForm] = useState({
    ...EMPTY_SCHEDULE_FORM,
    applicationId: scheduleFor || "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadData() {
    setLoadError("");
    try {
      const [interviewsResult, applicationsResult] = await Promise.all([
        getInterviews(token),
        getApplications(token),
      ]);
      setInterviews(interviewsResult.interviews || []);
      setApplications(applicationsResult.applications || []);
    } catch (err) {
      setLoadError(err.message || "Could not load interviews.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Arriving from an application's "Schedule Interview" button
  useEffect(() => {
    if (scheduleFor) {
      setForm({ ...EMPTY_SCHEDULE_FORM, applicationId: scheduleFor });
      setShowForm(true);
    }
  }, [scheduleFor]);

  const schedulable = applications.filter(
    (a) => !["rejected", "hired", "withdrawn"].includes(a.status)
  );

  const upcoming = interviews.filter(isUpcomingInterview);
  const others = interviews
    .filter((iv) => !isUpcomingInterview(iv))
    .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));

  const selected = selectedId ? interviews.find((iv) => iv._id === selectedId) : null;

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  function closeForm() {
    setShowForm(false);
    setFormError("");
    setForm(EMPTY_SCHEDULE_FORM);
    if (scheduleFor) setSearchParams({});
  }

  async function handleSchedule(event) {
    event.preventDefault();
    setFormError("");

    if (!form.applicationId || !form.date || !form.time) {
      setFormError("Choose a candidate, date and time.");
      return;
    }

    const scheduledAt = new Date(`${form.date}T${form.time}`);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
      setFormError("Pick a date and time in the future.");
      return;
    }

    setSaving(true);
    try {
      const result = await scheduleInterview(
        {
          applicationId: form.applicationId,
          scheduledAt: scheduledAt.toISOString(),
          type: form.type,
          mode: form.mode,
          meetingLink: form.mode === "online" ? form.meetingLink.trim() : "",
          location: form.mode === "in-person" ? form.location.trim() : "",
          interviewerName: form.interviewerName.trim(),
          notes: form.notes.trim(),
        },
        token
      );
      setShowForm(false);
      setForm(EMPTY_SCHEDULE_FORM);
      await loadData();
      setSearchParams({ id: result.interview._id });
    } catch (err) {
      setFormError(err.message || "Could not schedule the interview.");
    } finally {
      setSaving(false);
    }
  }

  function replaceInterview(updated) {
    setInterviews((prev) => prev.map((iv) => (iv._id === updated._id ? updated : iv)));
  }

  const renderRow = (iv) => {
    const ModeIcon = INTERVIEW_MODE_ICONS[iv.mode] || Video;
    return (
      <button
        type="button"
        key={iv._id}
        className="cp-card cp-list-item cp-row-button"
        onClick={() => setSearchParams({ id: iv._id })}
      >
        <span className="candidate-stat-icon">
          <ModeIcon size={18} />
        </span>
        <span className="cp-list-main">
          <strong>{iv.candidate?.name || "Candidate"}</strong>
          <span>{[iv.job?.title, iv.type].filter(Boolean).join(" · ")}</span>
          <small>
            {formatDate(iv.scheduledAt)} · {formatTime(iv.scheduledAt)} ·{" "}
            {INTERVIEW_MODE_LABELS[iv.mode] || capitalize(iv.mode)}
          </small>
        </span>
        <StatusChip status={iv.status} labels={INTERVIEW_STATUS_LABELS} />
        <ChevronRight size={17} className="cp-muted" />
      </button>
    );
  };

  let content;

  if (loading) {
    content = <p className="candidate-empty-state">Loading interviews…</p>;
  } else if (selectedId) {
    content = !selected ? (
      <div className="cp-card cp-empty">
        <h3>Interview not found</h3>
      </div>
    ) : (
      <RecruiterInterviewDetail
        key={selected._id}
        interview={selected}
        token={token}
        onUpdated={replaceInterview}
      />
    );
  } else {
    content = (
      <>
        {showForm && (
          <form className="cp-card cp-schedule-form" onSubmit={handleSchedule}>
            <div className="cp-card-head">
              <h2 className="cp-section-title">Schedule Interview</h2>
              <button type="button" className="cp-icon-btn" onClick={closeForm} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            {formError && <p className="candidate-load-error">{formError}</p>}

            <div className="cp-form-grid">
              <label className="cp-span-2">
                Candidate &amp; job
                <select
                  value={form.applicationId}
                  onChange={(e) => updateForm("applicationId", e.target.value)}
                >
                  <option value="">Select an application…</option>
                  {schedulable.map((app) => (
                    <option key={app._id} value={app._id}>
                      {app.candidate?.name || "Candidate"} — {app.job?.title || "Job"} (
                      {RECRUITER_STATUS_LABELS[app.status] || app.status})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Date
                <input
                  type="date"
                  value={form.date}
                  min={toDateInput(Date.now())}
                  onChange={(e) => updateForm("date", e.target.value)}
                />
              </label>

              <label>
                Time
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => updateForm("time", e.target.value)}
                />
              </label>

              <label>
                Interview type
                <select value={form.type} onChange={(e) => updateForm("type", e.target.value)}>
                  {INTERVIEW_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Mode
                <select value={form.mode} onChange={(e) => updateForm("mode", e.target.value)}>
                  <option value="online">Online</option>
                  <option value="in-person">In person</option>
                  <option value="phone">Phone call</option>
                </select>
              </label>

              {form.mode === "online" && (
                <label className="cp-span-2">
                  Meeting link (optional)
                  <input
                    value={form.meetingLink}
                    onChange={(e) => updateForm("meetingLink", e.target.value)}
                    placeholder="e.g. https://meet.google.com/abc-defg-hij"
                  />
                </label>
              )}

              {form.mode === "in-person" && (
                <label className="cp-span-2">
                  Location
                  <input
                    value={form.location}
                    onChange={(e) => updateForm("location", e.target.value)}
                    placeholder="Office address, floor, room"
                  />
                </label>
              )}

              <label className="cp-span-2">
                Interviewer (optional)
                <input
                  value={form.interviewerName}
                  onChange={(e) => updateForm("interviewerName", e.target.value)}
                  placeholder="e.g. Priya Sharma"
                />
              </label>

              <label className="cp-span-2">
                Notes for the candidate (optional)
                <textarea
                  className="cp-textarea"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  placeholder="What the round covers, what to bring…"
                />
              </label>
            </div>

            <div className="cp-edit-actions">
              <button type="button" className="btn small btn-outline" onClick={closeForm} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn small" disabled={saving}>
                {saving ? "Scheduling..." : "Schedule Interview"}
              </button>
            </div>
          </form>
        )}

        <div className="cp-interview-top">
          <section className="cp-block">
            <div className="cp-section-head">
              <div>
                <label>COMING UP</label>
                <h2>Upcoming Interviews</h2>
              </div>
            </div>
            {upcoming.length ? (
              <div className="cp-list">{upcoming.map(renderRow)}</div>
            ) : (
              <div className="cp-card cp-empty">
                <CalendarDays size={26} />
                <h3>No upcoming interviews</h3>
                <p>Schedule one from an application or with the button above.</p>
              </div>
            )}
          </section>

          <InterviewCalendar
            interviews={interviews}
            onSelect={(id) => setSearchParams({ id })}
          />
        </div>

        <section className="cp-block">
          <div className="cp-section-head">
            <div>
              <label>HISTORY</label>
              <h2>Past &amp; Closed Interviews</h2>
            </div>
          </div>
          {others.length ? (
            <div className="cp-list">{others.map(renderRow)}</div>
          ) : (
            <p className="candidate-empty-state">Nothing here yet.</p>
          )}
        </section>
      </>
    );
  }

  return (
    <DashboardLayout role="Recruiter">
      <div className="recruiter-command cp-page">
        {selectedId ? (
          <button type="button" className="cp-back" onClick={() => setSearchParams({})}>
            <ArrowLeft size={16} /> Back to interviews
          </button>
        ) : (
          <div className="cp-page-head cp-page-head-row">
            <div>
              <label>INTERVIEWS</label>
              <h1>Interviews</h1>
              <p>Schedule, reschedule and wrap up interviews with your candidates.</p>
            </div>
            {!showForm && (
              <button className="btn recruiter-post-btn" onClick={() => setShowForm(true)}>
                <Plus size={17} /> Schedule Interview
              </button>
            )}
          </div>
        )}

        {loadError && <p className="candidate-load-error">{loadError}</p>}
        {content}
      </div>
    </DashboardLayout>
  );
}

function RecruiterInterviewDetail({ interview, token, onUpdated }) {
  const [busy, setBusy] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(toDateInput(interview.scheduledAt));
  const [newTime, setNewTime] = useState(toTimeInput(interview.scheduledAt));

  const existing = interview.feedback || {};
  const hasFeedback = Boolean(existing.technicalSkills);
  const [editingFeedback, setEditingFeedback] = useState(false);
  const [feedback, setFeedback] = useState({
    technicalSkills: existing.technicalSkills || 3,
    communication: existing.communication || 3,
    problemSolving: existing.problemSolving || 3,
    recommendation: existing.recommendation || "Hire",
    comments: existing.comments || "",
  });

  const ModeIcon = INTERVIEW_MODE_ICONS[interview.mode] || Video;
  const isScheduled = interview.status === "scheduled";

  async function patch(payload, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return false;
    setBusy(true);
    try {
      const result = await updateInterview(interview._id, payload, token);
      onUpdated(result.interview);
      return true;
    } catch (err) {
      alert(err.message || "Could not update the interview.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleReschedule(event) {
    event.preventDefault();
    const scheduledAt = new Date(`${newDate}T${newTime}`);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
      alert("Pick a date and time in the future.");
      return;
    }
    if (await patch({ scheduledAt: scheduledAt.toISOString() })) {
      setRescheduling(false);
    }
  }

  async function handleFeedback(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await submitInterviewFeedback(interview._id, feedback, token);
      onUpdated(result.interview);
      setEditingFeedback(false);
    } catch (err) {
      alert(err.message || "Could not save feedback.");
    } finally {
      setBusy(false);
    }
  }

  const facts = [
    ["Status", <StatusChip key="s" status={interview.status} labels={INTERVIEW_STATUS_LABELS} />],
    ["Date", formatDate(interview.scheduledAt)],
    ["Time", formatTime(interview.scheduledAt)],
    ["Type", interview.type || "General interview"],
    ["Mode", INTERVIEW_MODE_LABELS[interview.mode] || capitalize(interview.mode)],
    interview.interviewerName && ["Interviewer", interview.interviewerName],
    interview.mode === "in-person" && ["Location", interview.location || "Not set"],
    interview.mode === "online" && [
      "Meeting link",
      interview.meetingLink ? (
        <a href={externalHref(interview.meetingLink)} target="_blank" rel="noreferrer">
          {interview.meetingLink}
        </a>
      ) : (
        "Not set"
      ),
    ],
  ].filter(Boolean);

  const ratingFields = [
    ["technicalSkills", "Technical skills"],
    ["communication", "Communication"],
    ["problemSolving", "Problem solving"],
  ];

  return (
    <>
      <section className="cp-card cp-detail-head">
        <div className="cp-detail-title">
          <span className="candidate-stat-icon cp-mark-lg">
            <ModeIcon size={22} />
          </span>
          <div>
            <label>INTERVIEW</label>
            <h1>{interview.candidate?.name || "Candidate"}</h1>
            <p>
              <BriefcaseBusiness size={14} /> {interview.job?.title || "Job removed"}
              {interview.candidate?.email && (
                <>
                  {" · "}
                  <Mail size={14} /> {interview.candidate.email}
                </>
              )}
            </p>
          </div>
        </div>

        <dl className="cp-facts">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        {isScheduled && !rescheduling && (
          <div className="cp-actions">
            <button
              type="button"
              className="btn small btn-outline"
              disabled={busy}
              onClick={() => setRescheduling(true)}
            >
              <CalendarDays size={15} /> Reschedule
            </button>
            <button
              type="button"
              className="btn small"
              disabled={busy}
              onClick={() => patch({ status: "completed" })}
            >
              <CheckCircle2 size={15} /> Mark Completed
            </button>
            <button
              type="button"
              className="cp-danger-btn"
              disabled={busy}
              onClick={() =>
                patch(
                  { status: "cancelled" },
                  "Cancel this interview? The candidate will see it as cancelled. Their application stage won't change."
                )
              }
            >
              Cancel Interview
            </button>
          </div>
        )}

        {rescheduling && (
          <form className="cp-reschedule" onSubmit={handleReschedule}>
            <label>
              New date
              <input
                type="date"
                value={newDate}
                min={toDateInput(Date.now())}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </label>
            <label>
              New time
              <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
            </label>
            <button type="button" className="btn small btn-outline" onClick={() => setRescheduling(false)} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="btn small" disabled={busy}>
              {busy ? "Saving..." : "Save new time"}
            </button>
          </form>
        )}
      </section>

      {interview.notes && (
        <section className="cp-card">
          <h2 className="cp-section-title">Notes shared with the candidate</h2>
          <p className="cp-body-text">{interview.notes}</p>
        </section>
      )}

      {interview.status === "completed" && (
        <section className="cp-card">
          <div className="cp-card-head">
            <h2 className="cp-section-title">Interview Feedback</h2>
            {hasFeedback && !editingFeedback && (
              <button
                type="button"
                className="candidate-text-action cp-edit-btn"
                onClick={() => setEditingFeedback(true)}
              >
                <Pencil size={14} /> Edit
              </button>
            )}
          </div>
          <p className="cp-muted cp-small cp-feedback-note">
            Internal to your team — candidates don't see this.
          </p>

          {hasFeedback && !editingFeedback ? (
            <>
              <dl className="cp-facts">
                {ratingFields.map(([key, label]) => (
                  <div key={key}>
                    <dt>{label}</dt>
                    <dd>{existing[key]} / 5</dd>
                  </div>
                ))}
                <div>
                  <dt>Recommendation</dt>
                  <dd>{existing.recommendation || "—"}</dd>
                </div>
              </dl>
              {existing.comments && (
                <p className="cp-body-text cp-feedback-comments">{existing.comments}</p>
              )}
            </>
          ) : !hasFeedback && !editingFeedback ? (
            <button type="button" className="btn small" onClick={() => setEditingFeedback(true)}>
              <Pencil size={15} /> Submit Feedback
            </button>
          ) : (
            <form onSubmit={handleFeedback}>
              <div className="cp-form-grid">
                {ratingFields.map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <select
                      value={feedback[key]}
                      onChange={(e) =>
                        setFeedback((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                      }
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} — {["Poor", "Below average", "Average", "Good", "Excellent"][n - 1]}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
                <label>
                  Recommendation
                  <select
                    value={feedback.recommendation}
                    onChange={(e) =>
                      setFeedback((prev) => ({ ...prev, recommendation: e.target.value }))
                    }
                  >
                    {FEEDBACK_RECOMMENDATIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="cp-span-2">
                  Comments
                  <textarea
                    className="cp-textarea"
                    rows={4}
                    value={feedback.comments}
                    onChange={(e) =>
                      setFeedback((prev) => ({ ...prev, comments: e.target.value }))
                    }
                    placeholder="Strengths, concerns, and anything the next interviewer should probe."
                  />
                </label>
              </div>
              <div className="cp-edit-actions">
                <button
                  type="button"
                  className="btn small btn-outline"
                  onClick={() => setEditingFeedback(false)}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button type="submit" className="btn small" disabled={busy}>
                  {busy ? "Saving..." : "Save Feedback"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </>
  );
}

/* =========================================================
   RECRUITER — PROFILE
========================================================= */

const RECRUITER_PERSONAL_FIELDS = [
  ["name", "Full name", UserRound],
  ["phone", "Phone", Phone],
];

const RECRUITER_COMPANY_FIELDS = [
  ["company", "Company name", Building2],
  ["industry", "Industry", BriefcaseBusiness],
  ["location", "Location", MapPin],
  ["companyWebsite", "Website", ExternalLink],
];

function RecruiterProfile() {
  const auth = getAuth();
  const token = auth?.token;

  const [profile, setProfile] = useState(null);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState(null); // "personal" | "company" | null
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getProfile(token), getRecruiterStats(token)])
      .then(([profileResult, statsResult]) => {
        if (cancelled) return;
        setProfile(profileResult.profile || {});
        setTotals(statsResult.totals || null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || "Could not load your profile.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const p = profile || {};
  const displayName = p.name || auth?.name || "Recruiter";

  function startEditing(section) {
    setDraft({
      name: p.name || "",
      phone: p.phone || "",
      company: p.company || "",
      industry: p.industry || "",
      location: p.location || "",
      companyWebsite: p.companyWebsite || "",
      companyDescription: p.companyDescription || "",
    });
    setEditing(section);
  }

  async function handleSave(event) {
    event.preventDefault();

    const keys =
      editing === "personal"
        ? RECRUITER_PERSONAL_FIELDS.map(([key]) => key)
        : [...RECRUITER_COMPANY_FIELDS.map(([key]) => key), "companyDescription"];
    const payload = Object.fromEntries(keys.map((key) => [key, draft[key]]));

    if ("name" in payload && !payload.name.trim()) {
      alert("Name can't be empty.");
      return;
    }

    setSaving(true);
    try {
      const result = await updateProfile(payload, token);
      setProfile(result.profile);
      setEditing(null);

      const current = getAuth();
      if (current && result.profile?.name) {
        localStorage.setItem(
          AUTH_KEY,
          JSON.stringify({ ...current, name: result.profile.name })
        );
      }
    } catch (err) {
      alert(err.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  const editButton = (section) => (
    <button
      type="button"
      className="candidate-text-action cp-edit-btn"
      onClick={() => startEditing(section)}
      disabled={Boolean(editing)}
    >
      <Pencil size={14} /> Edit
    </button>
  );

  const editActions = (
    <div className="cp-edit-actions">
      <button
        type="button"
        className="btn small btn-outline"
        onClick={() => setEditing(null)}
        disabled={saving}
      >
        Cancel
      </button>
      <button type="submit" className="btn small" disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );

  const renderFacts = (fields) => (
    <dl className="cp-facts cp-facts-grid">
      {fields.map(([key, label, Icon]) => {
        const value = p[key];
        return (
          <div key={key}>
            <dt>
              <Icon size={14} /> {label}
            </dt>
            <dd>
              {key === "companyWebsite" && value ? (
                <a href={externalHref(value)} target="_blank" rel="noreferrer">
                  {value}
                </a>
              ) : (
                value || <span className="cp-muted">Not added</span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );

  const renderInputs = (fields) =>
    fields.map(([key, label]) => (
      <label key={key}>
        {label}
        <input
          value={draft[key]}
          onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
        />
      </label>
    ));

  const overview = [
    [totals?.totalActiveOpenings, "Active jobs", BriefcaseBusiness],
    [totals?.totalApplicants, "Total applicants", Users],
    [totals?.totalInterviews, "Interviews scheduled", CalendarDays],
    [totals?.totalHires, "Candidates hired", Award],
  ];

  return (
    <DashboardLayout role="Recruiter">
      <div className="recruiter-command cp-page">
        {loadError && <p className="candidate-load-error">{loadError}</p>}

        {loading ? (
          <p className="candidate-empty-state">Loading profile…</p>
        ) : (
          <>
            <section className="cp-card cp-profile-head">
              <div className="candidate-avatar-large cp-avatar">
                {initialsOf(displayName)}
              </div>
              <div className="cp-profile-id">
                <label>RECRUITER PROFILE</label>
                <h1>{displayName}</h1>
                <p>
                  {[p.company, p.industry].filter(Boolean).join(" · ") ||
                    "Add your company details below"}
                  {p.location && (
                    <>
                      {" · "}
                      <MapPin size={14} /> {p.location}
                    </>
                  )}
                </p>
              </div>
            </section>

            <div className="cp-profile-layout">
              <div className="cp-profile-main">
                <form className="cp-card" onSubmit={handleSave}>
                  <div className="cp-card-head">
                    <h2 className="cp-section-title">Personal Information</h2>
                    {editing !== "personal" && editButton("personal")}
                  </div>
                  {editing === "personal" ? (
                    <>
                      <div className="cp-form-grid">
                        {renderInputs(RECRUITER_PERSONAL_FIELDS)}
                        <label>
                          Email
                          <input value={p.email || ""} disabled />
                        </label>
                      </div>
                      {editActions}
                    </>
                  ) : (
                    renderFacts([...RECRUITER_PERSONAL_FIELDS, ["email", "Email", Mail]])
                  )}
                </form>

                <form className="cp-card" onSubmit={handleSave}>
                  <div className="cp-card-head">
                    <h2 className="cp-section-title">Company Information</h2>
                    {editing !== "company" && editButton("company")}
                  </div>
                  {editing === "company" ? (
                    <>
                      <div className="cp-form-grid">
                        {renderInputs(RECRUITER_COMPANY_FIELDS)}
                        <label className="cp-span-2">
                          About the company
                          <textarea
                            className="cp-textarea"
                            rows={4}
                            value={draft.companyDescription}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                companyDescription: e.target.value,
                              }))
                            }
                          />
                        </label>
                      </div>
                      {editActions}
                    </>
                  ) : (
                    <>
                      {renderFacts(RECRUITER_COMPANY_FIELDS)}
                      <p className="cp-body-text cp-company-about">
                        {p.companyDescription || (
                          <span className="cp-muted">
                            Add a short description of your company.
                          </span>
                        )}
                      </p>
                    </>
                  )}
                </form>
              </div>

              <aside className="cp-profile-side">
                <section className="cp-card">
                  <h2 className="cp-section-title">Hiring Overview</h2>
                  <div className="cp-rec-counts cp-rec-counts-2">
                    {overview.map(([value, label, Icon]) => (
                      <div key={label}>
                        <Icon size={16} className="cp-count-icon" />
                        <strong>{value ?? "—"}</strong>
                        <small>{label}</small>
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

/* =========================================================
   ADMIN
========================================================= */

function Admin() {
  return (
    <DashboardLayout role="Admin">
      <div className="dash-head">
        <div>
          <label>
            ADMIN MANAGEMENT
          </label>

          <h1>
            Platform overview.
          </h1>

          <p>
            Monitor users, jobs, applications and
            system activity.
          </p>
        </div>

        <button className="btn">
          <ShieldCheck size={17} />
          Admin Tools
        </button>
      </div>

      <div className="kpi-grid">
        {[
          [
            "5,240",
            "Users",
            Users,
          ],
          [
            "1,284",
            "Jobs",
            BriefcaseBusiness,
          ],
          [
            "8,920",
            "Applications",
            FileText,
          ],
          [
            "97.4%",
            "System Health",
            ShieldCheck,
          ],
        ].map(([n, t, I]) => (
          <div
            className="kpi"
            key={t}
          >
            <span>
              <I />
            </span>

            <strong>{n}</strong>
            <small>{t}</small>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-title">
          <div>
            <h2>
              Recent platform activity
            </h2>

            <p>
              Latest user and recruiter actions
            </p>
          </div>

          <BarChart3 />
        </div>

        <table>
          <thead>
            <tr>
              <th>
                Activity
              </th>

              <th>
                User
              </th>

              <th>
                Status
              </th>

              <th>
                Time
              </th>
            </tr>
          </thead>

          <tbody>
            {[
              [
                "Resume parsed",
                "Akhila Nair",
                "Success",
                "2 min ago",
              ],
              [
                "Job posted",
                "NovaTech",
                "Approved",
                "8 min ago",
              ],
              [
                "Interview scheduled",
                "CloudNest",
                "Confirmed",
                "16 min ago",
              ],
              [
                "New recruiter",
                "PixelCraft",
                "Pending",
                "24 min ago",
              ],
            ].map((r) => (
              <tr key={r[0]}>
                {r.map((c, i) => (
                  <td
                    key={c}
                    className={
                      i === 2
                        ? "table-status"
                        : ""
                    }
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

/* =========================================================
   DASHBOARD LAYOUT
========================================================= */

function DashboardLayout({
  role,
  children,
}) {
  const navigate = useNavigate();

  const logout = () => {
    clearAuth();
    navigate("/");
  };

  const sectionPaths =
    role === "Candidate"
      ? { applications: "/applications", interviews: "/interviews", profile: "/profile" }
      : role === "Recruiter"
      ? {
          applications: "/recruiter/applications",
          interviews: "/recruiter/interviews",
          profile: "/recruiter/profile",
        }
      : { applications: "#", interviews: "#", profile: "#" };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <Link
          to="/"
          className="brand"
        >
          <span className="brand-icon">
            <BriefcaseBusiness size={20} />
          </span>

          <strong>
            HireHub
          </strong>
        </Link>

        <div className="side-role">
          {role} Portal
        </div>

        <nav>
          {role === "Candidate" && (
            <Link to="/jobs">
              <BriefcaseBusiness size={18} />
              Jobs
            </Link>
          )}

          {role === "Recruiter" && (
            <Link to="/recruiter/jobs">
              <BriefcaseBusiness size={18} />
              Jobs
            </Link>
          )}

          <Link to={sectionPaths.applications}>
            <FileText size={18} />
            Applications
          </Link>

          <Link to={sectionPaths.interviews}>
            <CalendarDays size={18} />
            Interviews
          </Link>

          <Link to={sectionPaths.profile}>
            <UserRound size={18} />
            Profile
          </Link>
        </nav>

        <button
          className="logout"
          onClick={logout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <section className="dashboard-content">
        {children}
      </section>
    </div>
  );
}

/* =========================================================
   APP ROUTES
========================================================= */

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* PUBLIC */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Auth />}
        />

        <Route
          path="/register"
          element={<Auth register />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        {/* PROTECTED JOBS */}

        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <JobsRoute />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <JobDetails />
            </ProtectedRoute>
          }
        />

        {/* CANDIDATE */}

        <Route
          path="/candidate"
          element={
            <ProtectedRoute
              roles={["Candidate"]}
            >
              {/* Overview moved to Home */}
              <Navigate to="/" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedRoute
              roles={["Candidate"]}
            >
              <CandidateApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interviews"
          element={
            <ProtectedRoute
              roles={["Candidate"]}
            >
              <CandidateInterviews />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              roles={["Candidate"]}
            >
              <CandidateProfile />
            </ProtectedRoute>
          }
        />

        {/* RECRUITER */}

        <Route
          path="/recruiter"
          element={
            <ProtectedRoute
              roles={["Recruiter"]}
            >
              {/* Overview moved to Home */}
              <Navigate to="/" replace />
            </ProtectedRoute>
          }
        />


        <Route
          path="/recruiter/jobs"
          element={
            <ProtectedRoute
              roles={["Recruiter"]}
            >
              <RecruiterJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/applications"
          element={
            <ProtectedRoute
              roles={["Recruiter"]}
            >
              <RecruiterApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/interviews"
          element={
            <ProtectedRoute
              roles={["Recruiter"]}
            >
              <RecruiterInterviews />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/profile"
          element={
            <ProtectedRoute
              roles={["Recruiter"]}
            >
              <RecruiterProfile />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              roles={["Admin"]}
            >
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>

      <footer>
        <div className="brand">
          <span className="brand-icon">
            <BriefcaseBusiness size={19} />
          </span>

          <strong>
            HireHub
          </strong>
        </div>

        <span>
          © 2026 HireHub · Smart recruitment
          platform
        </span>
      </footer>
    </>
  );
}

export default App;