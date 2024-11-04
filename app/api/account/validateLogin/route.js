import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(req) {
  const { newPassword, confirmPassword } = await req.json();
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'Les mots de passe ne correspondent pas' }, { status: 400 });
  }

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        password: hashedPassword,
        temp_password: '',
      },
    });

    const tokenValid = jwt.sign(
        { userId: updatedUser.id }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
      );

    return NextResponse.json({ token: tokenValid, message: 'Mot de passe mis à jour avec succès' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe :', error);

    // Gestion des erreurs JWT
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    } else if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Token expiré' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
