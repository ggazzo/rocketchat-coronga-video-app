export default interface IAppDataSource {

    getBBBUrl(uuid: string): Promise<string | undefined>;

    setBBBUrl(url: string, uuid: string): Promise<void>;

}
