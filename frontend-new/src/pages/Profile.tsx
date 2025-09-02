import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { FiUser, FiAlertCircle, FiShield, FiHeart, FiSave, FiPlus, FiX, FiCamera, FiUpload } from 'react-icons/fi'
import './Profile.css'

// Common health conditions
const COMMON_CONDITIONS = [
  "Crohn's Disease",
  "Ulcerative Colitis",
  "IBS (Irritable Bowel Syndrome)",
  "Celiac Disease",
  "GERD (Acid Reflux)",
  "Diabetes Type 1",
  "Diabetes Type 2",
  "Hypertension",
  "High Cholesterol",
  "FND (Functional Neurological Disorder)",
  "Epilepsy",
  "Migraine",
  "Arthritis",
  "Fibromyalgia",
  "PCOS",
  "Thyroid Disorders",
  "Kidney Disease",
  "Heart Disease",
  "Food Intolerances",
  "Other"
]

// Common allergens
const COMMON_ALLERGENS = [
  "Milk/Dairy",
  "Eggs",
  "Peanuts",
  "Tree Nuts",
  "Fish",
  "Shellfish",
  "Wheat/Gluten",
  "Soy",
  "Sesame",
  "Corn",
  "Sulfites",
  "Nightshades",
  "Citrus",
  "Strawberries",
  "Kiwi",
  "Banana",
  "Avocado",
  "Chocolate",
  "Cinnamon",
  "Garlic",
  "Onions"
]

// Dietary preferences
const DIETARY_PREFERENCES = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Paleo",
  "Keto",
  "Low FODMAP",
  "Mediterranean",
  "DASH",
  "Gluten-Free",
  "Dairy-Free",
  "Low Sodium",
  "Low Sugar",
  "Low Fat",
  "High Protein",
  "Halal",
  "Kosher",
  "No Pork",
  "No Beef"
]

function Profile() {
  const user = useAuthStore((state) => state.user)
  const [isEditing, setIsEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Profile data
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    profileImage: null as string | null,
    
    // Health information
    healthConditions: [] as string[],
    customConditions: '',
    allergies: [] as string[],
    customAllergies: '',
    medications: '',
    
    // Dietary preferences
    dietaryPreferences: [] as string[],
    avoidFoods: '',
    notes: '',
    
    // Emergency contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  })

  // Load saved profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userHealthProfile')
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile))
    }
  }, [])

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('userHealthProfile', JSON.stringify(profileData))
    setIsEditing(false)
    setHasUnsavedChanges(false)
    
    // Show success message
    alert('Profile saved successfully!')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileData({ ...profileData, profileImage: reader.result as string })
        setHasUnsavedChanges(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleCondition = (condition: string) => {
    const updated = profileData.healthConditions.includes(condition)
      ? profileData.healthConditions.filter(c => c !== condition)
      : [...profileData.healthConditions, condition]
    setProfileData({ ...profileData, healthConditions: updated })
    setHasUnsavedChanges(true)
  }

  const toggleAllergy = (allergy: string) => {
    const updated = profileData.allergies.includes(allergy)
      ? profileData.allergies.filter(a => a !== allergy)
      : [...profileData.allergies, allergy]
    setProfileData({ ...profileData, allergies: updated })
    setHasUnsavedChanges(true)
  }

  const togglePreference = (pref: string) => {
    const updated = profileData.dietaryPreferences.includes(pref)
      ? profileData.dietaryPreferences.filter(p => p !== pref)
      : [...profileData.dietaryPreferences, pref]
    setProfileData({ ...profileData, dietaryPreferences: updated })
    setHasUnsavedChanges(true)
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Health Profile</h1>
        <div className="profile-actions">
          {!isEditing ? (
            <button className="btn-edit" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          ) : (
            <>
              <button className="btn-cancel" onClick={() => {
                setIsEditing(false)
                setHasUnsavedChanges(false)
              }}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSave}>
                <FiSave /> Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="unsaved-warning">
          <FiAlertCircle /> You have unsaved changes
        </div>
      )}

      <div className="profile-content">
        {/* Basic Information */}
        <section className="profile-section">
          <h2><FiUser /> Basic Information</h2>
          
          <div className="profile-image-section">
            <div className="profile-image">
              {profileData.profileImage ? (
                <img src={profileData.profileImage} alt="Profile" />
              ) : (
                <div className="profile-image-placeholder">
                  <FiUser />
                </div>
              )}
            </div>
            {isEditing && (
              <div className="image-upload-buttons">
                <label htmlFor="image-upload" className="btn-upload">
                  <FiUpload /> Upload Photo
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <button className="btn-camera">
                  <FiCamera /> Take Photo
                </button>
              </div>
            )}
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>First Name</label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => {
                  setProfileData({ ...profileData, firstName: e.target.value })
                  setHasUnsavedChanges(true)
                }}
                disabled={!isEditing}
              />
            </div>
            <div className="form-field">
              <label>Last Name</label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => {
                  setProfileData({ ...profileData, lastName: e.target.value })
                  setHasUnsavedChanges(true)
                }}
                disabled={!isEditing}
              />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                value={profileData.email}
                disabled
              />
            </div>
            <div className="form-field">
              <label>Phone</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => {
                  setProfileData({ ...profileData, phone: e.target.value })
                  setHasUnsavedChanges(true)
                }}
                disabled={!isEditing}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="form-field">
              <label>Date of Birth</label>
              <input
                type="date"
                value={profileData.dateOfBirth}
                onChange={(e) => {
                  setProfileData({ ...profileData, dateOfBirth: e.target.value })
                  setHasUnsavedChanges(true)
                }}
                disabled={!isEditing}
              />
            </div>
          </div>
        </section>

        {/* Health Conditions */}
        <section className="profile-section">
          <h2><FiHeart /> Health Conditions</h2>
          <p className="section-description">
            Select all conditions that apply. This helps us suggest appropriate recipes and meal plans.
          </p>
          
          <div className="checkbox-grid">
            {COMMON_CONDITIONS.map(condition => (
              <label key={condition} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={profileData.healthConditions.includes(condition)}
                  onChange={() => toggleCondition(condition)}
                  disabled={!isEditing}
                />
                <span>{condition}</span>
              </label>
            ))}
          </div>
          
          <div className="form-field">
            <label>Other Conditions (comma-separated)</label>
            <textarea
              value={profileData.customConditions}
              onChange={(e) => {
                setProfileData({ ...profileData, customConditions: e.target.value })
                setHasUnsavedChanges(true)
              }}
              disabled={!isEditing}
              placeholder="Enter any other conditions not listed above"
              rows={2}
            />
          </div>

          <div className="form-field">
            <label>Current Medications</label>
            <textarea
              value={profileData.medications}
              onChange={(e) => {
                setProfileData({ ...profileData, medications: e.target.value })
                setHasUnsavedChanges(true)
              }}
              disabled={!isEditing}
              placeholder="List your current medications (this can affect dietary recommendations)"
              rows={3}
            />
          </div>
        </section>

        {/* Allergies & Intolerances */}
        <section className="profile-section">
          <h2><FiAlertCircle /> Allergies & Intolerances</h2>
          <p className="section-description">
            Select all foods you're allergic to or intolerant of. These will be automatically excluded from recommendations.
          </p>
          
          <div className="checkbox-grid">
            {COMMON_ALLERGENS.map(allergen => (
              <label key={allergen} className="checkbox-item allergen">
                <input
                  type="checkbox"
                  checked={profileData.allergies.includes(allergen)}
                  onChange={() => toggleAllergy(allergen)}
                  disabled={!isEditing}
                />
                <span>{allergen}</span>
              </label>
            ))}
          </div>
          
          <div className="form-field">
            <label>Other Allergies (comma-separated)</label>
            <textarea
              value={profileData.customAllergies}
              onChange={(e) => {
                setProfileData({ ...profileData, customAllergies: e.target.value })
                setHasUnsavedChanges(true)
              }}
              disabled={!isEditing}
              placeholder="Enter any other allergies not listed above"
              rows={2}
            />
          </div>
        </section>

        {/* Dietary Preferences */}
        <section className="profile-section">
          <h2><FiShield /> Dietary Preferences</h2>
          <p className="section-description">
            Select your dietary preferences and restrictions.
          </p>
          
          <div className="checkbox-grid">
            {DIETARY_PREFERENCES.map(pref => (
              <label key={pref} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={profileData.dietaryPreferences.includes(pref)}
                  onChange={() => togglePreference(pref)}
                  disabled={!isEditing}
                />
                <span>{pref}</span>
              </label>
            ))}
          </div>
          
          <div className="form-field">
            <label>Foods to Avoid (not allergies)</label>
            <textarea
              value={profileData.avoidFoods}
              onChange={(e) => {
                setProfileData({ ...profileData, avoidFoods: e.target.value })
                setHasUnsavedChanges(true)
              }}
              disabled={!isEditing}
              placeholder="List any foods you prefer to avoid (e.g., spicy foods, raw fish, etc.)"
              rows={3}
            />
          </div>

          <div className="form-field">
            <label>Additional Notes</label>
            <textarea
              value={profileData.notes}
              onChange={(e) => {
                setProfileData({ ...profileData, notes: e.target.value })
                setHasUnsavedChanges(true)
              }}
              disabled={!isEditing}
              placeholder="Any other dietary information or preferences we should know about"
              rows={3}
            />
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="profile-section">
          <h2>Emergency Contact</h2>
          <div className="form-grid">
            <div className="form-field">
              <label>Contact Name</label>
              <input
                type="text"
                value={profileData.emergencyContactName}
                onChange={(e) => {
                  setProfileData({ ...profileData, emergencyContactName: e.target.value })
                  setHasUnsavedChanges(true)
                }}
                disabled={!isEditing}
                placeholder="John Doe"
              />
            </div>
            <div className="form-field">
              <label>Contact Phone</label>
              <input
                type="tel"
                value={profileData.emergencyContactPhone}
                onChange={(e) => {
                  setProfileData({ ...profileData, emergencyContactPhone: e.target.value })
                  setHasUnsavedChanges(true)
                }}
                disabled={!isEditing}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="form-field">
              <label>Relationship</label>
              <input
                type="text"
                value={profileData.emergencyContactRelation}
                onChange={(e) => {
                  setProfileData({ ...profileData, emergencyContactRelation: e.target.value })
                  setHasUnsavedChanges(true)
                }}
                disabled={!isEditing}
                placeholder="Spouse, Parent, etc."
              />
            </div>
          </div>
        </section>
      </div>

      {/* Profile Summary (when not editing) */}
      {!isEditing && profileData.healthConditions.length > 0 && (
        <div className="profile-summary">
          <h3>Your Health Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <strong>Conditions:</strong> {profileData.healthConditions.join(', ')}
            </div>
            {profileData.allergies.length > 0 && (
              <div className="summary-item allergen-summary">
                <strong>Allergies:</strong> {profileData.allergies.join(', ')}
              </div>
            )}
            {profileData.dietaryPreferences.length > 0 && (
              <div className="summary-item">
                <strong>Diet:</strong> {profileData.dietaryPreferences.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile