import { supabase } from '@/lib/supabase'

export interface TutorProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  bio?: string
  avatar_url?: string
  hourly_rate: number
  subjects: string[]
  availability: AvailabilitySlot[]
  preferences: TutorPreferences
  location?: {
    city?: string
    state?: string
    country?: string
    timezone?: string
  }
  education?: EducationItem[]
  certifications?: CertificationItem[]
  languages?: string[]
  teaching_since?: string
}

export interface AvailabilitySlot {
  id?: string
  day_of_week: number // 0-6, where 0 is Sunday
  start_time: string // HH:MM format
  end_time: string // HH:MM format
  is_recurring: boolean
}

export interface TutorPreferences {
  notification_email: boolean
  notification_sms: boolean
  notification_push: boolean
  session_reminder_minutes: number
  auto_accept_rebooking: boolean
  preferred_session_length: number // in minutes
  min_advance_booking_hours: number
  max_advance_booking_days: number
  cancellation_policy_hours: number
}

export interface EducationItem {
  id?: string
  institution: string
  degree: string
  field_of_study: string
  start_year: number
  end_year?: number
  is_current: boolean
}

export interface CertificationItem {
  id?: string
  name: string
  issuer: string
  issue_date: string
  expiry_date?: string
  credential_id?: string
  credential_url?: string
}

export async function getTutorProfile(tutorId: string): Promise<TutorProfile | null> {
  try {
    const { data: tutor, error } = await supabase
      .from('tutors')
      .select(`
        *,
        availability:tutor_availability (*),
        preferences:tutor_preferences (*),
        education:tutor_education (*),
        certifications:tutor_certifications (*)
      `)
      .eq('id', tutorId)
      .single()

    if (error) throw error
    if (!tutor) return null

    // Format the response
    return {
      id: tutor.id,
      first_name: tutor.first_name,
      last_name: tutor.last_name,
      email: tutor.email,
      phone: tutor.phone,
      bio: tutor.bio,
      avatar_url: tutor.avatar_url,
      hourly_rate: tutor.hourly_rate,
      subjects: tutor.subjects || [],
      availability: tutor.availability || [],
      preferences: tutor.preferences?.[0] || getDefaultPreferences(),
      location: {
        city: tutor.city,
        state: tutor.state,
        country: tutor.country,
        timezone: tutor.timezone
      },
      education: tutor.education || [],
      certifications: tutor.certifications || [],
      languages: tutor.languages || [],
      teaching_since: tutor.teaching_since
    }
  } catch (error) {
    console.error('Error fetching tutor profile:', error)
    return null
  }
}

export async function updateTutorProfile(
  tutorId: string,
  updates: Partial<TutorProfile>
): Promise<boolean> {
  try {
    // Update main tutor record
    const { error: tutorError } = await supabase
      .from('tutors')
      .update({
        first_name: updates.first_name,
        last_name: updates.last_name,
        phone: updates.phone,
        bio: updates.bio,
        avatar_url: updates.avatar_url,
        hourly_rate: updates.hourly_rate,
        subjects: updates.subjects,
        city: updates.location?.city,
        state: updates.location?.state,
        country: updates.location?.country,
        timezone: updates.location?.timezone,
        languages: updates.languages,
        teaching_since: updates.teaching_since
      })
      .eq('id', tutorId)

    if (tutorError) throw tutorError

    return true
  } catch (error) {
    console.error('Error updating tutor profile:', error)
    return false
  }
}

export async function updateAvailability(
  tutorId: string,
  availability: AvailabilitySlot[]
): Promise<boolean> {
  try {
    // Delete existing availability
    await supabase
      .from('tutor_availability')
      .delete()
      .eq('tutor_id', tutorId)

    // Insert new availability
    if (availability.length > 0) {
      const { error } = await supabase
        .from('tutor_availability')
        .insert(
          availability.map(slot => ({
            tutor_id: tutorId,
            day_of_week: slot.day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_recurring: slot.is_recurring
          }))
        )

      if (error) throw error
    }

    return true
  } catch (error) {
    console.error('Error updating availability:', error)
    return false
  }
}

export async function updatePreferences(
  tutorId: string,
  preferences: TutorPreferences
): Promise<boolean> {
  try {
    // Check if preferences exist
    const { data: existing } = await supabase
      .from('tutor_preferences')
      .select('id')
      .eq('tutor_id', tutorId)
      .single()

    if (existing) {
      // Update existing preferences
      const { error } = await supabase
        .from('tutor_preferences')
        .update(preferences)
        .eq('tutor_id', tutorId)

      if (error) throw error
    } else {
      // Insert new preferences
      const { error } = await supabase
        .from('tutor_preferences')
        .insert({
          tutor_id: tutorId,
          ...preferences
        })

      if (error) throw error
    }

    return true
  } catch (error) {
    console.error('Error updating preferences:', error)
    return false
  }
}

export async function updateEducation(
  tutorId: string,
  education: EducationItem[]
): Promise<boolean> {
  try {
    // Delete existing education
    await supabase
      .from('tutor_education')
      .delete()
      .eq('tutor_id', tutorId)

    // Insert new education
    if (education.length > 0) {
      const { error } = await supabase
        .from('tutor_education')
        .insert(
          education.map(item => ({
            tutor_id: tutorId,
            ...item
          }))
        )

      if (error) throw error
    }

    return true
  } catch (error) {
    console.error('Error updating education:', error)
    return false
  }
}

export async function updateCertifications(
  tutorId: string,
  certifications: CertificationItem[]
): Promise<boolean> {
  try {
    // Delete existing certifications
    await supabase
      .from('tutor_certifications')
      .delete()
      .eq('tutor_id', tutorId)

    // Insert new certifications
    if (certifications.length > 0) {
      const { error } = await supabase
        .from('tutor_certifications')
        .insert(
          certifications.map(item => ({
            tutor_id: tutorId,
            ...item
          }))
        )

      if (error) throw error
    }

    return true
  } catch (error) {
    console.error('Error updating certifications:', error)
    return false
  }
}

export async function uploadAvatar(
  tutorId: string,
  file: File
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${tutorId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('tutor-profiles')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('tutor-profiles')
      .getPublicUrl(filePath)

    // Update tutor profile with new avatar URL
    const { error: updateError } = await supabase
      .from('tutors')
      .update({ avatar_url: publicUrl })
      .eq('id', tutorId)

    if (updateError) throw updateError

    return publicUrl
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return null
  }
}

function getDefaultPreferences(): TutorPreferences {
  return {
    notification_email: true,
    notification_sms: false,
    notification_push: true,
    session_reminder_minutes: 15,
    auto_accept_rebooking: true,
    preferred_session_length: 60,
    min_advance_booking_hours: 24,
    max_advance_booking_days: 30,
    cancellation_policy_hours: 24
  }
} 