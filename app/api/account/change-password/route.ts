import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) { // Assure-toi que le verbe HTTP utilisé correspond à l'appel dans le front-end
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Les champs mot de passe actuel et nouveau mot de passe sont requis' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const isOldPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isOldPasswordValid) {
      return NextResponse.json({ error: 'Ancien mot de passe incorrect' }, { status: 400 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
      },
    });

    return NextResponse.json({ message: 'Mot de passe mis à jour avec succès' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error); // Log de l'erreur détaillée pour le débogage
    return NextResponse.json({ error: 'Erreur lors du changement de mot de passe' }, { status: 500 });
  }
}
