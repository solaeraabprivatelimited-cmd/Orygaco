import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { MapPin, Star, Phone, Clock, Bed, Users, Award, Shield, Heart, Activity, ChevronLeft, Navigation, Share2, Building, Check, AlertCircle, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { VerificationBadge } from './ui/VerificationBadge';

interface HospitalDetailPageProps {
  onNavigate: (view: string) => void;
  hospital?: any;
}

export function HospitalDetailPage({ onNavigate, hospital }: HospitalDetailPageProps) {
  const [data, setData] = useState<any>(hospital);
  const [loading, setLoading] = useState(!hospital);
  const [previewMode, setPreviewMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check admin status
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.user_metadata?.role === 'hospital') {
            setIsAdmin(true);
        }
    });

    const hash = window.location.hash;
    const queryString = hash.split('?')[1];
    const params = new URLSearchParams(queryString);
    const id = params.get('id');
    const isPreview = params.get('preview') === 'true';

    setPreviewMode(isPreview);

    if (hospital) {
        setData(hospital);
        setLoading(false);
    } else if (id) {
        fetchHospital(id);
    } else {
        setLoading(false);
    }
  }, [hospital]);

  async function fetchHospital(id: string) {
     try {
         const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/hospitals/${id}`, {
             headers: { 'Authorization': `Bearer ${publicAnonKey}` }
         });
         if (res.ok) {
             const data = await res.json();
             setData(data);
         }
     } catch(e) { console.error(e); }
     finally { setLoading(false); }
  }

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!data) {
     return (
        <div className="min-h-screen py-8 bg-background flex items-center justify-center">
             <div className="text-center">
                 <h2 className="text-xl font-semibold mb-2">Hospital Not Found</h2>
                 <p className="text-muted-foreground mb-4">Please select a hospital from the list.</p>
                 <Button onClick={() => onNavigate('hospitals')}>Go to Hospitals</Button>
             </div>
        </div>
     );
  }

  // Use passed hospital data, avoid hardcoded unrelated data
  const displayHospital = {
      name: data.name || "Hospital Name",
      type: data.type || "General Hospital",
      rating: data.rating || "N/A",
      reviews: data.reviews || 0,
      location: data.location || "Location not listed",
      address: data.address || data.location || "Address not available",
      phone: data.phone || "Contact not listed",
      emergency: data.emergency || "Contact not listed",
      email: data.email || "",
      website: data.website || "",
      established: data.established || "",
      beds: data.beds || 0,
      icus: data.icus || 0,
      doctorsCount: data.doctors || 0, // 'doctors' might be number in summary or array
      accreditations: data.accreditations || [],
      verified: data.verified || false,
      verificationStatus: data.verification_status || (data.verified ? 'verified_hospital' : null)
  };

  const specialties = data.specialtiesList || [];
  const facilities = data.facilities || [];
  const featuredDoctors = data.featuredDoctors || []; // Should be real doctors linked to this hospital
  const reviews = data.reviewsList || [];
  const insuranceAccepted = data.insuranceAccepted || [];

  return (
    <div className="min-h-screen bg-background pb-8">
       {previewMode && isAdmin && (
          <div className="sticky top-0 z-50 bg-slate-900 text-white px-4 py-3 flex items-center justify-center shadow-md animate-in slide-in-from-top duration-300">
             <div className="flex items-center gap-2 text-sm font-medium">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Preview Mode – This is how patients see your hospital</span>
             </div>
          </div>
      )}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${(previewMode && isAdmin) ? 'mt-8' : 'pt-8'}`}>
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-4 text-sm"
          onClick={() => onNavigate('hospitals')}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <div className="grid lg:grid-cols-12 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-4">
            {/* Hospital Header */}
            <Card className="p-4">
              <div className="flex gap-4">
                {/* Hospital Logo */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                    <Building className="w-10 h-10 text-primary" />
                  </div>
                </div>

                {/* Hospital Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl">{displayHospital.name}</h1>
                        <VerificationBadge status={displayHospital.verificationStatus} />
                      </div>
                      <p className="text-sm text-muted-foreground">{displayHospital.type}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {displayHospital.accreditations.map((acc: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            {acc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{displayHospital.rating}</span>
                      <span className="text-muted-foreground">({displayHospital.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{displayHospital.doctorsCount} Doctors</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Bed className="w-4 h-4" />
                      <span>{displayHospital.beds} Beds</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{displayHospital.location}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button 
                  className="flex-1 text-sm" 
                  onClick={() => !(previewMode && isAdmin) && onNavigate('book-doctor')}
                  disabled={previewMode && isAdmin}
                  title={(previewMode && isAdmin) ? "Booking disabled in preview mode" : ""}
                >
                  <Users className="w-4 h-4 mr-2" />
                  {(previewMode && isAdmin) ? "Booking Disabled" : "Book Doctor"}
                </Button>
                <Button variant="outline" className="flex-1 text-sm">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Emergency
                </Button>
                {/* Icons */}
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Navigation className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* Image Gallery Placeholder if no images */}
            <Card className="p-4">
              <div className="aspect-video bg-accent rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Hospital Images
                  </div>
              </div>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-3">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="specialties" className="text-xs">Specialties</TabsTrigger>
                <TabsTrigger value="doctors" className="text-xs">Doctors</TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-3">
                {/* About */}
                <Card className="p-4">
                  <h3 className="text-base mb-2">About {displayHospital.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {hospital.description || `Welcome to ${displayHospital.name}, providing quality healthcare services in ${displayHospital.location}.`}
                  </p>
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
                    <div className="text-center">
                      <div className="text-2xl font-medium text-primary">{displayHospital.beds}</div>
                      <div className="text-xs text-muted-foreground">Total Beds</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-medium text-primary">{displayHospital.icus}</div>
                      <div className="text-xs text-muted-foreground">ICU Beds</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-medium text-primary">{displayHospital.doctorsCount}</div>
                      <div className="text-xs text-muted-foreground">Doctors</div>
                    </div>
                  </div>
                </Card>

                {/* Facilities */}
                <Card className="p-4">
                  <h3 className="text-base mb-3">Facilities & Services</h3>
                  {facilities.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {facilities.map((facility: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Check className="w-3 h-3 text-primary flex-shrink-0" />
                            <span>{facility}</span>
                          </div>
                        ))}
                      </div>
                  ) : (
                      <p className="text-sm text-muted-foreground">No facilities listed.</p>
                  )}
                </Card>

                {/* Insurance */}
                <Card className="p-4">
                  <h3 className="text-base mb-3">Insurance Accepted</h3>
                  {insuranceAccepted.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {insuranceAccepted.map((insurance: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {insurance}
                          </Badge>
                        ))}
                      </div>
                  ) : (
                      <p className="text-sm text-muted-foreground">Contact hospital for insurance information.</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="specialties">
                <Card className="p-4">
                  <h3 className="text-base mb-3">Medical Specialties</h3>
                  {specialties.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-3">
                        {specialties.map((specialty: any, index: number) => (
                          <div key={index} className="p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                <Activity className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">{specialty.name}</div>
                                <div className="text-xs text-muted-foreground">{specialty.doctors || 0} Specialists</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                  ) : (
                      <p className="text-sm text-muted-foreground">No specialties listed.</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="doctors">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base">Featured Doctors</h3>
                  </div>
                  {featuredDoctors.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-3">
                        {featuredDoctors.map((doctor: any) => (
                          <div key={doctor.id} className="p-3 rounded-lg border border-border hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-sm text-primary font-medium">{doctor.image || doctor.name.charAt(0)}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium mb-0.5">{doctor.name}</h4>
                                <div className="text-xs text-muted-foreground mb-1">{doctor.specialty}</div>
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="flex items-center gap-0.5">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span>{doctor.rating}</span>
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" className="text-xs">Book</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                  ) : (
                      <p className="text-sm text-muted-foreground">No doctors listed.</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-3">
                {/* Rating Summary */}
                <Card className="p-4">
                  <div className="flex items-start gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-medium mb-1">{displayHospital.rating}</div>
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">{displayHospital.reviews} reviews</div>
                    </div>
                  </div>
                </Card>

                {/* Individual Reviews */}
                {reviews.length > 0 ? (
                    reviews.map((review: any) => (
                      <Card key={review.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{review.patient}</span>
                              {review.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  <Check className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </Card>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No reviews yet.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* Quick Actions */}
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <h3 className="text-base mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button className="w-full text-sm" onClick={() => onNavigate('book-doctor')}>
                  <Users className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
                <Button variant="outline" className="w-full text-sm border-red-200 text-red-700 hover:bg-red-50">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Emergency Contact
                </Button>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-4">
              <h3 className="text-base mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="font-medium">Main Line</span>
                  </div>
                  <div className="text-sm text-muted-foreground ml-6">{displayHospital.phone}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-700">Emergency</span>
                  </div>
                  <div className="text-sm text-muted-foreground ml-6">{displayHospital.emergency}</div>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="text-xs text-muted-foreground mb-1">Email</div>
                  <div className="text-sm">{displayHospital.email}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Website</div>
                  <div className="text-sm text-primary">{displayHospital.website}</div>
                </div>
              </div>
            </Card>

            {/* Location */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="text-base">Location</h3>
              </div>
              <div className="space-y-2">
                <div className="text-sm">{displayHospital.address}</div>
                <div className="aspect-video bg-accent rounded-lg overflow-hidden mt-3">
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    Map View
                  </div>
                </div>
                <Button variant="outline" className="w-full text-xs mt-2">
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </Card>

            {/* Visiting Hours */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-base">Visiting Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">OPD</span>
                  <span>8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emergency</span>
                  <span className="text-green-600">24/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient Visiting</span>
                  <span>4:00 PM - 6:00 PM</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}