import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvTest() {
  try {
    const content = readFileSync(resolve(process.cwd(), '.env.test'), 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex).trim()
      const val = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '')
      process.env[key] = val
    }
  } catch {}
}

export function setup() {
  loadEnvTest()
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
}
