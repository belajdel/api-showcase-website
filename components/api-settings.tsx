'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { getApiBaseUrl, setApiBaseUrl } from '@/lib/api'
import { Check, Copy } from 'lucide-react'

interface ApiSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApiSettings({ open, onOpenChange }: ApiSettingsProps) {
  const [baseUrl, setBaseUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setBaseUrl(getApiBaseUrl())
  }, [open])

  const handleSave = () => {
    if (baseUrl.trim()) {
      setApiBaseUrl(baseUrl.trim())
      onOpenChange(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(baseUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>API Configuration</DialogTitle>
          <DialogDescription>
            Configure your API server base URL
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="base-url">Base URL</Label>
            <Input
              id="base-url"
              placeholder="http://localhost:3001"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This URL will be used as the prefix for all API calls
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Endpoints configured:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 font-mono">
              <li>GET {baseUrl}/produits</li>
              <li>POST {baseUrl}/produits</li>
              <li>GET {baseUrl}/valeur</li>
              <li>GET {baseUrl}/produits/alerte/:seuil</li>
              <li>GET {baseUrl}/factures</li>
              <li>POST {baseUrl}/factures</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy URL
              </>
            )}
          </Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
