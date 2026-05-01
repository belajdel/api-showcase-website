'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getInvoices } from '@/lib/api'
import { LoadingSpinner } from '@/components/loading-spinner'
import { InvoiceWizard } from '@/components/invoice-wizard'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showWizard, setShowWizard] = useState(false)

  const fetchInvoices = async () => {
    try {
      setError(null)
      const data = await getInvoices()
      setInvoices(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load invoices'
      )
      console.error('[v0] Invoices error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const handleInvoiceCreated = () => {
    setShowWizard(false)
    fetchInvoices()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your invoices
          </p>
        </div>
        <Button
          onClick={() => setShowWizard(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* Invoices Table */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice: any, idx) => {
                    const lineCount = invoice.ligneFactures?.length || 0
                    const totalAmount = invoice.ligneFactures?.reduce(
                      (sum: number, line: any) => sum + ((line.produit?.prix || 0) * (line.quantite || 0)),
                      0
                    ) || 0

                    return (
                      <TableRow key={idx} className="border-border/30">
                        <TableCell className="font-medium">
                          {invoice.numFacture || `INV-${idx + 1}`}
                        </TableCell>
                        <TableCell>
                          {invoice.numClient || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {invoice.dateFacture
                            ? new Date(invoice.dateFacture).toLocaleDateString()
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {lineCount}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="secondary"
                            className="bg-green-500/10 text-green-700 border-green-500/30"
                          >
                            Created
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No invoices yet. Create your first invoice!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Wizard */}
      <InvoiceWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        onInvoiceCreated={handleInvoiceCreated}
      />
    </div>
  )
}
