import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { RoomType } from '@rocket.chat/apps-engine/definition/rooms';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';

import BigBlueButtonApi from '../lib/bbbApi';
import AppPersistence from '../local/app/AppPersistence';
import ID from '../utils/ID';

export const CreateVideo = {
    command: 'video',
    i18nParamsExample: 'insert your text here',
    i18nDescription: 'generate link for video conference',
    providesPreview: false,
    async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        try {
            let departmentName;

            const [text = ''] = context.getArguments();
            const room = context.getRoom();
            const sender = context.getSender();

            const siteurl = await read.getEnvironmentReader().getServerSettings().getValueById('Site_Url');
            const messageDefault = await read.getEnvironmentReader().getSettings().getValueById('DEFAULT_MESSAGE');
            const bbbUrl = await read.getEnvironmentReader().getSettings().getValueById('bigbluebutton_server');
            const secret = await read.getEnvironmentReader().getSettings().getValueById('bigbluebutton_sharedSecret');
            const callbackUrl = await read.getEnvironmentReader().getSettings().getValueById('callback_url');
            const appVersion = await read.getEnvironmentReader().getSettings().getById('app_version');
            const meetingID = await read.getEnvironmentReader().getSettings().getValueById('uniqueID') + room.id;

            const api = new BigBlueButtonApi(`${bbbUrl}/bigbluebutton/api`, secret);

            const res = await http.get(`${siteurl}/api/info`);
            const rocketVersion = res.data.version;

            if (room.type === RoomType.LIVE_CHAT) {
                departmentName = room['department'].name;
            }

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
                meta_endCallbackUrl: encodeURI(callbackUrl),
                meta_bbb_roomId: room.id,
                meta_bbb_roomType: room.type,
                meta_bbb_originTag: appVersion.packageValue,
                meta_bbb_originVersion: rocketVersion,
                meta_bbb_originDomain: siteurl,
                meta_bbb_originName: 'Rocket.Chat',
                meta_bbb_attendeeId: sender.id,
                ...(room.type === RoomType.LIVE_CHAT) && { meta_bbb_departmentName: departmentName },
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

            // save guest url in persistence
            const appId = await read.getEnvironmentReader().getSettings().getValueById('app_id');
            const appPersistence = new AppPersistence(read.getPersistenceReader(), persis);
            const urlId = ID();
            await appPersistence.setBBBUrl(guestUrl, urlId);

            const preMessage = text.trim() ? text : messageDefault;

            const guestMessage = modify.getCreator().startMessage();

            guestMessage.setSender(context.getSender());
            guestMessage.setText(`${preMessage && `${preMessage}: `}${siteurl}/api/apps/public/${appId}/join?id=${urlId}`);
            guestMessage.setRoom(room);

            await modify.getCreator().finish(guestMessage);

            const attendantMessage = modify.getCreator().startMessage();

            const attendantUrl = api.urlFor('join', {
                password: 'mp', // mp if moderator ap if attendee
                meetingID,
                fullName: 'Atendente',
                userID: sender.id,
                joinViaHtml5: true,
            });

            attendantMessage.setSender(context.getSender());
            attendantMessage.setText(attendantUrl);
            attendantMessage.setRoom(room);

            await modify.getNotifier().notifyUser(context.getSender(), attendantMessage.getMessage());

        } catch (error) {
            console.log(error);
        }

    },
};
