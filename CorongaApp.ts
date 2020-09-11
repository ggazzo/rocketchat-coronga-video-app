import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import { ApiSecurity, ApiVisibility, IApi } from '@rocket.chat/apps-engine/definition/api';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';

import { CreateVideo } from './src/commands/create';
import { CallbackEndpoint } from './src/endpoint/CallbackEndpoint';
import { JoinEndpoint } from './src/endpoint/JoinEndpoint';

export class CorongaApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async initialize(configurationExtend: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {
        await this.extendConfiguration(configurationExtend);
        await configurationExtend.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [
                new JoinEndpoint(this),
                new CallbackEndpoint(this),
            ],
        } as IApi);
    }

    protected async extendConfiguration(configuration: IConfigurationExtend) {

        configuration.settings.provideSetting({
            id: 'app_version',
            type: SettingType.STRING,
            packageValue: this.getVersion(),
            required: false,
            public: false,
            hidden: true,
            i18nLabel: 'App Version',
        });

        configuration.settings.provideSetting({
            id: 'app_id',
            type: SettingType.STRING,
            packageValue: this.getID(),
            required: false,
            public: false,
            hidden: true,
            i18nLabel: 'App Id',
        });

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
            i18nLabel: 'Video Conference Base URL',
        });

        configuration.settings.provideSetting({
            id: 'bigbluebutton_sharedSecret',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'BBB API Secret',
        });

        configuration.settings.provideSetting({
            id: 'uniqueID',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Unique ID',
        });

        configuration.settings.provideSetting({
            id: 'callback_url',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Callback URL',
        });

        configuration.slashCommands.provideSlashCommand(CreateVideo);

    }

}
