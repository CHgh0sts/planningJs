import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const eventId = parseInt(params.id);
  const { date, debutAt } = await request.json();

  try {
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    const updatedData: any = {};

    if (date) {
      const newDate = new Date(date);
      newDate.setHours(existingEvent.date.getHours());
      newDate.setMinutes(existingEvent.date.getMinutes());
      newDate.setSeconds(existingEvent.date.getSeconds());
      updatedData.date = newDate;
    }

    if (debutAt) {
      const existingDebutAt = new Date(existingEvent.debutAt);
      const existingFinAt = new Date(existingEvent.finAt);
      const timeDifference = existingFinAt.getTime() - existingDebutAt.getTime();

      const newDebutAt = new Date(debutAt);
      updatedData.debutAt = newDebutAt;

      const newFinAt = new Date(newDebutAt.getTime() + timeDifference);
      updatedData.finAt = newFinAt;
    }

    if (Object.keys(updatedData).length === 0) {
      return NextResponse.json(
        { error: "Aucun champ à mettre à jour n'a été fourni" },
        { status: 400 }
      );
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updatedData,
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'événement" },
      { status: 500 }
    );
  }
}
