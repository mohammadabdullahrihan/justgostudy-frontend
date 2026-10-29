import { useState, useEffect } from 'react';
import { Settings, Save, MapPin, GraduationCap, DollarSign, Target, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
import studentService from '../services/studentService';

const DEFAULT_PREFERENCES = {
  countries: [],
  levels: [],
  budget: 30000,
  intake: 'September',
  notifications: true,
};

const ProfileStudyPreferences = () => {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Sweden', 'Malaysia'];
  const levels = ['Bachelor', 'Master', 'PhD', 'Diploma'];

  const loadPreferences = async () => {
    setPageLoading(true);
    setLoadError('');
    try {
      const profile = await studentService.getMyStudentProfile();
      setPreferences({
        countries: profile?.desiredCountry?.length ? profile.desiredCountry : DEFAULT_PREFERENCES.countries,
        levels: profile?.studyPreferences?.degreeLevels?.length ? profile.studyPreferences.degreeLevels : DEFAULT_PREFERENCES.levels,
        budget: profile?.studyPreferences?.budget ?? DEFAULT_PREFERENCES.budget,
        intake: profile?.studyPreferences?.intakeSeason || DEFAULT_PREFERENCES.intake,
        notifications: profile?.studyPreferences?.scholarshipAlerts ?? DEFAULT_PREFERENCES.notifications,
      });
    } catch (err) {
      // A brand-new student has no profile document yet, that's expected,
      // not a failure; start from defaults and let Save create the profile.
      if (!/not found/i.test(err.message || '')) {
        setLoadError(err.message || 'Failed to load your saved preferences.');
      }
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => { loadPreferences(); }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await studentService.updateMyStudentProfile({
        desiredCountry: preferences.countries,
        studyPreferences: {
          degreeLevels: preferences.levels,
          budget: Number(preferences.budget),
          intakeSeason: preferences.intake,
          scholarshipAlerts: preferences.notifications,
        },
      });
      toast.success('Study preferences saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (list, item, field) => {
    const newList = list.includes(item)
      ? list.filter(i => i !== item)
      : [...list, item];
    setPreferences({ ...preferences, [field]: newList });
  };

  if (pageLoading) {
    return (
      <div className="max-w-4xl space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-white border border-ink-100 rounded-3xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary-600" />
          Study Preferences
        </h1>
        <p className="text-ink-500">Set your preferences to get recommendations that fit you.</p>
      </div>

      {loadError && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl text-sm flex items-center justify-between gap-4">
          <span>{loadError}</span>
          <button onClick={loadPreferences} className="font-bold underline shrink-0">Retry</button>
        </div>
      )}

      <div className="space-y-6">
        {/* Countries */}
        <div className="bg-white p-8 rounded-3xl border border-ink-100 shadow-sm">
          <h3 className="text-lg font-bold text-ink-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-600" />
            Target Countries
          </h3>
          <div className="flex flex-wrap gap-3">
            {countries.map(country => (
              <button
                key={country}
                onClick={() => toggleItem(preferences.countries, country, 'countries')}
                className={`px-6 py-3 rounded-2xl font-bold transition-all border-2 ${preferences.countries.includes(country)
                    ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-100'
                    : 'bg-white border-ink-100 text-ink-500 hover:border-primary-200'
                  }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>

        {/* Levels */}
        <div className="bg-white p-8 rounded-3xl border border-ink-100 shadow-sm">
          <h3 className="text-lg font-bold text-ink-900 mb-6 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary-600" />
            Degree Level
          </h3>
          <div className="flex flex-wrap gap-3">
            {levels.map(level => (
              <button
                key={level}
                onClick={() => toggleItem(preferences.levels, level, 'levels')}
                className={`px-6 py-3 rounded-2xl font-bold transition-all border-2 ${preferences.levels.includes(level)
                    ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-100'
                    : 'bg-white border-ink-100 text-ink-500 hover:border-primary-200'
                  }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="bg-white p-8 rounded-3xl border border-ink-100 shadow-sm">
          <h3 className="text-lg font-bold text-ink-900 mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary-600" />
            Annual Budget (USD)
          </h3>
          <input
            type="range"
            min="5000"
            max="100000"
            step="5000"
            value={preferences.budget}
            onChange={(e) => setPreferences({ ...preferences, budget: e.target.value })}
            className="w-full h-3 bg-cream-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between mt-4">
            <span className="text-sm font-bold text-ink-500">$5k</span>
            <span className="text-xl font-bold text-primary-600">${Number(preferences.budget).toLocaleString()}</span>
            <span className="text-sm font-bold text-ink-500">$100k+</span>
          </div>
        </div>

        {/* Other Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-ink-100 shadow-sm">
            <h3 className="text-lg font-bold text-ink-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600" />
              Intake Season
            </h3>
            <select
              value={preferences.intake}
              onChange={(e) => setPreferences({ ...preferences, intake: e.target.value })}
              className="w-full px-6 py-4 bg-cream-50 border-none rounded-2xl font-bold text-ink-700 focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="September">Fall (September)</option>
              <option value="January">Winter (January)</option>
              <option value="May">Spring (May)</option>
            </select>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-ink-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-ink-900 mb-1 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-600" />
                Alerts
              </h3>
              <p className="text-sm text-ink-500">Get scholarship alerts</p>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, notifications: !preferences.notifications })}
              aria-label={preferences.notifications ? 'Disable scholarship alerts' : 'Enable scholarship alerts'}
              aria-pressed={preferences.notifications}
              className={`w-14 h-8 rounded-full transition-all relative ${preferences.notifications ? 'bg-primary-600' : 'bg-ink-200'
                }`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${preferences.notifications ? 'right-1' : 'left-1'
                }`} />
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-8">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-12 py-4 rounded-2xl shadow-xl shadow-primary-100 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-6 h-6" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileStudyPreferences;
