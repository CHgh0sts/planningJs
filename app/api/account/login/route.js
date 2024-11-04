import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Nom d'utilisateur et mot de passe requis" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
    }

    const isPasswordValid = user.password ? await bcrypt.compare(password.trim(), user.password) : false;
    const isTempPasswordValid = await bcrypt.compare(password.trim(), user.temp_password);

    if (!isPasswordValid && !isTempPasswordValid) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      token,
      user: { id: user.id, username: user.username },
      isTempPassword: isTempPasswordValid
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
