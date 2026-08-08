import React, { useState, useEffect } from 'react';
import { API, Match } from '../../api';
import { Calendar, MapPin, Clock, Trophy, Trash2, Edit2, Plus, X } from 'lucide-react';

const ManageMatches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    opponent: '',
    match_date: '',
    stadium: 'Stade El Massira, Tiznit',
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
    try {
      if (editingMatch) {
        await API.matches.update(editingMatch.id, formData);
      } else {
        await API.matches.create(formData);
      }
      setShowForm(false);
      setEditingMatch(null);
      resetForm();
      fetchMatches();
    } catch (error) {
      console.error('Failed to save match:', error);
      alert('Erreur lors de la sauvegarde du match.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce match ?')) {
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
      opponent: '', 
      match_date: '', 
      stadium: 'Stade El Massira, Tiznit', 
      is_home: true, 
      status: 'upcoming', 
      home_score: 0, 
      away_score: 0
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-widest font-bold">Chargement des rencontres...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0E182A] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-amber-500"></div>
            
            <button 
              onClick={() => { setShowForm(false); setEditingMatch(null); resetForm(); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 border border-white/10"
            >
              <X size={16} />
            </button>

            <div className="p-6 sm:p-8">
              <h3 className="text-lg font-bold font-display uppercase tracking-tight text-white mb-6">
                {editingMatch ? 'Modifier la Rencontre' : 'Planifier un Match'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">Adversaire</label>
                  <input 
                    type="text" 
                    value={formData.opponent} 
                    onChange={e => setFormData({ ...formData, opponent: e.target.value })}
                    className="w-full bg-[#040914] border border-white/10 rounded-xl py-2.5 px-4 text-white text-xs font-bold focus:outline-none focus:border-blue-500" 
                    required 
                    placeholder="ex: Kawkab Marrakech"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">Date & Heure</label>
                  <input 
                    type="datetime-local" 
                    value={formData.match_date} 
                    onChange={e => setFormData({ ...formData, match_date: e.target.value })}
                    className="w-full bg-[#040914] border border-white/10 rounded-xl py-2.5 px-4 text-white text-xs font-bold focus:outline-none focus:border-blue-500 font-mono" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">Stade</label>
                  <input 
                    type="text" 
                    value={formData.stadium} 
                    onChange={e => setFormData({ ...formData, stadium: e.target.value })}
                    className="w-full bg-[#040914] border border-white/10 rounded-xl py-2.5 px-4 text-white text-xs font-bold focus:outline-none focus:border-blue-500" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">Lieu du match</label>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer select-none">
                      <input 
                        type="radio" 
                        name="is_home"
                        checked={formData.is_home} 
                        onChange={() => setFormData({ ...formData, is_home: true })} 
                        className="text-blue-600 focus:ring-0 focus:ring-offset-0 bg-transparent border-white/10"
                      />
                      <span>Domicile (USAT Stadium)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer select-none">
                      <input 
                        type="radio" 
                        name="is_home"
                        checked={!formData.is_home} 
                        onChange={() => setFormData({ ...formData, is_home: false })} 
                        className="text-blue-600 focus:ring-0 focus:ring-offset-0 bg-transparent border-white/10"
                      />
                      <span>Extérieur (Terrain adverse)</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">Statut</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-[#040914] border border-white/10 rounded-xl py-2.5 px-4 text-white text-xs font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="upcoming">À venir (Upcoming)</option>
                    <option value="finished">Terminé (Finished)</option>
                  </select>
                </div>
                
                {formData.status === 'finished' && (
                  <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5 animate-slide-up">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">Buts USAT</label>
                      <input 
                        type="number" 
                        min={0}
                        value={formData.home_score} 
                        onChange={e => setFormData({ ...formData, home_score: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#040914] border border-white/10 rounded-xl py-2.5 px-4 text-white text-xs font-bold focus:outline-none focus:border-blue-500 font-mono" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">Buts Adversaire</label>
                      <input 
                        type="number" 
                        min={0}
                        value={formData.away_score} 
                        onChange={e => setFormData({ ...formData, away_score: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#040914] border border-white/10 rounded-xl py-2.5 px-4 text-white text-xs font-bold focus:outline-none focus:border-blue-500 font-mono" 
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { setShowForm(false); setEditingMatch(null); resetForm(); }}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest cursor-pointer shadow-lg"
                  >
                    {editingMatch ? 'Enregistrer' : 'Planifier'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-[#0E182A]/90 border border-white/10 rounded-2xl shadow-xl p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight font-display">Calendrier des Matchs</h3>
            <p className="text-xs text-gray-400 mt-1">Gestion des calendriers de fixtures et résultats de match</p>
          </div>
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <Plus size={14} />
            <span>Planifier un Match</span>
          </button>
        </div>

        <div className="space-y-4">
          {matches.map(match => (
            <div 
              key={match.id} 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-white/5 hover:border-white/15 bg-white/5 hover:bg-white/10 rounded-2xl transition-all gap-4"
            >
              <div className="flex items-center gap-5 w-full sm:w-auto">
                <div className="text-center w-16 bg-[#040914] py-2.5 rounded-xl border border-white/10 shrink-0">
                  <p className="text-[10px] font-black text-amber-400 font-mono tracking-widest uppercase">
                    {new Date(match.match_date).toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}
                  </p>
                  <p className="text-xl font-black text-white font-mono mt-0.5">{new Date(match.match_date).getDate()}</p>
                </div>
                <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                    {match.is_home ? 'US Amal Tiznit' : match.opponent} <span className="text-amber-400 mx-1">VS</span> {match.is_home ? match.opponent : 'US Amal Tiznit'}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 items-center text-[10px] text-gray-400 mt-1.5 uppercase font-medium">
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-amber-400" /> {match.stadium}</span>
                    <span className="flex items-center gap-1"><Clock size={12} className="text-amber-400" /> {new Date(match.match_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <div>
                  {match.status === 'finished' ? (
                    <span className="text-sm font-black font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-white">
                      {match.home_score} - {match.away_score}
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      À venir
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(match)} 
                    className="bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded-xl text-gray-400 hover:text-blue-400 transition-colors cursor-pointer"
                    title="Modifier"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(match.id)} 
                    className="bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded-xl text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {matches.length === 0 && (
            <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
              <Trophy size={36} className="mx-auto mb-3 opacity-30 text-amber-400" />
              <p className="text-xs uppercase font-bold tracking-wider">Aucune rencontre planifiée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageMatches;
