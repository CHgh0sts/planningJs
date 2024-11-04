import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { id, username, email, color } = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.id !== parseInt(id, 10)) {
      return NextResponse.json({ error: 'Utilisateur non autorisé ou introuvable' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: {
        username,
        color,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil' }, { status: 500 });
  }
}
