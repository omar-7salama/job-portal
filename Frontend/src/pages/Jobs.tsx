import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Job } from '../types';

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, search, jobType, location]);

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
        job.companyName.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (location) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    if (jobType) {
      filtered = filtered.filter(job => job.jobType === jobType);
    }
    setFilteredJobs(filtered);
  };

  const handleClearFilters = () => {
    setSearch('');
    setJobType('');
    setLocation('');
  };

  const handleApply = async () => {
    if (!selectedJob) return;

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
      alert('Failed to apply: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading jobs...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Job Listings</h1>

      {/* ── Search & Filter Bar ── */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Keyword search */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by title or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Location search */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-2.5 text-gray-400">📍</span>
            <input
              type="text"
              placeholder="Filter by location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Job type filter */}
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by job type"
          >
            <option value="">All Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
          {/* Clear filters */}
          {(search || jobType || location) && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* ── Job Cards ── */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No jobs found matching your search.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold">{job.title}</h2>
                <p className="text-gray-600">{job.companyName}</p>
                <p className="text-gray-500 text-sm">📍 {job.location}</p>
                <p className="text-green-600 font-semibold mt-1">${job.salary?.toLocaleString()}</p>
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mt-2">
                  {job.jobType.replace('_', ' ')}
                </span>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{job.description}</p>
              </div>
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
      )}

      {/* ── Apply Modal ── */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-1">Apply for {selectedJob.title}</h2>
            <p className="text-gray-500 text-sm mb-4">{selectedJob.companyName} · {selectedJob.location}</p>
            <textarea
              placeholder="Write your cover letter..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={5}
            />
            <div className="flex gap-2">
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {applying ? 'Applying...' : 'Submit Application'}
              </button>
              <button
                onClick={() => { setSelectedJob(null); setCoverLetter(''); }}
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
