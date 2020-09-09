import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';

import BigBlueButtonApi from '../lib/bbbApi';

export const EndVideo = {
    command: 'endvideo',
    i18nParamsExample: 'insert your text here',
    i18nDescription: 'generate link for video conference',
    providesPreview: false,
    async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        try {

            const [text = ''] = context.getArguments();

            const room = context.getRoom();

            const messageDefault = await read.getEnvironmentReader().getSettings().getValueById('DEFAULT_MESSAGE');

            const url = await read.getEnvironmentReader().getSettings().getValueById('bigbluebutton_server');
            const secret = await read.getEnvironmentReader().getSettings().getValueById('bigbluebutton_sharedSecret');
            const meetingID = await read.getEnvironmentReader().getSettings().getValueById('uniqueID') + room.id;

            const api = new BigBlueButtonApi(`${url}/bigbluebutton/api`, secret);

            const createUrl = api.urlFor('create', {
                name: room.type === 'd' ? 'Direct' : room.displayName,
                meetingID,
                attendeePW: 'ap',
                moderatorPW: 'mp',
                welcome: '<br>Welcome to <b>%%CONFNAME%%</b>!',
                meta_html5chat: false,
                meta_html5navbar: false,
                meta_html5autoswaplayout: true,
                meta_html5autosharewebcam: false,
                meta_html5hidepresentation: true,
            });

            const { content = '' } = await http.get(createUrl);
            const returnCode = content.match(/<returncode>(.*)<\/returncode>/);

            if (!returnCode) {
                return;
            }
            const guestUrl = api.urlFor('join', {
                password: 'mp', // mp if moderator ap if attendee
                meetingID,
                fullName: 'Visitante',
                userID: 'xxxx',
                joinViaHtml5: true,
            });

            const preMessage = text.trim() ? text : messageDefault;

            const attendantMessage = modify.getCreator().startMessage();

            const endApi = api.urlFor('end', {
                meetingID,
                password: 'mp', // mp if moderator ap if attendee
            });

            const endApiResult = await http.get(endApi);

            if (endApiResult.statusCode !== 200) {

                attendantMessage.setSender(context.getSender());
                attendantMessage.setText('Erro ao finalizar video');
                attendantMessage.setRoom(room);

                modify.getNotifier().notifyUser(context.getSender(), attendantMessage.getMessage());
                return;
            }

            const attendantUrl = api.urlFor('join', {
                password: 'mp', // mp if moderator ap if attendee
                meetingID,
                fullName: 'Atendente',
                userID: 'xxxxx',
                joinViaHtml5: true,
                // avatarURL: Meteor.absoluteUrl(`avatar/${ user.username }`),
            });

            attendantMessage.setSender(context.getSender());
            attendantMessage.setText('Video finalizado');
            attendantMessage.setRoom(room);

            modify.getNotifier().notifyUser(context.getSender(), attendantMessage.getMessage());

        } catch (error) {
            console.log(error);
        }

    },
};
