import { IssueStatus } from '../enums/issue-status.enum';
import { IssueCategory } from '../enums/issue-category.enum';

export interface Issue {
    id: string;
    title: string;
    description: string;
    category: IssueCategory;
    status: IssueStatus;
    latitude: number;
    longitude: number;
    reportedBy: string;
    assignedTo?: string;
    createdAt: string;
    updatedAt?: string;
}
