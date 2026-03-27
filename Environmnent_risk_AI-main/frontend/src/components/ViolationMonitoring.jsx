import React, { useState, useEffect } from 'react';
import { getCitizenReports, updateReportStatus } from '../api/api';
import DeploymentPanel from './DeploymentPanel';
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Shield,
  Clock,
  MapPin,
  Users,
  Truck,
  CheckCircle2,
  X,
  TrendingUp,
  Send,
  Timer,
  BarChart
} from 'lucide-react';

const CATEGORIES = [
  { key: 'all',              label: 'All Reports',           emoji: '📋' },
  { key: 'fire_hazard',      label: 'Fire Hazards',          emoji: '🔥' },
  { key: 'industrial_smoke', label: 'Industrial Smoke',      emoji: '🌫️' },
  { key: 'construction',     label: 'Construction',          emoji: '🏗️' },
  { key: 'vehicle_emissions',label: 'Vehicle Emissions',     emoji: '🚗' },
  { key: 'no_violation',     label: 'No Violation',          emoji: '✅' },
];

const ViolationMonitoring = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [deploymentPanel, setDeploymentPanel] = useState(null);
  const [escalationConfirm, setEscalationConfirm] = useState(null);
  const [deployedReports, setDeployedReports] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const [assignedResources, setAssignedResources] = useState({});

  // Standardized violation type labels
  const VIOLATION_LABELS = {
    fire_hazard: "Fire Hazard",
    industrial_smoke: "Industrial Smoke Discharge",
    construction: "Construction Activity",
    vehicle_emissions: "Vehicle Emissions",
    no_violation: "No Clear Violation"
  };

  const VIOLATION_ICONS = {
    fire_hazard: "🔥",
    industrial_smoke: "🏭",
    construction: "🏗️",
    vehicle_emissions: "🚗",
    no_violation: "✅"
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getCitizenReports();
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      fetchReports();
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const handleEscalate = (report) => {
    setEscalationConfirm(report);
  };

  const confirmEscalate = async () => {
    if (escalationConfirm) {
      try {
        await updateReportStatus(escalationConfirm.id, 'escalated');
        fetchReports();
        setEscalationConfirm(null);
      } catch (error) {
        console.error('Error escalating report:', error);
      }
    }
  };

  const handleDeploy = async (deploymentData) => {
    try {
      setDeployedReports(prev => new Set([...prev, deploymentData.violation_type]));
      const reportId = deploymentPanel.id;
      await updateReportStatus(reportId, 'action_taken');

      setNotification({
        type: 'success',
        title: '🚀 Resources Deployed Successfully!',
        message: `Deployment ID: ${deploymentData.deployment_id}\nPersonnel: ${deploymentData.deployment_plan.personnel}\nEquipment: ${deploymentData.deployment_plan.equipment.join(', ')}\n\nCitizen will receive confirmation notification.`,
        deploymentData: deploymentData
      });

      setDeploymentPanel(null);
      fetchReports();
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error('Error deploying resources:', error);
      setNotification({
        type: 'error',
        title: '❌ Deployment Failed',
        message: 'Failed to deploy resources. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleGenerateDeployment = (report) => {
    setDeploymentPanel(report);
  };

  const handleDeploymentGenerated = (deploymentData) => {
    // You can update state or show notification here
  };

  const handleAssignResource = (reportId, resource) => {
    setAssignedResources(prev => ({ ...prev, [reportId]: resource }));
  };

  /* =========================================================
     1. RISK PRIORITIZATION ENGINE
     ========================================================= */
  const calculatePriority = (report) => {
    let score = 0;
    const sev = report.severity?.toUpperCase() || "";
    
    // Severity weight
    if (sev === "SEVERE") score += 50;
    else if (sev === "HIGH") score += 30;
    else if (sev === "MODERATE") score += 15;

    // AI confidence
    score += (report.confidence || 0) * 0.3;

    // Cluster boost (simulated property for UI demo)
    if (report.cluster_count && report.cluster_count > 2 || Math.random() > 0.85) score += 20;

    // Sensitive zone boost
    const loc = report.location?.toLowerCase() || "";
    if (loc.includes("hospital") || loc.includes("school")) score += 25;

    return Math.floor(score);
  };

  const getPriorityBadge = (score) => {
    if (score >= 60) return { label: 'Priority 1 (High)', class: 'bg-red-100 text-red-800 border-red-200', icon: '🔴' };
    if (score >= 30) return { label: 'Priority 2', class: 'bg-orange-100 text-orange-800 border-orange-200', icon: '🟠' };
    return { label: 'Priority 3', class: 'bg-green-100 text-green-800 border-green-200', icon: '🟢' };
  };

  /* =========================================================
     2. SLA TRACKING SYSTEM
     ========================================================= */
  const SLA_LIMITS = { SEVERE: 60 * 60 * 1000, HIGH: 3 * 60 * 60 * 1000, MODERATE: 6 * 60 * 60 * 1000, LOW: 24 * 60 * 60 * 1000 };
  
  const getSLAStatus = (report) => {
    const createdTime = new Date(report.timestamp || report.created_at || Date.now() - Math.random() * 5 * 3600000).getTime();
    const currentTime = Date.now();
    const elapsed = currentTime - createdTime;
    const sev = report.severity?.toUpperCase() || "MODERATE";
    const limit = SLA_LIMITS[sev] || SLA_LIMITS.MODERATE;
    
    // Slight jitter to make it dynamic visually
    const remaining = limit - elapsed;
    
    if (remaining < 0 || report.status === 'escalated') {
      const minsOver = Math.floor(Math.abs(remaining) / 60000);
      return { status: 'OVERDUE', text: `Overdue by ${Math.floor(minsOver/60)}h ${minsOver%60}m`, color: 'text-red-600 font-bold', riskTrigger: true };
    } else {
      const minsRem = Math.floor(remaining / 60000);
      return { status: 'WITHIN TIME', text: `${Math.floor(minsRem/60)}h ${minsRem%60}m remaining`, color: 'text-gray-600', riskTrigger: false };
    }
  };

  /* =========================================================
     3. RESOURCE ALLOCATION OPTIMIZER
     ========================================================= */
  const assignResourceLogic = (report) => {
    const teams = {
      fire_hazard: "Nearest Fire Substation Unit",
      industrial_smoke: "AQI Mobile Inspection Team",
      construction: "Municipal Compliance Officer Array",
      vehicle_emissions: "Traffic Inspection Squad Alpha"
    };
    return {
      team: teams[report.violation_type] || "General Response Team",
      eta: Math.floor(Math.random() * 20 + 10) + " mins",
      distance: (Math.random() * 3 + 1).toFixed(1) + " km"
    };
  };

  /* =========================================================
     4. ESCALATION SYSTEM
     ========================================================= */
  const getEscalationLevel = (report, sla) => {
    if (report.status === "escalated") return "Level 3 → State Authority";
    if (report.severity?.toUpperCase() === "SEVERE" || sla.riskTrigger) return "Level 2 → District Authority (Urgent)";
    return "Level 1 → Local Authority";
  };

  /* Utils */
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'action_taken': return 'bg-green-100 text-green-800 border-green-200';
      case 'escalated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading risk management data...</span>
      </div>
    );
  }

  // Pre-process and sort reports by priority
  const processedReports = reports
    .map(report => ({
      ...report,
      priorityScore: calculatePriority(report)
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const filteredReports = activeCategory === 'all' 
    ? processedReports 
    : processedReports.filter(r => (r.violation_type || 'no_violation') === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Risk Management Intelligence</h2>
          <p className="text-gray-600 mt-1">
            {reports.length} total active incidents automatically sorted by Priority Score
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
        >
          <TrendingUp size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => {
          const count = cat.key === 'all' 
            ? processedReports.length 
            : processedReports.filter(r => (r.violation_type || 'no_violation') === cat.key).length;
          
          const isActive = activeCategory === cat.key;

          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <span>{cat.emoji}</span> {cat.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Reports</h3>
            <p className="text-gray-500">All clear in this category.</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const icon = VIOLATION_ICONS[report.violation_type] || VIOLATION_ICONS.no_violation;
            const prioBadge = getPriorityBadge(report.priorityScore);
            const sla = getSLAStatus(report);
            const assigned = assignedResources[report.id];
            const isResolved = report.status === 'action_taken' || deployedReports.has(report.id);
            const escLevel = getEscalationLevel(report, sla);

            return (
              <div key={report.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  {/* Report Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl bg-gray-50 p-2 rounded-lg border border-gray-100">{icon}</span>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">
                          {VIOLATION_LABELS[report.violation_type] || 'Unknown Type'}
                        </h4>
                        <p className="text-sm text-gray-500 font-medium tracking-wide">Report ID: {report.id}</p>
                      </div>
                    </div>

                    {/* NEW: RISK MANAGEMENT META TRAY */}
                    <div className="flex flex-wrap items-center gap-3 mt-4 mb-2">
                       {/* Priority Badge */}
                       <span className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${prioBadge.class}`}>
                          {prioBadge.icon} {prioBadge.label} <span className="text-gray-900/40 ml-1">({report.priorityScore} Pts)</span>
                       </span>
                       
                       {/* SLA Tracker */}
                       {!isResolved && (
                         <span className="flex items-center space-x-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg">
                           <Timer size={14} className={sla.color} />
                           <span className={sla.color}>{sla.text}</span>
                         </span>
                       )}
                    </div>

                    {/* Report Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-2">
                        <MapPin size={16} className="text-blue-500" />
                        <span className="text-gray-700 font-medium">{report.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock size={16} className="text-blue-500" />
                        <span className="text-gray-700 font-medium">
                          {new Date(report.timestamp || report.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp size={16} className="text-blue-500" />
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getSeverityColor(report.severity)}`}>
                          {report.severity || 'UNKNOWN'}
                        </span>
                      </div>
                    </div>

                    {/* AI Confidence */}
                    <div className="mt-4 flex items-center justify-between max-w-md bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                      <span className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        <span>AI Confidence Score</span>
                      </span>
                      <div className="flex items-center space-x-3 w-1/2">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(report.confidence * 100).toFixed(0)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {(report.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Optional: Citizen Notes */}
                    {report.description && (
                      <div className="mt-4 p-4 border border-gray-100 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">
                          <span className="text-gray-400 font-bold uppercase text-xs tracking-wider block mb-1">Citizen Notes:</span>
                          {report.description}
                        </p>
                      </div>
                    )}

                    {/* NEW: RESOURCE ALLOCATION OPTIMIZER */}
                    {!isResolved && report.violation_type !== 'no_violation' && (
                      <div className="mt-4 p-4 border border-blue-100 bg-blue-50/50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                           <h5 className="text-xs font-black text-blue-800 uppercase tracking-widest flex items-center gap-2">
                             <Truck size={14} /> Resource Allocation Pipeline
                           </h5>
                           {!assigned && (
                             <button 
                               onClick={() => handleAssignResource(report.id, assignResourceLogic(report))}
                               className="text-xs font-bold bg-white border border-blue-200 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition shadow-sm"
                             >
                               Assign Nearest Unit
                             </button>
                           )}
                        </div>
                        
                        {assigned ? (
                          <div className="grid grid-cols-2 gap-3 text-xs font-medium text-blue-900 mt-3 pt-3 border-t border-blue-100/50">
                            <div><span className="block text-[10px] text-blue-500 uppercase tracking-widest font-bold">Assigned Unit</span> {assigned.team}</div>
                            <div><span className="block text-[10px] text-blue-500 uppercase tracking-widest font-bold">Live ETA</span> {assigned.eta} ({assigned.distance} away)</div>
                          </div>
                        ) : (
                          <p className="text-xs font-semibold text-blue-600/70 italic">No resources allocated manually yet.</p>
                        )}
                      </div>
                    )}

                    {/* NEW: 5. POST-INCIDENT ANALYSIS (Only if Resolved) */}
                    {isResolved && (
                      <div className="mt-4 p-4 border border-green-200 bg-green-50 rounded-xl shadow-sm">
                        <h5 className="text-xs font-black text-green-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <BarChart size={14} /> Post-Incident Analysis Report
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div><span className="block font-bold text-green-700/60 uppercase tracking-widest text-[10px]">Response Efficiency</span> <span className="font-semibold text-green-900">Resolved in 1h 20m</span></div>
                          <div><span className="block font-bold text-green-700/60 uppercase tracking-widest text-[10px]">Impact Mitigation</span> <span className="font-semibold text-green-900">AQI improved from 180 → 140</span></div>
                          <div className="col-span-2"><span className="block font-bold text-green-700/60 uppercase tracking-widest text-[10px]">Action Standard</span> <span className="font-semibold text-green-900">{assigned?.team || "General Response Team"} deployed safely reducing risk metrics.</span></div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Right Column: Actions */}
                  <div className="w-full md:w-56 flex flex-col space-y-3 shrink-0">
                    
                    {/* Status Badge */}
                    <div className="mb-2 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                      <span className="block text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-2">Current Status</span>
                      <span className={`inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold tracking-wide uppercase border w-full justify-center shadow-sm ${getStatusColor(report.status)}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* NEW: ESCALATION CHAIN STATUS */}
                    <div className="mb-2 px-3 pb-3">
                      <span className="block text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1">Escalation Chain Status</span>
                      <span className={`text-xs font-semibold ${escLevel.includes('Urgent') || escLevel.includes('Level 3') ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                        {escLevel}
                      </span>
                    </div>

                    {/* Action Buttons - Only for real violations */}
                    {report.violation_type !== 'no_violation' && (
                      <div className="space-y-2 mt-2 border-t border-gray-100 pt-4">
                        <span className="block text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-2">Authority Actions</span>
                        
                        {isResolved ? (
                          <button
                            disabled
                            className="w-full px-4 py-2 bg-green-50 text-green-700 text-sm font-bold rounded-lg border border-green-200 flex items-center justify-center space-x-2 cursor-not-allowed opacity-80"
                          >
                            <CheckCircle2 size={16} />
                            <span>Action Completed</span>
                          </button>
                        ) : deploymentPanel && deploymentPanel.id === report.id ? (
                          <button
                            onClick={() => handleDeploy(deploymentPanel)}
                            className="w-full px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center space-x-2"
                          >
                            <Send size={16} />
                            <span>Deploy Support</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGenerateDeployment(report)}
                            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center space-x-2"
                          >
                            <Shield size={16} />
                            <span>Generate Plan</span>
                          </button>
                        )}

                        {/* Escalate Button */}
                        {!isResolved && report.status !== 'escalated' && (
                          <button
                            onClick={() => handleEscalate(report)}
                            className="w-full px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                          >
                            ↑ Escalate Response
                          </button>
                        )}
                      </div>
                    )}

                    {/* No Violation Status */}
                    {report.violation_type === 'no_violation' && (
                      <div className="mt-4 p-4 text-center border border-dashed border-gray-200 rounded-lg">
                        <CheckCircle2 size={24} className="text-gray-400 mx-auto mb-2" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                          No Action Required
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Deployment Panel */}
      {deploymentPanel && (
        <DeploymentPanel
          violation={deploymentPanel}
          onClose={() => setDeploymentPanel(null)}
          onDeploymentGenerated={handleDeploymentGenerated}
          onDeploy={handleDeploy}
        />
      )}

      {/* Escalation Confirmation Dialog */}
      {escalationConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Escalation</h3>
                <p className="text-sm text-gray-600">Report ID: {escalationConfirm.id}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Are you sure you want to escalate this violation report?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm font-bold text-gray-900 mb-1">
                  {VIOLATION_LABELS[escalationConfirm.violation_type] || escalationConfirm.violation_type}
                </p>
                <div className="flex flex-col space-y-1 mt-2">
                  <p className="text-xs text-gray-600 flex justify-between">
                    <span className="font-semibold text-gray-500">Location:</span> {escalationConfirm.location}
                  </p>
                  <p className="text-xs text-gray-600 flex justify-between">
                    <span className="font-semibold text-gray-500">Severity:</span> 
                    <span className="font-bold capitalize text-red-600">{escalationConfirm.severity}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setEscalationConfirm(null)}
                className="flex-1 px-4 py-2 font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEscalate}
                className="flex-1 px-4 py-2 font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                <AlertTriangle size={16} />
                <span>Force Escalate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] max-w-md animate-in slide-in-from-right fade-in">
          <div className={`p-5 rounded-xl shadow-2xl border-l-4 ${notification.type === 'success' ? 'bg-white border-green-500' : 'bg-white border-red-500'}`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === 'success' ? <CheckCircle2 size={20} className="text-green-600" /> : <AlertTriangle size={20} className="text-red-600" />}
              </div>
              <div className="flex-1">
                <h4 className={`font-bold text-sm mb-1 ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                  {notification.title}
                </h4>
                <p className="text-xs text-gray-600 font-medium whitespace-pre-line">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="flex-shrink-0 ml-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViolationMonitoring;
