import { useEffect, useState } from 'react';
import api from '../utils/api';

interface Application {
  id: number;
  applicantId: number;
  coverLetter: string;
  status: string;
  jobId: number;
}

interface Job {
  id: number;
  title: string;
}

const ManageApplications = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const employerId = localStorage.getItem('userId');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const jobsResponse = await api.get(
        `/api/jobs/employer/${employerId}`
      );

      const jobs: Job[] = jobsResponse.data;

      let allApplications: any[] = [];

      for (const job of jobs) {
        const applicationsResponse = await api.get(
          `/api/applications/job/${job.id}`
        );

        const apps = applicationsResponse.data.map((app: Application) => ({
          ...app,
          jobTitle: job.title,
        }));

        allApplications = [...allApplications, ...apps];
      }

      setApplications(allApplications);
    } catch (error) {
      console.error(error);
      alert('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    applicationId: number,
    status: string
  ) => {
    try {
      await api.put(
        `/api/applications/${applicationId}/status`,
        { status }
      );

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? { ...app, status }
            : app
        )
      );
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        Loading applications...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Manage Applications
      </h1>

      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <div className="grid gap-4">
          {applications.map(app => (
            <div
              key={app.id}
              className="bg-white shadow-md rounded-lg p-4"
            >
              <h2 className="text-xl font-semibold">
                {app.jobTitle}
              </h2>

              <p>
                <strong>Applicant ID:</strong>{' '}
                {app.applicantId}
              </p>

              <p className="mt-2">
                <strong>Cover Letter:</strong>
              </p>

              <p className="bg-gray-100 p-2 rounded">
                {app.coverLetter}
              </p>

              <p className="mt-2">
                <strong>Status:</strong>{' '}
                {app.status}
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() =>
                    updateStatus(app.id, 'REVIEWED')
                  }
                  className="bg-yellow-500 text-white px-4 py-2 rounded"
                >
                  Review
                </button>

                <button
                  onClick={() =>
                    updateStatus(app.id, 'ACCEPTED')
                  }
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Accept
                </button>

                <button
                  onClick={() =>
                    updateStatus(app.id, 'REJECTED')
                  }
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageApplications;
