import React, { useState } from 'react';
import {
  Camera, Send, CheckCircle2, AlertCircle, Loader2,
  MapPin, User, FileText, Shield, Download
} from 'lucide-react';
import { reportViolation } from '../api/api';

const severityGlow = {
  HIGH: 'shadow-[0_0_24px_4px_rgba(239,68,68,0.45)]  border-red-500   text-red-400   bg-red-950/40',
  MEDIUM: 'shadow-[0_0_24px_4px_rgba(234,179,8,0.40)]  border-yellow-500 text-yellow-400 bg-yellow-950/40',
  LOW: 'shadow-[0_0_24px_4px_rgba(34,197,94,0.35)]  border-emerald-500 text-emerald-400 bg-emerald-950/40',
  CRITICAL: 'shadow-[0_0_32px_6px_rgba(168,85,247,0.50)] border-purple-500  text-purple-400  bg-purple-950/40',
};

const ViolationUpload = () => {
  const [formData, setFormData] = useState({ name: '', location: '', description: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  /* ─── handlers ─────────────────────────────────────── */
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Image evidence is required for verification'); return; }

    setLoading(true);
    setError(null);

    const payload = new FormData();
    payload.append('image', file);
    payload.append('name', formData.name);
    payload.append('location', formData.location);
    payload.append('description', formData.description);

    try {
      const response = await reportViolation(payload);
      setResult(response.data);
      setFormData({ name: '', location: '', description: '' });
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission protocol failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setError(null);
    setFormData({ name: '', location: '', description: '' });
    setFile(null);
    setPreview(null);
  };

  const handleDownloadReport = () => {
    if (!result) return;
    const blob = new Blob(
      [JSON.stringify(result, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `violation_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const glowClass = severityGlow[result?.severity?.toUpperCase()] || severityGlow.LOW;

  /* ─── render ────────────────────────────────────────── */
  return (
    <div className="max-w-2xl mx-auto p-6">
      {!result ? (
        /* ══════════ FORM UI ══════════ */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <Camera className="text-blue-600" size={24} />
              Environmental Violation Report
            </h2>
            <p className="text-sm text-slate-500">Report violations in your area</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Evidence Photo */}
            <div className="space-y-1.5 mb-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Camera size={10} /> Evidence Photo
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {preview ? (
                    <img src={preview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-lg" />
                  ) : (
                    <div className="text-slate-400">
                      <Camera size={24} className="mx-auto mb-2" />
                      <p className="text-xs">Click to upload photo</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5 mb-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <User size={10} /> Your Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="Enter your name"
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5 mb-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin size={10} /> Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="Enter violation location"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 mb-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileText size={10} /> Incident Details
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
                placeholder="Describe the environmental breach in detail..."
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-rose-50 border border-rose-100 rounded-lg">
                <AlertCircle size={14} className="text-rose-500" />
                <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tighter">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-slate-900 to-blue-900 text-white font-black rounded-xl hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-md"
            >
              {loading
                ? <Loader2 className="animate-spin" size={16} />
                : <><Send size={16} /> Submit Environmental Report</>}
            </button>
          </form>
        </div>
      ) : (
        /* ══════════ RESULT UI ══════════ */
        <div
          className="space-y-6 animate-fade-in"
          style={{ animation: 'fadeIn 0.5s ease-in-out' }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(16px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
          `}</style>

          {/* ── AI Result Card ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 size={22} className="text-emerald-500" />
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                AI Analysis Complete
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Incident Type */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Incident Type</p>
                <p className="text-sm font-bold text-slate-800">{result.incident_type || result.category || '—'}</p>
              </div>

              {/* Severity Badge */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Severity</p>
                <span
                  className={`inline-block px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest transition-all ${glowClass}`}
                >
                  {result.severity || '—'}
                </span>
              </div>

              {/* Confidence */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confidence</p>
                <p className="text-sm font-bold text-slate-800">
                  {result.confidence != null ? `${(result.confidence * 100).toFixed(1)}%` : '—'}
                </p>
              </div>

              {/* Confidence Boost Reason */}
              {result.confidence_boost_reason && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1 italic">
                    Cross-Validation Boost Applied
                  </p>
                  <p className="text-[11px] font-bold text-emerald-800">{result.confidence_boost_reason}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Response Protocol ── */}
          <div className="space-y-4 bg-slate-900 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <Shield size={20} className="text-blue-400" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Protocol: {result.severity || ''} RESPONSE
              </h4>
            </div>

            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-6">
              {result.ai_recommendation || '—'}
            </h2>

            {Array.isArray(result.action_protocol) && result.action_protocol.length > 0 && (
              <div className="space-y-3">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">
                  Automated Action Sequencer:
                </p>
                {result.action_protocol.map((action, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/50 border border-white/5 p-4 rounded-xl flex items-center gap-4 group hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-xs">
                      0{idx + 1}
                    </div>
                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-tight">{action}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Action Buttons ── */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleDownloadReport}
              className="py-4 bg-white border border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
            >
              Download Report <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={resetForm}
              className="py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              New Report <CheckCircle2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViolationUpload;
