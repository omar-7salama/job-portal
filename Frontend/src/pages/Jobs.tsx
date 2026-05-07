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

  useEffect(() => { fetchJobs(); }, []);
  useEffect(() => { filterJobs(); }, [jobs, search, jobType, location]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/jobs');
      setJobs(response.data);
    } catch {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs.filter(job => job.status === 'OPEN');
    if (search) filtered = filtered.filter(job =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.companyName.toLowerCase().includes(search.toLowerCase())
    );
    if (location) filtered = filtered.filter(job =>
      job.location.toLowerCase().includes(location.toLowerCase())
    );
    if (jobType) filtered = filtered.filter(job => job.jobType === jobType);
    setFilteredJobs(filtered);
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    const applicantId = localStorage.getItem('userId');
    if (!applicantId) { alert('You must be logged in to apply.'); return; }
    setApplying(true);
    try {
      await api.post('/api/applications', { jobId: selectedJob.id, applicantId, coverLetter });
      alert('Application submitted successfully!');
      setSelectedJob(null);
      setCoverLetter('');
    } catch (err: any) {
      alert('Failed to apply: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div style={{textAlign:'center',padding:'2rem'}}>Loading jobs...</div>;
  if (error) return <div style={{textAlign:'center',padding:'2rem',color:'red'}}>{error}</div>;

  return (
    <div style={{maxWidth:'1200px',margin:'0 auto',padding:'1.5rem'}}>
      <h1 style={{fontSize:'1.75rem',fontWeight:'700',marginBottom:'1.5rem'}}>Job Listings</h1>

      {/* Search Bar */}
      <div style={{background:'white',padding:'1rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.1)',marginBottom:'1.5rem'}}>
        <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
          <input
            type="text"
            placeholder="Search by title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{flex:'2',minWidth:'200px',padding:'10px 14px',border:'1px solid #d1d5db',borderRadius:'6px',fontSize:'14px',outline:'none'}}
          />
          <input
            type="text"
            placeholder="Filter by location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{flex:'1',minWidth:'160px',padding:'10px 14px',border:'1px solid #d1d5db',borderRadius:'6px',fontSize:'14px',outline:'none'}}
          />
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            style={{padding:'10px 14px',border:'1px solid #d1d5db',borderRadius:'6px',fontSize:'14px',outline:'none'}}
          >
            <option value="">All Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
          {(search || jobType || location) && (
            <button
              onClick={() => { setSearch(''); setJobType(''); setLocation(''); }}
              style={{padding:'10px 16px',background:'#e5e7eb',borderRadius:'6px',border:'none',cursor:'pointer',fontSize:'14px'}}
            >
              Clear
            </button>
          )}
        </div>
        <p style={{fontSize:'13px',color:'#6b7280',marginTop:'8px'}}>
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Job Cards */}
      {filteredJobs.length === 0 ? (
        <div style={{textAlign:'center',padding:'3rem',color:'#6b7280'}}>No jobs found matching your search.</div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1rem'}}>
          {filteredJobs.map(job => (
            <div key={job.id} style={{background:'white',padding:'1.25rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.1)',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
              <div>
                <h2 style={{fontSize:'1.1rem',fontWeight:'600',marginBottom:'4px'}}>{job.title}</h2>
                <p style={{color:'#4b5563',marginBottom:'2px'}}>{job.companyName}</p>
                <p style={{color:'#6b7280',fontSize:'13px',marginBottom:'4px'}}>📍 {job.location}</p>
                <p style={{color:'#16a34a',fontWeight:'600',marginBottom:'8px'}}>${job.salary?.toLocaleString()}</p>
                <span style={{background:'#dbeafe',color:'#1e40af',padding:'3px 10px',borderRadius:'12px',fontSize:'12px'}}>
                  {job.jobType.replace('_', ' ')}
                </span>
                <p style={{color:'#6b7280',fontSize:'13px',marginTop:'8px'}}>{job.description}</p>
              </div>
              {userRole === 'JOB_SEEKER' && (
                <button
                  onClick={() => setSelectedJob(job)}
                  style={{marginTop:'1rem',width:'100%',padding:'10px',background:'#2563eb',color:'white',border:'none',borderRadius:'6px',cursor:'pointer',fontWeight:'500'}}
                >
                  Apply Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {selectedJob && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}>
          <div style={{background:'white',padding:'1.5rem',borderRadius:'8px',width:'100%',maxWidth:'480px',margin:'1rem'}}>
            <h2 style={{fontSize:'1.2rem',fontWeight:'700',marginBottom:'4px'}}>Apply for {selectedJob.title}</h2>
            <p style={{color:'#6b7280',fontSize:'13px',marginBottom:'1rem'}}>{selectedJob.companyName} · {selectedJob.location}</p>
            <textarea
              placeholder="Write your cover letter..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={5}
              style={{width:'100%',padding:'10px',border:'1px solid #d1d5db',borderRadius:'6px',fontSize:'14px',marginBottom:'1rem',resize:'vertical',boxSizing:'border-box'}}
            />
            <div style={{display:'flex',gap:'8px'}}>
              <button
                onClick={handleApply}
                disabled={applying}
                style={{flex:1,padding:'10px',background:'#2563eb',color:'white',border:'none',borderRadius:'6px',cursor:'pointer',opacity:applying?0.5:1}}
              >
                {applying ? 'Applying...' : 'Submit Application'}
              </button>
              <button
                onClick={() => { setSelectedJob(null); setCoverLetter(''); }}
                style={{flex:1,padding:'10px',background:'#e5e7eb',color:'#374151',border:'none',borderRadius:'6px',cursor:'pointer'}}
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
