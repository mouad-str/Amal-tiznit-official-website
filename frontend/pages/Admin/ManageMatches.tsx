
import React, { useState, useEffect } from 'react';
import { API, Match } from '../../api';

const ManageMatches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    opponent: '',
    match_date: '',
    stadium: 'Stade de Tiznit',
    is_home: true,
    status: 'upcoming' as 'upcoming' | 'finished',
    home_score: 0,
    away_score: 0
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await API.matches.getAll();
      setMatches(data);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData); // Debug log

    try {
      if (editingMatch) {
        console.log('Updating match:', editingMatch.id);
        await API.matches.update(editingMatch.id, formData);
        alert('✅ Match updated successfully!');
      } else {
        console.log('Creating new match');
        await API.matches.create(formData);
        alert('✅ Match scheduled successfully!');
      }
      setShowForm(false);
      setEditingMatch(null);
      resetForm();
      fetchMatches();
    } catch (error) {
      console.error('Failed to save match:', error);
      alert('❌ Failed to save match. Please check the console for details.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        await API.matches.delete(id);
        fetchMatches();
      } catch (error) {
        console.error('Failed to delete match:', error);
      }
    }
  };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    setFormData({
      opponent: match.opponent,
      match_date: match.match_date.slice(0, 16),
      stadium: match.stadium,
      is_home: match.is_home,
      status: match.status,
      home_score: match.home_score || 0,
      away_score: match.away_score || 0
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      opponent: '', match_date: '', stadium: 'Stade de Tiznit', is_home: true, status: 'upcoming', home_score: 0, away_score: 0
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="text-center py-10">Loading matches...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-6">{editingMatch ? 'Edit Match' : 'Schedule New Match'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Opponent</label>
                <input type="text" value={formData.opponent} onChange={e => setFormData({ ...formData, opponent: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Date & Time</label>
                <input type="datetime-local" value={formData.match_date} onChange={e => setFormData({ ...formData, match_date: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Stadium</label>
                <input type="text" value={formData.stadium} onChange={e => setFormData({ ...formData, stadium: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2" required />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" checked={formData.is_home} onChange={() => setFormData({ ...formData, is_home: true })} />
                  <span className="text-sm font-medium">Home</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={!formData.is_home} onChange={() => setFormData({ ...formData, is_home: false })} />
                  <span className="text-sm font-medium">Away</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full border rounded-lg px-4 py-2">
                  <option value="upcoming">Upcoming</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
              {formData.status === 'finished' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Home Score</label>
                    <input type="number" value={formData.home_score} onChange={e => setFormData({ ...formData, home_score: parseInt(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Away Score</label>
                    <input type="number" value={formData.away_score} onChange={e => setFormData({ ...formData, away_score: parseInt(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2" />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => { setShowForm(false); setEditingMatch(null); resetForm(); }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingMatch ? 'Update' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-lg font-bold text-gray-800">Fixture Schedule</h3>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
            + Schedule Match
          </button>
        </div>
        <div className="space-y-4">
          {matches.map(match => (
            <div key={match.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all">
              <div className="flex items-center space-x-6">
                <div className="text-center w-16">
                  <p className="text-xs font-bold text-blue-600">{new Date(match.match_date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</p>
                  <p className="text-xl font-black">{new Date(match.match_date).getDate()}</p>
                </div>
                <div className="h-10 w-[1px] bg-gray-100"></div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {match.is_home ? 'Amal Tiznit' : match.opponent} vs {match.is_home ? match.opponent : 'Amal Tiznit'}
                  </p>
                  <p className="text-xs text-gray-400">{match.stadium} • {new Date(match.match_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {match.status === 'finished' ? (
                  <span className="text-sm font-bold">{match.home_score} - {match.away_score}</span>
                ) : (
                  <span className="text-[10px] font-bold text-green-600 uppercase bg-green-50 px-2 py-1 rounded">Upcoming</span>
                )}
                <button onClick={() => handleEdit(match)} className="bg-gray-100 p-2 rounded-lg text-gray-500 hover:text-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                </button>
                <button onClick={() => handleDelete(match.id)} className="bg-gray-100 p-2 rounded-lg text-gray-500 hover:text-red-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                </button>
              </div>
            </div>
          ))}
          {matches.length === 0 && (
            <div className="text-center py-10 text-gray-400">No matches scheduled</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageMatches;
