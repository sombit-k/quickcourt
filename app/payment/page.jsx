"use client"
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  CreditCard, 
  Shield, 
  Lock, 
  ArrowLeft, 
  Check, 
  Calendar,
  MapPin,
  Clock,
  Loader2,
  Users,
  AlertCircle,
  Timer
} from 'lucide-react'
import Link from 'next/link'

const FakePaymentPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get booking details from URL params
  const [bookingDetails, setBookingDetails] = useState({
    bookingId: searchParams.get('bookingId') || '',
    venueName: searchParams.get('venueName') || 'Court Booking',
    courtName: searchParams.get('courtName') || 'Court 1',
    date: searchParams.get('date') || new Date().toISOString().split('T')[0],
    time: searchParams.get('time') || '10:00',
    duration: searchParams.get('duration') || '1',
    amount: searchParams.get('amount') || '50.00',
    isInQueue: searchParams.get('isInQueue') === 'true',
    queuePosition: parseInt(searchParams.get('queuePosition') || '0')
  })

  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    paymentMethod: 'card'
  })

  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState('payment') // 'payment' | 'processing' | 'success'
  const [paymentTimer, setPaymentTimer] = useState(600) // 10 minutes in seconds

  // Payment timer countdown
  useEffect(() => {
    if (step === 'payment' && paymentTimer > 0) {
      const interval = setInterval(() => {
        setPaymentTimer(prev => {
          if (prev <= 1) {
            // Payment expired
            router.push('/profile?payment=expired')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [step, paymentTimer, router])

  // Format timer display
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleInputChange = (field, value) => {
    let formattedValue = value

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value)
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value)
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 3)
    }

    setPaymentForm(prev => ({
      ...prev,
      [field]: formattedValue
    }))
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    
    // Basic validation for card payment
    if (paymentForm.paymentMethod === 'card') {
      if (!paymentForm.cardNumber || !paymentForm.expiryDate || !paymentForm.cvv || !paymentForm.cardholderName) {
        alert('Please fill in all card details')
        return
      }
      
      if (paymentForm.cardNumber.replace(/\s/g, '').length < 16) {
        alert('Please enter a valid card number')
        return
      }
      
      if (paymentForm.cvv.length < 3) {
        alert('Please enter a valid CVV')
        return
      }
    }
    
    setProcessing(true)
    setStep('processing')

    // Simulate payment processing with queue logic
    setTimeout(async () => {
      try {
        // Import the completion function here to avoid issues
        const { completeBookingPayment } = await import('@/actions/booking-queue-actions')
        
        if (bookingDetails.bookingId) {
          const result = await completeBookingPayment(bookingDetails.bookingId)
          
          if (result.success) {
            setProcessing(false)
            setStep('success')
            
            // Redirect to success page after 3 seconds
            setTimeout(() => {
              router.push('/profile?booking=success')
            }, 3000)
          } else {
            // Payment failed, redirect with error
            router.push(`/profile?payment=failed&reason=${encodeURIComponent(result.message)}`)
          }
        } else {
          // Fallback for demo without booking ID
          setProcessing(false)
          setStep('success')
          
          setTimeout(() => {
            router.push('/profile?booking=success')
          }, 3000)
        }
      } catch (error) {
        console.error('Payment error:', error)
        router.push('/profile?payment=failed&reason=Payment processing error')
      }
    }, 3000)
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
            <p className="text-gray-600 mb-4">Please wait while we process your payment...</p>
            <div className="text-sm text-gray-500">This may take a few seconds</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">Your booking has been confirmed</p>
            <div className="text-sm text-gray-500">Redirecting to your profile...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side - Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/venue">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Venues
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Complete Payment</h1>
                <p className="text-gray-600">Secure payment powered by FakePay Gateway</p>
              </div>
            </div>

            {/* Payment Timer */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="flex items-center gap-3 py-4">
                <Timer className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Payment Timer: {formatTimer(paymentTimer)}</p>
                  <p className="text-sm text-orange-600">Complete payment before timer expires</p>
                </div>
              </CardContent>
            </Card>

            {/* Queue Status */}
            {bookingDetails.isInQueue && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="flex items-center gap-3 py-4">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Queue Position: #{bookingDetails.queuePosition}</p>
                    <p className="text-sm text-blue-600">You're in the booking queue. Complete payment to secure your slot.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Badge */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="flex items-center gap-3 py-4">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Secure Payment</p>
                  <p className="text-sm text-green-600">Your payment information is encrypted and secure</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant={paymentForm.paymentMethod === 'card' ? 'default' : 'outline'}
                    className="h-16"
                    onClick={() => setPaymentForm(prev => ({ ...prev, paymentMethod: 'card' }))}
                  >
                    <div className="text-center">
                      <CreditCard className="w-6 h-6 mx-auto mb-1" />
                      <div className="text-sm">Credit/Debit Card</div>
                    </div>
                  </Button>
                  <Button
                    variant={paymentForm.paymentMethod === 'upi' ? 'default' : 'outline'}
                    className="h-16"
                    onClick={() => setPaymentForm(prev => ({ ...prev, paymentMethod: 'upi' }))}
                  >
                    <div className="text-center">
                      <div className="w-6 h-6 mx-auto mb-1 bg-orange-500 rounded text-white text-xs flex items-center justify-center">UPI</div>
                      <div className="text-sm">UPI Payment</div>
                    </div>
                  </Button>
                  <Button
                    variant={paymentForm.paymentMethod === 'wallet' ? 'default' : 'outline'}
                    className="h-16"
                    onClick={() => setPaymentForm(prev => ({ ...prev, paymentMethod: 'wallet' }))}
                  >
                    <div className="text-center">
                      <div className="w-6 h-6 mx-auto mb-1 bg-blue-500 rounded text-white text-xs flex items-center justify-center">₹</div>
                      <div className="text-sm">Digital Wallet</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            {paymentForm.paymentMethod === 'card' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Card Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentForm.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        maxLength="19"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={paymentForm.expiryDate}
                          onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                          maxLength="5"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={paymentForm.cvv}
                          onChange={(e) => handleInputChange('cvv', e.target.value)}
                          maxLength="3"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cardholderName">Cardholder Name</Label>
                      <Input
                        id="cardholderName"
                        placeholder="John Doe"
                        value={paymentForm.cardholderName}
                        onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay ₹{bookingDetails.amount}
                        </>
                      )}
                    </Button>
                    
                    {/* Demo Card Info */}
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="py-3">
                        <p className="text-sm text-blue-800 font-medium mb-2">Demo Payment - Use Test Cards</p>
                        <div className="space-y-1 text-xs text-blue-600">
                          <div>• Card: 4111 1111 1111 1111</div>
                          <div>• Expiry: Any future date (e.g., 12/25)</div>
                          <div>• CVV: Any 3 digits (e.g., 123)</div>
                          <div>• Name: Any name</div>
                        </div>
                      </CardContent>
                    </Card>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* UPI Payment */}
            {paymentForm.paymentMethod === 'upi' && (
              <Card>
                <CardHeader>
                  <CardTitle>UPI Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 bg-gray-200 mx-auto rounded-lg flex items-center justify-center">
                      <p className="text-gray-600">QR Code</p>
                    </div>
                    <p className="text-sm text-gray-600">Scan this QR code with any UPI app</p>
                    <Button onClick={handlePayment} className="w-full bg-green-600 hover:bg-green-700">
                      Simulate UPI Payment - ₹{bookingDetails.amount}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Wallet Payment */}
            {paymentForm.paymentMethod === 'wallet' && (
              <Card>
                <CardHeader>
                  <CardTitle>Digital Wallet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">Select your preferred wallet</p>
                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-16">
                          <div className="text-center">
                            <div className="w-8 h-8 bg-blue-600 rounded mx-auto mb-2"></div>
                            <div className="text-sm">PayTM</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-16">
                          <div className="text-center">
                            <div className="w-8 h-8 bg-purple-600 rounded mx-auto mb-2"></div>
                            <div className="text-sm">PhonePe</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                    <Button onClick={handlePayment} className="w-full bg-green-600 hover:bg-green-700">
                      Pay with Wallet - ₹{bookingDetails.amount}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Right Side - Booking Summary */}
          <div className="space-y-6">
            
            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{bookingDetails.venueName}</p>
                    <p className="text-sm text-gray-600">{bookingDetails.courtName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {new Date(bookingDetails.date).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">Booking Date</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{bookingDetails.time} ({bookingDetails.duration} hour{bookingDetails.duration !== '1' ? 's' : ''})</p>
                    <p className="text-sm text-gray-600">Time Slot</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Court booking</span>
                    <span>₹{bookingDetails.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Platform fee</span>
                    <span>₹5.00</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>GST (18%)</span>
                    <span>₹{((parseFloat(bookingDetails.amount) + 5) * 0.18).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{((parseFloat(bookingDetails.amount) + 5) * 1.18).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">100% Secure</p>
                    <p className="text-sm text-blue-600">Your payment is protected with 256-bit SSL encryption</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </div>
  )
}

export default FakePaymentPage
