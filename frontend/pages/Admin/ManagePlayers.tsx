
import React, { useState, useEffect } from 'react';
import { API, Player } from '../../api';

const ManagePlayers: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    position: 'Midfielder' as 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward',
    number: 0,
    image_url: '',
    nationality: 'Moroccan',
    matches_played: 0,
    goals: 0,
    assists: 0,
    minutes_played: 0,
    yellow_cards: 0,
    red_cards: 0
  });

  // Fetch players on mount
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const data = await API.players.getAll();
      setPlayers(data);
    } catch (error) {
      console.error('Failed to fetch players:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter players by search
  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlayer) {
        await API.players.update(editingPlayer.id, formData);
      } else {
        await API.players.create(formData);
      }
      setShowForm(false);
      setEditingPlayer(null);
      resetForm();
      fetchPlayers();
    } catch (error) {
      console.error('Failed to save player:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await API.players.delete(id);
        fetchPlayers();
      } catch (error) {
        console.error('Failed to delete player:', error);
      }
    }
  };

  // Handle edit
  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      position: player.position,
      number: player.number,
      image_url: player.image_url,
      nationality: player.nationality,
      matches_played: player.matches_played,
      goals: player.goals,
      assists: player.assists,
      minutes_played: player.minutes_played,
      yellow_cards: player.yellow_cards,
      red_cards: player.red_cards
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '', position: 'Midfielder', number: 0, image_url: '', nationality: 'Moroccan',
      matches_played: 0, goals: 0, assists: 0, minutes_played: 0, yellow_cards: 0, red_cards: 0
    });
  };

  if (loading) {
    return <div className="text-center py-10">Loading players...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">{editingPlayer ? 'Edit Player' : 'Add New Player'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Position</label>
                  <select value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value as any })}
                    className="w-full border rounded-lg px-4 py-2">
                    <option>Goalkeeper</option>
                    <option>Defender</option>
                    <option>Midfielder</option>
                    <option>Forward</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Number</label>
                  <input type="number" value={formData.number} onChange={e => setFormData({ ...formData, number: parseInt(e.target.value) })}
                    className="w-full border rounded-lg px-4 py-2" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Player Image</label>
                  <div className="flex flex-col gap-3">
                    {/* Image Preview */}
                    {formData.image_url && (
                      <div className="flex items-center gap-4">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg border"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Player'; }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: '' })}
                          className="text-red-500 text-xs font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {/* URL Input */}
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="Paste image URL here..."
                      className="w-full border rounded-lg px-4 py-2"
                    />
                    {/* File Upload */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">OR</span>
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({ ...formData, image_url: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-gray-500">Upload from device</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Goals</label>
                  <input type="number" value={formData.goals} onChange={e => setFormData({ ...formData, goals: parseInt(e.target.value) })}
                    className="w-full border rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Assists</label>
                  <input type="number" value={formData.assists} onChange={e => setFormData({ ...formData, assists: parseInt(e.target.value) })}
                    className="w-full border rounded-lg px-4 py-2" />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => { setShowForm(false); setEditingPlayer(null); resetForm(); }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingPlayer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <input type="text" placeholder="Search players..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="bg-gray-50 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 w-64" />
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
            + New Player
          </button>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Player</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Position</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Number</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Stats</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPlayers.map(player => (
              <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden">
                      <img src={player.image_url || `https://ui-avatars.com/api/?name=${player.name}`} alt={player.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{player.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase">{player.nationality}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{player.position}</td>
                <td className="px-6 py-4 text-sm font-bold">#{player.number}</td>
                <td className="px-6 py-4 text-xs text-gray-500">{player.goals}G / {player.assists}A</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleEdit(player)} className="text-blue-600 text-xs font-bold uppercase hover:underline">Edit</button>
                  <button onClick={() => handleDelete(player.id)} className="text-red-500 text-xs font-bold uppercase hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPlayers.length === 0 && (
          <div className="text-center py-10 text-gray-400">No players found</div>
        )}
      </div>
    </div>
  );
};

export default ManagePlayers;
