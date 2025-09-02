const express = require('express');
const { supabaseDb } = require('../db/supabase.js');
const { authenticateToken } = require('../middleware/auth.js');

const router = express.Router();

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!supabaseDb.isConfigured()) {
      return res.status(503).json({ 
        error: 'Cloud storage not available',
        message: 'Supabase is not configured' 
      });
    }

    const profile = await supabaseDb.users.findById(userId);
    
    if (!profile) {
      return res.status(404).json({ 
        error: 'Profile not found' 
      });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      message: error.message 
    });
  }
});

// Save/Update user profile
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const profileData = req.body;

    if (!supabaseDb.isConfigured()) {
      return res.status(503).json({ 
        error: 'Cloud storage not available',
        message: 'Supabase is not configured' 
      });
    }

    // Check if profile exists
    const existingProfile = await supabaseDb.users.findById(userId);

    let savedProfile;
    if (existingProfile) {
      // Update existing profile
      savedProfile = await supabaseDb.users.update(userId, {
        name: profileData.name,
        phone: profileData.phone,
        date_of_birth: profileData.dateOfBirth,
        health_conditions: profileData.healthConditions || [],
        allergies: profileData.allergies || [],
        dietary_preferences: profileData.dietaryPreferences || [],
        medications: profileData.medications || [],
        emergency_contact_name: profileData.emergencyContactName,
        emergency_contact_phone: profileData.emergencyContactPhone,
        emergency_contact_relation: profileData.emergencyContactRelation,
        notes: profileData.notes,
        updated_at: new Date().toISOString()
      });
    } else {
      // Create new profile
      savedProfile = await supabaseDb.users.create({
        user_id: userId,
        email: req.user.email,
        name: profileData.name,
        phone: profileData.phone,
        date_of_birth: profileData.dateOfBirth,
        health_conditions: profileData.healthConditions || [],
        allergies: profileData.allergies || [],
        dietary_preferences: profileData.dietaryPreferences || [],
        medications: profileData.medications || [],
        emergency_contact_name: profileData.emergencyContactName,
        emergency_contact_phone: profileData.emergencyContactPhone,
        emergency_contact_relation: profileData.emergencyContactRelation,
        notes: profileData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Profile saved successfully',
      profile: savedProfile
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ 
      error: 'Failed to save profile',
      message: error.message 
    });
  }
});

// Load profile from cloud
router.get('/load', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!supabaseDb.isConfigured()) {
      return res.status(503).json({ 
        error: 'Cloud storage not available',
        message: 'Supabase is not configured' 
      });
    }

    const profile = await supabaseDb.users.findById(userId);

    if (!profile) {
      return res.status(404).json({ 
        error: 'No cloud profile found',
        message: 'You have not saved a profile to the cloud yet' 
      });
    }

    res.json({
      success: true,
      profile: {
        firstName: profile.name?.split(' ')[0] || '',
        lastName: profile.name?.split(' ').slice(1).join(' ') || '',
        email: profile.email,
        phone: profile.phone || '',
        dateOfBirth: profile.date_of_birth || '',
        healthConditions: profile.health_conditions || [],
        allergies: profile.allergies || [],
        dietaryPreferences: profile.dietary_preferences || [],
        medications: profile.medications?.join(', ') || '',
        emergencyContactName: profile.emergency_contact_name || '',
        emergencyContactPhone: profile.emergency_contact_phone || '',
        emergencyContactRelation: profile.emergency_contact_relation || '',
        notes: profile.notes || ''
      }
    });
  } catch (error) {
    console.error('Error loading profile:', error);
    res.status(500).json({ 
      error: 'Failed to load profile',
      message: error.message 
    });
  }
});

// Test Supabase connection
router.get('/test-connection', authenticateToken, async (req, res) => {
  try {
    const result = await supabaseDb.testConnection();
    res.json(result);
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ 
      error: 'Connection test failed',
      message: error.message 
    });
  }
});

module.exports = router;