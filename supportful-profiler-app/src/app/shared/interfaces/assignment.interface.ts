import { Profile } from './profile.interface';
import { Client } from './client.interface';

export interface Assignment {
    id?: string;
    profile: Profile;
    client: Client;
    status: AssignmentStatus;
    startDate?: Date;
    endDate?: Date;
    rate: number;
    notes: AssignmentNote[];
    additionalInfo?: {
        position?: string;
        workType?: 'remote' | 'onsite' | 'hybrid';
        [key: string]: any;
    };
    createdAt: Date;
    updatedAt: Date;
}

export type AssignmentStatus = 
    | 'proposed' 
    | 'interviewing'
    | 'offered'
    | 'accepted'
    | 'rejected'
    | 'active'
    | 'completed'
    | 'terminated';

export interface AssignmentNote {
    id?: string;
    content: string;
    type: 'general' | 'interview' | 'feedback' | 'performance' | 'issue';
    createdAt: Date;
    updatedAt: Date;
} 