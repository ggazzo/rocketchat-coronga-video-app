import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { IRead, IModify, IHttp, IPersistence } from "@rocket.chat/apps-engine/definition/accessors";

import BigBlueButtonApi from '../lib/bbbApi';
export const GetVideo = {
    command: 'getvideo',
    i18nParamsExample: 'insert your text here',
    i18nDescription: 'generate link for video conference',
    providesPreview: false,
    async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        try {

            const [text = ''] = context.getArguments();

            const room = context.getRoom();

            const messageDefault = await read.getEnvironmentReader().getSettings().getValueById('DEFAULT_MESSAGE');

            const url = 'https://video.telemedicine.rocket.chat';//await read.getEnvironmentReader().getSettings().getValueById('bigbluebutton_server');
            const secret = 'OdrexHOAW4imRCMoEGqVHUTkRaCwXmi6X47ZDnZmLA';//await read.getEnvironmentReader().getSettings().getValueById('bigbluebutton_sharedSecret');

            const meetingID = await read.getEnvironmentReader().getSettings().getValueById('uniqueID') + room.id;

            const api = new BigBlueButtonApi(`${ url }/bigbluebutton/api`, secret);

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

            if(!returnCode) {
                return;
            }

            // const hookApi = api.urlFor('hooks/create', {
            //     meetingID,
            //     callbackURL: `api/v1/videoconference.bbb.update/${ meetingID }`,
            // });
            // console.log(hookApi);
            // console.log(await http.get(hookApi));



            const guestUrl = api.urlFor('join', {
                password: 'mp', // mp if moderator ap if attendee
                meetingID,
                fullName: "Visitante",
                userID: 'xxxx',
                joinViaHtml5: true,
                // avatarURL: Meteor.absoluteUrl(`avatar/${ user.username }`),
                // clientURL: `${ url }/html5client/join`,
            })

            const preMessage = text.trim() ? text : messageDefault;


            const attendantMessage = modify.getCreator().startMessage();

            const attendantUrl = api.urlFor('join', {
                password: 'mp', // mp if moderator ap if attendee
                meetingID,
                fullName: "Atendente",
                userID: 'xxxxx',
                joinViaHtml5: true,
                // avatarURL: Meteor.absoluteUrl(`avatar/${ user.username }`),
            });

            attendantMessage.setSender(context.getSender());
            attendantMessage.setText(attendantUrl);
            attendantMessage.setRoom(room);

            modify.getNotifier().notifyUser(context.getSender(), attendantMessage.getMessage());

        } catch (error) {
            console.log(error);
        }


    // // const hookResult = HTTP.get(hookApi);

    // // if (hookResult.statusCode !== 200) {
    // // 	// TODO improve error logging
    // // 	console.log({ hookResult });
    // // 	return;
    // // }

    //     return {
    //         url: api.urlFor('join', {
    //             password: 'mp', // mp if moderator ap if attendee
    //             meetingID,
    //             fullName: user.username,
    //             userID: user._id,
    //             joinViaHtml5: true,
    //             avatarURL: Meteor.absoluteUrl(`avatar/${ user.username }`),
    //             // clientURL: `${ url }/html5client/join`,
    //         }),
    //     };
    //     }

        // const preMessage = text.trim() ? text : messageDefault;

        // const message = modify.getCreator().startMessage();

        // message.setSender(context.getSender());
        // message.setText(`${ preMessage && `${preMessage}: `}https://meet.jit.si/telemedicine-${room.id}`);
        // message.setRoom(room);

        // modify.getCreator().finish(message);

    }
}
