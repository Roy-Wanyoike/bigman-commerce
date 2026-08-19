'use client'

import React, { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  Upload,
  ArrowLeft,
  Loader2,
  FileSpreadsheet,
  X,
} from 'lucide-react'

const CSV_HEADERS = [
  'Category', 'Subcategory', 'Brand', 'Product Name', 'Model', 'SKU',
  'Description', 'Price', 'Sale Price', 'Condition', 'Warranty (months)',
  'Stock', 'RAM', 'Storage', 'CPU', 'GPU', 'Screen',
  'Image URL', 'Image Source', 'Image License Status',
]

function generateTemplateCsv(): string {
  const headers = CSV_HEADERS.join(',')
  const row1 = [
    'Laptops', 'Gaming Laptops', 'ASUS', 'ASUS ROG Strix G16 2024',
    'G614JIR-RX754WS', 'ASUS-ROG-G16-2024',
    'High-performance gaming laptop with Intel 14th Gen processor',
    '245000', '229000', 'NEW', '24', '15',
    '16GB DDR5', '512GB NVMe SSD', 'Intel Core i7-14650HX',
    'NVIDIA RTX 4070 8GB', '16.0" FHD+ 165Hz',
    'https://example.com/rog-strix-g16.jpg', 'Manufacturer', 'Verified',
  ].join(',')
  const row2 = [
    'Laptops', '', 'Lenovo', 'Lenovo ThinkPad X1 Carbon Gen 11',
    'X1C11-004', 'LNV-X1C-GEN11-004',
    'Premium ultrabook for business professionals',
    '185000', '', 'NEW', '36', '8',
    '16GB LPDDR5', '256GB SSD', 'Intel Core i7-1365U',
    'Intel Iris Xe', '14" 2.8K OLED',
    '', '', '',
  ].join(',')
  return `${headers}\n${row1}\n${row2}\n`
}

interface ParsedRow {
  [key: string]: string
}

interface ImportResult {
  imported: number
  errors: { row: number; message: string }[]
  warnings: { row: number; message: string }[]
  total: number
}

export default function CsvImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleFile = useCallback((f: File) => {
    setFile(f)
    setResult(null)
    setApiError(null)

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = (results.data as ParsedRow[]).slice(0, 5)
        setParsedRows(rows)
        setParsedHeaders(results.meta.fields || [])
      },
      error: (err) => {
        setApiError(`Failed to parse CSV: ${err.message}`)
        setParsedRows([])
        setParsedHeaders([])
      },
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      handleFile(droppedFile)
    } else {
      setApiError('Please upload a .csv file')
    }
  }, [handleFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }, [handleFile])

  const handleDownloadTemplate = useCallback(() => {
    const csv = generateTemplateCsv()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bigman-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const clearFile = useCallback(() => {
    setFile(null)
    setParsedRows([])
    setParsedHeaders([])
    setResult(null)
    setApiError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setResult(null)
    setApiError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setApiError(data.error || 'Import failed')
        return
      }

      setResult(data as ImportResult)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setImporting(false)
    }
  }

  // Display columns for preview (pick the first 6 relevant ones)
  const previewColumns = parsedHeaders.slice(0, 8)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon" className="size-8">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Import CSV</h1>
            <p className="text-muted-foreground">
              Bulk import products from a CSV file. Max 500 rows per import.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleDownloadTemplate}>
          <Download className="size-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Upload area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="size-5" />
            Upload CSV File
          </CardTitle>
          <CardDescription>
            Drag and drop or click to browse. Only .csv files are accepted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={[
                'border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors',
                isDragging
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-muted-foreground/25 hover:border-emerald-400 hover:bg-muted/50',
              ].join(' ')}
            >
              <Upload className="size-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">
                Drop your CSV file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Accepted format: .csv (max 500 rows)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div className="flex items-center gap-3 min-w-0">
                <FileSpreadsheet className="size-8 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearFile()
                  }}
                >
                  <X className="size-3 mr-1" /> Remove
                </Button>
                <Button
                  size="sm"
                  onClick={handleImport}
                  disabled={importing}
                >
                  {importing ? (
                    <Loader2 className="size-4 mr-1 animate-spin" />
                  ) : (
                    <Upload className="size-4 mr-1" />
                  )}
                  {importing ? 'Importing...' : 'Import Products'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Error */}
      {apiError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Import Error</p>
            <p className="text-sm text-red-700 mt-0.5">{apiError}</p>
          </div>
        </div>
      )}

      {/* Preview table */}
      {parsedRows.length > 0 && !result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview (first 5 rows)</CardTitle>
            <CardDescription>
              Review the data below before importing. Only the first 5 rows are shown.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">#</TableHead>
                    {previewColumns.map((col) => (
                      <TableHead key={col} className="whitespace-nowrap">
                        {col}
                      </TableHead>
                    ))}
                    {parsedHeaders.length > 8 && (
                      <TableHead className="text-muted-foreground">
                        +{parsedHeaders.length - 8} more
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedRows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-muted-foreground text-xs">
                        {idx + 2}
                      </TableCell>
                      {previewColumns.map((col) => (
                        <TableCell key={col} className="max-w-[200px] truncate">
                          <span className="text-sm" title={row[col] || ''}>
                            {row[col] || <span className="text-muted-foreground">—</span>}
                          </span>
                        </TableCell>
                      ))}
                      {parsedHeaders.length > 8 && (
                        <TableCell className="text-muted-foreground text-xs">
                          ...
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="size-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-700">{result.imported}</p>
                    <p className="text-sm text-muted-foreground">Imported</p>
                  </div>
                </div>
                {result.errors.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-red-100">
                      <AlertCircle className="size-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-700">{result.errors.length}</p>
                      <p className="text-sm text-muted-foreground">Errors</p>
                    </div>
                  </div>
                )}
                {result.warnings.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-amber-100">
                      <AlertTriangle className="size-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-700">{result.warnings.length}</p>
                      <p className="text-sm text-muted-foreground">Warnings</p>
                    </div>
                  </div>
                )}
                <div className="sm:ml-auto flex items-center gap-2">
                  <Badge variant="outline">{result.total} total rows</Badge>
                  <Link href="/admin/products?status=IMPORTED">
                    <Button variant="outline" size="sm">
                      View Imported Products
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Errors */}
          {result.errors.length > 0 && (
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                  <AlertCircle className="size-4" /> Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto rounded-lg border border-red-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-red-50">
                        <TableHead className="w-[80px]">Row</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.errors.map((err, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-sm">{err.row}</TableCell>
                          <TableCell className="text-sm text-red-700">{err.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <Card className="border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="size-4" /> Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto rounded-lg border border-amber-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-amber-50">
                        <TableHead className="w-[80px]">Row</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.warnings.map((warn, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-sm">{warn.row}</TableCell>
                          <TableCell className="text-sm text-amber-700">{warn.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions after import */}
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={clearFile}>
              Import Another File
            </Button>
            <Link href="/admin/products">
              <Button variant="outline">
                <ArrowLeft className="size-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
