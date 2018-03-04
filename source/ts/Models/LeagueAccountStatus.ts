// tslint:disable:no-bitwise
export enum LeagueAccountStatus {
    None = 1 << 0,
    LoggedIn = 1 << 1,
    ChampionSelect = 1 << 2,
    ConnectingToGame = 1 << 3,
    InGame = 1 << 4,
    EndOfGame = 1 << 5,
    Reconnecting = 1 << 6,
}
