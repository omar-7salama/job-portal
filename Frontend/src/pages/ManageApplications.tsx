import { useState, useEffect } from 'react';
import api from '../utils/api';

interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  coverLetter: string;
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';
  appliedAt: string;
}

interface JobWithApplications {
  jobId: string;
  jobTitle: string;
  companyName: string;
  applications: Application[];
}

const ManageApplications = () => {
  const [jobsWithApps, setJobsWithApps] = useState<JobWithApplications[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployerApplications();
  }, []);

  const fetchEmployerApplications = async () => {
    const employerId = localStorage.getItem('userId');
    if (!employerId) {
      setError('You must be logged in.');
      setLoading(false);
      return;
    }

    try {
      // Get all jobs by this employer
      const jobsResponse = await api.get(`/api/jobs/employer/${employerId}`);
      const jobs = jobsResponse.data;

      // For each job, fetch its applications
      const results: JobWithApplications[] = await Promise.all(
        jobs.map(async (job: any) => {
          try {
            const appsResponse = await api.get(`/api/applications/job/${job.id}`);
            return {
              jobId: job.id,
              jobTitle: job.title,
              companyName: job.companyName,
              applications: appsResponse.data,
            };
          } catch {
            return {
              jobId: job.id,
              jobTitle: job.title,
              companyName: job.companyName,
              applications: [],
            };
          }
        })
      );

      setJobsWithApps(results);
    } catch (err: any) {
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    setUpdating(applicationId);
    try {
      await api.put(`/api/applications/${applicationId}/status`, { status: newStatus });
      // Update locally
      setJobsWithApps(prev =>
        prev.map(job => ({
          ...job,
          applications: job.applications.map(app =>
            app.id === applicationId ? { ...app, status: newStatus as any } : app
          ),
        }))
      );
    } catch (err: any) {
      alert('Failed to update status.');
    } finally {
      setUpdating(null);
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

  const totalApplications = jobsWithApps.reduce((sum, j) => sum + j.applications.length, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Manage Applications</h1>
      <p className="text-gray-500 mb-6">
        {jobsWithApps.length} job{jobsWithApps.length !== 1 ? 's' : ''} · {totalApplications} application{totalApplications !== 1 ? 's' : ''}
      </p>

      {jobsWithApps.length === 0 ? (
        <p className="text-center text-gray-500 py-12">You have not posted any jobs yet.</p>
      ) : (
        <div className="space-y-8">
          {jobsWithApps.map(job => (
            <div key={job.jobId} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Job Header */}
              <div className="bg-blue-900 text-white px-6 py-4">
                <h2 className="text-lg font-semibold">{job.jobTitle}</h2>
                <p className="text-blue-200 text-sm">{job.companyName}</p>
                <p className="text-blue-300 text-sm mt-1">
                  {job.applications.length} application{job.applications.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Applications */}
              {job.applications.length === 0 ? (
                <div className="px-6 py-4 text-gray-500 text-sm">No applications yet.</div>
              ) : (
                <div className="divide-y">
                  {job.applications.map(app => (
                    <div key={app.id} className="px-6 py-4">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <p className="text-sm text-gray-500">
                            Applicant ID: <span className="font-mono text-xs">{app.applicantId}</span>
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            Applied on {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                          {app.coverLetter && (
                            <p className="text-gray-700 text-sm mt-2 max-w-xl">{app.coverLetter}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                            disabled={updating === app.id}
                            className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            aria-label="Update application status"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="REVIEWED">Reviewed</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageApplications;
