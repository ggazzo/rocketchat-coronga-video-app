import {
    IAppAccessors,
    ILogger,
    IConfigurationExtend,
    IModify,
    IHttp,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';

import { CreateVideo } from './commands/create'
import { GetVideo } from './commands/get';
import { EndVideo } from './commands/end';
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
        })

        configuration.settings.provideSetting({
            id: 'bigbluebutton_server',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Video Conference Base URL',
        })

        configuration.settings.provideSetting({
            id: 'bigbluebutton_sharedSecret',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'API Secret',
        })

        configuration.settings.provideSetting({
            id: 'uniqueID',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Unique ID',
        })

        configuration.settings.provideSetting({
            id: 'callback_url',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Callback URL',
        })

        configuration.settings.provideSetting({
            id: 'callback_token',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Callback Token',
        })


        configuration.slashCommands.provideSlashCommand(CreateVideo);
        configuration.slashCommands.provideSlashCommand(EndVideo);
        configuration.slashCommands.provideSlashCommand(GetVideo);

    }
}


