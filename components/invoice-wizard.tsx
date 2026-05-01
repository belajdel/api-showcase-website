'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { createInvoice, getProducts } from '@/lib/api'

const formSchema = z.object({
  numClient: z.string().min(1, 'Client number is required'),
  dateFacture: z.string().min(1, 'Date is required'),
})

type FormValues = z.infer<typeof formSchema>

interface LineItem {
  produitId: number
  produitNom: string
  produitPrix: number
  quantite: number
}

interface InvoiceWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvoiceCreated: () => void
}

export function InvoiceWizard({
  open,
  onOpenChange,
  onInvoiceCreated,
}: InvoiceWizardProps) {
  const [step, setStep] = useState(1)
  const [products, setProducts] = useState<any[]>([])
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [productsLoading, setProductsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numClient: '',
      dateFacture: new Date().toISOString().split('T')[0],
    },
  })

  // Fetch products when dialog opens
  useEffect(() => {
    if (open && step === 2) {
      fetchProducts()
    }
  }, [open, step])

  const fetchProducts = async () => {
    try {
      setProductsLoading(true)
      const data = await getProducts()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[v0] Failed to fetch products:', err)
      setError('Failed to load products')
    } finally {
      setProductsLoading(false)
    }
  }

  const handleAddLineItem = () => {
    if (!selectedProductId) {
      setError('Please select a product')
      return
    }

    const product = products.find(
      (p) => p.id === parseInt(selectedProductId)
    )
    if (!product) return

    // Check if product already in line items
    if (lineItems.some((item) => item.produitId === product.id)) {
      setError('Product already added. Remove and re-add to change quantity.')
      return
    }

    // Validate quantity against available stock
    if (selectedQuantity > product.quantite) {
      setError(
        `Only ${product.quantite} units available. Current stock: ${product.quantite}`
      )
      return
    }

    setError(null)
    setLineItems([
      ...lineItems,
      {
        produitId: product.id,
        produitNom: product.nom,
        produitPrix: product.prix,
        quantite: selectedQuantity,
      },
    ])

    setSelectedProductId('')
    setSelectedQuantity(1)
  }

  const handleRemoveLineItem = (produitId: number) => {
    setLineItems(lineItems.filter((item) => item.produitId !== produitId))
  }

  const handleNextStep = async () => {
    if (step === 1) {
      const isValid = await form.trigger()
      if (isValid) {
        setStep(2)
      }
    } else if (step === 2) {
      if (lineItems.length === 0) {
        setError('Please add at least one item to the invoice')
        return
      }
      setStep(3)
    }
  }

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      const numFacture = `INV-${Date.now()}`
      const invoiceData = {
        numFacture,
        dateFacture: form.getValues('dateFacture'),
        numClient: form.getValues('numClient'),
        ligneFactures: lineItems.map((item) => ({
          produit: { id: item.produitId },
          quantite: item.quantite,
        })),
      }

      await createInvoice(invoiceData)

      // Reset form and close
      form.reset()
      setStep(1)
      setLineItems([])
      setSelectedProductId('')
      setSelectedQuantity(1)
      onOpenChange(false)
      onInvoiceCreated()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create invoice'
      )
      console.error('[v0] Invoice creation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = lineItems.reduce(
    (sum, item) => sum + item.produitPrix * item.quantite,
    0
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Step {step} of 3 - {step === 1 ? 'Client Information' : step === 2 ? 'Add Items' : 'Review & Submit'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Step 1: Client Information */}
        {step === 1 && (
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="numClient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., CLI-001"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateFacture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}

        {/* Step 2: Add Items */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Product Selection */}
            <div className="space-y-3 p-4 rounded-lg border border-border/30 bg-muted/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Product
                  </label>
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                    disabled={productsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          productsLoading ? 'Loading products...' : 'Select a product'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.nom} (${product.prix.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={(e) =>
                      setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    placeholder="1"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleAddLineItem}
                    className="w-full"
                    disabled={!selectedProductId || productsLoading}
                  >
                    Add Item
                  </Button>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            {lineItems.length > 0 ? (
              <div className="border border-border/30 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 bg-muted/50">
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.produitId} className="border-border/30">
                        <TableCell className="font-medium">
                          {item.produitNom}
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.produitPrix.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantite}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${(item.produitPrix * item.quantite).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveLineItem(item.produitId)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Total */}
                <div className="bg-muted/50 border-t border-border/30 p-4 text-right">
                  <p className="text-lg font-bold">
                    Total: <span className="text-primary">${totalAmount.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-border/30 rounded-lg text-muted-foreground">
                <p>No items added yet</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Invoice Summary */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/20 border border-border/30">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Client Number</p>
                <p className="font-semibold">{form.getValues('numClient')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Invoice Date</p>
                <p className="font-semibold">
                  {new Date(form.getValues('dateFacture')).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Line Items Summary */}
            <div className="border border-border/30 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 bg-muted/50">
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.produitId} className="border-border/30">
                      <TableCell className="font-medium">
                        {item.produitNom}
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.produitPrix.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantite}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${(item.produitPrix * item.quantite).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Total */}
              <div className="bg-muted/50 border-t border-border/30 p-4 text-right">
                <p className="text-lg font-bold">
                  Total: <span className="text-primary">${totalAmount.toFixed(2)}</span>
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3">
              <p className="text-sm text-green-700">
                ✓ Invoice is ready to be created
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-2 justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={step === 1 || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            {step < 3 ? (
              <Button onClick={handleNextStep} disabled={loading}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating...' : 'Create Invoice'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
