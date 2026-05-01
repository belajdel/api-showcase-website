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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { getProducts } from '@/lib/api'
import { LoadingSpinner } from '@/components/loading-spinner'
import { AddProductDialog } from '@/components/add-product-dialog'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  const fetchProducts = async () => {
    try {
      setError(null)
      const data = await getProducts()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load products'
      )
      console.error('[v0] Products error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleProductAdded = () => {
    setShowDialog(false)
    fetchProducts()
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
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-2">
            Manage your product inventory
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* Products Table */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            {products.length} product{products.length !== 1 ? 's' : ''} in inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Stock Value</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product: any, idx) => {
                    const stockValue = (product.prix || 0) * (product.quantite || 0)
                    const isLowStock = product.quantite < 5

                    return (
                      <TableRow key={idx} className="border-border/30">
                        <TableCell className="font-medium">
                          {product.nom || 'Unknown Product'}
                        </TableCell>
                        <TableCell className="text-right">
                          ${(product.prix || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.quantite || 0}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${stockValue.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          {isLowStock ? (
                            <Badge
                              variant="outline"
                              className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30"
                            >
                              Low Stock
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-700 border-green-500/30"
                            >
                              In Stock
                            </Badge>
                          )}
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
                No products yet. Create your first product!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <AddProductDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onProductAdded={handleProductAdded}
      />
    </div>
  )
}
