export interface Client {
    id: string;
    companyName: string;
    industry: string;
    website?: string;
    description?: string;
    primaryContactName: string;
    primaryContactEmail: string;
    primaryContactPhone?: string;
    locations?: string[];
    status: 'active' | 'inactive' | 'pending';
    assignments?: any[];
    requirements?: Record<string, any>;
    additionalInfo?: Record<string, any>;
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