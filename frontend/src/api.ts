export type Profile = {
  id: number
  full_name: string
  headline: string
  location?: string | null
  phone?: string | null
  email?: string | null
  linkedin_url?: string | null
  summary?: string | null
  hero_image?: string | null
}

export type Experience = {
  id: number
  title: string
  company: string
  location?: string | null
  start?: string | null
  end?: string | null
  bullets: string[]
  sort_order: number
}

export type SkillGroup = {
  id: number
  category: string
  items: string[]
  sort_order: number
}

export type Achievement = {
  id: number
  text: string
  sort_order: number
}

export type MediaItem = {
  id: number
  title?: string | null
  description?: string | null
  filename: string
  url: string
  created_at?: string | null
}

export type PublicPayload = {
  ok: true
  settings: { primary_color: string; secondary_color: string; updated_at?: string | null }
  profile: Profile | null
  experiences: Experience[]
  skills: SkillGroup[]
  achievements: Achievement[]
  media: MediaItem[]
}

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = data?.error ?? `Request failed: ${res.status}`
    throw new Error(msg)
  }
  return data as T
}

async function form<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    ...init,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = data?.error ?? `Request failed: ${res.status}`
    throw new Error(msg)
  }
  return data as T
}

export const api = {
  public: () => json<PublicPayload>('/api/public'),
  me: () => json<{ ok: true; user: { id: number; email: string } | null }>('/api/auth/me'),
  login: (email: string, password: string) =>
    json<{ ok: true; user: { id: number; email: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => json<{ ok: true }>('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) }),

  adminProfile: () => json<{ ok: true; profile: Profile | null }>('/api/admin/profile'),
  adminProfileUpdate: (profile: Partial<Profile>) =>
    json<{ ok: true; profile: Profile }>('/api/admin/profile', { method: 'PUT', body: JSON.stringify(profile) }),

  adminExperience: () => json<{ ok: true; items: Experience[] }>('/api/admin/experience'),
  adminExperienceCreate: (item: Partial<Experience>) =>
    json<{ ok: true; item: Experience }>('/api/admin/experience', { method: 'POST', body: JSON.stringify(item) }),
  adminExperienceUpdate: (id: number, item: Partial<Experience>) =>
    json<{ ok: true; item: Experience }>(`/api/admin/experience/${id}`, { method: 'PUT', body: JSON.stringify(item) }),
  adminExperienceDelete: (id: number) => json<{ ok: true }>(`/api/admin/experience/${id}`, { method: 'DELETE' }),

  adminSkills: () => json<{ ok: true; items: SkillGroup[] }>('/api/admin/skills'),
  adminSkillCreate: (item: Partial<SkillGroup>) =>
    json<{ ok: true; item: SkillGroup }>('/api/admin/skills', { method: 'POST', body: JSON.stringify(item) }),
  adminSkillUpdate: (id: number, item: Partial<SkillGroup>) =>
    json<{ ok: true; item: SkillGroup }>(`/api/admin/skills/${id}`, { method: 'PUT', body: JSON.stringify(item) }),
  adminSkillDelete: (id: number) => json<{ ok: true }>(`/api/admin/skills/${id}`, { method: 'DELETE' }),

  adminAchievements: () => json<{ ok: true; items: Achievement[] }>('/api/admin/achievements'),
  adminAchievementCreate: (item: Partial<Achievement>) =>
    json<{ ok: true; item: Achievement }>('/api/admin/achievements', { method: 'POST', body: JSON.stringify(item) }),
  adminAchievementUpdate: (id: number, item: Partial<Achievement>) =>
    json<{ ok: true; item: Achievement }>(`/api/admin/achievements/${id}`, { method: 'PUT', body: JSON.stringify(item) }),
  adminAchievementDelete: (id: number) => json<{ ok: true }>(`/api/admin/achievements/${id}`, { method: 'DELETE' }),

  adminMedia: () => json<{ ok: true; items: MediaItem[] }>('/api/admin/media'),
  adminMediaUpload: (payload: { title?: string; description?: string; file: File }) => {
    const fd = new FormData()
    fd.set('file', payload.file)
    if (payload.title) fd.set('title', payload.title)
    if (payload.description) fd.set('description', payload.description)
    return form<{ ok: true; item: MediaItem }>('/api/admin/media', { method: 'POST', body: fd })
  },
  adminMediaDelete: (id: number) => json<{ ok: true }>(`/api/admin/media/${id}`, { method: 'DELETE' }),

  adminSettings: () =>
    json<{ ok: true; settings: { primary_color: string; secondary_color: string; updated_at?: string | null } }>('/api/admin/settings'),
  adminSettingsUpdate: (settings: { primary_color?: string; secondary_color?: string }) =>
    json<{ ok: true; settings: { primary_color: string; secondary_color: string; updated_at?: string | null } }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
}

