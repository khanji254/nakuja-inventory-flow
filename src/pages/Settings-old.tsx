import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Download, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

export default function Settings() {
  const [newCategory, setNewCategory] = useState("")
  const [newLocation, setNewLocation] = useState("")
  const [newTeam, setNewTeam] = useState("")
  
  const [categories, setCategories] = useState<string[]>([
    'Electronics', 'Materials', 'Tools', 'Chemicals', 'Safety Equipment', 'Office Supplies'
  ])
  
  const [locations, setLocations] = useState<string[]>([
    'Lab A', 'Lab B', 'Storage Room', 'Warehouse', 'Clean Room', 'Workshop'
  ])
  
  const [teams, setTeams] = useState<string[]>([
    'Avionics', 'Telemetry', 'Parachute', 'Recovery'
  ])

  const [settings, setSettings] = useState({
    lowStockThreshold: 10,
    currency: 'USD',
    timezone: 'UTC',
    emailNotifications: true,
    autoBackup: true
  })

  const { toast } = useToast()

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()])
      setNewCategory("")
      toast({ title: "Category added successfully" })
    }
  }

  const removeCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category))
    toast({ title: "Category removed successfully" })
  }

  const addLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()])
      setNewLocation("")
      toast({ title: "Location added successfully" })
    }
  }

  const removeLocation = (location: string) => {
    setLocations(locations.filter(l => l !== location))
    toast({ title: "Location removed successfully" })
  }

  const addTeam = () => {
    if (newTeam.trim() && !teams.includes(newTeam.trim())) {
      setTeams([...teams, newTeam.trim()])
      setNewTeam("")
      toast({ title: "Team added successfully" })
    }
  }

  const removeTeam = (team: string) => {
    setTeams(teams.filter(t => t !== team))
    toast({ title: "Team removed successfully" })
  }

  const exportConfig = () => {
    const config = {
      categories,
      locations,
      teams,
      settings
    }
    const dataStr = JSON.stringify(config, null, 2)
    const dataBlob = new Blob([dataStr], {type:'application/json'})
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'inventory-config.json'
    link.click()
    toast({ title: "Configuration exported successfully" })
  }

  const resetToDefaults = () => {
    setCategories(['Electronics', 'Materials', 'Tools', 'Chemicals', 'Safety Equipment', 'Office Supplies'])
    setLocations(['Lab A', 'Lab B', 'Storage Room', 'Warehouse', 'Clean Room', 'Workshop'])
    setTeams(['Avionics', 'Telemetry', 'Parachute', 'Recovery'])
    setSettings({
      lowStockThreshold: 10,
      currency: 'USD',
      timezone: 'UTC',
      emailNotifications: true,
      autoBackup: true
    })
    toast({ title: "Settings reset to defaults" })
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure system settings and manage categories</p>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Categories</CardTitle>
              <CardDescription>Manage categories for inventory items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                />
                <Button onClick={addCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge key={category} variant="secondary" className="flex items-center gap-2">
                    {category}
                    <button
                      onClick={() => removeCategory(category)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Storage Locations</CardTitle>
              <CardDescription>Manage storage locations for inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                />
                <Button onClick={addLocation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {locations.map((location) => (
                  <Badge key={location} variant="secondary" className="flex items-center gap-2">
                    {location}
                    <button
                      onClick={() => removeLocation(location)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>Teams</CardTitle>
              <CardDescription>Manage team configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new team"
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTeam()}
                />
                <Button onClick={addTeam}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {teams.map((team) => (
                  <Badge key={team} variant="secondary" className="flex items-center gap-2">
                    {team}
                    <button
                      onClick={() => removeTeam(team)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="threshold">Low Stock Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) => setSettings({...settings, lowStockThreshold: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => setSettings({...settings, currency: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-backup">Auto Backup</Label>
                  <Switch
                    id="auto-backup"
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>Export or reset your configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={exportConfig} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Configuration
                </Button>
                <Button onClick={resetToDefaults} variant="destructive">
                  Reset to Defaults
                </Button>
              </div>
              <Alert>
                <AlertDescription>
                  Export your current configuration to backup your settings. Use "Reset to Defaults" to restore original settings.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
