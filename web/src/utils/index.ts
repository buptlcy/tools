function toFixed2(num: number): number {
    return Math.round(Number(num) * 100) / 100
}

export default {
    toFixed2,
}
