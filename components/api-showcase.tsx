"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Package, Plus, DollarSign, AlertTriangle, Send, CheckCircle2, XCircle } from "lucide-react"

interface Product {
  id?: number
  nom: string
  prix: number
  quantite: number
}

interface ApiResponse {
  status: "idle" | "loading" | "success" | "error"
  data: unknown
  statusCode?: number
}

export function ApiShowcase() {
  const [alertThreshold, setAlertThreshold] = useState("5")
  
  // API States
  const [productsResponse, setProductsResponse] = useState<ApiResponse>({ status: "idle", data: null })
  const [addProductResponse, setAddProductResponse] = useState<ApiResponse>({ status: "idle", data: null })
  const [valueResponse, setValueResponse] = useState<ApiResponse>({ status: "idle", data: null })
  const [alertResponse, setAlertResponse] = useState<ApiResponse>({ status: "idle", data: null })
  
  // New product form
  const [newProduct, setNewProduct] = useState<Product>({ nom: "", prix: 0, quantite: 0 })

  const fetchProducts = async () => {
    setProductsResponse({ status: "loading", data: null })
    try {
      const res = await fetch(`/api/produits`)
      const data = await res.json()
      setProductsResponse({ status: "success", data, statusCode: res.status })
    } catch (error) {
      setProductsResponse({ status: "error", data: String(error) })
    }
  }

  const addProduct = async () => {
    setAddProductResponse({ status: "loading", data: null })
    try {
      const res = await fetch(`/api/produits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      })
      const data = await res.json().catch(() => ({ message: "Product created" }))
      setAddProductResponse({ status: "success", data, statusCode: res.status })
      if (res.status === 201) {
        setNewProduct({ nom: "", prix: 0, quantite: 0 })
      }
    } catch (error) {
      setAddProductResponse({ status: "error", data: String(error) })
    }
  }

  const fetchValue = async () => {
    setValueResponse({ status: "loading", data: null })
    try {
      const res = await fetch(`/api/valeur`)
      const data = await res.json()
      setValueResponse({ status: "success", data, statusCode: res.status })
    } catch (error) {
      setValueResponse({ status: "error", data: String(error) })
    }
  }

  const fetchAlerts = async () => {
    setAlertResponse({ status: "loading", data: null })
    try {
      const res = await fetch(`/api/produits/alerte/${alertThreshold}`)
      const data = await res.json()
      setAlertResponse({ status: "success", data, statusCode: res.status })
    } catch (error) {
      setAlertResponse({ status: "error", data: String(error) })
    }
  }

  const StatusBadge = ({ response }: { response: ApiResponse }) => {
    if (response.status === "idle") return null
    if (response.status === "loading") return <Badge variant="secondary"><Spinner className="mr-1 h-3 w-3" /> Loading</Badge>
    if (response.status === "success") return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle2 className="mr-1 h-3 w-3" /> {response.statusCode}</Badge>
    return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Error</Badge>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">API  Showcase</h1>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">List Products</span>
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Product</span>
          </TabsTrigger>
          <TabsTrigger value="value" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Stock Value</span>
          </TabsTrigger>
          <TabsTrigger value="alert" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Stock Alert</span>
          </TabsTrigger>
        </TabsList>

        {/* GET /produits */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-500 hover:bg-blue-600">GET</Badge>
                    /produits
                  </CardTitle>
                  <CardDescription className="mt-2">Retrieve all products from the database</CardDescription>
                </div>
                <StatusBadge response={productsResponse} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={fetchProducts} disabled={productsResponse.status === "loading"}>
                <Send className="mr-2 h-4 w-4" />
                Send Request
              </Button>
              
              {productsResponse.data && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm font-medium mb-4 text-muted-foreground">Response:</p>
                  {Array.isArray(productsResponse.data) && productsResponse.data.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product Name</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">Price</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">Quantity</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productsResponse.data.map((product: Product, index: number) => (
                            <tr key={product.id || index} className="border-b hover:bg-background/50 transition-colors">
                              <td className="py-3 px-4">{product.id || index + 1}</td>
                              <td className="py-3 px-4 font-medium">{product.nom}</td>
                              <td className="py-3 px-4 text-right">${product.prix.toFixed(2)}</td>
                              <td className="py-3 px-4 text-right">
                                <Badge variant="outline">{product.quantite} units</Badge>
                              </td>
                              <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                                ${(product.prix * product.quantite).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Products: {productsResponse.data.length}</span>
                        <span className="text-lg font-bold">
                          Total Value: ${productsResponse.data.reduce((sum: number, p: Product) => sum + (p.prix * p.quantite), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <pre className="text-sm overflow-auto max-h-64 bg-background p-3 rounded-md">
                      {JSON.stringify(productsResponse.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* POST /produits */}
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-green-500 hover:bg-green-600">POST</Badge>
                    /produits
                  </CardTitle>
                  <CardDescription className="mt-2">Add a new product to the database (expects 201 Created)</CardDescription>
                </div>
                <StatusBadge response={addProductResponse} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Product Name (nom)</FieldLabel>
                  <Input
                    value={newProduct.nom}
                    onChange={(e) => setNewProduct({ ...newProduct, nom: e.target.value })}
                    placeholder="Enter product name"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Price (prix)</FieldLabel>
                    <Input
                      type="text  "
                      value={newProduct.prix}
                      onChange={(e) => setNewProduct({ ...newProduct, prix: Number(e.target.value) })}
                      placeholder="0.00"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Quantity (quantite)</FieldLabel>
                    <Input
                      type="number"
                      value={newProduct.quantite}
                      onChange={(e) => setNewProduct({ ...newProduct, quantite: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </Field>
                </div>
              </FieldGroup>

              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium mb-2 text-muted-foreground">Request Body:</p>
                <pre className="text-sm bg-background p-3 rounded-md">
                  {JSON.stringify(newProduct, null, 2)}
                </pre>
              </div>

              <Button onClick={addProduct} disabled={addProductResponse.status === "loading"}>
                <Send className="mr-2 h-4 w-4" />
                Send Request
              </Button>
              
              {addProductResponse.data && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm font-medium mb-2 text-muted-foreground">Response:</p>
                  <pre className="text-sm overflow-auto bg-background p-3 rounded-md">
                    {JSON.stringify(addProductResponse.data, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* GET /valeur */}
        <TabsContent value="value">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-500 hover:bg-blue-600">GET</Badge>
                    /valeur
                  </CardTitle>
                  <CardDescription className="mt-2">Get the total stock value (sum of all products)</CardDescription>
                </div>
                <StatusBadge response={valueResponse} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={fetchValue} disabled={valueResponse.status === "loading"}>
                <Send className="mr-2 h-4 w-4" />
                Send Request
              </Button>
              
              {valueResponse.data !== null && valueResponse.status === "success" && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm font-medium mb-2 text-muted-foreground">Response:</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-8 w-8 text-emerald-500" />
                    <span className="text-4xl font-bold">
                      {typeof valueResponse.data === "object" 
                        ? JSON.stringify(valueResponse.data) 
                        : valueResponse.data}
                    </span>
                  </div>
                </div>
              )}

              {valueResponse.status === "error" && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                  <p className="text-sm text-destructive">{String(valueResponse.data)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* GET /produits/alerte/:seuil */}
        <TabsContent value="alert">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-500 hover:bg-blue-600">GET</Badge>
                    /produits/alerte/{alertThreshold}
                  </CardTitle>
                  <CardDescription className="mt-2">Get products with quantity below the threshold</CardDescription>
                </div>
                <StatusBadge response={alertResponse} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field className="max-w-xs">
                <FieldLabel>Alert Threshold</FieldLabel>
                <Input
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  placeholder="5"
                />
              </Field>

              <Button onClick={fetchAlerts} disabled={alertResponse.status === "loading"}>
                <Send className="mr-2 h-4 w-4" />
                Send Request
              </Button>
              
              {alertResponse.data && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm font-medium mb-2 text-muted-foreground">Response:</p>
                  {Array.isArray(alertResponse.data) && alertResponse.data.length > 0 ? (
                    <div className="space-y-2">
                      {alertResponse.data.map((product: Product, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-background p-3 rounded-md border border-amber-200 dark:border-amber-800">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <span className="font-medium">{product.nom}</span>
                          </div>
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            Qty: {product.quantite}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre className="text-sm overflow-auto bg-background p-3 rounded-md">
                      {JSON.stringify(alertResponse.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Documentation Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>API Endpoints Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-medium">Method</th>
                  <th className="text-left py-2 px-4 font-medium">Endpoint</th>
                  <th className="text-left py-2 px-4 font-medium">Description</th>
                  <th className="text-left py-2 px-4 font-medium">Expected Response</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4"><Badge className="bg-blue-500">GET</Badge></td>
                  <td className="py-2 px-4 font-mono">/produits</td>
                  <td className="py-2 px-4">List all products</td>
                  <td className="py-2 px-4 text-muted-foreground">JSON array of products</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4"><Badge className="bg-green-500">POST</Badge></td>
                  <td className="py-2 px-4 font-mono">/produits</td>
                  <td className="py-2 px-4">Add a new product</td>
                  <td className="py-2 px-4 text-muted-foreground">201 Created</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4"><Badge className="bg-blue-500">GET</Badge></td>
                  <td className="py-2 px-4 font-mono">/valeur</td>
                  <td className="py-2 px-4">Get total stock value</td>
                  <td className="py-2 px-4 text-muted-foreground">Number (total sum)</td>
                </tr>
                <tr>
                  <td className="py-2 px-4"><Badge className="bg-blue-500">GET</Badge></td>
                  <td className="py-2 px-4 font-mono">/produits/alerte/:seuil</td>
                  <td className="py-2 px-4">Get low stock products</td>
                  <td className="py-2 px-4 text-muted-foreground">Products below threshold</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
