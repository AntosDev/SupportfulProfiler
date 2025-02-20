import { Profile } from './profile.interface';
import { Client } from './client.interface';

export interface Assignment {
    id?: number;
    profile: Profile;
    client: Client;
    status: AssignmentStatus;
    startDate?: Date;
    endDate?: Date;
    rate: number;
    position: string;
    workType: 'remote' | 'onsite' | 'hybrid';
    notes: AssignmentNote[];
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
    id?: number;
    content: string;
    type: 'general' | 'interview' | 'feedback' | 'performance' | 'issue';
    createdAt: Date;
    updatedAt: Date;
} 