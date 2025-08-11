'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { updateFacility, getFacilityById } from '@/actions/facility-actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, Clock, MapPin, ArrowLeft } from 'lucide-react'

export default function EditFacilityPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const params = useParams()
  const facilityId = params.id
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [userRole, setUserRole] = useState(null)

  // Form state
  const [facilityData, setFacilityData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: ''
  })

  const [sportsTypes, setSportsTypes] = useState([''])
  const [amenities, setAmenities] = useState([''])
  const [images, setImages] = useState([''])

  const [operatingHours, setOperatingHours] = useState({
    monday: { open: '09:00', close: '22:00', closed: false },
    tuesday: { open: '09:00', close: '22:00', closed: false },
    wednesday: { open: '09:00', close: '22:00', closed: false },
    thursday: { open: '09:00', close: '22:00', closed: false },
    friday: { open: '09:00', close: '22:00', closed: false },
    saturday: { open: '08:00', close: '23:00', closed: false },
    sunday: { open: '08:00', close: '23:00', closed: false }
  })

  // Check user role and load facility data
  useEffect(() => {
    const checkUserAndLoadFacility = async () => {
      if (!isLoaded) return
      
      if (!user) {
        toast.error('You must be logged in to edit facilities')
        router.push('/venue')
        return
      }

      try {
        const response = await fetch('/api/user')
        const userData = await response.json()
        
        if (userData.role !== 'FACILITY_OWNER') {
          toast.error('You must be a facility owner to edit facilities')
          router.push('/venue')
          return
        }
        
        setUserRole(userData.role)
        await loadFacilityData()
      } catch (error) {
        console.error('Error checking user role:', error)
        toast.error('Error verifying permissions')
        router.push('/venue')
      }
    }

    checkUserAndLoadFacility()
  }, [user, isLoaded, router, facilityId])

  const loadFacilityData = async () => {
    try {
      setIsLoadingData(true)
      const facility = await getFacilityById(facilityId)
      
      if (!facility) {
        toast.error('Facility not found')
        router.push('/facility')
        return
      }

      // Set basic facility data
      setFacilityData({
        name: facility.name || '',
        description: facility.description || '',
        address: facility.address || '',
        city: facility.city || '',
        state: facility.state || '',
        zipCode: facility.zipCode || '',
        phone: facility.phone || '',
        email: facility.email || '',
        website: facility.website || ''
      })

      // Parse JSON fields
      try {
        const parsedSportsTypes = JSON.parse(facility.sportsTypes || '[]')
        setSportsTypes(parsedSportsTypes.length > 0 ? parsedSportsTypes : [''])
      } catch {
        setSportsTypes([''])
      }

      try {
        const parsedAmenities = JSON.parse(facility.amenities || '[]')
        setAmenities(parsedAmenities.length > 0 ? parsedAmenities : [''])
      } catch {
        setAmenities([''])
      }

      try {
        const parsedImages = JSON.parse(facility.images || '[]')
        setImages(parsedImages.length > 0 ? parsedImages : [''])
      } catch {
        setImages([''])
      }

      try {
        const parsedHours = JSON.parse(facility.operatingHours || '{}')
        setOperatingHours({
          monday: parsedHours.monday || { open: '09:00', close: '22:00', closed: false },
          tuesday: parsedHours.tuesday || { open: '09:00', close: '22:00', closed: false },
          wednesday: parsedHours.wednesday || { open: '09:00', close: '22:00', closed: false },
          thursday: parsedHours.thursday || { open: '09:00', close: '22:00', closed: false },
          friday: parsedHours.friday || { open: '09:00', close: '22:00', closed: false },
          saturday: parsedHours.saturday || { open: '08:00', close: '23:00', closed: false },
          sunday: parsedHours.sunday || { open: '08:00', close: '23:00', closed: false }
        })
      } catch {
        // Keep default hours
      }

    } catch (error) {
      console.error('Error loading facility:', error)
      toast.error('Failed to load facility data')
      router.push('/facility')
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFacilityData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleArrayChange = (index, value, array, setter) => {
    const newArray = [...array]
    newArray[index] = value
    setter(newArray)
  }

  const addArrayItem = (array, setter, defaultValue = '') => {
    setter([...array, defaultValue])
  }

  const removeArrayItem = (index, array, setter) => {
    setter(array.filter((_, i) => i !== index))
  }

  const handleOperatingHoursChange = (day, field, value) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!facilityData.name || !facilityData.address || !facilityData.city || !facilityData.state) {
        toast.error('Please fill in all required fields')
        setIsLoading(false)
        return
      }

      // Prepare form data
      const formData = new FormData()
      
      // Add facility data
      Object.entries(facilityData).forEach(([key, value]) => {
        formData.append(key, value)
      })

      // Add JSON data
      formData.append('sportsTypes', JSON.stringify(sportsTypes.filter(s => s.trim())))
      formData.append('amenities', JSON.stringify(amenities.filter(a => a.trim())))
      formData.append('images', JSON.stringify(images.filter(img => img.trim())))
      formData.append('operatingHours', JSON.stringify(operatingHours))

      const result = await updateFacility(facilityId, formData)

      if (result.success) {
        toast.success(result.message)
        router.push('/facility')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error updating facility:', error)
      toast.error('An error occurred while updating the facility')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading states
  if (!isLoaded || userRole === null || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-20">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/facility')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Facilities
              </Button>
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <MapPin className="h-6 w-6" />
                  Edit Facility
                </CardTitle>
                <p className="text-gray-600">
                  Update your facility information. Changes will be reviewed before going live.
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Facility Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={facilityData.name}
                      onChange={handleInputChange}
                      placeholder="Enter facility name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={facilityData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={facilityData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your facility"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={facilityData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={facilityData.website}
                      onChange={handleInputChange}
                      placeholder="https://your-website.com"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address Information</h3>
                
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={facilityData.address}
                    onChange={handleInputChange}
                    placeholder="Enter street address"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={facilityData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={facilityData.state}
                      onChange={handleInputChange}
                      placeholder="Enter state"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={facilityData.zipCode}
                      onChange={handleInputChange}
                      placeholder="Enter ZIP code"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Sports Types */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sports Types</h3>
                {sportsTypes.map((sport, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={sport}
                      onChange={(e) => handleArrayChange(index, e.target.value, sportsTypes, setSportsTypes)}
                      placeholder="e.g., Badminton, Tennis, Basketball"
                    />
                    {sportsTypes.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem(index, sportsTypes, setSportsTypes)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem(sportsTypes, setSportsTypes)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sport Type
                </Button>
              </div>

              <Separator />

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Amenities</h3>
                {amenities.map((amenity, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={amenity}
                      onChange={(e) => handleArrayChange(index, e.target.value, amenities, setAmenities)}
                      placeholder="e.g., Parking, Locker Rooms, Cafeteria"
                    />
                    {amenities.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem(index, amenities, setAmenities)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem(amenities, setAmenities)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Amenity
                </Button>
              </div>

              <Separator />

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Facility Images</h3>
                {images.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={image}
                      onChange={(e) => handleArrayChange(index, e.target.value, images, setImages)}
                      placeholder="Enter image URL"
                    />
                    {images.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem(index, images, setImages)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem(images, setImages)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image URL
                </Button>
              </div>

              <Separator />

              {/* Operating Hours */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Operating Hours
                </h3>
                <div className="grid gap-4">
                  {Object.entries(operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-24 capitalize font-medium">{day}</div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                          disabled={hours.closed}
                          className="w-32"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                          disabled={hours.closed}
                          className="w-32"
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hours.closed}
                            onChange={(e) => handleOperatingHoursChange(day, 'closed', e.target.checked)}
                          />
                          Closed
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Submit */}
              <div className="flex justify-end gap-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/facility')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="min-w-32"
                >
                  {isLoading ? 'Updating...' : 'Update Facility'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
