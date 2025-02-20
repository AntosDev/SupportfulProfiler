export interface Client {
    id?: number;
    companyName: string;
    industry: string;
    primaryContact: ContactPerson;
    additionalContacts?: ContactPerson[];
    location: string;
    timezone: string;
    website?: string;
    notes: ClientNote[];
    status: 'active' | 'inactive' | 'potential';
    createdAt: Date;
    updatedAt: Date;
}

export interface ContactPerson {
    id?: number;
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone?: string;
    isMainContact: boolean;
}

export interface ClientNote {
    id?: number;
    content: string;
    type: 'general' | 'meeting' | 'requirement' | 'feedback';
    createdAt: Date;
    updatedAt: Date;
} 