import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const { id, title, description, startDate, endDate, isFullDay, userId } = await request.json();

    if (!id || !title || !startDate || !endDate || !userId) {
      return NextResponse.json({ error: 'Les informations essentielles sont requises.' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
    }

    // Split userId if it's a group of users (e.g., "1/2/3")
    const userIds = userId.split('/').map(Number);

    // Convert dates and times to UTC format
    const debutAt = new Date(Date.UTC(
      new Date(startDate).getUTCFullYear(),
      new Date(startDate).getUTCMonth(),
      new Date(startDate).getUTCDate(),
      new Date(startDate).getUTCHours(),
      new Date(startDate).getUTCMinutes()
    ));

    const finAt = new Date(Date.UTC(
      new Date(endDate).getUTCFullYear(),
      new Date(endDate).getUTCMonth(),
      new Date(endDate).getUTCDate(),
      new Date(endDate).getUTCHours(),
      new Date(endDate).getUTCMinutes()
    ));

    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id, 10) },
      data: {
        title,
        subtitle: description || '',
        debutAt,
        finAt,
        fullDay: isFullDay,
        userId: {
          set: userIds.map((userId) => ({ id: userId })),
        },
      },
    });

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de l\'événement' }, { status: 500 });
  }
}
