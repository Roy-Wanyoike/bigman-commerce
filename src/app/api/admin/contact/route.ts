import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const rejection = await requireAdmin()
    if (rejection) return rejection

    const filePath = path.join(process.cwd(), 'data', 'contact-submissions.json')

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ submissions: [], total: 0 })
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const submissions = JSON.parse(fileContent)

    return NextResponse.json({
      submissions,
      total: submissions.length,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch contact submissions' }, { status: 500 })
  }
}
