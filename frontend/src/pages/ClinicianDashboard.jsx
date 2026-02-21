import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Brain, Video, ClipboardList, Bell, LogOut,
  TrendingUp, AlertTriangle, FileText, ChevronRight,
  Clock, User, Activity
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } }),
}

const riskConfig = (score) => {
  if (score >= 0.7) return { label: 'High Risk', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400' }
  if (score >= 0.4) return { label: 'Moderate', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', dot: 'bg-yellow-400' }
  return { label: 'Low Risk', bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/20', dot: 'bg-secondary' }
}

const recentPatients = [
  { id: 1, name: 'Aarav K.', age: 4, riskScore: 0.68, lastScreening: '2 days ago', initials: 'AK' },
  { id: 2, name: 'Priya S.', age: 3, riskScore: 0.42, lastScreening: '5 days ago', initials: 'PS' },
  { id: 3, name: 'Rohan M.', age: 5, riskScore: 0.85, lastScreening: '1 day ago', initials: 'RM' },
  { id: 4, name: 'Sara P.', age: 4, riskScore: 0.28, lastScreening: '1 week ago', initials: 'SP' },
]

const pendingReviews = [
  { id: 1, patient: 'Aarav K.', initials: 'AK', uploaded: '3 hours ago', riskScore: 0.78 },
  { id: 2, patient: 'Sara P.', initials: 'SP', uploaded: '1 day ago', riskScore: 0.65 },
]

export default function ClinicianDashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const fullName = user?.user_metadata?.full_name || 'Clinician'
  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const handleSignOut = async () => { await signOut(); navigate('/') }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/20">
            <Brain className="h-4 w-4 text-secondary" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">
            Neuro<span className="text-secondary">Thrive</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-4">
          {[
            { label: 'Dashboard', icon: Activity, active: true, path: '/dashboard' },
            { label: 'Screening', icon: Video, path: '/screening' },
            { label: 'Therapy Plans', icon: ClipboardList, path: '/therapy' },
            { label: 'Alerts', icon: Bell, path: '/alerts', badge: 3 },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                item.active
                  ? 'bg-secondary/15 text-secondary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/20 text-sm font-bold text-secondary">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
              <p className="text-xs text-muted-foreground">Clinician</p>
            </div>
            <button onClick={handleSignOut} className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="ml-64 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur-md">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Clinician Dashboard</h1>
            <p className="text-xs text-muted-foreground">Welcome back, {fullName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
              Live monitoring
            </span>
          </div>
        </div>

        <div className="p-8 space-y-8">

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-5">
            {[
              { label: 'Active Screenings', value: '12', sub: 'cases this month', icon: Video, color: 'text-secondary', bg: 'bg-secondary/10' },
              { label: 'Risk Alerts', value: '3', sub: 'pending review', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
              { label: 'Reports Generated', value: '8', sub: 'this month', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 font-display text-4xl font-bold text-foreground">{stat.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick actions */}
          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'New Screening', icon: Video, path: '/screening', color: 'text-secondary', bg: 'bg-secondary/10' },
                { label: 'Therapy Plans', icon: ClipboardList, path: '/therapy', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'View Alerts', icon: Bell, path: '/alerts', color: 'text-red-400', bg: 'bg-red-500/10' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-card"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.bg} transition-transform group-hover:scale-110`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{action.label}</p>
                    <p className="text-xs text-muted-foreground">Click to open</p>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Recent patients table */}
          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Recent Patients</h2>
              <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary/80 text-xs">
                View all <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
              {/* Header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr_auto] gap-4 border-b border-border bg-muted/40 px-6 py-3">
                {['Patient', 'Age', 'Risk Score', 'Last Screening', 'Status', ''].map((h) => (
                  <p key={h} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</p>
                ))}
              </div>
              {/* Rows */}
              {recentPatients.map((p, i) => {
                const rc = riskConfig(p.riskScore)
                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr_auto] gap-4 items-center border-b border-border/50 px-6 py-4 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    {/* Patient */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/15 text-sm font-bold text-secondary">
                        {p.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{p.name}</p>
                      </div>
                    </div>
                    {/* Age */}
                    <p className="text-sm text-muted-foreground">{p.age} yrs</p>
                    {/* Risk Score */}
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${rc.bg} ${rc.text} border ${rc.border}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${rc.dot}`} />
                      {p.riskScore.toFixed(2)}
                    </span>
                    {/* Last screening */}
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {p.lastScreening}
                    </div>
                    {/* Status */}
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${rc.bg} ${rc.text}`}>
                      {rc.label}
                    </span>
                    {/* Action */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/screening')}
                      className="h-8 border-secondary/40 text-secondary hover:bg-secondary/10 text-xs"
                    >
                      View
                    </Button>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Pending reviews */}
          <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Pending Reviews
                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {pendingReviews.length}
                </span>
              </h2>
            </div>
            <div className="space-y-3">
              {pendingReviews.map((r) => {
                const rc = riskConfig(r.riskScore)
                return (
                  <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/15 text-sm font-bold text-secondary shrink-0">
                      {r.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{r.patient}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> Uploaded {r.uploaded}
                      </p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-xs text-muted-foreground">Risk Score</p>
                      <span className={`text-sm font-bold ${rc.text}`}>{r.riskScore.toFixed(2)}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate('/screening')}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shrink-0"
                    >
                      Review <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  )
}