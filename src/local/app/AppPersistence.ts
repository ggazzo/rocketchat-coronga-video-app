import { IPersistence, IPersistenceRead } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';

import IAppDataSource from '../../data/local/app/IAppDataSource';
import PersistenceUtils from '../../utils/PersistenceUtils';

export default class AppPersistence implements IAppDataSource {

    private static ASSOC_CALLBACK_URL(uuid: string): RocketChatAssociationRecord {
        return new RocketChatAssociationRecord(
            RocketChatAssociationModel.MISC,
            'AppPersistence_bbb_url_' + uuid,
        );
    }

    private persisUtils: PersistenceUtils;

    constructor(reader: IPersistenceRead, writer: IPersistence) {
        this.persisUtils = new PersistenceUtils(reader, writer);
    }

    public async getBBBUrl(id: string): Promise<string | undefined> {
        return this.persisUtils.readValue(AppPersistence.ASSOC_CALLBACK_URL(id));
    }

    public async setBBBUrl(url: string, id: string): Promise<void> {
        await this.persisUtils.writeValue(url, AppPersistence.ASSOC_CALLBACK_URL(id));
    }

}
