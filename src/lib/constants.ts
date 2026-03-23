
export interface InstitutionalUnit {
  id: string;
  name: string;
  category: "Undergraduate" | "Medical & Health" | "Professional" | "Post-Graduate" | "K-12" | "Other";
}

export const NEU_COLLEGES: InstitutionalUnit[] = [
  // Undergraduate Colleges
  { id: "COA", name: "College of Accountancy", category: "Undergraduate" },
  { id: "COAG", name: "College of Agriculture", category: "Undergraduate" },
  { id: "CAS", name: "College of Arts and Sciences", category: "Undergraduate" },
  { id: "CBA", name: "College of Business Administration", category: "Undergraduate" },
  { id: "CCOMM", name: "College of Communication", category: "Undergraduate" },
  { id: "CICS", name: "College of Computer Studies / Informatics", category: "Undergraduate" },
  { id: "CCJ", name: "College of Criminology", category: "Undergraduate" },
  { id: "COED", name: "College of Education", category: "Undergraduate" },
  { id: "CEA", name: "College of Engineering & Architecture", category: "Undergraduate" },
  { id: "COMUS", name: "College of Music", category: "Undergraduate" },
  
  // Medical & Health Allied Sciences
  { id: "COM", name: "College of Medicine", category: "Medical & Health" },
  { id: "COL", name: "College of Law", category: "Professional" },
  { id: "CON", name: "College of Nursing", category: "Medical & Health" },
  { id: "CMT", name: "College of Medical Technology", category: "Medical & Health" },
  { id: "CPT", name: "College of Physical Therapy", category: "Medical & Health" },
  { id: "CRT", name: "College of Respiratory Therapy", category: "Medical & Health" },
  { id: "CMID", name: "College of Midwifery", category: "Medical & Health" },
  
  // Post-Graduate & Specialized
  { id: "SGS", name: "School of Graduate Studies", category: "Post-Graduate" },
  { id: "SIR", name: "School of International Relations", category: "Post-Graduate" },
  { id: "IS", name: "Integrated School", category: "K-12" },
  
  // External
  { id: "EXTERNAL", name: "External / Guest", category: "Other" },
];

export interface LibraryPurpose {
  id: string;
  label: string;
  category: "Academic & Research" | "Study & Productivity" | "Community & Culture" | "Other";
}

export const LIBRARY_PURPOSES: LibraryPurpose[] = [
  // Academic & Research Support
  { id: "collections", label: "Accessing Diverse Collections", category: "Academic & Research" },
  { id: "research", label: "Conducting Research", category: "Academic & Research" },
  { id: "assistance", label: "Expert Assistance (ERA)", category: "Academic & Research" },
  { id: "literacy", label: "Information Literacy / Orientation", category: "Academic & Research" },
  
  // Study & Productivity
  { id: "study", label: "Quiet Study & Productivity", category: "Study & Productivity" },
  { id: "technology", label: "Technological Access (Wi-Fi/PC)", category: "Study & Productivity" },
  { id: "printing", label: "Printing & Scanning Services", category: "Study & Productivity" },
  
  // Community & Culture
  { id: "art", label: "Art Exhibit & Creativity", category: "Community & Culture" },
  { id: "literary", label: "Literary Events & Book Talk", category: "Community & Culture" },
  { id: "outreach", label: "Community Outreach Programs", category: "Community & Culture" },
  { id: "values", label: "Value-Based Learning & Mission", category: "Community & Culture" },
];
