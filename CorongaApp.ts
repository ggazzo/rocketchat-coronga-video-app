import { IAppAccessors, IConfigurationExtend, ILogger } from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';

import { CreateVideo } from './commands/create';
import { EndVideo } from './commands/end';
import { GetVideo } from './commands/get';

export class CorongaApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    protected async extendConfiguration(configuration: IConfigurationExtend) {

        const app = this;

        configuration.settings.provideSetting({
            id: 'DEFAULT_MESSAGE',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Default Message',
        });

        configuration.settings.provideSetting({
            id: 'bigbluebutton_server',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Default Message',
        });

        configuration.settings.provideSetting({
            id: 'bigbluebutton_sharedSecret',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Default Message',
        });

        configuration.settings.provideSetting({
            id: 'uniqueID',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Default Message',
        });

        configuration.slashCommands.provideSlashCommand(CreateVideo);
        configuration.slashCommands.provideSlashCommand(EndVideo);
        configuration.slashCommands.provideSlashCommand(GetVideo);

    }
}
