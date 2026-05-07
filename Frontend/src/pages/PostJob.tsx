import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { CreateJobRequest } from '../types';

const PostJob = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: 0,
    jobType: 'FULL_TIME' as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/api/jobs', form as CreateJobRequest);
      navigate('/jobs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Post a New Job</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Job Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="Enter job title"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="Describe the job"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Company</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="Company name"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="Job location"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Salary</label>
          <input
            type="number"
            value={form.salary}
            onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })}
            className="w-full p-2 border rounded"
            placeholder="Salary amount"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Job Type</label>
          <select
            value={form.jobType}
            onChange={(e) => setForm({ ...form, jobType: e.target.value as any })}
            className="w-full p-2 border rounded"
            aria-label="Select job type"
          >
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
};

export default PostJob;