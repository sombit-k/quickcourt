'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { updateCourt, getCourtById } from '@/actions/facility-actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, ArrowLeft, Settings } from 'lucide-react'

export default function EditCourtPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const params = useParams()
  const facilityId = params.id
  const courtId = params.courtId
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [userRole, setUserRole] = useState(null)

  // Form state
  const [courtData, setCourtData] = useState({
    name: '',
    sportType: '',
    pricePerHour: '',
    description: '',
    isActive: true
  })

  const [images, setImages] = useState([''])

  // Check user role and load court data
  useEffect(() => {
    const checkUserAndLoadCourt = async () => {
      if (!isLoaded) return
      
      if (!user) {
        toast.error('You must be logged in to edit courts')
        router.push('/venue')
        return
      }

      try {
        const response = await fetch('/api/user')
        const userData = await response.json()
        
        if (userData.role !== 'FACILITY_OWNER') {
          toast.error('You must be a facility owner to edit courts')
          router.push('/venue')
          return
        }
        
        setUserRole(userData.role)
        await loadCourtData()
      } catch (error) {
        console.error('Error checking user role:', error)
        toast.error('Error verifying permissions')
        router.push('/venue')
      }
    }

    checkUserAndLoadCourt()
  }, [user, isLoaded, router, courtId])

  const loadCourtData = async () => {
    try {
      setIsLoadingData(true)
      const court = await getCourtById(courtId)
      
      if (!court) {
        toast.error('Court not found')
        router.push(`/facility`)
        return
      }

      // Set court data
      setCourtData({
        name: court.name || '',
        sportType: court.sportType || '',
        pricePerHour: court.pricePerHour?.toString() || '',
        description: court.description || '',
        isActive: court.isActive ?? true
      })

      // Parse images
      try {
        const parsedImages = JSON.parse(court.images || '[]')
        setImages(parsedImages.length > 0 ? parsedImages : [''])
      } catch {
        setImages([''])
      }

    } catch (error) {
      console.error('Error loading court:', error)
      toast.error('Failed to load court data')
      router.push(`/facility`)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setCourtData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!courtData.name || !courtData.sportType || !courtData.pricePerHour) {
        toast.error('Please fill in all required fields')
        setIsLoading(false)
        return
      }

      // Validate price
      if (parseFloat(courtData.pricePerHour) <= 0) {
        toast.error('Price per hour must be greater than 0')
        setIsLoading(false)
        return
      }

      // Prepare form data
      const formData = new FormData()
      
      // Add court data
      Object.entries(courtData).forEach(([key, value]) => {
        formData.append(key, value.toString())
      })

      // Add images
      formData.append('images', JSON.stringify(images.filter(img => img.trim())))

      const result = await updateCourt(courtId, formData)

      if (result.success) {
        toast.success(result.message)
        router.push('/facility')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error updating court:', error)
      toast.error('An error occurred while updating the court')
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
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
                  <Settings className="h-6 w-6" />
                  Edit Court
                </CardTitle>
                <p className="text-gray-600">
                  Update court information and pricing.
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Court Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Court Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={courtData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Court A, Main Court"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sportType">Sport Type *</Label>
                    <Input
                      id="sportType"
                      name="sportType"
                      value={courtData.sportType}
                      onChange={handleInputChange}
                      placeholder="e.g., Badminton, Tennis"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pricePerHour">Price per Hour (₹) *</Label>
                    <Input
                      id="pricePerHour"
                      name="pricePerHour"
                      type="number"
                      step="0.01"
                      min="0"
                      value={courtData.pricePerHour}
                      onChange={handleInputChange}
                      placeholder="Enter price"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-8">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={courtData.isActive}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <Label htmlFor="isActive">Court is active and available for booking</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={courtData.description}
                    onChange={handleInputChange}
                    placeholder="Describe this court (optional)"
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Court Images</h3>
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
                  {isLoading ? 'Updating...' : 'Update Court'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
