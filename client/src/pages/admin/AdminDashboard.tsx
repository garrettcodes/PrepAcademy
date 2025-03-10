import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../services/api';

interface ReviewStats {
  total: number;
  pending: number;
  reviewed: number;
  updated: number;
  rejected: number;
  byContentType: Array<{ _id: string; count: number }>;
  byStatus: Array<{ _id: string; count: number }>;
  recentActivity: Array<any>;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/content-review/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching review stats:', err);
        setError(err.response?.data?.message || 'Failed to fetch stats');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-bold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Content Reviews</h2>
          <p className="text-3xl font-bold text-blue-600">{stats?.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Pending Reviews</h2>
          <p className="text-3xl font-bold text-yellow-500">{stats?.pending || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Updated Content</h2>
          <p className="text-3xl font-bold text-green-500">{stats?.updated || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Rejected Flags</h2>
          <p className="text-3xl font-bold text-red-500">{stats?.rejected || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Content Types</h2>
          {stats?.byContentType && stats.byContentType.length > 0 ? (
            <div className="space-y-4">
              {stats.byContentType.map((item) => (
                <div key={item._id} className="flex justify-between">
                  <span className="capitalize">{item._id}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Review Status</h2>
          {stats?.byStatus && stats.byStatus.length > 0 ? (
            <div className="space-y-4">
              {stats.byStatus.map((item) => (
                <div key={item._id} className="flex justify-between">
                  <span className="capitalize">{item._id}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/admin/reviews"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded text-center"
            >
              Content Reviews
            </Link>
            <Link
              to="/admin/sat-act-updates"
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded text-center"
            >
              SAT/ACT Updates
            </Link>
            <Link
              to="/admin/manage-experts"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded text-center"
            >
              Manage Experts
            </Link>
            <Link
              to="/admin/feedback"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded text-center"
            >
              Manage Feedback
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Content Type</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Flagged By</th>
                  <th className="px-4 py-2 text-left">Flagged At</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivity.map((activity) => (
                  <tr key={activity._id} className="border-b">
                    <td className="px-4 py-2 capitalize">{activity.contentType}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${activity.status === 'reviewed' ? 'bg-blue-100 text-blue-800' : ''}
                        ${activity.status === 'updated' ? 'bg-green-100 text-green-800' : ''}
                        ${activity.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{activity.flaggedBy?.name || 'Unknown'}</td>
                    <td className="px-4 py-2">{new Date(activity.flaggedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <Link
                        to={`/admin/review/${activity._id}`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 