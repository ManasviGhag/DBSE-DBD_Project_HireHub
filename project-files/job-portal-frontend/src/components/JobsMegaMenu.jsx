import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  MapPin,
  GraduationCap,
  ChevronRight,
  Code2,
  Database,
  Palette,
  Package,
  WalletCards,
  Megaphone,
  Wrench,
  HeartPulse,
  GraduationCap as EducationIcon,
  Headphones,
} from "lucide-react";

const jobCategories = [
  {
    id: "software",
    name: "Software & IT",
    icon: Code2,
    options: [
      "Software Developer",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "DevOps Engineer",
      "Cybersecurity",
    ],
  },
  {
    id: "data",
    name: "Data & AI",
    icon: Database,
    options: [
      "Data Analyst",
      "Data Scientist",
      "Machine Learning Engineer",
      "AI Engineer",
      "Business Intelligence",
    ],
  },
  {
    id: "design",
    name: "Design & Creative",
    icon: Palette,
    options: [
      "UI/UX Designer",
      "Graphic Designer",
      "Product Designer",
      "Visual Designer",
      "Content Designer",
    ],
  },
  {
    id: "product",
    name: "Product & Management",
    icon: Package,
    options: [
      "Product Manager",
      "Project Manager",
      "Business Analyst",
      "Program Manager",
      "Operations Manager",
    ],
  },
  {
    id: "finance",
    name: "Business & Finance",
    icon: WalletCards,
    options: [
      "Accountant",
      "Financial Analyst",
      "Investment Analyst",
      "Banking Jobs",
      "Business Consultant",
    ],
  },
  {
    id: "marketing",
    name: "Sales & Marketing",
    icon: Megaphone,
    options: [
      "Digital Marketing",
      "Marketing Executive",
      "Sales Executive",
      "SEO Specialist",
      "Social Media Manager",
    ],
  },
  {
    id: "engineering",
    name: "Engineering",
    icon: Wrench,
    options: [
      "Mechanical Engineer",
      "Civil Engineer",
      "Electrical Engineer",
      "Electronics Engineer",
      "Manufacturing Engineer",
    ],
  },
  {
    id: "healthcare",
    name: "Healthcare & Life Sciences",
    icon: HeartPulse,
    options: [
      "Medical Jobs",
      "Pharmacy",
      "Biotechnology",
      "Clinical Research",
      "Healthcare Operations",
    ],
  },
  {
    id: "education",
    name: "Education & Teaching",
    icon: EducationIcon,
    options: [
      "Teacher",
      "Lecturer",
      "Academic Counselor",
      "Training & Development",
      "Online Teaching",
    ],
  },
  {
    id: "operations",
    name: "Operations & Support",
    icon: Headphones,
    options: [
      "Customer Support",
      "Operations Executive",
      "HR Executive",
      "Administration",
      "Back Office",
    ],
  },
];

const locations = [
  "Work From Home",
  "Jobs in Hyderabad",
  "Jobs in Bengaluru",
  "Jobs in Chennai",
  "Jobs in Mumbai",
  "Jobs in Pune",
  "Jobs in Delhi",
];

const fresherOptions = [
  "Fresher Jobs",
  "Internship Opportunities",
  "Software Internships",
  "Data Science Internships",
  "Marketing Internships",
  "Remote Internships",
];

function getAuth() {
  try {
    return JSON.parse(localStorage.getItem("hirehub_auth")) || null;
  } catch {
    return null;
  }
}

export default function JobsMegaMenu({ open, onClose }) {
  const navigate = useNavigate();

  const [selected, setSelected] = useState("software");

  const selectedCategory = jobCategories.find(
    (category) => category.id === selected
  );

  const goToJobs = (params) => {
    onClose?.();

    const auth = getAuth();

    if (!auth?.isAuthenticated) {
      navigate("/login");
      return;
    }

    const query = new URLSearchParams(params).toString();

    navigate(`/jobs?${query}`);
  };

  if (!open) return null;

  return (
    <div className="jobs-mega-overlay" onClick={onClose}>
      <div
        className="jobs-mega-menu"
        onClick={(event) => event.stopPropagation()}
      >
        {/* LEFT SIDE */}
        <div className="jobs-menu-sidebar">
          <div className="jobs-menu-heading">
            <BriefcaseBusiness size={17} />
            <span>JOB CATEGORIES</span>
          </div>

          <div className="jobs-category-list">
            {jobCategories.map((category) => {
              const Icon = category.icon;
              const active = selected === category.id;

              return (
                <button
                  key={category.id}
                  className={`jobs-category-item ${
                    active ? "active" : ""
                  }`}
                  onMouseEnter={() => setSelected(category.id)}
                  onClick={() => setSelected(category.id)}
                >
                  <span className="jobs-category-icon">
                    <Icon size={16} />
                  </span>

                  <span>{category.name}</span>

                  <ChevronRight
                    size={14}
                    className="jobs-category-arrow"
                  />
                </button>
              );
            })}
          </div>

          <div className="jobs-special-links">
            <button
              className={`jobs-special-item ${
                selected === "locations" ? "active" : ""
              }`}
              onMouseEnter={() => setSelected("locations")}
              onClick={() => setSelected("locations")}
            >
              <MapPin size={16} />
              <span>Top Locations</span>
              <ChevronRight size={14} />
            </button>

            <button
              className={`jobs-special-item ${
                selected === "freshers" ? "active" : ""
              }`}
              onMouseEnter={() => setSelected("freshers")}
              onClick={() => setSelected("freshers")}
            >
              <GraduationCap size={16} />
              <span>Fresher & Internships</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="jobs-menu-content">
          {selected === "locations" ? (
            <>
              <div className="jobs-content-heading">
                <MapPin size={18} />
                <div>
                  <h3>Top Locations</h3>
                  <p>Explore opportunities by location</p>
                </div>
              </div>

              <div className="jobs-options-list">
                {locations.map((location) => (
                  <button
                    key={location}
                    onClick={() => {
                      if (location === "Work From Home") {
                        goToJobs({ location: "Remote" });
                      } else {
                        goToJobs({
                          location: location
                            .replace("Jobs in ", ""),
                        });
                      }
                    }}
                  >
                    <span>{location}</span>
                    <ChevronRight size={15} />
                  </button>
                ))}
              </div>
            </>
          ) : selected === "freshers" ? (
            <>
              <div className="jobs-content-heading">
                <GraduationCap size={18} />
                <div>
                  <h3>Fresher & Internships</h3>
                  <p>Start your career with the right opportunity</p>
                </div>
              </div>

              <div className="jobs-options-list">
                {fresherOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      if (option === "Fresher Jobs") {
                        goToJobs({ experience: "fresher" });
                      } else if (
                        option === "Internship Opportunities"
                      ) {
                        goToJobs({ type: "internship" });
                      } else if (
                        option === "Software Internships"
                      ) {
                        goToJobs({
                          type: "internship",
                          category: "software",
                        });
                      } else if (
                        option === "Data Science Internships"
                      ) {
                        goToJobs({
                          type: "internship",
                          category: "data",
                        });
                      } else if (
                        option === "Marketing Internships"
                      ) {
                        goToJobs({
                          type: "internship",
                          category: "marketing",
                        });
                      } else {
                        goToJobs({
                          type: "internship",
                          location: "Remote",
                        });
                      }
                    }}
                  >
                    <span>{option}</span>
                    <ChevronRight size={15} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="jobs-content-heading">
                {selectedCategory &&
                  React.createElement(selectedCategory.icon, {
                    size: 18,
                  })}

                <div>
                  <h3>{selectedCategory?.name}</h3>
                  <p>
                    Explore popular roles in{" "}
                    {selectedCategory?.name}
                  </p>
                </div>
              </div>

              <div className="jobs-options-list">
                {selectedCategory?.options.map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      goToJobs({
                        q: option,
                        category: selectedCategory.id,
                      })
                    }
                  >
                    <span>{option}</span>
                    <ChevronRight size={15} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}