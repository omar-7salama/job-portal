import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Application } from '../types';
import { getUserFromToken } from '../utils/auth';

const MyApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const user = getUserFromToken();
    if (!user) return;

    try {
      const response = await api.get(`/api/applications/applicant/${user.id}`);
      setApplications(response.data);
    } catch (err: any) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REVIEWED': return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-8">Loading applications...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>

      {applications.length === 0 ? (
        <p className="text-center text-gray-500">No applications yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{app.job?.title || 'Job Title'}</h2>
                  <p className="text-gray-600">{app.job?.company || 'Company'}</p>
                  <p className="text-gray-500">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${getStatusColor(app.status)}`}>
                  {app.status}
                </span>
              </div>
              <p className="mt-2 text-gray-700">{app.coverLetter}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;