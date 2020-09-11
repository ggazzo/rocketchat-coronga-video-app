import { HttpStatusCode, IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest } from '@rocket.chat/apps-engine/definition/api';
import { IApiResponse } from '@rocket.chat/apps-engine/definition/api/IResponse';

export class CallbackEndpoint extends ApiEndpoint {

    public path = 'callback';

    public async get(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence,
    ): Promise<IApiResponse> {
        const roomId = request.query.meetingID;

        if (! await read.getRoomReader().getById(roomId)) {
            return this.json({ status: HttpStatusCode.NOT_FOUND, content: {error: 'Room not found'}});
        }

        return this.json({ status: HttpStatusCode.OK });
    }
}
