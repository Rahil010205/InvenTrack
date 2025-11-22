'use client';

import { useState, useEffect } from 'react';
import { User, Lock } from 'lucide-react';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [changing, setChanging] = useState(false);

    useEffect(() => {
        // Fetch user profile (using existing auth check or a new profile endpoint)
        // Since we don't have a dedicated /api/me, we can decode the token or fetch from a new endpoint.
        // Let's assume we can get basic info from a new endpoint or just use what we have.
        // I'll create a simple /api/auth/me endpoint or just fetch from /api/auth/profile if it existed.
        // For now, I'll create a quick /api/auth/me endpoint to get user details.
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        setChanging(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(data.message);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setError(data.error || 'Failed to change password');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setChanging(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-foreground">User Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Details */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-foreground">Account Details</h2>
                            <p className="text-sm text-muted-foreground">Your personal information</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground">Name</label>
                            <p className="text-foreground font-medium">{user?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground">Email</label>
                            <p className="text-foreground font-medium">{user?.email || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground">Role</label>
                            <p className="text-foreground font-medium capitalize">{user?.role || 'User'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground">Tenant ID</label>
                            <p className="text-foreground font-medium font-mono">{user?.tenant_id || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Lock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-foreground">Security</h2>
                            <p className="text-sm text-muted-foreground">Change your password</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label htmlFor="current" className="block text-sm font-medium text-foreground">Current Password</label>
                            <input
                                type="password"
                                id="current"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="new" className="block text-sm font-medium text-foreground">New Password</label>
                            <input
                                type="password"
                                id="new"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm" className="block text-sm font-medium text-foreground">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirm"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>

                        {error && <p className="text-sm text-destructive">{error}</p>}
                        {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}

                        <button
                            type="submit"
                            disabled={changing}
                            className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors"
                        >
                            {changing ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
