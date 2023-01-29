interface UserActivityLog {
    [index: string]: string | null | number,
    userId: (string | null),
    code: number,
    message: string,
    source: string,
    tag: string,
    platform: (string | null),
    studyId: (string | null),
    portfolioId: (string | null),
    assetId: (string | null),
    holdingId: (string | null),
    transactionId: (string | null)
}

export { UserActivityLog }