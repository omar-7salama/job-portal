import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Job } from '../types';

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  // NEW
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, search, jobType]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/jobs');
      setJobs(response.data);
    } catch (err: any) {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs.filter(job => job.status === 'OPEN');

    if (search) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.companyName.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (jobType) {
      filtered = filtered.filter(job => job.jobType === jobType);
    }

    setFilteredJobs(filtered);
  };

  const handleApply = async () => {
    if (!selectedJob) return;

    // NEW SECURITY CHECK
    if (userRole !== 'JOB_SEEKER') {
      alert('Only job seekers can apply.');
      return;
    }

    const applicantId = localStorage.getItem('userId');

    if (!applicantId) {
      alert('You must be logged in to apply.');
      return;
    }

    setApplying(true);

    try {
      await api.post('/api/applications', {
        jobId: selectedJob.id,
        applicantId,
        coverLetter,
      });

      alert('Application submitted successfully!');
      setSelectedJob(null);
      setCoverLetter('');
    } catch (err: any) {
      alert(
        'Failed to apply: ' +
          (err.response?.data?.message || 'Unknown error')
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        Loading jobs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Job Listings
      </h1>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded"
        />

        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="p-2 border rounded"
          aria-label="Filter by job type"
        >
          <option value="">All Types</option>
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERNSHIP">Internship</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.map(job => (
          <div
            key={job.id}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <h2 className="text-xl font-semibold">
              {job.title}
            </h2>

            <p className="text-gray-600">
              {job.companyName}
            </p>

            <p className="text-gray-500">
              {job.location}
            </p>

            <p className="text-green-600 font-semibold">
              ${job.salary}
            </p>

            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {job.jobType.replace('_', ' ')}
            </span>

            {/* ONLY JOB SEEKER CAN APPLY */}
            {userRole === 'JOB_SEEKER' && (
              <button
                onClick={() => setSelectedJob(job)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Apply Now
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              Apply for {selectedJob.title}
            </h2>

            <textarea
              placeholder="Cover letter..."
              value={coverLetter}
              onChange={(e) =>
                setCoverLetter(e.target.value)
              }
              className="w-full p-2 border rounded mb-4"
              rows={4}
              required
            />

            <div className="flex gap-2">
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {applying
                  ? 'Applying...'
                  : 'Submit Application'}
              </button>

              <button
                onClick={() => setSelectedJob(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
