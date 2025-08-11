'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { createFacility } from '@/actions/facility-actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Plus, Trash2, Clock, MapPin, } from 'lucide-react'

export default function NewFacilityPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [userRole, setUserRole] = useState(null)

  // Available sports types
  const sportsTypeOptions = [
    'Badminton',
    'Tennis',
    'Basketball',
    'Cricket',
    'Football',
    'Volleyball',
    'Table Tennis',
    'Squash',
    'Swimming',
    'Boxing',
    'Martial Arts',
    'Fitness/Gym',
    'Yoga',
    'Pickleball',
    'Padel',
    'Other'
  ]

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
  const [customSportsTypes, setCustomSportsTypes] = useState(['']) // For facility-level custom sports
  const [amenities, setAmenities] = useState([''])
  const [images, setImages] = useState([''])
  const [courts, setCourts] = useState([{
    name: '',
    sportType: '',
    customSportType: '', // For court-level custom sport
    pricePerHour: '',
    description: '',
    images: ['']
  }])

  const [operatingHours, setOperatingHours] = useState({
    monday: { open: '09:00', close: '22:00', closed: false },
    tuesday: { open: '09:00', close: '22:00', closed: false },
    wednesday: { open: '09:00', close: '22:00', closed: false },
    thursday: { open: '09:00', close: '22:00', closed: false },
    friday: { open: '09:00', close: '22:00', closed: false },
    saturday: { open: '08:00', close: '23:00', closed: false },
    sunday: { open: '08:00', close: '23:00', closed: false }
  })

  // Check user role on component mount
  useEffect(() => {
    const checkUserRole = async () => {
      if (!isLoaded) return
      
      if (!user) {
        toast.error('You must be logged in to access this page')
        router.push('/venue')
        return
      }

      try {
        const response = await fetch('/api/user')
        const userData = await response.json()
        
        if (userData.role !== 'FACILITY_OWNER') {
          toast.error('You must be a facility owner to create venues')
          router.push('/venue')
          return
        }
        
        setUserRole(userData.role)
      } catch (error) {
        console.error('Error checking user role:', error)
        toast.error('Error verifying permissions')
        router.push('/venue')
      }
    }

    checkUserRole()
  }, [user, isLoaded, router])

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

  // Special remove function for facility sports that also removes custom sports
  const removeFacilitySportType = (index) => {
    setSportsTypes(sportsTypes.filter((_, i) => i !== index))
    setCustomSportsTypes(customSportsTypes.filter((_, i) => i !== index))
  }

  // Special add function for facility sports that also adds to custom sports
  const addFacilitySportType = () => {
    setSportsTypes([...sportsTypes, ''])
    setCustomSportsTypes([...customSportsTypes, ''])
  }

  // Special handler for facility sports types with "Other" support
  const handleFacilitySportTypeChange = (index, value) => {
    if (value === 'Other') {
      // Keep the "Other" selection and initialize custom sport type
      handleArrayChange(index, value, sportsTypes, setSportsTypes)
      const newCustomSports = [...customSportsTypes]
      newCustomSports[index] = ''
      setCustomSportsTypes(newCustomSports)
    } else {
      // Clear any custom sport type for this index
      handleArrayChange(index, value, sportsTypes, setSportsTypes)
      const newCustomSports = [...customSportsTypes]
      newCustomSports[index] = ''
      setCustomSportsTypes(newCustomSports)
    }
  }

  // Handler for custom sport type input
  const handleCustomSportTypeChange = (index, value) => {
    const newCustomSports = [...customSportsTypes]
    newCustomSports[index] = value
    setCustomSportsTypes(newCustomSports)
  }

  // Special handler for court sport types with "Other" support
  const handleCourtSportTypeChange = (courtIndex, value) => {
    const newCourts = [...courts]
    newCourts[courtIndex].sportType = value
    if (value === 'Other') {
      newCourts[courtIndex].customSportType = ''
    } else {
      newCourts[courtIndex].customSportType = ''
    }
    setCourts(newCourts)
  }

  const handleCourtChange = (courtIndex, field, value) => {
    const newCourts = [...courts]
    newCourts[courtIndex] = {
      ...newCourts[courtIndex],
      [field]: value
    }
    setCourts(newCourts)
  }

  const handleCourtImageChange = (courtIndex, imageIndex, value) => {
    const newCourts = [...courts]
    const newImages = [...newCourts[courtIndex].images]
    newImages[imageIndex] = value
    newCourts[courtIndex] = {
      ...newCourts[courtIndex],
      images: newImages
    }
    setCourts(newCourts)
  }

  const addCourt = () => {
    setCourts([...courts, {
      name: '',
      sportType: '',
      customSportType: '',
      pricePerHour: '',
      description: '',
      images: ['']
    }])
  }

  const removeCourt = (index) => {
    setCourts(courts.filter((_, i) => i !== index))
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

      // Validate courts
      const validCourts = courts.filter(court => {
        const hasValidSportType = court.sportType === 'Other' 
          ? court.customSportType && court.customSportType.trim()
          : court.sportType && court.sportType.trim()
        
        return court.name && hasValidSportType && court.pricePerHour
      })

      if (validCourts.length === 0) {
        toast.error('Please add at least one valid court')
        setIsLoading(false)
        return
      }

      // Process sports types (combine regular selections with custom ones)
      const processedSportsTypes = sportsTypes.map((sport, index) => {
        if (sport === 'Other' && customSportsTypes[index]) {
          return customSportsTypes[index].trim()
        }
        return sport
      }).filter(s => s.trim())

      // Process courts (use custom sport type if "Other" is selected)
      const processedCourts = validCourts.map(court => ({
        ...court,
        sportType: court.sportType === 'Other' && court.customSportType 
          ? court.customSportType.trim() 
          : court.sportType,
        images: court.images.filter(img => img.trim())
      }))

      // Prepare form data
      const formData = new FormData()
      
      // Add facility data
      Object.entries(facilityData).forEach(([key, value]) => {
        formData.append(key, value)
      })

      // Add JSON data
      formData.append('sportsTypes', JSON.stringify(processedSportsTypes))
      formData.append('amenities', JSON.stringify(amenities.filter(a => a.trim())))
      formData.append('images', JSON.stringify(images.filter(img => img.trim())))
      formData.append('operatingHours', JSON.stringify(operatingHours))
      formData.append('courts', JSON.stringify(processedCourts))

      const result = await createFacility(formData)

      if (result.success) {
        toast.success(result.message)
        router.push('/facility')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error creating facility:', error)
      toast.error('An error occurred while creating the facility')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading or check permissions
  if (!isLoaded || userRole === null) {
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
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Create New Venue
            </CardTitle>
            <p className="text-gray-600">
              Fill in the details to create your sports facility. Your venue will be reviewed before going live.
            </p>
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
                      placeholder="https://google.com"
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
                  <div key={index} className="space-y-2">
                    <div className="flex gap-2">
                      <Select
                        value={sport}
                        onValueChange={(value) => handleFacilitySportTypeChange(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a sport type" />
                        </SelectTrigger>
                        <SelectContent>
                          {sportsTypeOptions.map((sportOption) => (
                            <SelectItem key={sportOption} value={sportOption}>
                              {sportOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {sportsTypes.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeFacilitySportType(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {sport === 'Other' && (
                      <Input
                        value={customSportsTypes[index] || ''}
                        onChange={(e) => handleCustomSportTypeChange(index, e.target.value)}
                        placeholder="Enter custom sport type"
                        className="ml-0"
                      />
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFacilitySportType}
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

              {/* Courts */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Courts</h3>
                {courts.map((court, courtIndex) => (
                  <Card key={courtIndex} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Court {courtIndex + 1}</h4>
                      {courts.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCourt(courtIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>Court Name *</Label>
                        <Input
                          value={court.name}
                          onChange={(e) => handleCourtChange(courtIndex, 'name', e.target.value)}
                          placeholder="e.g., Court A, Main Court"
                        />
                      </div>
                      
                      <div>
                        <Label>Sport Type *</Label>
                        <Select
                          value={court.sportType}
                          onValueChange={(value) => handleCourtSportTypeChange(courtIndex, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a sport type" />
                          </SelectTrigger>
                          <SelectContent>
                            {sportsTypeOptions.map((sport) => (
                              <SelectItem key={sport} value={sport}>
                                {sport}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {court.sportType === 'Other' && (
                          <Input
                            value={court.customSportType}
                            onChange={(e) => handleCourtChange(courtIndex, 'customSportType', e.target.value)}
                            placeholder="Enter custom sport type"
                            className="mt-2"
                          />
                        )}
                      </div>
                      
                      <div>
                        <Label>Price per Hour *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={court.pricePerHour}
                          onChange={(e) => handleCourtChange(courtIndex, 'pricePerHour', e.target.value)}
                          placeholder="Enter price"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <Label>Court Description</Label>
                      <Textarea
                        value={court.description}
                        onChange={(e) => handleCourtChange(courtIndex, 'description', e.target.value)}
                        placeholder="Describe this court"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label>Court Images</Label>
                      {court.images.map((image, imageIndex) => (
                        <div key={imageIndex} className="flex gap-2 mb-2">
                          <Input
                            value={image}
                            onChange={(e) => handleCourtImageChange(courtIndex, imageIndex, e.target.value)}
                            placeholder="Enter image URL"
                          />
                          {court.images.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const newCourts = [...courts]
                                newCourts[courtIndex].images = court.images.filter((_, i) => i !== imageIndex)
                                setCourts(newCourts)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newCourts = [...courts]
                          newCourts[courtIndex].images.push('')
                          setCourts(newCourts)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Image
                      </Button>
                    </div>
                  </Card>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCourt}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Court
                </Button>
              </div>

              <Separator />

              {/* Submit */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="min-w-32"
                >
                  {isLoading ? 'Creating...' : 'Create Facility'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}