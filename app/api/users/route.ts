import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function generateRandomPassword(length = 8) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  try {
    let users;

    if (username && username.trim() !== '') {
      users = await prisma.user.findMany({
        where: {
          username: {
            contains: username,
          },
        },
      });
    } else {
      users = await prisma.user.findMany();
    }
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Erreur côté serveur:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs ou des événements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, color } = await request.json();

    if (!username || !color) {
      return NextResponse.json({ error: 'Le nom d\'utilisateur et la couleur sont requis' }, { status: 400 });
    }

    const tempPassword = generateRandomPassword();
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        color,
        role: "user",
        temp_password: hashedTempPassword,
      },
    });

    return NextResponse.json({ user: newUser, tempPassword }, { status: 201 }); // `tempPassword` peut être envoyé pour montrer le mot de passe généré, si besoin
  } catch (error) {
    console.error('Erreur côté serveur:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de l\'utilisateur' }, { status: 500 });
  }
}
