import { HttpStatusCode, IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest } from '@rocket.chat/apps-engine/definition/api';
import { IApiResponse } from '@rocket.chat/apps-engine/definition/api/IResponse';

import AppPersistence from '../local/app/AppPersistence';

export class JoinEndpoint extends ApiEndpoint {

    public path = 'join';

    public async get(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence,
    ): Promise<IApiResponse> {

        const urlId = request.query.id;

        const appPersistence = new AppPersistence(read.getPersistenceReader(), persis);
        const bbbUrl = await appPersistence.getBBBUrl(urlId);

        if (!bbbUrl) {
            return this.json({ status: HttpStatusCode.NOT_FOUND, content: { error: `Room ${urlId} not found` } });
        }

        return this.json({ status: HttpStatusCode.TEMPORARY_REDIRECT, headers: { Location: bbbUrl } });
    }
}
