import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Video, Calendar, ChevronRight, Shield, Clock, User, FileText, CreditCard, Check, ChevronLeft, X, Phone, Loader2, Stethoscope } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { VerificationBadge } from './ui/VerificationBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import { useAppNavigate } from '../hooks/useAppNavigate';

export function BookDoctorPage() {
  const { navigate } = useAppNavigate();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedHospital, setSelectedHospital] = useState("all");
  
  // Quick filter states
  const [filterAvailableToday, setFilterAvailableToday] = useState(false);
  const [filterVideoConsultation, setFilterVideoConsultation] = useState(false);
  const [filterHighlyRated, setFilterHighlyRated] = useState(false);
  const [filterAcceptInsurance, setFilterAcceptInsurance] = useState(false);
  
  // Lazy loading state
  const [displayedCount, setDisplayedCount] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  const specialties = [
    "Cardiologist",
    "Orthopedic Surgeon",
    "Dermatologist",
    "General Physician",
    "Pediatrician",
    "Gynecologist",
    "Neurologist",
    "Psychiatrist"
  ];

  const locations = [
    "Mumbai",
    "Pune",
    "Bangalore",
    "Delhi",
    "Hyderabad",
    "Chennai",
    "Kolkata"
  ];

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        if (!projectId) return;
        
        // Fetch Doctors
        const doctorsPromise = fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctors?t=${Date.now()}`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` },
            cache: 'no-store'
        });

        // Fetch Hospitals
        const hospitalsPromise = fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/hospitals?t=${Date.now()}`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` },
            cache: 'no-store'
        });

        const [doctorsResponse, hospitalsResponse] = await Promise.all([doctorsPromise, hospitalsPromise]);

        if (doctorsResponse.ok) {
          const data = await doctorsResponse.json();
          setDoctors(Array.isArray(data) ? data : []);
        }

        if (hospitalsResponse.ok) {
          const data = await hospitalsResponse.json();
          setHospitals(Array.isArray(data) ? data : []);
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Unable to load data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter doctors based on all criteria
  const filteredDoctors = doctors.filter((doctor) => {
    // Basic fields with fallbacks
    const name = doctor.name || doctor.fullName || "Doctor";
    const specialty = doctor.specialty || "General";
    const location = doctor.location || "";
    const hospitalName = doctor.hospital || "";
    
    // Search query filter (name or specialty)
    const searchMatch = searchQuery === "" || 
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospitalName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Specialty filter
    const specialtyMatch = selectedSpecialty === "all" || 
      specialty.toLowerCase() === selectedSpecialty.toLowerCase();
    
    // Location filter
    const locationMatch = selectedLocation === "all" || 
      location.toLowerCase().includes(selectedLocation.toLowerCase());
      
    // Hospital filter
    const hospitalMatch = selectedHospital === "all" || 
      hospitalName.toLowerCase() === selectedHospital.toLowerCase();
    
    // Quick filters
    const availableTodayMatch = !filterAvailableToday || doctor.availableToday;
    const videoConsultationMatch = !filterVideoConsultation || doctor.videoConsultation;
    const highlyRatedMatch = !filterHighlyRated || (doctor.rating || 0) >= 4.5;
    const acceptInsuranceMatch = !filterAcceptInsurance || doctor.acceptsInsurance;
    
    return searchMatch && specialtyMatch && locationMatch && hospitalMatch &&
           availableTodayMatch && videoConsultationMatch && 
           highlyRatedMatch && acceptInsuranceMatch;
  });

  // Doctors to display with lazy loading
  const displayedDoctors = filteredDoctors.slice(0, displayedCount);

  return (
    <div className="min-h-screen py-6 pt-[24px] pr-[0px] pb-[64px] pl-[0px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl tracking-tight">Find the right doctor</h1>
          <p className="text-lg text-muted-foreground">
            Search by specialty, location, or describe your symptoms
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="grid md:grid-cols-12 gap-4">
              {/* Search Input */}
              <div className="md:col-span-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Specialty Filter */}
              <div className="md:col-span-3">
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty.toLowerCase()}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="md:col-span-3">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location.toLowerCase()}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Hospital Filter */}
              <div className="md:col-span-3">
                <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hospitals</SelectItem>
                  {hospitals.filter(h => h.name).map((hospital) => (
  <SelectItem key={hospital.id || hospital.name} value={hospital.name.toLowerCase()}>
    {hospital.name}
  </SelectItem>
))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
              <Badge
                variant={filterAvailableToday ? "default" : "secondary"}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setFilterAvailableToday(!filterAvailableToday)}
              >
                {filterAvailableToday && <Check className="w-3 h-3 mr-1" />}
                Available Today
              </Badge>
              <Badge
                variant={filterVideoConsultation ? "default" : "secondary"}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setFilterVideoConsultation(!filterVideoConsultation)}
              >
                {filterVideoConsultation && <Check className="w-3 h-3 mr-1" />}
                Video Consultation
              </Badge>
              <Badge
                variant={filterHighlyRated ? "default" : "secondary"}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setFilterHighlyRated(!filterHighlyRated)}
              >
                {filterHighlyRated && <Check className="w-3 h-3 mr-1" />}
                Highly Rated
              </Badge>
              <Badge
                variant={filterAcceptInsurance ? "default" : "secondary"}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setFilterAcceptInsurance(!filterAcceptInsurance)}
              >
                {filterAcceptInsurance && <Check className="w-3 h-3 mr-1" />}
                Accept Insurance
              </Badge>
            </div>
          </Card>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-muted-foreground">
            {isLoading ? 'Loading doctors...' : `Showing ${filteredDoctors.length} doctors`}
          </div>
          <Select defaultValue="recommended">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Doctor Cards */}
        {isLoading ? (
             <div className="text-center py-20">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">Finding the best doctors for you...</p>
             </div>
        ) : (
             <div className="space-y-4">
              {displayedDoctors.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                      <Stethoscope className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3>No doctors found</h3>
                    <p className="text-muted-foreground">
                      We couldn't find any doctors matching your criteria. Try adjusting your filters.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedSpecialty("all");
                        setSelectedLocation("all");
                        setSelectedHospital("all");
                        setFilterAvailableToday(false);
                        setFilterVideoConsultation(false);
                        setFilterHighlyRated(false);
                        setFilterAcceptInsurance(false);
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </Card>
              ) : (
                displayedDoctors.map((doctor) => (
                  <Card 
                    key={doctor.id} 
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => navigate('doctor-detail', doctor)}
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Doctor Image */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-accent rounded-xl overflow-hidden relative">
                           {doctor.image ? (
                               <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                           ) : (
                               <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                  <span className="text-2xl text-primary font-bold">
                                      {(doctor.name || 'Dr').charAt(0)}
                                  </span>
                               </div>
                           )}
                        </div>
                      </div>

                      {/* Doctor Info */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{doctor.name || 'Doctor'}</h3>
                                <VerificationBadge status={doctor.verification_status || (doctor.verified ? 'verified_doctor' : null)} showLabel={false} />
                              </div>
                              <div className="text-muted-foreground font-medium">{doctor.specialty || 'General Practitioner'}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-foreground font-semibold">
                                 {doctor.consultationFee ? `₹${doctor.consultationFee}` : 'Contact for Fee'}
                              </div>
                              <div className="text-sm text-muted-foreground">Consultation fee</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                          {doctor.rating && (
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-medium">{doctor.rating}</span>
                                <span className="text-muted-foreground">({doctor.reviews || 0} reviews)</span>
                              </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{doctor.location || 'Location Not Listed'}</span>
                          </div>
                          <div className="text-muted-foreground">
                            {doctor.experience || 'Experienced'}
                          </div>
                        </div>

                        {/* Badges/Tags */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {doctor.hospital && (
                            <Badge variant="secondary" className="font-normal bg-slate-100 hover:bg-slate-200">
                               <Stethoscope className="w-3 h-3 mr-1" /> {doctor.hospital}
                            </Badge>
                          )}
                          {doctor.videoConsultation && (
                            <Badge variant="secondary" className="font-normal bg-blue-50 text-blue-700 hover:bg-blue-100">
                               <Video className="w-3 h-3 mr-1" /> Video Available
                            </Badge>
                          )}
                          {doctor.availableToday && (
                             <Badge variant="secondary" className="font-normal bg-green-50 text-green-700 hover:bg-green-100">
                                <Clock className="w-3 h-3 mr-1" /> Available Today
                             </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 justify-center min-w-[140px]">
                        <Button 
                            className="w-full"
                            onClick={(e) => { e.stopPropagation(); navigate('booking', doctor); }}
                        >
                          Book Appointment
                        </Button>
                        <Button variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); navigate('doctor-detail', doctor); }}>
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
        )}

        {/* Load More */}
        {displayedDoctors.length < filteredDoctors.length && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => setDisplayedCount(prev => prev + 4)}
            >
              Load More Doctors
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
