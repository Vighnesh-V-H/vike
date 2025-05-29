export type Lead = {
  id: string;
  name?: string;
  company?: string;
  position?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    linkedin?: string;
  };
  website?: string;
  description?: string;
  industry?: string;
  location?: string;
};
