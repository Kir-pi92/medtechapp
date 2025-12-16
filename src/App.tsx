import { useState, useEffect } from 'react';
import { PlusCircle, LayoutDashboard, Search, FileText, Settings as SettingsIcon, Pencil, Trash2, LogOut, Loader2 } from 'lucide-react';
import { ServiceForm } from './components/ServiceForm';
import { ServiceReport } from './components/ServiceReport';
import { Settings } from './components/Settings';
import { TemplateEditor } from './components/TemplateEditor';
import { CompanyLogo } from './components/CompanyLogo';
import { LoginPage } from './components/LoginPage';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import { reportsApi } from './api';
import { statusTranslationMap } from './i18n';
import type { ServiceReport as ServiceReportType } from './types';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function App() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const [view, setView] = useState<'dashboard' | 'new' | 'edit' | 'report' | 'settings' | 'template'>('dashboard');
  const [currentReport, setCurrentReport] = useState<ServiceReportType | null>(null);
  const [editingReport, setEditingReport] = useState<ServiceReportType | null>(null);
  const [reports, setReports] = useState<ServiceReportType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const { t } = useLanguage();

  // Load reports from API when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadReports = async () => {
      setIsLoadingReports(true);
      try {
        const data = await reportsApi.getAll();
        setReports(data);

        // Check backup reminder
        const lastBackupReminder = localStorage.getItem('medtech_lastBackupReminder');
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        if ((!lastBackupReminder || Date.now() - parseInt(lastBackupReminder) > oneWeek) && data.length > 0) {
          setShowBackupReminder(true);
        }
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setIsLoadingReports(false);
      }
    };

    loadReports();
  }, [isAuthenticated]);

  // Export to Excel function
  const exportToExcel = () => {
    const data = filteredReports.map(r => ({
      [t('reportNo')]: r.reportNumber || `#${r.id?.slice(-6).toUpperCase()}`,
      [t('date')]: r.serviceDate,
      [t('customer')]: r.customerName,
      [t('department')]: r.department || '',
      [t('deviceType')]: r.deviceType,
      [t('brand')]: r.brand,
      [t('model')]: r.model,
      [t('serialNumber')]: r.serialNumber,
      [t('tagNumber')]: r.tagNumber || '',
      [t('faultDescription')]: r.faultDescription,
      [t('actionTaken')]: r.actionTaken,
      [t('status')]: getStatusTranslation(r.status),
      [t('technician')]: r.technicianName,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reports');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `MedTech_Reports_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Backup to JSON function
  const downloadBackup = () => {
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      reports: reports
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    saveAs(blob, `MedTech_Backup_${new Date().toISOString().split('T')[0]}.json`);
    localStorage.setItem('medtech_lastBackupReminder', Date.now().toString());
    setShowBackupReminder(false);
  };


  const handleSaveReport = async (data: ServiceReportType) => {
    try {
      const newReport = await reportsApi.create(data);
      setReports([newReport, ...reports]);
      setCurrentReport(newReport);
      setView('report');
    } catch (error) {
      console.error('Failed to save report:', error);
      alert('Failed to save report');
    }
  };

  const handleUpdateReport = async (data: ServiceReportType) => {
    if (!editingReport?.id) return;
    try {
      const updatedReport = await reportsApi.update(editingReport.id, data);
      setReports(reports.map(r => r.id === editingReport.id ? updatedReport : r));
      setCurrentReport(updatedReport);
      setEditingReport(null);
      setView('report');
    } catch (error) {
      console.error('Failed to update report:', error);
      alert('Failed to update report');
    }
  };

  const handleEditReport = (report: ServiceReportType) => {
    setEditingReport(report);
    setView('edit');
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await reportsApi.delete(id);
      setReports(reports.filter(r => r.id !== id));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Failed to delete report:', error);
      alert('Failed to delete report');
    }
  };

  const handleViewReport = (report: ServiceReportType) => {
    setCurrentReport(report);
    setView('report');
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.reportNumber && r.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDateFrom = !dateFrom || r.serviceDate >= dateFrom;
    const matchesDateTo = !dateTo || r.serviceDate <= dateTo;

    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const getStatusTranslation = (status: string) => {
    const key = statusTranslationMap[status];
    return key ? t(key) : status.replace('_', ' ');
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Template editor is full-screen
  if (view === 'template') {
    return <TemplateEditor onBack={() => setView('settings')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header - Hidden when printing */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary-700">
            {/* Company Logo */}
            <CompanyLogo />
            <h1 className="text-xl font-bold tracking-tight">{t('appName')}</h1>
          </div>

          <nav className="flex gap-2">
            <button
              onClick={() => setView('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'dashboard'
                ? 'bg-primary-50 text-primary-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {t('dashboard')}
            </button>
            <button
              onClick={() => {
                setCurrentReport(null);
                setEditingReport(null);
                setView('new');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'new'
                ? 'bg-primary-50 text-primary-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <PlusCircle className="w-4 h-4" />
              {t('newEntry')}
            </button>
            <button
              onClick={() => setView('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'settings'
                ? 'bg-primary-50 text-primary-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <SettingsIcon className="w-4 h-4" />
              {t('settings')}
            </button>

            {/* User info and logout */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
              <span className="text-sm text-slate-600">
                {t('welcome')}, <span className="font-medium">{user?.fullName}</span>
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Backup Reminder Modal */}
      {showBackupReminder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4 animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('backupReminder')}</h3>
            <p className="text-slate-600 mb-6">{t('backupReminderMessage')}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  localStorage.setItem('medtech_lastBackupReminder', Date.now().toString());
                  setShowBackupReminder(false);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {t('remindLater')}
              </button>
              <button
                onClick={downloadBackup}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                {t('downloadBackup')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full print:p-0 print:max-w-none">
        {view === 'new' && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">{t('newServiceEntry')}</h2>
              <p className="text-slate-500">{t('newEntryDescription')}</p>
            </div>
            <ServiceForm onSubmit={handleSaveReport} />
          </div>
        )}

        {view === 'edit' && editingReport && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">{t('editReport')}</h2>
              <p className="text-slate-500">{t('editReportDescription')}</p>
            </div>
            <ServiceForm onSubmit={handleUpdateReport} initialData={editingReport} isEditing />
          </div>
        )}

        {view === 'report' && currentReport && (
          <div className="animate-in fade-in duration-300">
            <ServiceReport
              data={currentReport}
              onBack={() => setView('dashboard')}
              onEdit={() => handleEditReport(currentReport)}
            />
          </div>
        )}

        {view === 'settings' && (
          <div className="animate-in fade-in duration-300">
            <Settings onOpenTemplateEditor={() => setView('template')} />
          </div>
        )}

        {view === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t('serviceDashboard')}</h2>
                <p className="text-slate-500">{t('dashboardDescription')}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Date Filters */}
                <div className="flex items-center gap-2 text-sm">
                  <label className="text-slate-600">{t('from')}:</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <label className="text-slate-600">{t('to')}:</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                {/* Search */}
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none w-48"
                  />
                </div>
                {/* Export Buttons */}
                {reports.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={exportToExcel}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      title={t('exportExcel')}
                    >
                      <FileText className="w-4 h-4" />
                      Excel
                    </button>
                    <button
                      onClick={downloadBackup}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                      title={t('downloadBackup')}
                    >
                      <FileText className="w-4 h-4" />
                      {t('backup')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics Cards */}
            {reports.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <FileText className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{reports.length}</p>
                      <p className="text-sm text-slate-500">{t('totalReports')}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {reports.filter(r => r.status === 'completed').length}
                      </p>
                      <p className="text-sm text-slate-500">{t('completed')}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FileText className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {reports.filter(r => r.status === 'pending').length}
                      </p>
                      <p className="text-sm text-slate-500">{t('pending')}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        {reports.filter(r => r.status === 'parts_needed').length}
                      </p>
                      <p className="text-sm text-slate-500">{t('partsNeeded')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {reports.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">{t('noReportsFound')}</h3>
                <p className="text-slate-500 mt-1 mb-6">{t('noReportsDescription')}</p>
                <button
                  onClick={() => setView('new')}
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  {t('createFirstReport')}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold">{t('reportNo')}</th>
                      <th className="px-6 py-4 font-semibold">{t('date')}</th>
                      <th className="px-6 py-4 font-semibold">{t('customer')}</th>
                      <th className="px-6 py-4 font-semibold">{t('device')}</th>
                      <th className="px-6 py-4 font-semibold">{t('technician')}</th>
                      <th className="px-6 py-4 font-semibold">{t('status')}</th>
                      <th className="px-6 py-4 font-semibold text-right">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-slate-600">
                          {report.reportNumber || `#${report.id?.slice(-6).toUpperCase()}`}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{report.serviceDate}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{report.customerName}</td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="font-medium text-slate-900">{report.deviceType}</div>
                          <div className="text-xs text-slate-500">{report.brand} {report.model}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{report.technicianName}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${report.status === 'completed' ? 'bg-green-100 text-green-800' :
                              report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                report.status === 'parts_needed' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'}`}>
                            {getStatusTranslation(report.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewReport(report)}
                              className="text-primary-600 hover:text-primary-900 font-medium text-sm"
                            >
                              {t('viewReport')}
                            </button>
                            <button
                              onClick={() => handleEditReport(report)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title={t('editReport')}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(report.id || null)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title={t('deleteReport')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('confirmDelete')}</h3>
            <p className="text-slate-600 mb-6">{t('confirmDeleteMessage')}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => handleDeleteReport(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
