export interface Profile {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    title: string;
    summary: string;
    skills: string[];
    yearsOfExperience: number;
    expectedRate: number;
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