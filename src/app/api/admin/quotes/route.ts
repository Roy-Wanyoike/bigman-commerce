import { getServerSession } from '@/lib/auth'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dirPath = path.join(process.cwd(), 'data', 'quotes')

    if (!fs.existsSync(dirPath)) {
      return NextResponse.json({ quotes: [], total: 0 })
    }

    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.json'))

    const quotes = files.map((file) => {
      try {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf-8')
        return JSON.parse(content)
      } catch {
        return null
      }
    }).filter(Boolean)

    // Sort by requested date descending
    quotes.sort((a, b) => {
      const dateA = new Date(a.requestedAt).getTime()
      const dateB = new Date(b.requestedAt).getTime()
      return dateB - dateA
    })

    return NextResponse.json({
      quotes,
      total: quotes.length,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}
