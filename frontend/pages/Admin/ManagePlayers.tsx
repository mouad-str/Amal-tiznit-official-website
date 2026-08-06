import React, { useState, useEffect } from 'react';
import { API, Player } from '../../api';
import { Upload, X, Check, Image as ImageIcon, AlertCircle, Trash2, Edit2, Plus, Search } from 'lucide-react';

const PRESET_IMAGES = [
  '/Assets/bg.jpg',
  '/Assets/bg1.jpg',
  '/Assets/bg2.jpg',
];

const ManagePlayers: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    position: 'Midfielder' as 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward',
    number: 1,
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

  // Compress image before setting to state
  const handleImageFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setFormData(prev => ({ ...prev, image_url: compressedBase64 }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Filter players by search
  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(p.number).includes(searchTerm)
  );

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg('Le nom du joueur est obligatoire.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        number: Number(formData.number) || 1,
        goals: Number(formData.goals) || 0,
        assists: Number(formData.assists) || 0,
        matches_played: Number(formData.matches_played) || 0,
        image_url: formData.image_url || '/Assets/bg2.jpg'
      };

      if (editingPlayer) {
        await API.players.update(editingPlayer.id, payload);
      } else {
        await API.players.create(payload);
      }

      setShowForm(false);
      setEditingPlayer(null);
      resetForm();
      fetchPlayers();
    } catch (error: any) {
      console.error('Failed to save player:', error);
      setErrorMsg(error.message || 'Échec de la sauvegarde du joueur.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce joueur ?')) {
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
      name: player.name || '',
      position: player.position || 'Midfielder',
      number: player.number || 1,
      image_url: player.image_url || '',
      nationality: player.nationality || 'Moroccan',
      matches_played: player.matches_played || 0,
      goals: player.goals || 0,
      assists: player.assists || 0,
      minutes_played: player.minutes_played || 0,
      yellow_cards: player.yellow_cards || 0,
      red_cards: player.red_cards || 0
    });
    setErrorMsg(null);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '', position: 'Midfielder', number: 1, image_url: '', nationality: 'Moroccan',
      matches_played: 0, goals: 0, assists: 0, minutes_played: 0, yellow_cards: 0, red_cards: 0
    });
    setErrorMsg(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-black uppercase text-[#001226] font-display">Gestion de l'Effectif</h2>
          <p className="text-xs text-gray-500">Ajoutez, modifiez et téléchargez les photos des joueurs d'Amal Tiznit.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(true); }} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
        >
          <Plus size={16} /> Nouveau Joueur
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-black uppercase text-[#001226] font-display">
                {editingPlayer ? `Modifier ${editingPlayer.name}` : 'Ajouter Un Joueur'}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingPlayer(null); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs font-bold">
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nom Du Joueur</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ex: Sofiane Rahimi"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Poste</label>
                  <select 
                    value={formData.position} 
                    onChange={e => setFormData({ ...formData, position: e.target.value as any })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Goalkeeper">Gardien (Goalkeeper)</option>
                    <option value="Defender">Défenseur (Defender)</option>
                    <option value="Midfielder">Milieu (Midfielder)</option>
                    <option value="Forward">Attaquant (Forward)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Numéro Maillot</label>
                  <input 
                    type="number" 
                    value={formData.number} 
                    onChange={e => setFormData({ ...formData, number: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nationalité</label>
                  <input 
                    type="text" 
                    value={formData.nationality} 
                    onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none" 
                  />
                </div>

                {/* Photo Upload Section */}
                <div className="sm:col-span-2 space-y-3 pt-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase">Photo Officielle</label>
                  
                  {/* Image Preview */}
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-16 h-16 bg-white rounded-lg border overflow-hidden flex-shrink-0">
                      <img
                        src={formData.image_url || '/Assets/bg2.jpg'}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/Assets/bg2.jpg'; }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-gray-800 block truncate">
                        {formData.image_url?.startsWith('data:') ? '📷 Photo Téléchargée de l\'appareil' : (formData.image_url || 'Photo par défaut')}
                      </span>
                      <span className="text-[10px] text-gray-400">Format accepté: JPG, PNG, WEBP</span>
                    </div>

                    {formData.image_url && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="text-red-500 hover:text-red-700 text-xs font-bold"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="cursor-pointer border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 p-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <Upload size={16} className="text-blue-600" />
                      <span className="text-xs font-bold text-blue-700 uppercase">Choisir une Image...</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFileUpload(file);
                        }}
                      />
                    </label>

                    {/* Presets */}
                    <div className="flex items-center justify-around bg-gray-50 border p-1 rounded-xl">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Presets:</span>
                      {PRESET_IMAGES.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: img })}
                          className={`w-8 h-8 rounded-lg overflow-hidden border-2 ${formData.image_url === img ? 'border-blue-600 scale-110' : 'border-transparent'}`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Buts</label>
                  <input 
                    type="number" 
                    value={formData.goals} 
                    onChange={e => setFormData({ ...formData, goals: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Passes Décisives</label>
                  <input 
                    type="number" 
                    value={formData.assists} 
                    onChange={e => setFormData({ ...formData, assists: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => { setShowForm(false); setEditingPlayer(null); resetForm(); }}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold uppercase hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  {editingPlayer ? 'Mettre À Jour' : 'Créer Joueur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher un joueur..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-600 outline-none" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Joueur</th>
                <th className="px-6 py-3.5">Poste</th>
                <th className="px-6 py-3.5">Numéro</th>
                <th className="px-6 py-3.5">Statistiques</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredPlayers.map(player => (
                <tr key={player.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                        <img 
                          src={player.image_url || '/Assets/bg2.jpg'} 
                          alt={player.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { (e.target as HTMLImageElement).src = '/Assets/bg2.jpg'; }}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-[#001226] text-sm">{player.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase">{player.nationality || 'Moroccan'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">{player.position}</td>
                  <td className="px-6 py-4 font-black font-mono text-[#001226]">#{player.number}</td>
                  <td className="px-6 py-4 font-mono text-gray-600">
                    <span className="font-bold text-blue-700">{player.goals}G</span> / <span className="font-bold text-emerald-700">{player.assists}A</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleEdit(player)} 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(player.id)} 
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-xs italic">Aucun joueur trouvé dans l'effectif.</div>
        )}
      </div>
    </div>
  );
};

export default ManagePlayers;
