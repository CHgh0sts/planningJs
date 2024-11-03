"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [username, setUsername] = useState('');
  const [color, setColor] = useState("#ffffff");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      username: username,
      color: color,
      password: password,
    };

    console.log("Données envoyées :", data);

    try {
      const res = await fetch(`/api/account/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Erreur lors de la création de l'utilisateur");

      const user = await res.json();
      console.log("Utilisateur créé :", user);
      router.push("/login");
    } catch (error) {
      console.error("Erreur:", error);
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <h2 className="text-2xl font-bold text-center mb-6">Créer un compte</h2>
          {error && <p className="text-red-500 text-center">Erreur : {error}</p>}
          <Input
            id="username"
            name="username"
            placeholder="Nom d'utilisateur"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border-gray-300 rounded-md focus:ring-2 focus:border-blue-500"
          />
          <div className="relative w-full">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-gray-300 rounded-md focus:ring-2 focus:border-blue-500 pr-10"
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
            </div>
          </div>
          <Input
            id="color"
            name="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full border-gray-300 rounded-md focus:ring-2 focus:border-blue-500"
          />
          <Button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-700">
            Créer un compte
          </Button>
          <p className="text-center text-sm text-gray-600">
            Déjà un compte ? <a href="/login" className="text-blue-500 hover:underline">Connexion</a>
          </p>
        </form>
      </div>
    </div>
  );
}
