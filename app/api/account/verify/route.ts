import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.redirect('/login');
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Erreur de vérification du token :', error);
    return NextResponse.redirect('/login');
  }
}
