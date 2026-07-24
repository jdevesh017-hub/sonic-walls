import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../../uploads");
const usersCsvPath = path.join(uploadsDir, "registered_users.csv");

interface UserRecord {
  name: string;
  email: string;
  mobileNumber?: string;
  createdAt?: Date | string;
}

const pendingQueue: UserRecord[] = [];
let retryInterval: NodeJS.Timeout | null = null;

// Helper to escape CSV values safely for Excel
function escapeCsv(val: string): string {
  if (!val) return '""';
  const cleanStr = String(val).replace(/"/g, '""');
  return `"${cleanStr}"`;
}

// Ensure uploads directory and CSV header exist
function initCsvFile(): void {
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    if (!fs.existsSync(usersCsvPath)) {
      const header = "Name,Email,Mobile Number,Registration Date\n";
      fs.writeFileSync(usersCsvPath, header, "utf8");
      console.log(`[ExcelLogger] Created Excel registry file at: ${usersCsvPath}`);
    }
  } catch (err: any) {
    if (err.code === "EBUSY") {
      console.warn(`[ExcelLogger Warning] ${usersCsvPath} is open in Excel. Will auto-create/update when closed.`);
    } else {
      console.error(`[ExcelLogger Error] Failed to initialize CSV file: ${err.message}`);
    }
  }
}

function flushQueue(): void {
  if (pendingQueue.length === 0) return;

  initCsvFile();

  let writtenCount = 0;
  const remaining: UserRecord[] = [];

  for (const userData of pendingQueue) {
    const name = escapeCsv(userData.name);
    const email = escapeCsv(userData.email);
    const mobile = escapeCsv(userData.mobileNumber || "N/A");
    const dateStr = escapeCsv(
      userData.createdAt ? new Date(userData.createdAt).toLocaleString() : new Date().toLocaleString()
    );

    const row = `${name},${email},${mobile},${dateStr}\n`;

    try {
      fs.appendFileSync(usersCsvPath, row, "utf8");
      writtenCount++;
      console.log(`[ExcelLogger] Successfully logged user ${userData.email} to registered_users.csv`);
    } catch (err: any) {
      if (err.code === "EBUSY") {
        console.warn(
          `[ExcelLogger Warning] registered_users.csv is currently OPEN in Microsoft Excel! Pending registration for ${userData.email} will save automatically once Excel is closed.`
        );
        remaining.push(userData);
      } else {
        console.error(`[ExcelLogger Error] Could not write to CSV: ${err.message}`);
      }
    }
  }

  // Replace pending queue with any rows that could not be written due to file locks
  pendingQueue.length = 0;
  pendingQueue.push(...remaining);

  if (pendingQueue.length > 0 && !retryInterval) {
    retryInterval = setInterval(() => {
      if (pendingQueue.length === 0) {
        if (retryInterval) clearInterval(retryInterval);
        retryInterval = null;
      } else {
        flushQueue();
      }
    }, 3000);
  }
}

export function logUserToExcel(userData: UserRecord): void {
  // Prevent duplicate additions in the queue for the same email
  const existingIdx = pendingQueue.findIndex((u) => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existingIdx >= 0) {
    pendingQueue[existingIdx] = userData;
  } else {
    pendingQueue.push(userData);
  }
  flushQueue();
}

export function getUsersCsvFilePath(): string {
  initCsvFile();
  return usersCsvPath;
}
