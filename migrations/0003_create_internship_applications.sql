PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS internship_applications (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  college TEXT,
  course TEXT,
  graduation_year TEXT,
  internship_program TEXT NOT NULL CHECK (internship_program IN ('Web Development Internship', 'Software Development Internship', 'UI/UX Design Internship')),
  technical_skills TEXT,
  experience_level TEXT,
  portfolio_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  resume_reference TEXT,
  motivation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected')),
  admin_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_internship_applications_email ON internship_applications (email);
CREATE INDEX IF NOT EXISTS idx_internship_applications_program ON internship_applications (internship_program);
CREATE INDEX IF NOT EXISTS idx_internship_applications_status ON internship_applications (status);
CREATE INDEX IF NOT EXISTS idx_internship_applications_created_at ON internship_applications (created_at);
