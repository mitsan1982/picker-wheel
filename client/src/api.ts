export interface CreateWheelParams {
  userId: string;
  name: string;
  options: string[];
  isPublic?: boolean;
}

export interface Wheel {
  id: string;
  userId: string;
  name: string;
  options: string[];
  createdAt: string;
  spins: number;
  isPublic: boolean;
  lastUsed?: string;
}

const API_BASE_URL = 'https://pickle-wheel.onrender.com';

export async function createWheel({ userId, name, options, isPublic = false }: CreateWheelParams): Promise<Wheel> {
  const idToken = localStorage.getItem('googleCredential');
  if (!idToken) throw new Error('Not authenticated');
  const response = await fetch(`${API_BASE_URL}/api/wheels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ userId, name, options, isPublic }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create wheel');
  }
  return await response.json();
}

export async function getWheels(): Promise<Wheel[]> {
  const idToken = localStorage.getItem('googleCredential');
  if (!idToken) throw new Error('Not authenticated');
  const response = await fetch(`${API_BASE_URL}/api/wheels`, {
    headers: {
      'Authorization': `Bearer ${idToken}`,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch wheels');
  }
  return await response.json();
}

export async function deleteWheel(wheelId: string): Promise<void> {
  const idToken = localStorage.getItem('googleCredential');
  if (!idToken) throw new Error('Not authenticated');
  const response = await fetch(`${API_BASE_URL}/api/wheels/${wheelId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${idToken}`,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete wheel');
  }
}

export async function getWheelById(id: string): Promise<Wheel> {
  const idToken = localStorage.getItem('googleCredential');
  if (!idToken) throw new Error('Not authenticated');
  const response = await fetch(`${API_BASE_URL}/api/wheels/${id}`, {
    headers: {
      'Authorization': `Bearer ${idToken}`,
    },
  });
  if (!response.ok) {
    throw new Error('Wheel not found.');
  }
  return await response.json();
}

export async function updateWheel(id: string, data: { name: string; options: string[]; isPublic: boolean }): Promise<Wheel> {
  const idToken = localStorage.getItem('googleCredential');
  if (!idToken) throw new Error('Not authenticated');
  const response = await fetch(`${API_BASE_URL}/api/wheels/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update wheel');
  }
  return await response.json();
}

export async function spinWheel(id: string): Promise<Wheel> {
  const idToken = localStorage.getItem('googleCredential');
  if (!idToken) throw new Error('Not authenticated');
  const response = await fetch(`${API_BASE_URL}/api/wheels/${id}/spin`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to spin wheel');
  }
  return await response.json();
} 