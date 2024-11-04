import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'Les dates de début et de fin sont requises' }, { status: 400 });
  }

  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [
          {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
          {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
        ]
      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des événements' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, startDate, endDate, isFullDay, userId, address } = body;

    if (!title || !startDate || !endDate || !userId || (startDate && startDate == "Invalid Date")) {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }

    const debutAt = new Date(Date.UTC(
      new Date(startDate).getUTCFullYear(),
      new Date(startDate).getUTCMonth(),
      new Date(startDate).getUTCDate(),
      new Date(startDate).getHours(),
      new Date(startDate).getMinutes()
    ));
    
    const finAt = new Date(Date.UTC(
      new Date(endDate).getUTCFullYear(),
      new Date(endDate).getUTCMonth(),
      new Date(endDate).getUTCDate(),
      new Date(endDate).getHours(),
      new Date(endDate).getMinutes()
    ));

    const newEvent = await prisma.event.create({
      data: {
        title,
        subtitle: description || '',
        date: new Date(Date.UTC(
          new Date(startDate).getUTCFullYear(),
          new Date(startDate).getUTCMonth(),
          new Date(startDate).getUTCDate(),
          0, 0, 0, 0
        )),
        debutAt,
        finAt,
        fullDay: isFullDay,
        userId,
        address: address || null,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ message: 'Error creating event' }, { status: 500 });
  }
}
