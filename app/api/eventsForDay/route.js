import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'eventId est requis' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId, 10) }
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
    }

    const eventDate = new Date(event.date);
    const startOfDay = eventDate.toISOString().split('T')[0];

    const eventsForDay = await prisma.event.findMany({
      where: {
        date: {
          gte: new Date(startOfDay),
          lt: new Date(new Date(startOfDay).setDate(new Date(startOfDay).getDate() + 1)),
        }
      }
    });

    return NextResponse.json(eventsForDay, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements :', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des événements' }, { status: 500 });
  }
}
