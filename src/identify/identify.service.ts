import { Contact } from '@prisma/client';
import {
  findContactsByEmailOrPhone,
  findContactsByIds,
  findContactsByPrimaryId,
  createPrimaryContact,
  createSecondaryContact,
  updateContact,
  updateManyContacts,
} from './identify.repo';

type IdentityResponse = {
  contact: {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
};

export const handleIdentify = async (
  email?: string,
  phoneNumber?: string
): Promise<IdentityResponse> => {
  // Find contacts matching email or phone
  const matchedContacts = await findContactsByEmailOrPhone(email, phoneNumber);

  // Create a new primary contact
  if (matchedContacts.length === 0) {
    const newContact = await createPrimaryContact(email, phoneNumber);
    return buildResponse([newContact]);
  }

  // take unique primary ids
  const primaryIds = new Set<number>();
  matchedContacts.forEach(contact => {
    if (contact.linkPrecedence === 'primary') {
      primaryIds.add(contact.id);
    } else if (contact.linkedId) {
      primaryIds.add(contact.linkedId);
    }
  });

  let truePrimaryId: number;

  if (primaryIds.size === 1) {
    // Single primary
    truePrimaryId = [...primaryIds][0];
  } else {
    // Multiple primaries 
    const primaryContacts = await findContactsByIds([...primaryIds]);
    primaryContacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const [oldestPrimary, ...others] = primaryContacts;
    truePrimaryId = oldestPrimary.id;

    // change to secondary
    for (const contact of others) {
      await updateContact(contact.id, {
        linkPrecedence: 'secondary',
        linkedId: truePrimaryId,
      });

      await updateManyContacts(
        { linkedId: contact.id },
        { linkedId: truePrimaryId }
      );
    }
  }

  // Get all contacts linked
  const contactGroup = await findContactsByPrimaryId(truePrimaryId);

  // Build sets of emails, phone numbers, secondary
  const emails = new Set<string>();
  const phoneNumbers = new Set<string>();
  const secondaryIds: number[] = [];

  contactGroup.forEach(contact => {
    if (contact.email) emails.add(contact.email);
    if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
    if (contact.linkPrecedence === 'secondary') {
      secondaryIds.push(contact.id);
    }
  });

  // If email/phone is new add 
  const emailExists = email ? emails.has(email) : false;
  const phoneExists = phoneNumber ? phoneNumbers.has(phoneNumber) : false;

  if ((email && !emailExists) || (phoneNumber && !phoneExists)) {
    await createSecondaryContact(truePrimaryId, email, phoneNumber);
    const updatedGroup = await findContactsByPrimaryId(truePrimaryId);
    return buildResponse(updatedGroup);
  }

  // Nothing new to add 
  return buildResponse(contactGroup);
};

const buildResponse = (contacts: Contact[]): IdentityResponse => {
  const primary = contacts.find(c => c.linkPrecedence === 'primary') ?? contacts[0];

  const emails = new Set<string>();
  const phones = new Set<string>();
  const secondaryIds: number[] = [];

  contacts.forEach(contact => {
    if (contact.email) emails.add(contact.email);
    if (contact.phoneNumber) phones.add(contact.phoneNumber);
    if (contact.linkPrecedence === 'secondary') {
      secondaryIds.push(contact.id);
    }
  });

  const orderedEmails = primary.email
    ? [primary.email, ...[...emails].filter(e => e !== primary.email)]
    : [...emails];

  const orderedPhones = primary.phoneNumber
    ? [primary.phoneNumber, ...[...phones].filter(p => p !== primary.phoneNumber)]
    : [...phones];

  return {
    contact: {
      primaryContactId: primary.id,
      emails: orderedEmails,
      phoneNumbers: orderedPhones,
      secondaryContactIds: secondaryIds,
    },
  };
};
