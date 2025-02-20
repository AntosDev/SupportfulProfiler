export interface Profile {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    title: string;
    skills: string[];
    experience: number;
    rate: number;
    availability: 'immediate' | 'two_weeks' | 'one_month' | 'unavailable';
    location: string;
    timezone: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    preferredWorkType: 'remote' | 'onsite' | 'hybrid';
    notes: ProfileNote[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ProfileNote {
    id?: number;
    content: string;
    type: 'general' | 'interview' | 'feedback' | 'performance';
    createdAt: Date;
    updatedAt: Date;
} 