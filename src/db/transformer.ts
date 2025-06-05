 
type DotPathValue = Record<string, any>

export class SettingsMapper {
  static fromApiResponse(api: any): any {
    const { settings } = api.result
    const indexed: any = {
      email: api.result.email,
      updatedAt: Date.now(),
      settings: {
        notifications: {
          communication_emails: false,
          marketing_emails: false,
          social_emails: false,
          security_emails: false,
        },
        security: {
          password: "",
          password_confirmation: "",
        },
        user: {
          display_name: settings.user?.display_name ?? "",
          first_name: "", // assume missing in API
          last_name: "",
          footer_enabled: settings.email_settings?.footer_enabled ?? false,
          secure_email_enabled: settings.email_settings?.secure_email_enabled ?? false,
        },
        timezone: "",
        personalization: settings.personalization ?? { theme: "light", layout: "list" },
        display: settings.display ?? { showMeetings: false, showRightSidebar: false, showCalendar: false, showQuota: false },
        account: {
          quota: {}, // not available in API
          sync: {
            last_synced_at: settings.last_synced_at ?? "",
            sync_status: "",
            sync_error: settings.sync_error ?? "",
          },
          auto_sync: settings.auto_sync,
          folder_labels: {},
          blocked_sent_domain: settings.blocked_sent_domain ?? [],
          blocked_recipients_domain: settings.blocked_recepient_domain ?? [],
          aliases: settings.aliases ?? [],
          catch_emails: settings.catch_emails ?? [],
          forwarding_rules: settings.forwarding_rules ?? {},
          auto_reply: {
            ON_NEW_MESSAGE: {},
            ON_REPLY_MESSAGE: {},
          },
          vacationSender: settings.vacationSender ?? {},
          email_settings: {
            autoShowImages: settings.email_settings?.autoShowImages ?? false,
            keepMessages: settings.email_settings?.keepMessages ?? false,
            excludeSpam: settings.email_settings?.excludeSpam ?? false,
            confirmLinks: settings.email_settings?.confirmLinks ?? false,
            conversationGrouping: settings.email_settings?.conversationGrouping ?? false,
            autoDeleteUnwanted: settings.email_settings?.autoDeleteUnwanted ?? false,
            stickyLabels: settings.email_settings?.stickyLabels ?? false,
            monthly_limit: settings.email_settings?.monthly_limit ?? 0,
            thresold_limit: settings.email_settings?.thresold_limit ?? 0,
          },
          email_privacy: settings.email_privacy ?? {
            autoShowImages: false,
            block_email_tracking: false,
          },
          imap_config: {
            enable_imap: true, // assume always enabled
          },
          smtp_config: settings.smtp_config ?? {
            enable_smtp: false,
            enable_smtp_from_alias: false,
            allow_email_tracking: false,
          },
          signatures: settings.signatures ?? [],
        },
      },
    }

    return indexed
  }

  static fromIndexedDb(indexed: any): any {
    const s = indexed.settings
    const api = {
      id: 0,
      email_id: indexed.email,
      blocked_sent_domain: s.account.blocked_sent_domain,
      blocked_recepient_domain: s.account.blocked_recipients_domain,
      aliases: s.account.aliases,
      forwarding_rules: s.account.forwarding_rules,
      catch_emails: s.account.catch_emails,
      smtp_config: s.account.smtp_config,
      auto_reply: {}, // composed from ON_NEW_MESSAGE/ON_REPLY_MESSAGE if needed
      vacationSender: s.account.vacationSender,
      user: {
        display_name: s.user.display_name,
      },
      personalization: s.personalization,
      email_settings: {
        autoShowImages: s.account.email_settings.autoShowImages,
        keepMessages: s.account.email_settings.keepMessages,
        excludeSpam: s.account.email_settings.excludeSpam,
        confirmLinks: s.account.email_settings.confirmLinks,
        conversationGrouping: s.account.email_settings.conversationGrouping,
        autoDeleteUnwanted: s.account.email_settings.autoDeleteUnwanted,
        stickyLabels: s.account.email_settings.stickyLabels,
        monthly_limit: Number(s.account.email_settings.monthly_limit),
        thresold_limit: Number(s.account.email_settings.thresold_limit),
        is_system_email: false,
        footer_enabled: s.user.footer_enabled,
        system_email_reply: null,
        secure_email_enabled: s.user.secure_email_enabled,
      },
      email_privacy: s.account.email_privacy,
      imap_config: {
        autoShowImages: s.account.email_settings.autoShowImages,
        block_email_tracking: s.account.email_privacy.block_email_tracking,
      },
      display: s.display,
      auto_sync: s.account.auto_sync,
      signatures: s.account.signatures,
      last_synced_at: s.account.sync.last_synced_at,
      sync_error: s.account.sync.sync_error,
    }

    return api
  }

  static applyDelta(target: any, changes: DotPathValue): any {
    const updated = structuredClone(target)
    for (const key in changes) {
      this.update(updated, key, changes[key])
    }
    return updated
  }

  static update(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {}
      }
      current = current[k]
    }
    current[keys[keys.length - 1]] = value
  }
}
