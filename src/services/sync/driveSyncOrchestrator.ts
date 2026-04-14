import { useDriveSyncStore } from '../../store/driveSyncStore';
import { tryParseAndApplyBackup } from './applySnapshot';
import { buildAppBackup } from './buildSnapshot';
import {
  createBackupFile,
  downloadBackupFile,
  findBackupFileId,
  updateBackupFileContent,
} from './googleDrive';

export async function uploadLocalDataToDrive(
  accessToken: string,
  linkedEmail: string,
): Promise<void> {
  const json = JSON.stringify(buildAppBackup());
  const state = useDriveSyncStore.getState();
  let fid = state.fileId;

  if (fid) {
    await updateBackupFileContent(accessToken, fid, json);
  } else {
    const existing = await findBackupFileId(accessToken);
    if (existing) {
      await updateBackupFileContent(accessToken, existing, json);
      fid = existing;
    } else {
      fid = await createBackupFile(accessToken, json);
    }
  }

  state.markLinked(linkedEmail, fid);
  state.setLastSync(new Date().toISOString(), null);
}

export async function downloadAndApplyDriveBackup(
  accessToken: string,
  fileId: string,
  linkedEmail: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const raw = await downloadBackupFile(accessToken, fileId);
  const result = tryParseAndApplyBackup(raw);
  if (result.ok) {
    useDriveSyncStore.getState().markLinked(linkedEmail, fileId);
    useDriveSyncStore.getState().setLastSync(new Date().toISOString(), null);
  }
  return result;
}
