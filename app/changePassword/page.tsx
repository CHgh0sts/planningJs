"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Utilisateur non authentifié");
      return;
    }

    try {
      const res = await fetch("/api/account/changePassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, currentPassword, newPassword }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors du changement de mot de passe. Vérifiez vos informations.");
      }

      setSuccess("Mot de passe mis à jour avec succès");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <h2 className="text-2xl font-bold text-center mb-6">Changer le mot de passe</h2>
          {error && <p className="text-red-500 text-center">Erreur : {error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}
          <div className="relative w-full">
            <Input
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Mot de passe actuel"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full border-gray-300 rounded-md focus:ring-2 focus:border-blue-500 pr-10"
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
            </div>
          </div>
          <div className="relative w-full">
            <Input
              type={showNewPassword ? "text" : "password"}
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full border-gray-300 rounded-md focus:ring-2 focus:border-blue-500 pr-10"
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
            </div>
          </div>
          <div className="relative w-full">
            <Input
              type={showConfirmNewPassword ? "text" : "password"}
              placeholder="Confirmer le nouveau mot de passe"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              className="w-full border-gray-300 rounded-md focus:ring-2 focus:border-blue-500 pr-10"
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
            >
              {showConfirmNewPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
            </div>
          </div>
          <Button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-700">
            Changer le mot de passe
          </Button>
          <a href="/login" className="text-blue-500 hover:underline text-center m-auto w-[fit-content]">Retour</a>
        </form>
      </div>
    </div>
  );
}
