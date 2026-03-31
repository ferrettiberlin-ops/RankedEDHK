"use client";
import React, { useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const UNIVERSITIES = [
  { id: 'hku', name: 'HKU' },
  { id: 'hkust', name: 'HKUST' },
  { id: 'cuhk', name: 'CUHK' },
  { id: 'hkbu', name: 'HKBU' },
  { id: 'eduhk', name: 'EdUHK' },
  { id: 'lingnan', name: 'Lingnan' },
  { id: 'polyu', name: 'PolyU' },
  { id: 'cityu', name: 'CityU' },
  { id: 'hkmu', name: 'HKMU' },
];

export default function Client() {
  const [user, setUser] = useState<any | null>(null);
  const [activePage, setActivePage] = useState<'home' | 'submit' | 'account'>('home');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [selectedUni, setSelectedUni] = useState<string | null>(null);
  const [programs, setPrograms] = useState<string[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [formState, setFormState] = useState<any>({
    email: '',
    yearOfStudy: '1',
    competitiveness: 'B',
    competitionText: '',
    social: 'B',
    socialText: '',
    career: 'B',
    careerText: '',
    teaching: 'B',
    teachingText: '',
  });

  useEffect(() => {
    let mounted = true;
    (async function init() {
      try {
        const res = await fetch('/api/config');
        const cfg = await res.json();
        if (cfg.url && cfg.anon) {
          const client = createClient(cfg.url, cfg.anon);
          if (!mounted) return;
          setSupabase(client);
          try {
            // best-effort auth info
            // handle redirect session (oauth/magic link)
            if ((client as any).auth?.getSessionFromUrl) {
              try {
                const r = await (client as any).auth.getSessionFromUrl({ storeSession: true });
                if (r?.data?.session?.user) setUser(r.data.session.user);
              } catch (e) {
                // ignore
              }
            }
            // fallback: try getUser
            if ((client as any).auth?.getUser) {
              const u = await (client as any).auth.getUser();
              if (mounted) setUser(u?.data?.user ?? null);
            } else if ((client as any).auth?.getSession) {
              const s = await (client as any).auth.getSession();
              if (mounted) setUser(s?.data?.session?.user ?? null);
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        console.warn('Failed to init supabase config', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (selectedUni) fetchPrograms(selectedUni);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUni]);

  useEffect(() => {
    if (selectedProgram && supabase) loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgram]);

  async function fetchPrograms(uni: string) {
    setFetchError(null);
    try {
      const res = await fetch(`/api/programs?uni=${encodeURIComponent(uni)}`);
      const body = await res.json();
      const names = (body.programs || []) as string[];
      // console.log('fetchPrograms', uni, names?.length);
      if (names.length) {
        setPrograms(names);
        setSelectedProgram(names[0] ?? null);
        return;
      }
    } catch (e: any) {
      console.warn('server api failed', e);
      setFetchError(String(e?.message ?? e));
    }

    // client fallback
    if (supabase) {
      try {
        const { data, error } = await supabase.from('program_list').select('program').eq('university', uni).order('id', { ascending: true });
        if (!error && data) {
          const names = data.map((r: any) => r.program as string);
          setPrograms(names);
          setSelectedProgram(names[0] ?? null);
          return;
        }
        if (error) setFetchError(error.message);
      } catch (e: any) {
        setFetchError(String(e?.message ?? e));
      }
    }

    setPrograms([]);
    setSelectedProgram(null);
  }

  // email verification helpers
  async function requestVerification(email: string) {
    const res = await fetch('/api/auth/request-verification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    return res.json();
  }

  async function confirmVerification(email: string, code: string) {
    const res = await fetch('/api/auth/confirm-verification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code }) });
    return res.json();
  }

  async function loadReviews() {
    if (!supabase || !selectedProgram || !selectedUni) return;
    setLoadingReviews(true);
    try {
      const { data, error } = await supabase.from('reviews').select('*').eq('university', selectedUni).eq('program', selectedProgram).order('created_at', { ascending: false });
      if (!error && data) setReviews(data as any[]);
      else setReviews([]);
    } catch (e) {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }

  function onChangeField(name: string, value: string) {
    setFormState((prev: any) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUni || !selectedProgram) {
      alert('Select university and program');
      return;
    }
    try {
      // moderation
      const texts = [formState.competitionText, formState.socialText, formState.careerText, formState.teachingText];
      const modRes = await fetch('/api/moderate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texts }) });
      if (!modRes.ok) return alert('Moderation failed');
      const mod = await modRes.json();
      if (!mod.approved) return alert('Review flagged as inappropriate');

      if (!supabase) return alert('Missing supabase client');
      const { error } = await supabase.from('reviews').insert({
        email: (formState.email || '').toLowerCase(),
        university: selectedUni,
        program: selectedProgram,
        year_of_study: parseInt(formState.yearOfStudy || '1'),
        competitiveness: formState.competitiveness,
        competition_text: formState.competitionText,
        social: formState.social,
        social_text: formState.socialText,
        career: formState.career,
        career_text: formState.careerText,
        teaching: formState.teaching,
        teaching_text: formState.teachingText,
        created_at: new Date().toISOString(),
      });
      if (error) return alert('Insert failed: ' + error.message);
      alert('Review submitted');
      setFormState({ email: '', yearOfStudy: '1', competitiveness: 'B', competitionText: '', social: 'B', socialText: '', career: 'B', careerText: '', teaching: 'B', teachingText: '' });
      loadReviews();
    } catch (e: any) {
      alert('Error: ' + (e?.message ?? e));
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'inherit' }}>
      {/* Top navigation / header */}
      <div style={{ position: 'fixed', left: 0, right: 0, top: 0, height: 56, background: '#ffffff', borderBottom: '1px solid #e6eefb', display: 'flex', alignItems: 'center', padding: '0 20px', zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontWeight: 700, color: '#1e3a8a' }}>RankedEDHK</div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
            <button onClick={() => setActivePage('home')} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: activePage === 'home' ? '#e6f0ff' : 'transparent', color: '#1d4ed8', cursor: 'pointer' }}>Home</button>
            <button onClick={() => setActivePage('submit')} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: activePage === 'submit' ? '#e6f0ff' : 'transparent', color: '#1d4ed8', cursor: 'pointer' }}>Submit</button>
            <button onClick={() => setActivePage('account')} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: activePage === 'account' ? '#e6f0ff' : 'transparent', color: '#1d4ed8', cursor: 'pointer' }}>Account</button>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ color: '#1e3a8a' }}>{user.email}</div>
          ) : (
            <button onClick={async () => {
              const email = window.prompt('Enter your school email to verify');
              if (!email) return;
              try {
                const resp = await requestVerification(email);
                if (resp.error) return alert('Request failed: ' + resp.error);
                if (resp.dev_code) {
                  // dev mode: show the code and allow confirm immediately
                  const code = resp.dev_code;
                  const ok = window.confirm(`Dev verification code: ${code} — auto-confirm?`);
                  if (ok) {
                    const c = await confirmVerification(email, code);
                    if (c?.ok) {
                      setUser({ email });
                      alert('Email verified');
                    } else alert('Confirm failed: ' + (c?.error || JSON.stringify(c)));
                  }
                } else {
                  alert('Verification sent. Check your email and paste the code when prompted.');
                  const code = window.prompt('Enter the verification code you received');
                  if (!code) return;
                  const c = await confirmVerification(email, code);
                  if (c?.ok) {
                    setUser({ email });
                    alert('Email verified');
                  } else alert('Confirm failed: ' + (c?.error || JSON.stringify(c)));
                }
              } catch (e: any) {
                alert('Verification request failed: ' + (e?.message ?? e));
              }
            }} style={{ background: '#1d4ed8', color: 'white', padding: '6px 10px', borderRadius: 6, border: 'none' }}>Verify email</button>
          )}
        </div>
      </div>

      {/* spacer for fixed header */}
      <div style={{ height: 56 }} />

      {/* LEFT SIDEBAR */}
      <div style={{ width: 260, background: '#ffffff', padding: 20, color: '#1e3a8a', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e6eefb' }}>
        <h2 style={{ color: '#1e3a8a', textAlign: 'center', marginBottom: 12 }}>RankedEDHK</h2>
        {!selectedUni ? (
          <div style={{ overflowY: 'auto', paddingRight: 6, fontSize: 15 }}>
            {UNIVERSITIES.map((u) => (
              <button key={u.id} onClick={() => setSelectedUni(u.id)} style={{ display: 'block', width: '100%', padding: 12, marginBottom: 8, background: selectedUni === u.id ? '#1d4ed8' : '#ffffff', color: selectedUni === u.id ? 'white' : '#1e3a8a', borderRadius: 6, border: '1px solid #e6eefb', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}>{u.name}</button>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <button onClick={() => { setSelectedUni(null); setPrograms([]); setSelectedProgram(null); setReviews([]); }} style={{ marginBottom: 12, background: '#ffffff', color: '#1e3a8a', border: '1px solid #e6eefb', padding: 8, borderRadius: 6, cursor: 'pointer' }}>← Back</button>
            <div style={{ overflowY: 'auto', paddingRight: 6 }}>
              {programs.length === 0 && <div style={{ color: '#999', padding: 8 }}>No programs loaded{fetchError ? ' — ' + fetchError : ''}.</div>}
              {programs.map((p) => (
                <button key={p} onClick={() => setSelectedProgram(p)} style={{ display: 'block', width: '100%', padding: 10, marginBottom: 8, background: selectedProgram === p ? '#1d4ed8' : '#ffffff', color: selectedProgram === p ? 'white' : '#1e3a8a', borderRadius: 6, border: '1px solid #e6eefb', textAlign: 'left', cursor: 'pointer' }}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #eee', background: '#fafafa' }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>{selectedUni ? (selectedProgram ? selectedProgram : 'Select a program') : 'Select a university'}</h3>
        </div>

        {activePage === 'account' ? (
          <div style={{ padding: 24 }}>
            <h3>Account</h3>
            {user ? (
              <div style={{ marginTop: 12 }}>
                <div><strong>Email:</strong> {user.email}</div>
                <div style={{ marginTop: 8 }}>
                  <button onClick={async () => {
                    if (supabase && (supabase as any).auth && typeof (supabase as any).auth.signOut === 'function') {
                      await (supabase as any).auth.signOut();
                      setUser(null);
                      alert('Signed out');
                    } else alert('Sign-out not available');
                  }} style={{ background: '#1d4ed8', color: 'white', padding: '8px 12px', borderRadius: 6, border: 'none', marginTop: 8 }}>Sign out</button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>Not signed in.</div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 20, padding: 20, flex: 1 }}>
            <div style={{ flex: 1, background: 'white', padding: 20, borderRadius: 8, border: '1px solid #e5e5e5', overflowY: 'auto' }}>
              {!selectedProgram && <div style={{ color: '#666' }}>Choose a program from the left to view reviews.</div>}
              {selectedProgram && (
                <>
                  <h4 style={{ color: '#1d4ed8', fontSize: 20 }}>{selectedProgram}</h4>
                  {loadingReviews && <div>Loading...</div>}
                  {!loadingReviews && reviews.length === 0 && <div>No reviews yet.</div>}
                  {reviews.map((r) => (
                    <div key={r.id} style={{ padding: 12, marginBottom: 12, background: '#f0f7ff', borderLeft: '4px solid #1d4ed8' }}>
                      <div><strong>Year {r.year_of_study}</strong></div>
                      <div style={{ marginTop: 6 }}>{r.competition_text}</div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div style={{ width: 360, background: 'white', padding: 20, borderRadius: 8, border: '1px solid #e5e5e5' }}>
              <h3>Submit Review</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 10 }}>
                  <label>Year</label>
                  <select value={formState.yearOfStudy} onChange={(e) => onChangeField('yearOfStudy', e.target.value)} style={{ width: '100%', padding: 8 }}>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="5">Year 5+</option>
                  </select>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label>Competitiveness</label>
                  <select value={formState.competitiveness} onChange={(e) => onChangeField('competitiveness', e.target.value)} style={{ width: '100%', padding: 8 }}>
                    <option>A</option><option>B</option><option>C</option><option>D</option><option>F</option>
                  </select>
                  <textarea value={formState.competitionText} onChange={(e) => onChangeField('competitionText', e.target.value)} style={{ width: '100%', padding: 8, minHeight: 70 }} />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label>Social</label>
                  <select value={formState.social} onChange={(e) => onChangeField('social', e.target.value)} style={{ width: '100%', padding: 8 }}>
                    <option>A</option><option>B</option><option>C</option><option>D</option><option>F</option>
                  </select>
                  <textarea value={formState.socialText} onChange={(e) => onChangeField('socialText', e.target.value)} style={{ width: '100%', padding: 8, minHeight: 70 }} />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label>Career</label>
                  <select value={formState.career} onChange={(e) => onChangeField('career', e.target.value)} style={{ width: '100%', padding: 8 }}>
                    <option>A</option><option>B</option><option>C</option><option>D</option><option>F</option>
                  </select>
                  <textarea value={formState.careerText} onChange={(e) => onChangeField('careerText', e.target.value)} style={{ width: '100%', padding: 8, minHeight: 70 }} />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label>Teaching</label>
                  <select value={formState.teaching} onChange={(e) => onChangeField('teaching', e.target.value)} style={{ width: '100%', padding: 8 }}>
                    <option>A</option><option>B</option><option>C</option><option>D</option><option>F</option>
                  </select>
                  <textarea value={formState.teachingText} onChange={(e) => onChangeField('teachingText', e.target.value)} style={{ width: '100%', padding: 8, minHeight: 70 }} />
                </div>

                <div>
                  <button type="submit" style={{ background: '#1d4ed8', color: 'white', padding: '10px 16px', border: 'none', borderRadius: 6 }}>Submit Review</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
