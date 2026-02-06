import { MapPin, Star, Video, Calendar, Shield, Award, GraduationCap, Briefcase, Clock, CheckCircle, Phone, MessageSquare, Share2, Heart, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { VerificationBadge } from './ui/VerificationBadge';

interface DoctorDetailPageProps {
  onNavigate: (view: string) => void;
  doctor?: any;
}

export function DoctorDetailPage({ onNavigate, doctor }: DoctorDetailPageProps) {
  // If no doctor passed, we might want to show a loading state or redirect. 
  // For now, we'll render a "Not Found" state if doctor is missing to strictly avoid showing unrelated data.
  if (!doctor) {
     return (
        <div className="min-h-screen py-8 bg-background flex items-center justify-center">
             <div className="text-center">
                 <h2 className="text-xl font-semibold mb-2">Doctor Not Found</h2>
                 <p className="text-muted-foreground mb-4">Please select a doctor from the list.</p>
                 <Button onClick={() => onNavigate('book-doctor')}>Go to Search</Button>
             </div>
        </div>
     );
  }

  // Use the passed doctor data. Fallback to empty strings/arrays if specific fields are missing.
  // We strictly avoid using hardcoded "Dr. Priya Sharma" data for other doctors.
  const displayDoctor = {
      name: doctor.name || doctor.fullName || "Unknown Doctor",
      specialty: doctor.specialty || "Specialist",
      subSpecialty: doctor.subSpecialty || "",
      experience: doctor.experience || "Experience not listed",
      rating: doctor.rating || "N/A",
      reviews: doctor.reviews || 0,
      consultations: doctor.consultations || 0,
      location: doctor.location || "Location not listed",
      hospital: doctor.hospital || "Hospital not listed",
      consultationFee: doctor.consultationFee || 0,
      languages: doctor.languages || ["English"], // Default to English if not specified
      verified: doctor.verified || false,
      verificationStatus: doctor.verification_status || (doctor.verified ? 'verified_doctor' : null),
      image: doctor.image || null
  };

  // For arrays, we only show what's in the doctor object. 
  // If the backend doesn't return these yet, we show empty states or specific messages.
  const education = doctor.education || [];
  const experience = doctor.experienceList || []; // distinct from 'experience' string
  const awards = doctor.awards || [];
  const services = doctor.services || [];
  const reviews = doctor.reviewsList || [];
  const availability = doctor.availability || [
    { day: "Monday", slots: ["09:00 AM - 05:00 PM"] },
    { day: "Tuesday", slots: ["09:00 AM - 05:00 PM"] },
    { day: "Wednesday", slots: ["09:00 AM - 05:00 PM"] },
    { day: "Thursday", slots: ["09:00 AM - 05:00 PM"] },
    { day: "Friday", slots: ["09:00 AM - 05:00 PM"] }
  ]; // Fallback to standard hours if specific slots not provided

  return (
    <div className="min-h-screen py-[24px] bg-background px-[0px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-2 text-xs h-7"
          onClick={() => onNavigate('book-doctor')}
        >
          <ChevronLeft className="w-3 h-3 mr-1" />
          Back to Search
        </Button>

        <div className="grid lg:grid-cols-12 gap-3">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-3">
            {/* Doctor Profile Card */}
            <Card className="p-3">
              <div className="flex gap-3">
                {/* Doctor Image */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {displayDoctor.image ? (
                        <img src={displayDoctor.image} alt={displayDoctor.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xl text-slate-400">{displayDoctor.name.charAt(0)}</span>
                    )}
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h1 className="text-xl">{displayDoctor.name}</h1>
                        <VerificationBadge status={displayDoctor.verificationStatus} />
                      </div>
                      <p className="text-xs text-muted-foreground">{displayDoctor.specialty}</p>
                      <p className="text-xs text-muted-foreground">{displayDoctor.subSpecialty}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{displayDoctor.rating}</span>
                      <span className="text-muted-foreground">({displayDoctor.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Briefcase className="w-3 h-3" />
                      <span>{displayDoctor.experience}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <CheckCircle className="w-3 h-3" />
                      <span>{displayDoctor.consultations} consults</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs">{displayDoctor.hospital}, {displayDoctor.location}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Languages:</span>
                    {displayDoctor.languages.map((lang: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1.5 mt-3 pt-3 border-t border-border">
                <Button className="flex-1 text-xs h-8" onClick={() => onNavigate('booking', doctor)}>
                  <Calendar className="w-3 h-3 mr-1" />
                  Book
                </Button>
                <Button variant="outline" className="flex-1 text-xs h-8">
                  <Video className="w-3 h-3 mr-1" />
                  Video
                </Button>
                {/* Other buttons remain same */}
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <Phone className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <MessageSquare className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <Share2 className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <Heart className="w-3 h-3" />
                </Button>
              </div>
            </Card>

            {/* Tabs for Details */}
            <Tabs defaultValue="overview" className="space-y-2">
              <TabsList className="w-full justify-start h-8">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="education" className="text-xs">Education</TabsTrigger>
                <TabsTrigger value="experience" className="text-xs">Experience</TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs">Reviews ({displayDoctor.reviews})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-2">
                {/* About */}
                <Card className="p-3">
                  <h3 className="text-sm mb-1.5">About</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {doctor.about || `Dr. ${displayDoctor.name} is a specialist in ${displayDoctor.specialty} with ${displayDoctor.experience} of experience.`}
                  </p>
                </Card>

                {/* Services */}
                <Card className="p-3">
                  <h3 className="text-sm mb-2">Services Offered</h3>
                  {services.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1.5">
                      {services.map((service: string, index: number) => (
                        <div key={index} className="flex items-center gap-1.5 text-xs">
                          <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                          <span>{service}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No services listed.</p>
                  )}
                </Card>

                {/* Awards */}
                <Card className="p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Award className="w-4 h-4 text-primary" />
                    <h3 className="text-sm">Awards & Recognition</h3>
                  </div>
                  {awards.length > 0 ? (
                      <div className="space-y-1">
                        {awards.map((award: string, index: number) => (
                          <div key={index} className="flex items-start gap-1.5 text-xs">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{award}</span>
                          </div>
                        ))}
                      </div>
                  ) : (
                      <p className="text-xs text-muted-foreground">No awards listed.</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="education">
                <Card className="p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <h3 className="text-sm">Education & Qualifications</h3>
                  </div>
                  {education.length > 0 ? (
                      <div className="space-y-2">
                        {education.map((edu: any, index: number) => (
                          <div key={index} className="pb-2 border-b border-border last:border-0 last:pb-0">
                            <div className="font-medium text-xs mb-0.5">{edu.degree}</div>
                            <div className="text-xs text-muted-foreground">{edu.institution}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{edu.year}</div>
                          </div>
                        ))}
                      </div>
                  ) : (
                      <p className="text-xs text-muted-foreground">No education details listed.</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="experience">
                <Card className="p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <h3 className="text-sm">Professional Experience</h3>
                  </div>
                  {experience.length > 0 ? (
                      <div className="space-y-2">
                        {experience.map((exp: any, index: number) => (
                          <div key={index} className="pb-2 border-b border-border last:border-0 last:pb-0">
                            <div className="font-medium text-xs mb-0.5">{exp.position}</div>
                            <div className="text-xs text-muted-foreground">{exp.hospital}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{exp.duration}</div>
                          </div>
                        ))}
                      </div>
                  ) : (
                      <p className="text-xs text-muted-foreground">No experience details listed.</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-2">
                {/* Reviews List */}
                {reviews.length > 0 ? (
                    reviews.map((review: any) => (
                      <Card key={review.id} className="p-3">
                        <div className="flex items-start justify-between mb-1.5">
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-xs font-medium">{review.patient}</span>
                              {review.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="w-3 h-3 mr-0.5" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
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
                        <p className="text-xs text-muted-foreground">{review.comment}</p>
                      </Card>
                    ))
                ) : (
                    <Card className="p-3 text-center">
                        <p className="text-xs text-muted-foreground">No reviews yet.</p>
                    </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            {/* Consultation Fee */}
            <Card className="p-3 bg-slate-50 border-border">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-0.5">Consultation Fee</div>
                <div className="text-2xl font-medium mb-2">₹{displayDoctor.consultationFee}</div>
                <Button className="w-full text-xs h-8" onClick={() => onNavigate('booking', doctor)}>
                  Book Appointment
                </Button>
              </div>
            </Card>

            {/* Availability */}
            <Card className="p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="text-sm">Availability</h3>
              </div>
              <div className="space-y-1">
                {availability.map((day: any) => (
                  <div key={day.day} className="flex justify-between text-xs pb-1 border-b border-border last:border-0">
                    <span className="font-medium">{day.day}</span>
                    <div className="text-right text-muted-foreground">
                      {day.slots.map((slot: string, index: number) => (
                        <div key={index}>{slot}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Location */}
            <Card className="p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="text-sm">Location</h3>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-medium">{displayDoctor.hospital}</div>
                <div className="text-xs text-muted-foreground">{displayDoctor.location}</div>
                <div className="aspect-video bg-accent rounded-lg overflow-hidden mt-2">
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    Map View
                  </div>
                </div>
                <Button variant="outline" className="w-full text-xs h-7 mt-1.5">
                  Get Directions
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
