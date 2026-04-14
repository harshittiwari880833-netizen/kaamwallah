import { useState } from 'react';
import AvatarBadge from '../components/AvatarBadge';
import PageHeader from '../components/PageHeader';
import { featuredWorkers, workerReviews, availableJobs } from '../data/appData';
import { useAppContext } from '../context/AppContext';
import HireModal from '../components/HireModal';
import WorkerCard from '../components/WorkerCard';

function StarRating({ rating, size = 'sm' }) {
  return (
    <span className={`flex items-center gap-0.5 ${size === 'lg' ? 'text-xl' : 'text-sm'}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.floor(rating) ? 'text-amber-400' : 'text-slate-200'}>★</span>
      ))}
    </span>
  );
}

function WorkerProfile() {
  const { user, setUser, t } = useAppContext();
  const [isAvailable, setIsAvailable] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const displayRating = 4.8;
  const displayName = user?.name || 'Kaam Worker';
  const displayCategory = user?.category || 'Multi-skilled';
  const displayPrice = user?.price || 550;
  const initialSkills = user?.skills || ['Plumbing', 'Electrical Basics', 'Site Visits', 'Customer Support'];
  
  const [editForm, setEditForm] = useState({
    name: displayName,
    category: displayCategory,
    price: displayPrice,
    skills: initialSkills,
  });

  const [newSkill, setNewSkill] = useState('');

  const handleSave = () => {
    setUser(prev => {
      const updated = {
        ...prev,
        name: editForm.name,
        category: editForm.category,
        price: editForm.price,
        skills: editForm.skills,
      };
      localStorage.setItem('kaam_wallah_user', JSON.stringify(updated));
      return updated;
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        eyebrow={t('myProfile')}
        title="Your Worker Profile"
        description="Manage your profile, skills, availability, and reviews."
      />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-card overflow-hidden pb-4">
          <div className="h-40 bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
            <div className="absolute top-4 right-4">
              <span className="rounded-full px-3 py-1 text-xs font-bold bg-emerald-400/90 text-white shadow-sm">
                ✅ Verified Worker
              </span>
            </div>
          </div>

          <div className="px-6 pb-2">
            <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center sm:items-end gap-4">
                <div className="relative group ring-4 ring-white rounded-full bg-white flex-shrink-0 cursor-pointer">
                  <AvatarBadge seed={displayName} size="lg" imgSrc={user?.profilePic} />
                  <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <span className="text-xs font-bold">Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setUser(prev => {
                            const updated = { ...prev, profilePic: reader.result };
                            localStorage.setItem('kaam_wallah_user', JSON.stringify(updated));
                            return updated;
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                </div>
                <div className="pb-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">Worker Account</p>
                  {isEditing ? (
                    <div className="mt-1 flex flex-col gap-2">
                      <input type="text" className="form-input text-sm py-1 px-2" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                      <input type="text" className="form-input text-sm py-1 px-2" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} />
                    </div>
                  ) : (
                    <>
                      <h1 className="mt-1 text-2xl font-extrabold text-slate-900">{displayName}</h1>
                      <p className="text-sm font-semibold text-slate-500">{displayCategory}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {isEditing ? (
                  <button type="button" onClick={handleSave} className="gradient-button text-sm px-4 py-2">
                    Save Changes
                  </button>
                ) : (
                  <button type="button" onClick={() => setIsEditing(true)} className="secondary-button text-sm px-4 py-2">
                    {t('editProfile')}
                  </button>
                )}
              </div>
            </div>

            {/* Availability Toggle */}
            <div className={`mt-6 flex items-center justify-between rounded-2xl p-4 border transition-colors ${isAvailable ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <p className={`font-bold ${isAvailable ? 'text-emerald-800' : 'text-slate-600'}`}>
                  {isAvailable ? 'Available for work' : 'Currently Busy'}
                </p>
                <p className={`text-sm mt-0.5 ${isAvailable ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {isAvailable ? 'You are visible to clients for new jobs.' : 'You are hidden from search results.'}
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="sr-only peer" checked={isAvailable} onChange={() => setIsAvailable(!isAvailable)} />
                <div className="peer h-7 w-14 rounded-full bg-slate-200 after:absolute after:left-[4px] after:top-[4px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
              </label>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <StarRating rating={displayRating} size="lg" />
              <span className="text-lg font-extrabold text-slate-900">{displayRating}</span>
              <span className="text-sm font-semibold text-slate-400">(143 reviews)</span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ['Experience', '6+ years'],
                ['Jobs Done', '148'],
                ['Response', '< 10 min', '⚡'],
              ].map(([label, value, badge]) => (
                <div key={label} className="rounded-2xl bg-white border border-slate-100 p-4 text-center shadow-sm relative overflow-hidden">
                  {badge && <span className="absolute top-2 right-2 text-xs">{badge}</span>}
                  <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                  <p className="mt-1 flex items-center justify-center gap-1 text-base font-extrabold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <aside className="space-y-5">
          <div className="surface-card p-5 group">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-extrabold text-slate-900">{t('skills')}</h2>
            </div>
            
            {isEditing && (
              <div className="flex gap-2 mb-3">
                <input 
                  type="text" 
                  className="form-input text-sm flex-1" 
                  placeholder="Add skill" 
                  value={newSkill} 
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newSkill.trim()) {
                      setEditForm({...editForm, skills: [...editForm.skills, newSkill.trim()]});
                      setNewSkill('');
                    }
                  }}
                />
                <button type="button" className="secondary-button text-xs px-3" onClick={() => {
                  if(newSkill.trim()) {
                    setEditForm({...editForm, skills: [...editForm.skills, newSkill.trim()]});
                    setNewSkill('');
                  }
                }}>Add</button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {(isEditing ? editForm.skills : initialSkills).map((skill, index) => (
                <span key={index} className="skill-tag border border-slate-200 flex items-center gap-1">
                  {skill}
                  {isEditing && (
                    <button type="button" onClick={() => setEditForm({...editForm, skills: editForm.skills.filter((_, i) => i !== index)})} className="text-slate-400 hover:text-rose-500 ml-1">×</button>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <h2 className="text-lg font-extrabold text-slate-900 mb-3">Pricing</h2>
            <div className="rounded-2xl bg-slate-950 p-5 text-white flex flex-col gap-2">
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Base rate</p>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <span className="text-xl">₹</span>
                  <input type="number" className="form-input bg-slate-800 text-white border-slate-700 w-32" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
                  <span className="text-sm text-slate-400">/ visit</span>
                </div>
              ) : (
                <p className="mt-2 text-2xl font-extrabold text-white">
                  ₹{displayPrice} <span className="text-lg text-slate-400 font-normal">/ visit</span>
                </p>
              )}
            </div>
          </div>
        </aside>
      </section>

      <section className="surface-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold text-slate-900">{t('reviews')}</h2>
          <div className="flex items-center gap-2">
            <StarRating rating={displayRating} />
            <span className="text-sm font-bold text-slate-700">{displayRating}</span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workerReviews.map((review) => (
            <div key={review.id} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">{review.reviewer}</span>
                <span className="text-xs font-semibold text-slate-400">{review.date}</span>
              </div>
              <StarRating rating={review.rating} />
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ClientProfile() {
  // const { user, t } = useAppContext();
  const { user, setUser, t } = useAppContext();
  const [activeTab, setActiveTab] = useState('info');
  const [addresses, setAddresses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('kaam_wallah_addresses') || '[]');
    } catch { return []; }
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', text: '' });
  const [locating, setLocating] = useState(false);

  function saveAddresses(addrs) {
    setAddresses(addrs);
    localStorage.setItem('kaam_wallah_addresses', JSON.stringify(addrs));
  }

  const TABS = [
    { id: 'info', label: 'Profile Info', icon: '👤' },
    { id: 'addresses', label: 'Addresses', icon: '📍' },
    { id: 'jobs', label: 'My Jobs', icon: '📋' },
    { id: 'saved', label: 'Saved Workers', icon: '❤️' },
  ];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        eyebrow="Client Account"
        title="My Profile"
      />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="surface-card p-3 flex flex-row md:flex-col gap-1 overflow-x-auto scrollbar-hidden">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-cyan-50 text-cyan-700 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'info' && (
            <div className="surface-card p-6 sm:p-8 animate-fade-in">
              <div className="flex items-center gap-5 mb-8">
                <div className="relative group ring-4 ring-slate-50 rounded-full bg-slate-100 p-1 cursor-pointer">
                  {user?.profilePic ? (
                    <img src={user.profilePic} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
                  ) : (
                    <AvatarBadge seed={user?.name || 'Client'} size="lg" />
                  )}
                  <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <span className="text-xs font-bold">Upload</span>
                    {/* <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files[0];
                      if(file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setUser({...user, profilePic: reader.result});
                        reader.readAsDataURL(file);
                      }
                    }} /> */
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const updatedUser = {
                                ...user,
                                profilePic: reader.result,
                              };

                              setUser(updatedUser);

                              // persist also
                              localStorage.setItem(
                                "kaam_wallah_user",
                                JSON.stringify(updatedUser)
                              );
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />}
                  </label>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">{user?.name || 'Client User'}</h2>
                  <p className="text-slate-500 font-semibold">{user?.phone || '+91 98765 43210'}</p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input bg-slate-50" defaultValue={user?.name || 'Client User'} readOnly />
                </div>
                <div>
                  <label className="form-label">Phone Number</label>
                  <input type="text" className="form-input bg-slate-50" defaultValue={user?.phone || '+91 98765 43210'} readOnly />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Email Address (Optional)</label>
                  <input type="email" className="form-input" placeholder="Enter your email" />
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button className="gradient-button">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-slate-900">Saved Addresses</h3>
                {!showAddressForm && (
                  <button onClick={() => setShowAddressForm(true)} className="ghost-button text-sm">+ Add New</button>
                )}
              </div>

              {showAddressForm && (
                <div className="surface-card p-5 space-y-4">
                  <div className="flex gap-2">
                    <button type="button" disabled={locating} onClick={() => {
                      if (!navigator.geolocation) return alert('Geolocation not supported');
                      setLocating(true);
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setLocating(false);
                          setNewAddress(prev => ({ ...prev, text: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}` }));
                        },
                        () => { setLocating(false); alert('Could not get location'); }
                      );
                    }} className="secondary-button text-sm flex-1">
                      {locating ? 'Locating...' : '📍 Use Current Location'}
                    </button>
                  </div>
                  <input type="text" className="form-input" placeholder="Label (e.g. Home, Office)" value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })} />
                  <textarea className="form-input" placeholder="Full Address (House No, Landmark, Area)" value={newAddress.text} onChange={e => setNewAddress({ ...newAddress, text: e.target.value })} rows={3} />
                  <div className="flex gap-2">
                    <button onClick={() => {
                      if (newAddress.label && newAddress.text) {
                        saveAddresses([...addresses, { id: Date.now(), ...newAddress, isDefault: addresses.length === 0 }]);
                        setShowAddressForm(false);
                        setNewAddress({ label: '', text: '' });
                      }
                    }} className="gradient-button text-sm px-4">Save Address</button>
                    <button onClick={() => setShowAddressForm(false)} className="ghost-button text-sm px-4">Cancel</button>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.length === 0 && !showAddressForm && (
                  <p className="text-sm text-slate-500 py-4">No saved addresses found.</p>
                )}
                {addresses.map(addr => (
                  <div key={addr.id} className={`rounded-[1.5rem] border-2 p-5 transition ${addr.isDefault ? 'border-cyan-400 bg-cyan-50/30' : 'border-slate-100 bg-white hover:border-cyan-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{addr.label.toLowerCase().includes('home') ? '🏠' : '🏢'}</span>
                        <h4 className="font-extrabold text-slate-900">{addr.label}</h4>
                      </div>
                      {addr.isDefault && (
                        <span className="bg-cyan-500 text-white text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full">Default</span>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">{addr.text}</p>
                    <div className="mt-4 flex items-center gap-4 text-sm font-semibold">
                      <button onClick={() => {
                        saveAddresses(addresses.filter(a => a.id !== addr.id));
                      }} className="text-rose-500 hover:text-rose-700">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xl font-extrabold text-slate-900">Job History</h3>
              <div className="grid gap-4">
                {availableJobs.slice(0, 3).map(job => (
                  <div key={job.id} className="surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-cyan-500">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="status-completed text-[10px]">Completed</span>
                        <span className="text-xs font-bold text-slate-400">{job.time}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-lg">{job.title}</h4>
                      <p className="text-sm font-semibold text-slate-500 mt-0.5">{job.category} • ₹{job.price}</p>
                    </div>
                    <button className="secondary-button text-sm whitespace-nowrap">View Details</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xl font-extrabold text-slate-900">Previously Hired Workers</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {featuredWorkers.slice(0, 2).map(worker => (
                  <WorkerCard key={worker.id} worker={worker} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { role } = useAppContext();
  return role === 'worker' ? <WorkerProfile /> : <ClientProfile />;
}
