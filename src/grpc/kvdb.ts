import { Level } from 'level';

export const lockStatusDB = new Level('./lock_status', { valueEncoding: 'json' });
