import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STAGES = ['Wishlist', 'Applied', 'Screening', 'Interview', 'Offer', 'Rejected']

const DEFAULT_JOBS = [
  {
    id: 1,
    company: 'Google',
    role: 'Frontend Engineer',
    stage: 'Applied',
    source: 'LinkedIn',
    salary: '$180k',
    date: '2026-09-03',
    notes: 'Portfolio reviewed; recruiter response pending.',
    starred: true,
  },
  {
    id: 2,
    company: 'Stripe',
    role: 'Product Designer',
    stage: 'Interview',
    source: 'Referral',
    salary: '$170k',
    date: '2026-09-08',
    notes: 'Panel interview scheduled next Wednesday.',
    starred: false,
  },
  {
    id: 3,
    company: 'Notion',
    role: 'Full Stack Engineer',
    stage: 'Wishlist',
    source: 'Company Site',
    salary: '$200k',
    date: '2026-09-15',
    notes: 'Strong product fit and interesting remote flexibility.',
    starred: true,
  },
]

const STORAGE_KEY = 'job-tracker-app-v1'

function App() {
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_JOBS
  })
  const [query, setQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [draft, setDraft] = useState({
    company: '',
    role: '',
    stage: 'Wishlist',
    source: 'LinkedIn',
    salary: '',
    date: '',
    notes: '',
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
  }, [jobs])

  const sourceOptions = useMemo(
    () => ['All', ...new Set(jobs.map((job) => job.source).filter(Boolean))],
    [jobs],
  )

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesQuery =
        !query ||
        `${job.company} ${job.role} ${job.notes}`
          .toLowerCase()
          .includes(query.toLowerCase())

      const matchesSource =
        sourceFilter === 'All' || job.source === sourceFilter

      return matchesQuery && matchesSource
    })
  }, [jobs, query, sourceFilter])

  const stats = useMemo(() => {
    const total = jobs.length
    const interviewing = jobs.filter((job) => job.stage === 'Interview').length
    const offers = jobs.filter((job) => job.stage === 'Offer').length
    const tracked = jobs.filter((job) => job.stage !== 'Wishlist').length
    const responseRate = tracked
      ? Math.round((jobs.filter((job) => job.stage === 'Interview' || job.stage === 'Offer').length / tracked) * 100)
      : 0

    return { total, interviewing, offers, responseRate }
  }, [jobs])

  const handleAddJob = (event) => {
    event.preventDefault()

    if (!draft.company || !draft.role) {
      return
    }

    const newJob = {
      id: Date.now(),
      company: draft.company,
      role: draft.role,
      stage: draft.stage,
      source: draft.source,
      salary: draft.salary,
      date: draft.date,
      notes: draft.notes,
      starred: false,
    }

    setJobs((current) => [newJob, ...current])
    setDraft({
      company: '',
      role: '',
      stage: 'Wishlist',
      source: 'LinkedIn',
      salary: '',
      date: '',
      notes: '',
    })
    setIsFormOpen(false)
  }

  const handleStageChange = (jobId, nextStage) => {
    setJobs((current) =>
      current.map((job) =>
        job.id === jobId
          ? {
              ...job,
              stage: nextStage,
            }
          : job,
      ),
    )
  }

  const handleDelete = (jobId) => {
    setJobs((current) => current.filter((job) => job.id !== jobId))
  }

  const handleToggleStar = (jobId) => {
    setJobs((current) =>
      current.map((job) =>
        job.id === jobId ? { ...job, starred: !job.starred } : job,
      ),
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Job Tracker</h1>
        </div>
        <button className="primary-button" onClick={() => setIsFormOpen((open) => !open)}>
          {isFormOpen ? 'Close form' : '+ Add application'}
        </button>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat-card">
          <span>Applied</span>
          <strong>{jobs.filter((job) => job.stage !== 'Wishlist').length}</strong>
        </div>
        <div className="stat-card">
          <span>Interviewing</span>
          <strong>{stats.interviewing}</strong>
        </div>
        <div className="stat-card">
          <span>Offers</span>
          <strong>{stats.offers}</strong>
        </div>
        <div className="stat-card accent">
          <span>Response rate</span>
          <strong>{stats.responseRate}%</strong>
        </div>
      </section>

      <div className="toolbar">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search company, role or notes..."
          aria-label="Search applications"
        />

        <select
          value={sourceFilter}
          onChange={(event) => setSourceFilter(event.target.value)}
          aria-label="Filter by source"
        >
          {sourceOptions.map((source) => (
            <option key={source} value={source}>
              {source === 'All' ? 'All sources' : source}
            </option>
          ))}
        </select>
      </div>

      {isFormOpen && (
        <form className="app-form" onSubmit={handleAddJob}>
          <div className="field-grid">
            <label>
              Company
              <input
                value={draft.company}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, company: event.target.value }))
                }
                placeholder="Acme Inc."
              />
            </label>

            <label>
              Role
              <input
                value={draft.role}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, role: event.target.value }))
                }
                placeholder="Product Analyst"
              />
            </label>

            <label>
              Stage
              <select
                value={draft.stage}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, stage: event.target.value }))
                }
              >
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Source
              <select
                value={draft.source}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, source: event.target.value }))
                }
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Referral">Referral</option>
                <option value="Company Site">Company Site</option>
                <option value="Indeed">Indeed</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              Salary
              <input
                value={draft.salary}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, salary: event.target.value }))
                }
                placeholder="$150k"
              />
            </label>

            <label>
              Date
              <input
                type="date"
                value={draft.date}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, date: event.target.value }))
                }
              />
            </label>
          </div>

          <label className="full-width">
            Notes
            <textarea
              rows="3"
              value={draft.notes}
              onChange={(event) =>
                setDraft((current) => ({ ...current, notes: event.target.value }))
              }
              placeholder="Keep track of recruiter follow-ups or interview prep notes."
            />
          </label>

          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={() => setIsFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Save application
            </button>
          </div>
        </form>
      )}

      <main className="board">
        {STAGES.map((stage) => {
          const stageJobs = filteredJobs.filter((job) => job.stage === stage)

          return (
            <section key={stage} className="board-column">
              <div className="column-header">
                <h2>{stage}</h2>
                <span>{stageJobs.length}</span>
              </div>

              <div className="column-content">
                {stageJobs.length === 0 ? (
                  <div className="empty-state">No roles here yet.</div>
                ) : (
                  stageJobs.map((job) => {
                    const initials = job.company
                      .split(' ')
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join('')
                      .toUpperCase()

                    return (
                      <article key={job.id} className="job-card">
                        <div className="job-card-header">
                          <div className="company-mark">{initials}</div>
                          <div>
                            <h3>{job.company}</h3>
                            <p>{job.role}</p>
                          </div>
                          <button
                            className="star-button"
                            onClick={() => handleToggleStar(job.id)}
                            aria-label={`Toggle favorite for ${job.company}`}
                          >
                            {job.starred ? '★' : '☆'}
                          </button>
                        </div>

                        <div className="tag-row">
                          <span>{job.source}</span>
                          {job.salary && <span>{job.salary}</span>}
                        </div>

                        <p className="job-notes">{job.notes || 'No notes added yet.'}</p>

                        <div className="job-meta">
                          <span>{job.date || 'No date'}</span>
                        </div>

                        <div className="card-actions">
                          <select
                            value={job.stage}
                            onChange={(event) => handleStageChange(job.id, event.target.value)}
                            aria-label={`Move ${job.company} to another stage`}
                          >
                            {STAGES.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <button type="button" className="delete-button" onClick={() => handleDelete(job.id)}>
                            Delete
                          </button>
                        </div>
                      </article>
                    )
                  })
                )}
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}

export default App
