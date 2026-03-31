
// Supabase client will be initialized at runtime via `/api/config`.
let supabase = null;

let selectedUni = null;
let selectedProgram = null;

// UNIVERSITIES (match codes in data/programs_seed.json)
const universities = [
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

// PROGRAMS (mock data)
const programs = {
    hku: ['Computer Science', 'Business', 'Medicine', 'Law', 'Engineering'],
    hkust: ['Computer Science', 'Business', 'Engineering', 'Physics', 'Chemistry'],
    cuhk: ['Computer Science', 'Business', 'Medicine', 'Philosophy', 'Fine Arts'],
    polyu: ['Engineering', 'Business', 'Design', 'Building & Real Estate', 'Accountancy'],
    cityu: ['Business', 'Engineering', 'Science', 'Design', 'Creative Media'],
    lingnan: ['Business', 'Social Sciences', 'Humanities', 'Philosophy'],
    ouhk: ['Business', 'Science & Technology', 'Humanities', 'Law'],
};

// Initialize UI
function initializeUI() {
    renderUniversities();
    document.getElementById('reviewForm').addEventListener('submit', handleFormSubmit);
}

function renderUniversities() {
    const container = document.getElementById('uniButtons');
    container.innerHTML = '';
    universities.forEach((uni) => {
        const btn = document.createElement('button');
        btn.className = 'uni-button';
        btn.textContent = uni.name;
        btn.addEventListener('click', (evt) => selectUni(uni.id, uni.name, evt));
        container.appendChild(btn);
    });
}

async function selectUni(id, name, evt) {
    selectedUni = id;
    selectedProgram = null;
    document.querySelectorAll('.uni-button').forEach(btn => btn.classList.remove('active'));
    evt.currentTarget.classList.add('active');

    // Fetch programs for the selected university from Supabase; fallback to local mock
    await fetchProgramsForUni(id);

    // Auto-click first program if available
    setTimeout(() => {
        document.getElementById('programButtons').querySelectorAll('.program-button')[0]?.click();
    }, 0);
}

function renderPrograms(progList) {
    const container = document.getElementById('programButtons');
    const progs = progList || programs[selectedUni] || [];
    container.innerHTML = '';
    progs.forEach((prog) => {
        const b = document.createElement('button');
        b.className = 'program-button';
        b.textContent = prog;
        b.addEventListener('click', (evt) => selectProgram(prog, evt));
        container.appendChild(b);
    });
}

async function fetchProgramsForUni(uniId) {
    try {
        const res = await fetch(`/api/programs?uni=${encodeURIComponent(uniId)}`);
        if (!res.ok) throw new Error('Programs fetch failed');
        const body = await res.json();
        const names = body.programs || [];
        if (!names || names.length === 0) {
            // Try client-side Supabase fallback if server API returned empty
            const { data: clientData, error: clientErr } = await supabase.from('program_list').select('program').eq('university', uniId).order('id', { ascending: true });
            if (!clientErr && clientData && clientData.length) {
                renderPrograms(clientData.map(r => r.program));
                return;
            }
            renderPrograms();
            return;
        }
        renderPrograms(names);
    } catch (err) {
        console.warn('Failed to fetch programs from server API, trying client Supabase fallback.', err?.message || err);
        try {
            const { data: clientData, error: clientErr } = await supabase.from('program_list').select('program').eq('university', uniId).order('id', { ascending: true });
            if (!clientErr && clientData && clientData.length) {
                renderPrograms(clientData.map(r => r.program));
                return;
            }
        } catch (e) {
            console.warn('Client Supabase fallback failed', e?.message || e);
        }
        renderPrograms();
    }
}

function selectProgram(name, evt) {
    selectedProgram = name;
    document.querySelectorAll('.program-button').forEach(b => b.classList.remove('active'));
    evt.target.classList.add('active');
    document.getElementById('selectedProgramName').textContent = name;
    loadReviews();
}

async function loadReviews() {
    if (!selectedUni || !selectedProgram) return;
    
    const container = document.getElementById('reviewsList');
    container.innerHTML = '<div class="loading">Loading reviews...</div>';

    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('university', selectedUni)
            .eq('program', selectedProgram)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = '<div class="empty-state">No reviews yet. Be the first to review!</div>';
            return;
        }

        container.innerHTML = data.map(review => `
            <div class="review-item">
                <h4>Year ${review.year_of_study}</h4>
                <div>
                    <span class="grade">Competitiveness: ${review.competitiveness}</span>
                    <span class="grade">Social: ${review.social}</span>
                </div>
                <div style="margin-top: 8px;">
                    <span class="grade">Career: ${review.career}</span>
                    <span class="grade">Teaching: ${review.teaching}</span>
                </div>
                <div class="review-text"><strong>Competitiveness:</strong> ${review.competition_text}</div>
                <div class="review-text"><strong>Social:</strong> ${review.social_text}</div>
                <div class="review-text"><strong>Career:</strong> ${review.career_text}</div>
                <div class="review-text"><strong>Teaching:</strong> ${review.teaching_text}</div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<div class="empty-state">Error loading reviews: ${error.message}</div>`;
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    if (!selectedUni || !selectedProgram) {
        showMessage('Please select a university and program', 'error');
        return;
    }

    const email = document.querySelector('input[name="email"]').value.toLowerCase();
    const btn = document.querySelector('.submit-btn');
    btn.disabled = true;

    try {
        // Check if email already submitted a review
        const { data: existingReview, error: checkError } = await supabase
            .from('reviews')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        if (existingReview) {
            showMessage('You have already submitted a review. One review per email address.', 'error');
            btn.disabled = false;
            return;
        }

        const formData = {
            yearOfStudy: document.querySelector('select[name="yearOfStudy"]').value,
            competitiveness: document.querySelector('select[name="competitiveness"]').value,
            competitionText: document.querySelector('textarea[name="competitionText"]').value,
            social: document.querySelector('select[name="social"]').value,
            socialText: document.querySelector('textarea[name="socialText"]').value,
            career: document.querySelector('select[name="career"]').value,
            careerText: document.querySelector('textarea[name="careerText"]').value,
            teaching: document.querySelector('select[name="teaching"]').value,
            teachingText: document.querySelector('textarea[name="teachingText"]').value,
        };

        // Call moderation API
        const response = await fetch('/api/moderate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                texts: [
                    formData.competitionText,
                    formData.socialText,
                    formData.careerText,
                    formData.teachingText
                ]
            })
        });

        if (!response.ok) {
            const modError = await response.json();
            throw new Error(modError.message || 'Content moderation failed');
        }

        const modResult = await response.json();
        if (!modResult.approved) {
            showMessage('Your review was flagged as inappropriate. Please revise and try again.', 'error');
            btn.disabled = false;
            return;
        }

        // Save to Supabase
        const { error: insertError } = await supabase.from('reviews').insert({
            email: email,
            university: selectedUni,
            program: selectedProgram,
            year_of_study: parseInt(formData.yearOfStudy),
            competitiveness: formData.competitiveness,
            competition_text: formData.competitionText,
            social: formData.social,
            social_text: formData.socialText,
            career: formData.career,
            career_text: formData.careerText,
            teaching: formData.teaching,
            teaching_text: formData.teachingText,
            created_at: new Date().toISOString(),
        });

        if (insertError) throw insertError;

        showMessage('Review submitted successfully!', 'success');
        document.getElementById('reviewForm').reset();
        loadReviews();
    } catch (error) {
        showMessage(`Error: ${error.message}`, 'error');
    } finally {
        btn.disabled = false;
    }
}

function showMessage(text, type) {
    const container = document.getElementById('formMessage');
    container.innerHTML = `<div class="message ${type}">${text}</div>`;
    setTimeout(() => {
        container.innerHTML = '';
    }, 4000);
}

// Start: fetch config then initialize Supabase client and UI
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/config');
        if (res.ok) {
            const cfg = await res.json();
            if (cfg.url && cfg.anon) {
                supabase = window.supabase.createClient(cfg.url, cfg.anon);
            } else {
                console.warn('Supabase config missing from /api/config; some features may be disabled.');
            }
        } else {
            console.warn('Failed to load /api/config:', res.status);
        }
    } catch (e) {
        console.warn('Error fetching /api/config', e?.message || e);
    }
    initializeUI();
});


