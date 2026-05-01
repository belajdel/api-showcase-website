'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  AlertTriangle,
  Package,
  TrendingUp,
} from 'lucide-react'
import {
  getStockValue,
  getLowStockProducts,
  getInvoices,
} from '@/lib/api'
import { LoadingSpinner } from '@/components/loading-spinner'

export default function DashboardPage() {
  const [stockValue, setStockValue] = useState<number | null>(null)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [threshold, setThreshold] = useState(5)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlertProducts = async (thresholdValue: number) => {
    try {
      const lowStock = await getLowStockProducts(thresholdValue)
      const products = Array.isArray(lowStock) ? lowStock : []
      setLowStockProducts(products)
      setLowStockCount(products.length)
    } catch (err) {
      console.error('[v0] Error fetching alert products:', err)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        
        // Fetch stock value
        const valueData = await getStockValue()
        setStockValue(typeof valueData === 'number' ? valueData : 0)

        // Fetch low stock products with initial threshold
        await fetchAlertProducts(threshold)

        // Fetch invoices
        const invoiceData = await getInvoices()
        const invoiceList = Array.isArray(invoiceData) ? invoiceData : []
        setInvoices(invoiceList.slice(0, 5)) // Show last 5 invoices
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load dashboard data'
        )
        console.error('[v0] Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    setThreshold(Math.max(0, value))
    fetchAlertProducts(Math.max(0, value))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's your inventory overview.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4">
          <p className="text-sm text-destructive font-medium">{error}</p>
          <p className="text-xs text-destructive/70 mt-1">
            Make sure your API server is running and the base URL is configured correctly.
          </p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Stock Value */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stockValue ? stockValue.toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total inventory value
            </p>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm hover:border-yellow-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Products below threshold
            </p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lowStockProducts.length || '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In inventory system
            </p>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm hover:border-green-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Recent invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Products */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Products</CardTitle>
            <CardDescription>
              Set a threshold to see products below that quantity
            </CardDescription>
            <div className="mt-4 flex items-center gap-2">
              <label htmlFor="threshold" className="text-sm font-medium text-muted-foreground">
                Threshold:
              </label>
              <input
                id="threshold"
                type="number"
                min="0"
                value={threshold}
                onChange={handleThresholdChange}
                className="w-20 px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">units</span>
            </div>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product: any, idx) => (
                    <TableRow key={idx} className="border-border/30">
                      <TableCell className="font-medium">
                        {product.nom || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">
                          {product.quantite || 0}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>All products are well stocked</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Invoices</CardTitle>
            <CardDescription>
              Latest invoices from your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice: any, idx) => (
                    <TableRow key={idx} className="border-border/30">
                      <TableCell className="font-medium">
                        {invoice.numFacture || `INV-${idx + 1}`}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {invoice.dateFacture
                          ? new Date(invoice.dateFacture).toLocaleDateString()
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/30">
                          Created
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No invoices yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
