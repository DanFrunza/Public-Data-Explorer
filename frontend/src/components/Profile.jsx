import React, { useState, useEffect } from "react";
import "../css/Profile.css";
import { get, put, post } from "../api/apiClient";

const Profile = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarError, setAvatarError] = useState(null);

    useEffect(() => {
        const abortCtrl = new AbortController();
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await get("/api/users/me", { auth: true, signal: abortCtrl.signal });
                const user = res?.user || null;
                setData(user);
                setForm(user); // initialize form with current values
                // You can inspect in console while wiring UI
                // console.log("Profile user:", res?.user);
            } catch (e) {
                if (e?.name === "AbortError") return;
                if (e?.status === 401) {
                    setError("Please log in to view your profile");
                } else if (e?.status === 404) {
                    setError(e?.message || "Not found");
                } else {
                    setError(e?.message || "Failed to load profile");
                }
            } finally {
                setLoading(false);
            }
        })();
        return () => abortCtrl.abort();
    }, []);

        return (
            <main className="profile-modern">
                {/* Hero Section */}
                <section className="profile-hero-section">
                    <div className="profile-hero-content">
                        <div className="profile-hero-badge">👤 Profile</div>
                        <h1 className="profile-hero-title">
                            <span className="text-gradient">Profile</span> & Settings
                        </h1>
                        <p className="profile-hero-desc">
                            View and update your personal information, avatar, and preferences.
                        </p>
                    </div>
                </section>
                {/* Profile Card */}
                <section className="profile-section">
                    <div className="profile-card">
                        {loading && <p>Loading profile…</p>}
                        {error && <p className="profile-error">{error}</p>}
                        {/* Actions */}
                        {data && (
                            <div style={{ alignSelf: 'flex-end', display: 'flex', gap: '10px' }}>
                                {!editMode ? (
                                    <button className="profile-card-btn" onClick={() => {
                                        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                                        const loc = navigator.language || navigator.userLanguage;
                                        setForm((prev) => ({
                                            ...(prev || data || {}),
                                            timezone: (prev?.timezone || (data?.timezone)) || tz,
                                            locale: (prev?.locale || (data?.locale)) || loc,
                                        }));
                                        setEditMode(true);
                                    }}>Edit</button>
                                ) : (
                                    <>
                                        <button className="profile-card-btn" onClick={() => { setEditMode(false); setForm(data); }}>Cancel</button>
                                        <button className="profile-card-btn" onClick={async () => {
                                            try {
                                                setError(null);
                                                if (avatarFile) {
                                                    try {
                                                        const fd = new FormData();
                                                        fd.append('avatar', avatarFile);
                                                        const up = await post('/api/users/me/avatar', fd, { auth: true });
                                                        const newUrl = up?.avatarUrl || up?.avatar_url;
                                                        if (newUrl) {
                                                            setData({ ...(data || {}), avatar_url: newUrl });
                                                            setForm({ ...(form || {}), avatar_url: newUrl });
                                                        }
                                                        setAvatarFile(null);
                                                        setAvatarPreview(null);
                                                    } catch (ae) {
                                                        const status = ae?.status;
                                                        const msg = ae?.message || 'Avatar upload failed';
                                                        const detailsMsg = ae?.details?.message || '';
                                                        let hint = '';
                                                        if (status === 403) {
                                                            hint = 'Forbidden: Ensure you are logged in and have permission to update your avatar.';
                                                        } else if (status === 401) {
                                                            hint = 'Unauthorized: Session expired. Please log in again.';
                                                        } else if (status === 400) {
                                                            hint = 'Bad request: Check file type (JPEG/PNG/WEBP) and size (≤ 5MB).';
                                                        }
                                                        setAvatarError(`${msg}${detailsMsg ? ` (${detailsMsg})` : ''}${hint ? ` — ${hint}` : ''}`);
                                                        return;
                                                    }
                                                }
                                                const payload = {
                                                    first_name: form.first_name,
                                                    last_name: form.last_name,
                                                    country: form.country,
                                                    city: form.city,
                                                    occupation: form.occupation,
                                                    bio: form.bio,
                                                    phone: form.phone,
                                                    timezone: form.timezone,
                                                    locale: form.locale,
                                                    gender: form.gender,
                                                    date_of_birth: form.date_of_birth,
                                                };
                                                const res = await put('/api/users/me', payload, { auth: true });
                                                setData(res?.user || form);
                                                setForm(res?.user || form);
                                                setEditMode(false);
                                            } catch (e) {
                                                setError(e?.message || 'Failed to save profile');
                                            }
                                        }}>Save</button>
                                    </>
                                )}
                            </div>
                        )}
                        <div>
                            <h2 className="profile-hero-title" style={{ fontSize: '1.3rem', marginBottom: 8 }}>General Information</h2>
                            {data && (
                                <div>
                                    {data.avatar_url && (
                                        <img className="profile-avatar" src={avatarPreview || data.avatar_url} alt="User Avatar" />
                                    )}
                                    {!editMode ? (
                                        <ul style={{ margin: 0, marginBottom: 12 }}>
                                            <li><strong>Last name:</strong> {data.last_name}</li>
                                            <li><strong>First name:</strong> {data.first_name}</li>
                                            <li><strong>Email:</strong> {data.email}</li>
                                            <li><strong>Country:</strong> {data.country}</li>
                                            <li><strong>Member Since:</strong> {new Date(data.created_at).toLocaleDateString()}</li>
                                        </ul>
                                    ) : (
                                        <form className="profile-form-group">
                                            <label>
                                                Avatar (JPEG, PNG, WEBP, max 5MB)
                                                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
                                                    setAvatarError(null);
                                                    const file = e.target.files && e.target.files[0];
                                                    if (!file) { setAvatarFile(null); setAvatarPreview(null); return; }
                                                    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
                                                    if (!allowed.includes(file.type)) { setAvatarError('Unsupported file type'); return; }
                                                    if (file.size > 5 * 1024 * 1024) { setAvatarError('File too large (max 5MB)'); return; }
                                                    setAvatarFile(file);
                                                    const url = URL.createObjectURL(file);
                                                    setAvatarPreview(url);
                                                }} />
                                                {avatarError && <span className="profile-error">{avatarError}</span>}
                                            </label>
                                            <label>
                                                First name
                                                <input type="text" value={form?.first_name || ''} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                                            </label>
                                            <label>
                                                Last name
                                                <input type="text" value={form?.last_name || ''} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                                            </label>
                                            <label>
                                                Country
                                                <input type="text" value={form?.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                                            </label>
                                        </form>
                                    )}
                                </div>
                            )}
                            <h2 className="profile-hero-title" style={{ fontSize: '1.3rem', margin: '16px 0 8px 0' }}>Plan Information</h2>
                            {data && (
                                <div>
                                    {!editMode ? (
                                        <ul style={{ margin: 0, marginBottom: 12 }}>
                                            <li><strong>Plan:</strong> {data.plan}</li>
                                        </ul>
                                    ) : (
                                        <p>Plan is managed by the system.</p>
                                    )}
                                </div>
                            )}
                            <h2 className="profile-hero-title" style={{ fontSize: '1.3rem', margin: '16px 0 8px 0' }}>Additional Information</h2>
                            {data && (
                                <div>
                                    {!editMode ? (
                                        <ul style={{ margin: 0, marginBottom: 12 }}>
                                            <li><strong>Gender:</strong> {data.gender || "N/A"}</li>
                                            <li><strong>Date of Birth:</strong> {data.date_of_birth ? new Date(data.date_of_birth).toLocaleDateString() : "N/A"}</li>
                                            <li><strong>City:</strong> {data.city || "N/A"}</li>
                                            <li><strong>Occupation:</strong> {data.occupation || "N/A"}</li>
                                            <li><strong>Bio:</strong> {data.bio || "N/A"}</li>
                                            <li><strong>Phone:</strong> {data.phone || "N/A"}</li>
                                            <li><strong>Timezone:</strong> {data.timezone || "N/A"}</li>
                                            <li><strong>Locale:</strong> {data.locale || "N/A"}</li>
                                        </ul>
                                    ) : (
                                        <form className="profile-form-group">
                                            <label>
                                                Gender
                                                <select value={form?.gender || ''} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                                                    <option value="">Select</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="nonbinary">Nonbinary</option>
                                                    <option value="other">Other</option>
                                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                                </select>
                                            </label>
                                            <label>
                                                Date of Birth
                                                <input type="date" value={(form?.date_of_birth || '').slice(0, 10)} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
                                            </label>
                                            <label>
                                                City
                                                <input type="text" value={form?.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                                            </label>
                                            <label>
                                                Occupation
                                                <input type="text" value={form?.occupation || ''} onChange={(e) => setForm({ ...form, occupation: e.target.value })} />
                                            </label>
                                            <label>
                                                Bio
                                                <textarea value={form?.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                                            </label>
                                            <label>
                                                Phone
                                                <input type="tel" value={form?.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                            </label>
                                            <label>
                                                Timezone
                                                <input type="text" value={form?.timezone || ''} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
                                            </label>
                                            <label>
                                                Locale
                                                <input type="text" value={form?.locale || ''} onChange={(e) => setForm({ ...form, locale: e.target.value })} />
                                            </label>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        );
};

export default Profile;