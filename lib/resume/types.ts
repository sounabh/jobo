export interface ParsedResume {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  professional_summary?: string;
  skills?: string[];
  work_experience?: {
    company: string;
    title: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    is_current?: boolean;
    responsibilities?: string[];
  }[];
  education?: {
    institution: string;
    degree?: string;
    field_of_study?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
  }[];
  projects?: {
    name: string;
    description?: string;
    technologies?: string[];
    url?: string;
  }[];
  certifications?: {
    name: string;
    issuer?: string;
    issue_date?: string;
    url?: string;
  }[];
  links?: { label: string; url: string }[];
}