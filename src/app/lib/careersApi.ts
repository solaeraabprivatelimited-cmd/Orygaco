import { supabase } from '@/lib/supabase';
import type {
  CareerProfile,
  CareerOrganization,
  CareerJob,
  CareerApplication,
  CareerVerification,
  JobFilters,
} from '../types/careers';

// ─── Jobs ──────────────────────────────────────────────────────────────────

export async function fetchJobs(filters: JobFilters, page = 0, pageSize = 20) {
  let query = supabase
    .from('career_jobs')
    .select('*, organization:career_organizations(*)', { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,role.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }
  if (filters.job_type) query = query.eq('job_type', filters.job_type);
  if (filters.location) query = query.ilike('location', `%${filters.location}%`);
  if (filters.experience !== null) query = query.lte('experience_required', filters.experience);

  const { data, error, count } = await query;
  if (error) throw error;
  return { jobs: (data ?? []) as CareerJob[], total: count ?? 0 };
}

export async function fetchJobById(id: string) {
  const { data, error } = await supabase
    .from('career_jobs')
    .select('*, organization:career_organizations(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as CareerJob;
}

export async function createJob(
  payload: Omit<CareerJob, 'id' | 'created_at' | 'organization'>
) {
  const { data, error } = await supabase
    .from('career_jobs')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as CareerJob;
}

export async function updateJob(id: string, payload: Partial<CareerJob>) {
  const { data, error } = await supabase
    .from('career_jobs')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as CareerJob;
}

export async function toggleJobStatus(id: string, status: 'active' | 'closed') {
  return updateJob(id, { status });
}

export async function fetchOrgJobs(orgId: string) {
  const { data, error } = await supabase
    .from('career_jobs')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CareerJob[];
}

// ─── Applications ──────────────────────────────────────────────────────────

export async function applyToJob(
  jobId: string,
  applicantId: string,
  coverNote: string
) {
  // Guard against duplicate applications (unique constraint on job_id+applicant_id)
  const existing = await checkExistingApplication(jobId, applicantId);
  if (existing) {
    throw new Error('You have already applied to this job.');
  }

  const { data, error } = await supabase
    .from('career_applications')
    .insert({
      job_id: jobId,
      applicant_id: applicantId,
      cover_note: coverNote,
      status: 'applied',
    })
    .select()
    .single();
  if (error) throw error;
  return data as CareerApplication;
}

export async function fetchMyApplications(applicantId: string) {
  const { data, error } = await supabase
    .from('career_applications')
    .select('*, job:career_jobs(*, organization:career_organizations(*))')
    .eq('applicant_id', applicantId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CareerApplication[];
}

export async function fetchJobApplications(jobId: string) {
  const { data, error } = await supabase
    .from('career_applications')
    .select('*, applicant:career_profiles(*)')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CareerApplication[];
}

export async function updateApplicationStatus(
  id: string,
  status: CareerApplication['status']
) {
  const { data, error } = await supabase
    .from('career_applications')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as CareerApplication;
}

export async function checkExistingApplication(jobId: string, applicantId: string) {
  const { data } = await supabase
    .from('career_applications')
    .select('id, status')
    .eq('job_id', jobId)
    .eq('applicant_id', applicantId)
    .maybeSingle();
  return data as { id: string; status: string } | null;
}

// ─── Career Profiles ──────────────────────────────────────────────────────

export async function fetchMyProfile(userId: string) {
  const { data } = await supabase
    .from('career_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return data as CareerProfile | null;
}

export async function upsertProfile(userId: string, payload: Partial<CareerProfile>) {
  const { data, error } = await supabase
    .from('career_profiles')
    .upsert(
      { ...payload, id: userId, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data as CareerProfile;
}

// ─── Organizations ────────────────────────────────────────────────────────

export async function fetchMyOrg(userId: string) {
  const { data } = await supabase
    .from('career_organizations')
    .select('*')
    .eq('created_by', userId)
    .maybeSingle();
  return data as CareerOrganization | null;
}

export async function upsertOrg(
  userId: string,
  payload: Omit<Partial<CareerOrganization>, 'created_by'>
) {
  const existing = await fetchMyOrg(userId);
  if (existing) {
    const { data, error } = await supabase
      .from('career_organizations')
      .update(payload)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as CareerOrganization;
  }
  const { data, error } = await supabase
    .from('career_organizations')
    .insert({ ...payload, created_by: userId })
    .select()
    .single();
  if (error) throw error;
  return data as CareerOrganization;
}

// ─── Verifications ────────────────────────────────────────────────────────

export async function fetchMyVerifications(userId: string) {
  const { data, error } = await supabase
    .from('career_verifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CareerVerification[];
}

export async function submitVerification(
  userId: string,
  type: CareerVerification['type'],
  documentUrl: string
) {
  const { data, error } = await supabase
    .from('career_verifications')
    .insert({
      user_id: userId,
      type,
      document_url: documentUrl,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return data as CareerVerification;
}

export async function uploadVerificationDoc(
  userId: string,
  file: File,
  type: string
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${type}_${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('career-verifications')
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('career-verifications').getPublicUrl(path);
  return data.publicUrl;
}
