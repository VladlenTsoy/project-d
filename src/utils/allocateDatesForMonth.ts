import dayjs from "dayjs"

/**
 * Генерирует структуру календаря (датами) на месяц — равномерно распределяет публикации
 */
export function allocateDatesForMonth(month: string, postsPerWeek: number) {
    // month format: YYYY-MM
    const start = dayjs(month + "-01")
    const daysInMonth = start.daysInMonth()
    const dates: string[] = []
    for (let d = 1; d <= daysInMonth; d++) dates.push(start.date(d).format("YYYY-MM-DD"))

    // simple allocation: pick every N-th day so avg postsPerWeek achieved
    const weeks = Math.ceil(daysInMonth / 7)
    const totalPosts = postsPerWeek * weeks
    const step = Math.max(1, Math.floor(dates.length / totalPosts))
    const res = []
    for (let i = 0; i < totalPosts && i * step < dates.length; i++) {
        res.push(dates[i * step])
    }
    return res
}