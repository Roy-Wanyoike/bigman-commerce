import { NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'contact-submissions.json')

async function readSubmissions(): Promise<unknown[]> {
  try {
    const raw = await readFile(DATA_FILE, 'utf-8')
    return JSON.parse(raw) as unknown[]
  } catch {
    return []
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data

    await mkdir(DATA_DIR, { recursive: true })

    const submissions = await readSubmissions()

    const entry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
    }

    submissions.push(entry)

    await writeFile(DATA_FILE, JSON.stringify(submissions, null, 2), 'utf-8')

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message. We will get back to you soon.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
