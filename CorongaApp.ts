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

        configuration.slashCommands.provideSlashCommand({
            command: 'coronga',
            i18nParamsExample: 'insert your text here',
            i18nDescription:"coronga video",
            providesPreview: false,
            async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {


                const [text = ''] = context.getArguments();

                const room = context.getRoom();

                const messageDefault = await read.getEnvironmentReader().getSettings().getValueById('DEFAULT_MESSAGE');

                const preMessage = text.trim() ? text : messageDefault;

                const message = modify.getCreator().startMessage();

                message.setSender(context.getSender());
                message.setText(`${ preMessage && `${preMessage}: `}https://meet.jit.si/telemedicine-${room.id}`);
                message.setRoom(room);

                modify.getCreator().finish(message);

            }
        })

    }
}
