import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    const genererChaineAleatoire = (longueur) => {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let chaine = '';
        for (let i = 0; i < longueur; i++) {
            chaine += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return chaine;
    }
    
    try {
        const body = await request.json();
        const { username, color, password } = body;

        const tempPassword = password || genererChaineAleatoire(8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                color,
                password: hashedPassword,
                temp_password: password ? '' : tempPassword,
                role: "user",
            },
        });

        return NextResponse.json({ user: newUser, tempPassword: password ? null : tempPassword }, { status: 201 });
    } catch (e) {
        console.log(e);
        return NextResponse.json({ error: 'Erreur lors de la création du user' }, { status: 500 });
    }
}
