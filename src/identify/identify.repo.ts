import { PrismaClient, Contact } from '@prisma/client';

const prisma = new PrismaClient();

export const findContactsByEmailOrPhone = async (
  email?: string,
  phoneNumber?: string
): Promise<Contact[]> => {
  if (!email && !phoneNumber) return [];

  const conditions = [
    email ? { email } : undefined,
    phoneNumber ? { phoneNumber } : undefined,
  ].filter(Boolean) as object[];

  return prisma.contact.findMany({
    where: {
      OR: conditions,
      deletedAt: null,
    },
  });
};

export const findContactsByIds = async (ids: number[]): Promise<Contact[]> => {
  if (!ids.length) return [];

  return prisma.contact.findMany({
    where: {
      id: { in: ids },
      deletedAt: null,
    },
  });
};

export const findContactsByPrimaryId = async (primaryId: number): Promise<Contact[]> => {
  return prisma.contact.findMany({
    where: {
      OR: [
        { id: primaryId },
        { linkedId: primaryId },
      ],
      deletedAt: null,
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const createPrimaryContact = async (
  email?: string,
  phoneNumber?: string
): Promise<Contact> => {
  return prisma.contact.create({
    data: {
      email: email ?? null,
      phoneNumber: phoneNumber ?? null,
      linkPrecedence: 'primary',
      linkedId: null,
    },
  });
};

export const createSecondaryContact = async (
  primaryId: number,
  email?: string,
  phoneNumber?: string
): Promise<Contact> => {
  return prisma.contact.create({
    data: {
      email: email ?? null,
      phoneNumber: phoneNumber ?? null,
      linkPrecedence: 'secondary',
      linkedId: primaryId,
    },
  });
};

export const updateContact = async (
  contactId: number,
  data: Partial<Pick<Contact, 'linkPrecedence' | 'linkedId'>>
): Promise<Contact> => {
  return prisma.contact.update({
    where: { id: contactId },
    data,
  });
};

export const updateManyContacts = async (
  where: Partial<Pick<Contact, 'linkedId'>>,
  data: Partial<Pick<Contact, 'linkedId'>>
) => {
  return prisma.contact.updateMany({
    where: {
      ...where,
      deletedAt: null,
    },
    data,
  });
};
