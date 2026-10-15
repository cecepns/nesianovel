import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { Eye, Coins, Crown } from 'lucide-react';
import { apiClient, getImageUrl } from '../utils/api';

const ProfileUser = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      setLoading(true);
      setError('');
      try {
        const result = await apiClient.getUserProfile(username);
        if (result?.status && result?.data) {
          setProfile(result.data);
        } else {
          setError('Profil tidak ditemukan');
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat profil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const membershipDate = useMemo(() => {
    if (!profile?.membership_expires_at) return null;
    const date = new Date(profile.membership_expires_at);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }, [profile?.membership_expires_at]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0717] text-white flex items-center justify-center">
        <p className="text-purple-300">Memuat profil...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0c0717] text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-purple-300 mb-4">{error || 'Profil tidak ditemukan'}</p>
          <Link
            to="/"
            className="inline-block px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition-colors font-semibold"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const photo = getImageUrl(profile.profile_image);

  return (
    <div className="min-h-screen bg-[#0c0717] text-white">
      <Helmet>
        <title>{`${profile.name} (@${profile.username}) | NesiaNovel`}</title>
        <meta
          name="description"
          content={profile.bio || `Lihat profil ${profile.name} di NesiaNovel.`}
        />
      </Helmet>

      <main className="px-4 py-10 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="relative h-[280px] md:h-[320px] rounded-3xl overflow-hidden mb-6 border border-purple-900/30">
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-40"
              style={{ backgroundImage: `url(${photo || '/logo-nesianovel.png'})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0717] via-[#0c0717]/80 to-purple-950/20" />
            <div className="relative h-full flex items-end p-6 md:p-8">
              <div className="flex items-end gap-5 w-full">
                <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-purple-950/80 border-2 border-purple-500/40 shadow-xl">
                  {photo ? (
                    <img src={photo} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-purple-400">
                      {String(profile.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <h1 className="text-2xl md:text-4xl font-extrabold leading-tight text-white">{profile.name}</h1>
                  <p className="text-purple-300/80 text-sm mt-0.5">@{profile.username}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                    <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-amber-300 font-semibold">
                      <Coins className="h-4 w-4 text-amber-400" />
                      <span>{Number(profile.points || 0).toLocaleString('id-ID')} Koin</span>
                    </div>
                    <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold ${
                      profile.membership_active
                        ? 'bg-purple-600/20 border border-purple-500/40 text-purple-300'
                        : 'bg-white/5 border border-white/10 text-gray-300'
                    }`}>
                      <Crown className={`h-4 w-4 ${profile.membership_active ? 'text-purple-400' : 'text-gray-400'}`} />
                      <span>{profile.membership_active ? 'VIP Premium' : 'Member Reguler'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#130c24]/90 rounded-2xl border border-purple-900/30 p-5 md:p-6 mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300/80 mb-2">Bio</h3>
            <p className="text-gray-200 leading-relaxed text-sm">
              {profile.bio || 'Pengguna ini belum menambahkan bio.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {profile.membership_active && (
              <div className="px-4 py-2 bg-purple-900/40 border border-purple-500/40 rounded-xl text-purple-200 text-sm font-medium">
                VIP Member {membershipDate ? `(aktif sampai ${membershipDate})` : ''}
              </div>
            )}
            {!profile.membership_active && (
              <div className="px-4 py-2 bg-purple-950/40 border border-purple-900/30 rounded-xl text-purple-300/70 text-sm">
                Member Reguler
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileUser;
