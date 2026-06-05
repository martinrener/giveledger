import fs from 'fs'
import path from 'path'
import type {
    Reporter,
    TestCase,
    TestResult,
    FullResult,
    Suite,
} from '@playwright/test/reporter'

interface HistoryEntry {
    runId:    string
    status:   string
    duration: number
    flaky:    boolean
}

interface TestRecord {
    title:    string
    testId:   string
    status:   string
    duration: number
    retries:  number
    flaky:    boolean
    history:  HistoryEntry[]
}

interface ReportFile {
    runId:   string
    summary: {
        total:           number
        passed:          number
        failed:          number
        flaky:           number
        skipped:         number
        durationSeconds: number
    }
    tests: TestRecord[]
}

const REPORT_PATH  = path.resolve(process.cwd(), `test-results/report.json`)
const HISTORY_SIZE = 10

export default class CustomReporter implements Reporter {
    private readonly runId: string
    private readonly previousHistory: Map<string, HistoryEntry[]>
    private readonly records: TestRecord[] = []
    private startTime = 0

    constructor() {
        this.runId           = Date.now().toString()
        this.previousHistory = this.loadHistory()
    }

    onBegin(_config: Parameters<NonNullable<Reporter['onBegin']>>[0], _suite: Suite): void {
        this.startTime = Date.now()
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        const annotation = test.annotations.find(a => a.type === `id`)
        const testId     = annotation?.description ?? `NO-ID`
        const flaky      = result.retry > 0 && result.status === `passed`

        const prior   = this.previousHistory.get(test.title) ?? []
        const entry: HistoryEntry = {
            runId:    this.runId,
            status:   result.status,
            duration: result.duration,
            flaky,
        }
        const history = [...prior, entry].slice(-HISTORY_SIZE)

        this.records.push({
            title:    test.title,
            testId,
            status:   result.status,
            duration: result.duration,
            retries:  result.retry,
            flaky,
            history,
        })
    }

    async onEnd(result: FullResult): Promise<void> {
        const durationSeconds = (Date.now() - this.startTime) / 1000

        let passed  = 0
        let failed  = 0
        let flaky   = 0
        let skipped = 0

        for (const r of this.records) {
            if (r.status === `skipped`) {
                skipped++
            } else if (r.flaky) {
                flaky++
                passed++
            } else if (r.status === `passed`) {
                passed++
            } else {
                failed++
            }
        }

        const report: ReportFile = {
            runId: this.runId,
            summary: {
                total: this.records.length,
                passed,
                failed,
                flaky,
                skipped,
                durationSeconds: Math.round(durationSeconds * 10) / 10,
            },
            tests: this.records,
        }

        fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
        fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2))

        const sep = `─`.repeat(52)
        console.log(`\n${sep}`)
        console.log(`  Run ${this.runId} · ${durationSeconds.toFixed(1)}s`)
        console.log(
            `  ${this.records.length} total  ` +
            `✓ ${passed} passed  ` +
            `✘ ${failed} failed  ` +
            `~ ${flaky} flaky  ` +
            `– ${skipped} skipped`
        )
        console.log(`${sep}\n`)
    }

    private loadHistory(): Map<string, HistoryEntry[]> {
        const map = new Map<string, HistoryEntry[]>()
        if (!fs.existsSync(REPORT_PATH)) return map
        try {
            const data = JSON.parse(fs.readFileSync(REPORT_PATH, `utf8`)) as ReportFile
            for (const t of data.tests ?? []) {
                map.set(t.title, t.history ?? [])
            }
        } catch {
            // corrupt or empty file — start fresh
        }
        return map
    }
}
