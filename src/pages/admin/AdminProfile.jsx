import { useState, useRef } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import uploadService from '../../services/uploadService';
import { auth } from '../../config/firebase';
import { mapFirebaseAuthError } from '../../utils/firebaseAuthErrors';
import { PASSWORD_HINT, getPasswordValidationError } from '../../utils/passwordValidation';
import { toast } from 'react-hot-toast';
import { formatRole } from '../../utils/formatRole';
import {
  Camera, Shield, BadgeCheck, BadgeAlert, CircleUser,
  Lock, Key, Bell, Globe2,
  Edit3, Save, X, User, Eye, EyeOff,
} from 'lucide-react';

const PROVIDER_LABELS = { google: 'Google', github: 'GitHub', microsoft: 'Microsoft' };

const ProfileSectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl border border-ink-200 shadow-theme-sm overflow-hidden">
    {title && (
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-ink-100">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary-600" />
          </div>
        )}
        <h3 className="text-base font-bold text-ink-900">{title}</h3>
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

const Toggle = ({ enabled, onChange, label, disabled, disabledNote }) => (
  <div className="flex items-center justify-between py-2.5">
    <div>
      <span className="text-sm font-medium text-ink-700">{label}</span>
      {disabled && disabledNote && <p className="text-xs text-ink-500 mt-0.5">{disabledNote}</p>}
    </div>
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-label={label}
      aria-pressed={enabled}
      className={`relative w-11 h-6 rounded-full transition-all ${enabled ? 'bg-primary-600' : 'bg-ink-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-theme-sm transition-transform ${enabled ? 'translate-x-5' : ''}`} />
    </button>
  </div>
);

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const fileRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [notifications, setNotifications] = useState(true);
  const [lang, setLang] = useState('en');

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const role = user?.role || 'admin';
  const canChangePassword = user?.authProvider === 'email';

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    const policyError = await getPasswordValidationError(auth, newPassword);
    if (policyError) {
      toast.error(policyError);
      return;
    }

    setPasswordSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      toast.success('Password updated');
      closePasswordModal();
    } catch (err) {
      toast.error(mapFirebaseAuthError(err).message);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const result = await uploadService.uploadFile(file);
      const url = result.url || result.secure_url || result;
      await userService.updateUser(user._id, { avatar: url });
      updateUser({ avatar: url });
      toast.success('Avatar updated');
    } catch {
      toast.error('Avatar upload failed');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const updateRes = await userService.updateUser(user._id, { name });
      updateUser({ name: updateRes.name || updateRes.user?.name });
      toast.success('Profile updated');
      setShowEditModal(false);
    } catch (err) {
      toast.error(err.data?.error || err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <div className="max-w-5xl mx-auto py-6 px-4 md:px-6 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-ink-900">My Profile</h1>
          <p className="text-sm text-ink-500 mt-1">Manage your account information and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─── Left column: Profile Summary ─── */}
        <div className="lg:col-span-1 space-y-6">
          <ProfileSectionCard>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-44 h-44 rounded-2xl overflow-hidden ring-4 ring-primary-100 shadow-theme-lg mx-auto">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name || 'Profile photo'} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-primary-50 flex items-center justify-center">
                      <CircleUser className="w-20 h-20 text-primary-300" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-white border-2 border-ink-200 shadow-theme-md flex items-center justify-center hover:bg-ink-50 transition-all"
                >
                  <Camera className="w-5 h-5 text-ink-500" />
                </button>
                <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </div>

              <h2 className="text-xl font-bold text-ink-900">{user?.name}</h2>

              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                  <Shield className="w-3 h-3" />
                  {formatRole(role)}
                </span>
                {user?.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs text-secondary-600 bg-secondary-50 px-3 py-1 rounded-full font-semibold">
                    <BadgeCheck className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-accent-600 bg-accent-50 px-3 py-1 rounded-full font-semibold">
                    <BadgeAlert className="w-3 h-3" />
                    Not Verified
                  </span>
                )}
              </div>

              <p className="text-sm text-ink-500 mt-3">{user?.email}</p>

              <button
                type="button"
                onClick={() => { setName(user?.name || ''); setShowEditModal(true); }}
                className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-all shadow-theme-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>
          </ProfileSectionCard>
        </div>

        {/* ─── Right column: Security, Preferences ─── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Security */}
          <ProfileSectionCard title="Security" icon={Lock}>
            <div className="divide-y divide-ink-50">
              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ink-50 flex items-center justify-center shrink-0">
                    <Key className="w-4 h-4 text-ink-500" />
                  </div>
                  <div>
                    <p className="text-xs text-ink-500 font-medium uppercase tracking-wide">Password</p>
                    <p className="text-sm font-semibold text-ink-800">
                      {canChangePassword ? 'Change your account password' : `Managed by ${PROVIDER_LABELS[user?.authProvider] || 'external'} sign-in`}
                    </p>
                  </div>
                </div>
                {canChangePassword ? (
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-all"
                  >
                    Change
                  </button>
                ) : (
                  <span className="text-sm font-semibold text-ink-500 px-3 py-1.5">Not available</span>
                )}
              </div>
              <Toggle
                enabled={false}
                onChange={() => {}}
                label="Two-Factor Authentication"
                disabled
                disabledNote="Coming soon"
              />
            </div>
          </ProfileSectionCard>

          {/* Preferences */}
          <ProfileSectionCard title="Preferences" icon={Bell}>
            <div className="divide-y divide-ink-50">
              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ink-50 flex items-center justify-center shrink-0">
                    <Globe2 className="w-4 h-4 text-ink-500" />
                  </div>
                  <div>
                    <p className="text-xs text-ink-500 font-medium uppercase tracking-wide">Language</p>
                    <p className="text-sm font-semibold text-ink-800">{lang === 'en' ? 'English' : 'Bangla'}</p>
                  </div>
                </div>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="text-sm font-semibold border border-ink-200 rounded-lg px-3 py-1.5 text-ink-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="en">English</option>
                  <option value="bn">Bangla</option>
                </select>
              </div>
              <Toggle enabled={notifications} onChange={() => setNotifications((p) => !p)} label="Email Notifications" />
            </div>
          </ProfileSectionCard>

          {/* Danger Zone */}
          <ProfileSectionCard title="Danger Zone">
            <div className="space-y-3">
              <p className="text-sm text-ink-500">Account deletion for admin accounts must go through a super admin to prevent accidental loss of platform access. Contact a super admin to close your account.</p>
              <button
                disabled
                title="Contact a super admin to close your account"
                className="px-5 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-semibold text-sm opacity-50 cursor-not-allowed"
              >
                Delete Account
              </button>
            </div>
          </ProfileSectionCard>
        </div>
      </div>
    </div>

    {/* ═══ Edit Name Modal ═══ */}
    {showEditModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-ink-900">Edit Profile</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-ink-100 transition-all"
            >
              <X className="w-4 h-4 text-ink-500" />
            </button>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-ink-900 text-sm"
                placeholder="Your full name"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-ink-200 text-ink-700 font-semibold text-sm hover:bg-ink-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-coral-500 text-white rounded-xl font-bold text-sm hover:bg-coral-600 disabled:opacity-50 transition-all shadow-theme-sm"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* ═══ Change Password Modal ═══ */}
    {showPasswordModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                <Key className="w-4 h-4 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-ink-900">Change Password</h3>
            </div>
            <button
              type="button"
              onClick={closePasswordModal}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-ink-100 transition-all"
            >
              <X className="w-4 h-4 text-ink-500" />
            </button>
          </div>
          <form onSubmit={handleChangePassword} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-ink-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-ink-900 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-ink-500 hover:text-ink-600 transition-colors"
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={PASSWORD_HINT}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-ink-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-ink-900 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-ink-500 hover:text-ink-600 transition-colors"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-ink-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-ink-900 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-ink-500 hover:text-ink-600 transition-colors"
                  aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closePasswordModal}
                className="flex-1 px-4 py-2.5 rounded-xl border border-ink-200 text-ink-700 font-semibold text-sm hover:bg-ink-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passwordSaving}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-coral-500 text-white rounded-xl font-bold text-sm hover:bg-coral-600 disabled:opacity-50 transition-all shadow-theme-sm"
              >
                {passwordSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
};

export default AdminProfile;
