import { useOutletContext, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Wheel } from '../components/Wheel';
import { getWheels, type Wheel as WheelType, deleteWheel, updateWheel } from '../api';

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
  const [editWheel, setEditWheel] = useState<WheelType | null>(null);
  const [editName, setEditName] = useState('');
  const [editOptions, setEditOptions] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'lastUsed' | 'name' | 'createdAt'>('lastUsed');

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

  const openEditModal = (wheel: WheelType) => {
    setEditWheel(wheel);
    setEditName(wheel.name);
    setEditOptions(wheel.options.join(', '));
    setEditIsPublic(wheel.isPublic);
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    const optionsArr = editOptions.split(',').map(opt => opt.trim()).filter(Boolean);
    if (optionsArr.length < 2) {
      setEditError('Please enter at least 2 options.');
      setEditLoading(false);
      return;
    }
    try {
      if (!editWheel) return;
      const updated = await updateWheel(editWheel.id, {
        name: editName,
        options: optionsArr,
        isPublic: editIsPublic,
      });
      setWheels(wheels => wheels.map(w => w.id === updated.id ? updated : w));
      setEditWheel(null);
    } catch (err: any) {
      if (err.message && err.message.includes('unique')) {
        setEditError('You already have a wheel with this name. Please choose a different name.');
      } else {
        setEditError(err.message || 'Failed to update wheel');
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Sort wheels before rendering
  const sortedWheels = [...wheels].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      // lastUsed (default)
      const aLast = a.lastUsed || a.createdAt;
      const bLast = b.lastUsed || b.createdAt;
      return new Date(bLast).getTime() - new Date(aLast).getTime();
    }
  });

  return (
    <div style={{ width: '100%' }}>
      <section className="wheels-section">
        <h2>Your Wheels</h2>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label htmlFor="sortBy" style={{ fontWeight: 500, color: 'var(--primary-color)', fontSize: '1.05rem' }}>Sort by:</label>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            padding: '0.3rem 1rem',
            display: 'flex',
            alignItems: 'center',
            border: '1.5px solid var(--accent-color)'
          }}>
            <select
              id="sortBy"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '1.05rem',
                color: 'var(--primary-color)',
                fontWeight: 500,
                outline: 'none',
                padding: '0.2rem 0',
                minWidth: 120,
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
              }}
            >
              <option value="lastUsed">Last Used</option>
              <option value="name">Wheel Name</option>
              <option value="createdAt">Created Date</option>
            </select>
            <span style={{ marginLeft: 8, color: 'var(--accent-color)', fontSize: 18, pointerEvents: 'none' }}>▼</span>
          </div>
        </div>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div className="wheels-grid">
          {sortedWheels.map(wheel => (
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
                <button className="edit-button" onClick={() => openEditModal(wheel)}>Edit</button>
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
        {/* Edit Wheel Modal */}
        {editWheel && (
          <div className="modal-overlay">
            <div className="modal">
              <button className="close-button" onClick={() => setEditWheel(null)}>×</button>
              <h2>Edit Wheel</h2>
              <form className="create-form" onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label htmlFor="editWheelName">Wheel Name</label>
                  <input
                    type="text"
                    id="editWheelName"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editWheelOptions">Options (comma-separated)</label>
                  <input
                    type="text"
                    id="editWheelOptions"
                    value={editOptions}
                    onChange={e => setEditOptions(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <input
                    type="checkbox"
                    id="editIsPublic"
                    checked={editIsPublic}
                    onChange={e => setEditIsPublic(e.target.checked)}
                  />
                  <label htmlFor="editIsPublic">Make this wheel public</label>
                </div>
                {editError && <div style={{ color: 'red', marginBottom: '1rem' }}>{editError}</div>}
                <div className="form-actions">
                  <button type="submit" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save Changes'}</button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setEditWheel(null)}
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
} 