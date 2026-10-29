import { useRef } from 'react';
import { Camera, Shield, BadgeCheck, BadgeAlert, CircleUser, Award, Zap, Flame, Edit3 } from 'lucide-react';
import userService from '../../services/userService';
import uploadService from '../../services/uploadService';
import { toast } from 'react-hot-toast';
import { formatRole } from '../../utils/formatRole';

const ProfileHeader = ({ user, updateUser, onEdit }) => {
  const fileRef = useRef(null);
  const role = user?.role || 'student';

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

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    : '—';

  return (
    <div className="bg-white rounded-2xl border border-ink-100/70 overflow-hidden shadow-theme-md">
      <div className="h-3 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700" />
      <div className="p-8 md:p-10 flex flex-col md:flex-row gap-10 items-start">
        {/* Big Avatar */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative group">
            <div className="w-44 h-44 rounded-2xl overflow-hidden ring-[6px] ring-primary-200 shadow-theme-lg">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name || 'Profile photo'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary-50 flex items-center justify-center">
                  <CircleUser className="w-20 h-20 text-primary-400" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-11 h-11 rounded-full bg-white border-2 border-ink-200 shadow-theme-md flex items-center justify-center hover:bg-cream-50 transition-all"
            >
              <Camera className="w-5 h-5 text-ink-600" />
            </button>
            <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Name + Role + Edit */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-ink-900 font-outfit">{user?.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 text-base font-semibold text-primary-600 bg-primary-50 px-4 py-1.5 rounded-full">
                  <Shield className="w-4 h-4" />
                  {formatRole(role)}
                </span>
                {user?.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-sm text-secondary-600 bg-secondary-50 px-4 py-1.5 rounded-full font-semibold">
                    <BadgeCheck className="w-4 h-4" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm text-accent-600 bg-accent-50 px-4 py-1.5 rounded-full font-semibold">
                    <BadgeAlert className="w-4 h-4" />
                    Not Verified
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-theme-sm shrink-0"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          {/* Compact details */}
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-ink-600 font-medium">Email</span>
              <p className="text-ink-800 font-semibold">{user?.email}</p>
            </div>
            <div>
              <span className="text-ink-600 font-medium">Member Since</span>
              <p className="text-ink-800 font-semibold">{memberSince}</p>
            </div>
            {user?.countryFlag && (
              <div>
                <span className="text-ink-600 font-medium">Country</span>
                <p className="text-ink-800 font-semibold">{user.countryFlag}</p>
              </div>
            )}
            <div>
              <span className="text-ink-600 font-medium">User ID</span>
              <p className="text-ink-800 font-semibold">#{user?._id?.slice(-8)}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-200">
              <Award className="w-4 h-4 text-primary-600" />
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-ink-900">{user?.points ?? 0}</span>
                <span className="text-xs text-ink-600 font-medium">Points</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-50 border border-accent-200">
              <Zap className="w-4 h-4 text-accent-600" />
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-ink-900">{user?.level ?? 1}</span>
                <span className="text-xs text-ink-600 font-medium">Level</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-coral-50 border border-coral-200">
              <Flame className="w-4 h-4 text-coral-600" />
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-ink-900">{user?.streak ?? 0}</span>
                <span className="text-xs text-ink-600 font-medium">Streak</span>
              </div>
            </div>
            {user?.badges?.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary-50 border border-secondary-200">
                <Award className="w-4 h-4 text-secondary-600" />
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-ink-900">{user.badges.length}</span>
                  <span className="text-xs text-ink-600 font-medium">Badges</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
