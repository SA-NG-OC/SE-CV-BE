// queues/queue.constants.ts
export const QUEUE_NAMES = {
    MAIL: 'mail',
    UPLOAD: 'upload',
    EMBEDDING: 'embedding',
} as const;

export const MAIL_JOBS = {
    SEND_VERIFICATION: 'send-verification',
    SEND_RESET_PASSWORD: 'send-reset-password',
    SEND_WELCOME: 'send-welcome',
} as const;

export const UPLOAD_JOBS = {
    UPLOAD_AVATAR: 'upload-avatar',
    UPLOAD_CV: 'upload-cv',
} as const;

export const EMBEDDING_JOBS = {
    GENERATE_JOB: 'generate-job-embedding',
    GENERATE_STUDENT: 'generate-student-embedding',
} as const;