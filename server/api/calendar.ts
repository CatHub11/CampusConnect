import { Response } from 'express';
import { createEvents, DateArray, EventAttributes } from 'ics';
import { Event } from '@shared/schema';

/**
 * Convert date to format required by ics library
 * Format: [year, month, day, hour, minute]
 */
function formatDateForICS(date: Date): DateArray {
  return [
    date.getFullYear(),
    date.getMonth() + 1, // Months are 0-indexed in JS, 1-indexed in ICS
    date.getDate(),
    date.getHours(),
    date.getMinutes()
  ];
}

/**
 * Generate .ics file content from a list of events
 */
export function generateCalendarFile(events: Event[]): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!events.length) {
      return resolve('');
    }

    const eventAttributes: EventAttributes[] = events.map(event => {
      const startDate = new Date(event.startTime);
      const endDate = new Date(event.endTime);
      
      return {
        start: formatDateForICS(startDate),
        end: formatDateForICS(endDate),
        title: event.name,
        description: event.description,
        location: event.location,
        url: event.externalUrl || undefined,
        // Add a unique ID to prevent duplicate events
        uid: `event-${event.id}@campusconnect`,
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: { name: 'CampusConnect', email: 'noreply@campusconnect.app' },
      };
    });

    createEvents(eventAttributes, (error, value) => {
      if (error) {
        console.error('Error generating calendar file:', error);
        return reject(error);
      }
      
      resolve(value);
    });
  });
}

/**
 * Send an .ics file as a download
 */
export function sendCalendarFile(res: Response, fileContent: string, filename: string = 'calendar.ics'): void {
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(fileContent);
}

/**
 * Generate an .ics file for a single event
 */
export async function generateSingleEventCalendarFile(event: Event): Promise<string> {
  return generateCalendarFile([event]);
}

/**
 * Generate a filename for the calendar download
 */
export function generateCalendarFilename(prefix: string, eventId?: number): string {
  const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0];
  const idPart = eventId ? `-${eventId}` : '';
  return `${prefix}${idPart}-calendar-${timestamp}.ics`;
}