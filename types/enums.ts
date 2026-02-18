export enum SubmissionStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  DECLINED = 'Declined',
}

export enum SubmissionPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum TaskCategory {
  MANUAL = 'MANUAL',
  AUTOMATED = 'AUTOMATED',
  SPECIAL = 'SPECIAL',
}

export enum TaskAction {
  JOIN_TELEGRAM_CHANNEL = 'JOIN_TELEGRAM_CHANNEL',
  JOIN_DISCORD_CHANNEL = 'JOIN_DISCORD_CHANNEL',
  RETWEET = 'RETWEET',
  COMMENT_TWEET = 'COMMENT_TWEET',
}