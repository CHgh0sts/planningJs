"use client";
import { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableUser, setEditableUser] = useState(null);
    const [isPasswordChanging, setIsPasswordChanging] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState({ currentPassword: false, newPassword: false, confirmPassword: false });
    const [passwordError, setPasswordError] = useState(null); // To store the error message from the API
    const router = useRouter();

    const verifyToken = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const res = await fetch('/api/account/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Token invalide ou expiré');
            }

            const data = await res.json();
            setUser(data.user);
            setEditableUser({ ...data.user });
            setLoading(false);
        } catch (error) {
            router.push('/login');
        }
    };

    useEffect(() => {
        verifyToken();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditableUser(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditableUser({ ...user });
        setIsEditing(false);
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/account/update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editableUser),
            });

            if (!res.ok) {
                throw new Error('Erreur lors de la mise à jour du profil');
            }

            const updatedUser = await res.json();
            setUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil :", error);
        }
    };

    const handlePasswordChange = () => {
        setIsPasswordChanging(true);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError(null); // Clear previous error

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("Les nouveaux mots de passe ne correspondent pas");
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/account/change-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(passwordForm),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.log(errorData);
                
                setPasswordError(errorData.message || 'Erreur lors du changement de mot de passe');
                return;
            }

            alert('Mot de passe modifié avec succès');
            setIsPasswordChanging(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error("Erreur lors du changement de mot de passe :", error);
            setPasswordError('Erreur lors du changement de mot de passe');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-100">Chargement...</div>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="absolute top-4 right-4">
                <Link href="/" passHref>
                    <Button className="bg-gray-200 text-gray-600 hover:bg-gray-300">Retour</Button>
                </Link>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">{isEditing ? 'Modifier Profil' : 'Mon Profil'}</h1>
                {isEditing ? (
                    <>
                        <div className="mb-4">
                            <label className="block text-gray-700">Nom d'utilisateur</label>
                            <Input name="username" value={editableUser.username} onChange={handleChange} className="w-full border-gray-300 rounded-md" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Couleur</label>
                            <Input name="color" type="color" value={editableUser.color} onChange={handleChange} className="w-full border-gray-300 rounded-md" />
                        </div>
                        <div className="mb-4">
                            <Button onClick={handlePasswordChange} className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-700">Changer le mot de passe</Button>
                        </div>
                        <div className="flex justify-between">
                            <Button className="w-full mr-2 bg-green-500 text-white py-2 rounded-md hover:bg-green-700" onClick={handleSave}>Enregistrer</Button>
                            <Button className="w-full ml-2 bg-red-500 text-white py-2 rounded-md hover:bg-red-700" onClick={handleCancel}>Annuler</Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">{user.username}</h2>
                        </div>
                        <div className="mb-4">
                            <p className="text-gray-600">Rôle: {user.role}</p>
                        </div>
                        <div className="mb-4 flex items-center">
                            <p className="text-gray-600">Couleur: </p>
                            <div className="w-4 h-4 rounded-full ml-2" style={{ backgroundColor: user.color }}></div>
                        </div>
                        <Button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-700" onClick={handleEdit}>Modifier</Button>
                    </>
                )}
            </div>

            <Dialog open={isPasswordChanging} onOpenChange={setIsPasswordChanging}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Changer le mot de passe</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePasswordSubmit}>
                        {passwordError && <p className="text-red-500 text-sm mb-4">{passwordError}</p>}
                        <div className="mb-4 relative w-full">
                            <label className="block text-gray-700">Mot de passe actuel</label>
                            <div className="relative w-full">
                                <Input
                                    name="currentPassword"
                                    type={showPassword.currentPassword ? "text" : "password"}
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    required
                                    className="w-full border-gray-300 rounded-md pr-10"
                                />
                                <div
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                    onClick={() => setShowPassword((prev) => ({ ...prev, currentPassword: !prev.currentPassword }))}
                                >
                                    {showPassword.currentPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                                </div>
                            </div>
                        </div>
                        <div className="mb-4 relative w-full">
                            <label className="block text-gray-700">Nouveau mot de passe</label>
                            <div className="relative w-full">
                                <Input
                                    name="newPassword"
                                    type={showPassword.newPassword ? "text" : "password"}
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    required
                                    className="w-full border-gray-300 rounded-md pr-10"
                                />
                                <div
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                    onClick={() => setShowPassword((prev) => ({ ...prev, newPassword: !prev.newPassword }))}
                                >
                                    {showPassword.newPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                                </div>
                            </div>
                        </div>
                        <div className="mb-4 relative w-full">
                            <label className="block text-gray-700">Confirmer le nouveau mot de passe</label>
                            <div className="relative w-full">
                                <Input
                                    name="confirmPassword"
                                    type={showPassword.confirmPassword ? "text" : "password"}
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    required
                                    className="w-full border-gray-300 rounded-md pr-10"
                                />
                                <div
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                    onClick={() => setShowPassword((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                                >
                                    {showPassword.confirmPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-700">Changer le mot de passe</Button>
                            <Button className="bg-gray-500 text-white py-2 rounded-md hover:bg-gray-700" variant="secondary" onClick={() => setIsPasswordChanging(false)}>Annuler</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
