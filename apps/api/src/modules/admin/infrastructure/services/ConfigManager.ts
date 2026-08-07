import fs from 'fs';
import path from 'path';

import { createModuleLogger } from '@/core/logger.js';

const log = createModuleLogger('ConfigManager');

export interface SystemConfig {
  featureFlags: {
    aiReader: boolean;
    aiSearch: boolean;
    zenQuotes: boolean;
    stripeLiveMode: boolean;
    antiCheatDaemon: boolean;
    maintenanceMode: boolean;
  };
  emailTemplates: Array<{
    id: string;
    name: string;
    subject: string;
    body: string;
  }>;
  apiKeys: Array<{
    id: string;
    name: string;
    keyMasked: string;
    status: string;
  }>;
}

const DEFAULT_CONFIG: SystemConfig = {
  featureFlags: {
    aiReader: true,
    aiSearch: true,
    zenQuotes: true,
    stripeLiveMode: true,
    antiCheatDaemon: true,
    maintenanceMode: false,
  },
  emailTemplates: [
    {
      id: 'candidate_onboarding',
      name: 'Candidate Onboarding Invitation',
      subject: 'Welcome to MicroIntern - Complete Your eKYC Onboarding',
      body: 'Hello {{name}},\n\nWelcome to MicroIntern! Please click the link below to verify your account and start your real-world skill trials.\n\nBest regards,\nThe MicroIntern Team',
    },
    {
      id: 'interview_scheduled',
      name: 'Interview Scheduled Notification',
      subject: 'Interview Confirmed: {{trialTitle}}',
      body: 'Hello {{name}},\n\nYour technical panel interview for {{trialTitle}} has been scheduled successfully. Please find details below:\n\nDate/Time: {{dateTime}}\nMeeting Link: {{meetingLink}}',
    },
    {
      id: 'trial_graded',
      name: 'Assessment Evaluation Graded',
      subject: 'Your Skill Trial Score is Available for {{trialTitle}}',
      body: 'Hello {{name}},\n\nCongratulations! Your workspace solution for {{trialTitle}} has been graded. Your total score is {{score}}%.\n\nFeedback:\n{{feedback}}',
    },
  ],
  apiKeys: [
    { id: 'openai', name: 'OpenAI Evaluation API Key', keyMasked: 'sk-proj-...8aK9', status: 'HEALTHY' },
    { id: 'stripe', name: 'Stripe Escrow Connect API Key', keyMasked: 'rk_live_...2A0d', status: 'HEALTHY' },
    { id: 'tavily', name: 'Tavily Web Search API Key', keyMasked: 'tvly-...fD82', status: 'HEALTHY' },
  ],
};

const CONFIG_PATH = path.resolve(
  process.cwd(),
  'apps/api/src/modules/admin/infrastructure/services/admin_config.json'
);

export class ConfigManager {
  private static instance: ConfigManager | null = null;
  private cachedConfig: SystemConfig | null = null;

  private constructor() {
    this.ensureConfigFileExists();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private ensureConfigFileExists(): void {
    try {
      const dir = path.dirname(CONFIG_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (!fs.existsSync(CONFIG_PATH)) {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf8');
        log.info('Default system configurations generated at admin_config.json');
      }
    } catch (err) {
      log.error({ err }, 'Failed to initialize system settings JSON file');
    }
  }

  public getConfig(): SystemConfig {
    try {
      if (this.cachedConfig) {
        return this.cachedConfig;
      }
      this.ensureConfigFileExists();
      const content = fs.readFileSync(CONFIG_PATH, 'utf8');
      this.cachedConfig = JSON.parse(content) as SystemConfig;
      return this.cachedConfig;
    } catch (err) {
      log.error({ err }, 'Failed to read system settings, returning default configuration');
      return DEFAULT_CONFIG;
    }
  }

  public saveConfig(config: Partial<SystemConfig>): SystemConfig {
    try {
      const current = this.getConfig();
      const updated = {
        ...current,
        ...config,
        featureFlags: {
          ...current.featureFlags,
          ...(config.featureFlags ?? {}),
        },
      };

      fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), 'utf8');
      this.cachedConfig = updated;
      log.info('Platform system configurations updated successfully');
      return updated;
    } catch (err) {
      log.error({ err }, 'Failed to write updated settings to config file');
      throw err;
    }
  }
}
