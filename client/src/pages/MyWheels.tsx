import { useOutletContext, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Wheel } from '../components/Wheel';
import { getWheels, type Wheel as WheelType, deleteWheel } from '../api';

interface DashboardContext {
  userData: {
    name: string;
    email: string;
    picture: string;
  };
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;
  refreshWheels?: number;
  setRefreshWheels?: (r: number) => void;
}

export default function MyWheels() {
  const navigate = useNavigate();
  const { userData, refreshWheels } = useOutletContext<DashboardContext>();
  const [wheels, setWheels] = useState<WheelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    getWheels()
      .then(setWheels)
      .catch(err => setError(err.message || 'Failed to fetch wheels'))
      .finally(() => setLoading(false));
  }, [refreshWheels]);

  const handleDelete = async (wheelId: string) => {
    setDeletingId(wheelId);
    setError(null);
    try {
      await deleteWheel(wheelId);
      setWheels(wheels => wheels.filter(w => w.id !== wheelId));
      setConfirmDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete wheel');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <section className="wheels-section">
        <h2>Your Wheels</h2>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div className="wheels-grid">
          {wheels.map(wheel => (
            <div key={wheel.id} className="wheel-card">
              <h3>{wheel.name}</h3>
              <p>Created: {new Date(wheel.createdAt).toLocaleDateString()}</p>
              <div style={{ marginTop: '1rem' }}>
                <Wheel options={wheel.options} spinning={false} />
              </div>
              <div className="wheel-actions" style={{marginTop: '1rem'}}>
                <button
                  className="cta-button"
                  style={{background: 'var(--button-bg)', color: 'white', fontWeight: 600}}
                  onClick={() => navigate(`/dashboard/wheel/${wheel.id}`)}
                >
                  Use Wheel
                </button>
                <button className="edit-button">Edit</button>
                <button
                  className="delete-button"
                  disabled={deletingId === wheel.id}
                  onClick={() => setConfirmDelete({ id: wheel.id, name: wheel.name })}
                >
                  {deletingId === wheel.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="modal-overlay">
            <div className="modal">
              <button className="close-button" onClick={() => setConfirmDelete(null)}>×</button>
              <h2>Delete Wheel</h2>
              <p>Are you sure you want to delete <b>{confirmDelete.name}</b>? This cannot be undone.</p>
              <div className="form-actions" style={{marginTop: '2rem', display: 'flex', gap: '1rem'}}>
                <button
                  className="delete-button"
                  style={{minWidth: 120}}
                  disabled={deletingId === confirmDelete.id}
                  onClick={() => handleDelete(confirmDelete.id)}
                >
                  {deletingId === confirmDelete.id ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  className="cancel-button"
                  style={{minWidth: 120}}
                  onClick={() => setConfirmDelete(null)}
                  disabled={deletingId === confirmDelete.id}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
} 