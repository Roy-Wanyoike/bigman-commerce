import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { safeJsonParse } from '@/lib/utils'

export async function GET() {
  try {
    const rejection = await requireAdmin()
    if (rejection) return rejection

    const filePath = path.join(process.cwd(), 'data', 'contact-submissions.json')

    let fileContent: string
    try {
      fileContent = await fs.readFile(filePath, 'utf-8')
    } catch {
      return NextResponse.json({ success: true, submissions: [], total: 0 })
    }

    const submissions = safeJsonParse(fileContent, [])

    return NextResponse.json({
      success: true,
      submissions,
      total: submissions.length,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'Failed to fetch contact submissions' }, { status: 500 })
  }
}
