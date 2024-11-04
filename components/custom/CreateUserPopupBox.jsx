"use client";
import { useState, useContext } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GlobalContext } from '@/lib/GlobalState';

export const CreateUserPopupBox = ({ isOpen, onClose }) => {
    const { ListUsers, setListUsers } = useContext(GlobalContext);
    const [username, setUsername] = useState('');
    const [color, setColor] = useState('#000000');
    const [tempPassword, setTempPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [userCreated, setUserCreated] = useState(false);

    const handleCreateUser = async () => {
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    color
                }),
            });

            if (!res.ok) throw new Error("Erreur lors de la création de l'utilisateur");

            const data = await res.json();
            setTempPassword(data.tempPassword); 
            setSuccessMessage(`Utilisateur créé avec succès`);
            setUserCreated(true);
            setErrorMessage('');

            setListUsers([...ListUsers, { id: data.userId, username, color }]); // Ajoute le nouvel utilisateur dans ListUsers
        } catch (error) {
            setErrorMessage("Erreur lors de la création de l'utilisateur");
            setSuccessMessage('');
        }
    };

    const handleCopyPassword = () => {
        if (tempPassword) {
            navigator.clipboard.writeText(tempPassword).then(() => {
                alert("Mot de passe copié dans le presse-papiers");
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                </DialogHeader>

                {userCreated ? (
                    <div className="text-center space-y-4">
                        <p className="text-green-500">{successMessage}</p>
                        <p>Nom d'utilisateur : {username}</p>
                        <p>Mot de passe temporaire : {tempPassword}</p>
                        <Button onClick={handleCopyPassword} className="mt-4">Copier le mot de passe</Button>
                    </div>
                ) : (
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="grid gap-4 py-4">
                            <div className="">
                                <Label htmlFor="username">Nom d'utilisateur</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    placeholder="Nom d'utilisateur"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="">
                                <Label htmlFor="color">Couleur</Label>
                                <Input
                                    id="color"
                                    name="color"
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                />
                            </div>
                            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={onClose}>Annuler</Button>
                            <Button onClick={handleCreateUser}>Créer l'utilisateur</Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};
