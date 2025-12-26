import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Toast from '../components/Toast';
import { User, Camera, Save, X, Edit2, Mail, Type, FileText, Utensils } from 'lucide-react';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        profilePicture: '',
        dietaryPreferences: [], // Will be comma separated string for simple input or checkbox array
        email: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                bio: user.bio || '',
                profilePicture: user.profilePicture || '',
                dietaryPreferences: Array.isArray(user.dietaryPreferences) ? user.dietaryPreferences : [],
                email: user.email || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDietChange = (pref) => {
        setFormData(prev => {
            const current = prev.dietaryPreferences;
            if (current.includes(pref)) {
                return { ...prev, dietaryPreferences: current.filter(p => p !== pref) };
            } else {
                return { ...prev, dietaryPreferences: [...current, pref] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Exclude email from the update payload since it's disabled
            const { email, ...updateData } = formData;
            const { data } = await api.put('/users/profile', updateData);
            updateUser(data); // Update Auth Context
            setIsEditing(false);
            setToast({ message: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            console.error("Profile update error:", error);
            setToast({ message: error.response?.data?.message || 'Failed to update profile.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten Free', 'Dairy Free', 'Ketogenic'];

    if (!user) return <div className="profile-container">Please login to view profile.</div>;

    return (
        <div className="profile-page">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="profile-header-card">
                <div className="profile-avatar-wrapper">
                    {formData.profilePicture ? (
                        <img src={formData.profilePicture} alt="Profile" className="profile-avatar-img" />
                    ) : (
                        <div className="profile-avatar-placeholder"><User size={64} /></div>
                    )}
                    {isEditing && (
                        <div className="avatar-edit-overlay" onClick={() => {
                            const url = prompt("Enter image URL:");
                            if (url) setFormData(prev => ({ ...prev, profilePicture: url }));
                        }}>
                            <Camera size={24} color="white" />
                        </div>
                    )}
                </div>
                <h1 className="profile-name-display">{user.name}</h1>
                <p className="profile-bio-display">{user.bio || 'No bio yet. Start writing your story!'}</p>

                {!isEditing && (
                    <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                        <Edit2 size={16} /> Edit Profile
                    </button>
                )}
            </div>

            <div className={`profile-form-container ${isEditing ? 'editing-mode' : ''}`}>
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                        <label><Type size={16} /> Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="profile-input"
                        />
                    </div>

                    <div className="form-group">
                        <label><Mail size={16} /> Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={true}
                            className="profile-input disabled"
                            title="Email cannot be changed"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label><FileText size={16} /> Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="profile-textarea"
                            rows={3}
                            placeholder="Tell us about your favorite cuisines..."
                        />
                    </div>

                    <div className="form-group full-width">
                        <label><Utensils size={16} /> Dietary Preferences</label>
                        <div className="dietary-tags">
                            {dietaryOptions.map(pref => (
                                <div
                                    key={pref}
                                    className={`diet-tag ${formData.dietaryPreferences.includes(pref) ? 'active' : ''} ${!isEditing ? 'readonly' : ''}`}
                                    onClick={() => isEditing && handleDietChange(pref)}
                                >
                                    {pref}
                                </div>
                            ))}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={() => {
                                setIsEditing(false);
                                // Reset form
                                setFormData({
                                    name: user.name || '',
                                    bio: user.bio || '',
                                    profilePicture: user.profilePicture || '',
                                    dietaryPreferences: Array.isArray(user.dietaryPreferences) ? user.dietaryPreferences : [],
                                    email: user.email || ''
                                });
                            }}>
                                <X size={18} /> Cancel
                            </button>
                            <button type="submit" className="save-btn" disabled={loading}>
                                <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Profile;
