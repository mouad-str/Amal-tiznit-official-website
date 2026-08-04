
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../../api';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    players: 0,
    matches: 0,
    news: 0,
    products: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [players, matches, news, products] = await Promise.all([
          API.players.getAll(),
          API.matches.getAll(),
          API.news.getAll(),
          API.shop.getAll()
        ]);
        setStats({
          players: players.length,
          matches: matches.filter(m => m.status === 'upcoming').length,
          news: news.length,
          products: products.length
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Players', value: stats.players, change: 'Active roster', color: 'bg-blue-600', link: '/admin/players' },
    { label: 'Upcoming Matches', value: stats.matches, change: 'Scheduled', color: 'bg-green-600', link: '/admin/matches' },
    { label: 'News Articles', value: stats.news, change: 'Published', color: 'bg-yellow-600', link: '/admin/news' },
    { label: 'Shop Products', value: stats.products, change: 'Available', color: 'bg-purple-600', link: '/admin/dashboard' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Link to={stat.link} key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-gray-500 mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-gray-800">{loading ? '...' : stat.value}</h3>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-50 text-gray-400 uppercase">{stat.change}</span>
            </div>
            <div className={`h-1 w-full mt-4 rounded-full bg-gray-100 overflow-hidden`}>
              <div className={`h-full ${stat.color} w-2/3`}></div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h4 className="font-bold text-gray-800 mb-6 uppercase tracking-tight">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/players" className="p-4 border border-gray-100 hover:border-blue-600 hover:bg-blue-50 transition-all rounded-lg text-left">
              <p className="text-sm font-bold text-gray-700">Manage Players</p>
              <p className="text-[10px] text-gray-400 uppercase mt-1">Add, Edit, Delete</p>
            </Link>
            <Link to="/admin/matches" className="p-4 border border-gray-100 hover:border-blue-600 hover:bg-blue-50 transition-all rounded-lg text-left">
              <p className="text-sm font-bold text-gray-700">Manage Matches</p>
              <p className="text-[10px] text-gray-400 uppercase mt-1">Schedule Games</p>
            </Link>
            <Link to="/admin/news" className="p-4 border border-gray-100 hover:border-blue-600 hover:bg-blue-50 transition-all rounded-lg text-left">
              <p className="text-sm font-bold text-gray-700">Manage News</p>
              <p className="text-[10px] text-gray-400 uppercase mt-1">Write Articles</p>
            </Link>
            <Link to="/admin/settings/tickets" className="p-4 border border-gray-100 hover:border-blue-600 hover:bg-blue-50 transition-all rounded-lg text-left">
              <p className="text-sm font-bold text-gray-700">Ticket Settings</p>
              <p className="text-[10px] text-gray-400 uppercase mt-1">Sponsors & Style</p>
            </Link>
            <Link to="/" className="p-4 border border-gray-100 hover:border-blue-600 hover:bg-blue-50 transition-all rounded-lg text-left">
              <p className="text-sm font-bold text-gray-700">View Website</p>
              <p className="text-[10px] text-gray-400 uppercase mt-1">Public Site</p>
            </Link>
          </div>
        </div>

        {/* API Status */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h4 className="font-bold text-gray-800 mb-6 uppercase tracking-tight">System Status</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Backend API</span>
              </div>
              <span className="text-xs text-gray-400">http://localhost:5000</span>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">MySQL Database</span>
              </div>
              <span className="text-xs text-gray-400">Connected</span>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Frontend</span>
              </div>
              <span className="text-xs text-gray-400">http://localhost:5173</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
