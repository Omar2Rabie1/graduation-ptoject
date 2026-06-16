export interface WorkerTask {
  id: string;
  reportId: string;
  title: string;
  description: string;
  status: string;
  priority?: string;
  assignedDate?: string;
  dueDate?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  images?: string[];
  notes?: string;
  reporterName?: string;
  category?: string;
  submittedByName?: string;
  submittedAt?: string;
  assignedAt?: string;
  rejectionReason?: string;
  mapUrl?: string;
  assignedByName?: string;
  [key: string]: unknown;
}

export interface MarkFixedRequest {
  comment?: string | null;
}

export interface MarkBlockedRequest {
  reason: string;
}

export interface RejectTaskRequest {
  reason?: string | null;
}

export interface WorkerListQuery {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: string;
}

export function reportIdFromTask(task: WorkerTask): string {
  return String(task.reportId ?? task.id ?? '').trim();
}

export function mapWorkerTask(task: any): WorkerTask {
  if (!task) return task;

  const rawPhotos = task.images || task.photos || task.photoUrls || task.photosPreview || [];
  const category = task.category || (task as any).categoryName || '';
  
  const formatPhotoUrl = (path: any): string => {
    if (!path) return '';
    let url = '';
    if (typeof path === 'string') {
      url = path;
    } else if (path && typeof path === 'object') {
      url = path.imageUrl || path.url || path.photoUrl || '';
    }
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    let cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    if (cleanUrl.startsWith('wwwroot/')) {
      cleanUrl = cleanUrl.substring(8);
    }
    return `https://irs-main.runasp.net/${cleanUrl}`;
  };

  const images = Array.isArray(rawPhotos)
    ? rawPhotos.map(p => formatPhotoUrl(p)).filter(url => !!url)
    : [];

  return {
    ...task,
    images,
    category
  };
}
