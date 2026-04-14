import {
  GOOGLE_DRIVE_BACKUP_FILENAME,
} from '../../config/google';

const DRIVE_FILES = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3/files';

function authHeaders(accessToken: string): Record<string, string> {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function findBackupFileId(
  accessToken: string,
): Promise<string | null> {
  const q = encodeURIComponent(
    `name='${GOOGLE_DRIVE_BACKUP_FILENAME.replace(/'/g, "\\'")}' and trashed=false`,
  );
  const url = `${DRIVE_FILES}?spaces=appDataFolder&q=${q}&fields=files(id,name)`;
  const res = await fetch(url, { headers: authHeaders(accessToken) });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`drive_list_failed:${res.status}:${t}`);
  }
  const data = (await res.json()) as { files?: { id: string }[] };
  return data.files?.[0]?.id ?? null;
}

export async function downloadBackupFile(
  accessToken: string,
  fileId: string,
): Promise<string> {
  const url = `${DRIVE_FILES}/${fileId}?alt=media`;
  const res = await fetch(url, { headers: authHeaders(accessToken) });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`drive_download_failed:${res.status}:${t}`);
  }
  return res.text();
}

/**
 * Tạo file trong thư mục ẩn appDataFolder (theo tài khoản Google đã đăng nhập).
 */
export async function createBackupFile(
  accessToken: string,
  jsonBody: string,
): Promise<string> {
  const boundary = 'pfm_boundary';
  const delimiter = `\r\n--${boundary}\r\n`;
  const close = `\r\n--${boundary}--`;

  const metadata = {
    name: GOOGLE_DRIVE_BACKUP_FILENAME,
    parents: ['appDataFolder'],
  };

  const multipartBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    jsonBody +
    close;

  const url = `${UPLOAD_BASE}?uploadType=multipart`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`drive_create_failed:${res.status}:${t}`);
  }
  const created = (await res.json()) as { id?: string };
  if (!created.id) {
    throw new Error('drive_create_no_id');
  }
  return created.id;
}

export async function updateBackupFileContent(
  accessToken: string,
  fileId: string,
  jsonBody: string,
): Promise<void> {
  const url = `${UPLOAD_BASE}/${fileId}?uploadType=media`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonBody,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`drive_update_failed:${res.status}:${t}`);
  }
}
