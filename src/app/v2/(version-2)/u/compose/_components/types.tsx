export interface Contact {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
  }
  
  export interface EmailAccount {
    id: string;
    name: string;
    email: string;
  }
  
  export interface EmailData {
    to: Contact[];
    cc?: Contact[];
    bcc?: Contact[];
    subject: string;
    body: string;
  }