export interface CreateWheelParams {
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
}

export async function createWheel({ name, options, isPublic = false }: CreateWheelParams): Promise<Wheel> {
  const idToken = localStorage.getItem('googleCredential');
  if (!idToken) throw new Error('Not authenticated');
  const response = await fetch('http://localhost:5001/api/wheels', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ name, options, isPublic }),
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
  const response = await fetch('http://localhost:5001/api/wheels', {
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