import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Download, Upload } from "lucide-react"
import { SystemConfig, ConfigManager } from "@/lib/system-config"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Settings() {
  const [newCategory, setNewCategory] = useState("")
  const [newLocation, setNewLocation] = useState("")
  const [newTeam, setNewTeam] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [teams, setTeams] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    setCategories([...SystemConfig.categories])
    setLocations([...SystemConfig.storageLocations])
    setTeams([...SystemConfig.teams])
  }, [])

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      ConfigManager.addCategory(newCategory.trim())
      setCategories([...SystemConfig.categories])
      setNewCategory("")
      toast({
        title: "Category Added",
        description: `"${newCategory.trim()}" has been added to categories.`,
      })
    }
  }

  const handleRemoveCategory = (category: string) => {
    ConfigManager.removeCategory(category)
    setCategories([...SystemConfig.categories])
    toast({
      title: "Category Removed",
      description: `"${category}" has been removed from categories.`,
      variant: "destructive",
    })
  }

  const handleAddLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      ConfigManager.addStorageLocation(newLocation.trim())
      setLocations([...SystemConfig.storageLocations])
      setNewLocation("")
      toast({
        title: "Storage Location Added",
        description: `"${newLocation.trim()}" has been added to storage locations.`,
      })
    }
  }

  const handleRemoveLocation = (location: string) => {
    ConfigManager.removeStorageLocation(location)
    setLocations([...SystemConfig.storageLocations])
    toast({
      title: "Storage Location Removed",
      description: `"${location}" has been removed from storage locations.`,
      variant: "destructive",
    })
  }

  const handleAddTeam = () => {
    if (newTeam.trim() && !teams.includes(newTeam.trim())) {
      ConfigManager.addTeam(newTeam.trim())
      setTeams([...SystemConfig.teams])
      setNewTeam("")
      toast({
        title: "Team Added",
        description: `"${newTeam.trim()}" has been added to teams.`,
      })
    }
  }

  const handleRemoveTeam = (team: string) => {
    ConfigManager.removeTeam(team)
    setTeams([...SystemConfig.teams])
    toast({
      title: "Team Removed",
      description: `"${team}" has been removed from teams.`,
      variant: "destructive",
    })
  }

  const handleExportConfig = () => {
    const config = ConfigManager.exportConfig()
    const blob = new Blob([config], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'system-config.json'
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: "Configuration Exported",
      description: "System configuration has been downloaded.",
    })
  }

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const configJson = e.target?.result as string
          if (ConfigManager.importConfig(configJson)) {
            setCategories([...SystemConfig.categories])
            setLocations([...SystemConfig.storageLocations])
            setTeams([...SystemConfig.teams])
            toast({
              title: "Configuration Imported",
              description: "System configuration has been updated.",
            })
          } else {
            toast({
              title: "Import Failed",
              description: "Failed to import configuration file.",
              variant: "destructive",
            })
          }
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Invalid configuration file format.",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }
  }

  const handleResetConfig = () => {
    if (confirm("Are you sure you want to reset all configurations to default? This action cannot be undone.")) {
      ConfigManager.resetConfig()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage system preferences and configurations.
        </p>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="locations">Storage</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Categories</CardTitle>
              <CardDescription>
                Manage categories for organizing inventory items
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter new category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button onClick={handleAddCategory} disabled={!newCategory.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge key={category} variant="secondary" className="gap-1">
                    {category}
                    <Trash2 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => handleRemoveCategory(category)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Locations</CardTitle>
              <CardDescription>
                Manage storage locations for inventory items
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter new storage location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                />
                <Button onClick={handleAddLocation} disabled={!newLocation.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {locations.map((location) => (
                  <Badge key={location} variant="secondary" className="gap-1">
                    {location}
                    <Trash2 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => handleRemoveLocation(location)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teams</CardTitle>
              <CardDescription>
                Manage teams for organizing work and assignments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter new team name"
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTeam()}
                />
                <Button onClick={handleAddTeam} disabled={!newTeam.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {teams.map((team) => (
                  <Badge key={team} variant="secondary" className="gap-1">
                    {team}
                    <Trash2 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => handleRemoveTeam(team)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>
                  View system configuration details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <div className="text-sm text-muted-foreground">
                    {SystemConfig.defaults.currency}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Auto-sync Interval</Label>
                  <div className="text-sm text-muted-foreground">
                    {SystemConfig.defaults.autoSyncInterval / 1000} seconds
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Default Location</Label>
                  <div className="text-sm text-muted-foreground">
                    {SystemConfig.defaults.defaultLocation}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure notification thresholds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Low Stock Threshold</Label>
                  <div className="text-sm text-muted-foreground">
                    {SystemConfig.notifications.lowStockThreshold} items
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Critical Stock Threshold</Label>
                  <div className="text-sm text-muted-foreground">
                    {SystemConfig.notifications.criticalStockThreshold} items
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Max Notifications Display</Label>
                  <div className="text-sm text-muted-foreground">
                    {SystemConfig.notifications.maxNotificationsDisplay} notifications
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Backup</CardTitle>
              <CardDescription>
                Export, import, or reset system configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Backup your configuration before making major changes. Import/export allows you to share configurations between systems.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button onClick={handleExportConfig}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Configuration
                </Button>
                
                <div className="relative">
                  <Button variant="outline" asChild>
                    <label className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Configuration
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportConfig}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                  </Button>
                </div>
                
                <Button 
                  variant="destructive" 
                  onClick={handleResetConfig}
                >
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
