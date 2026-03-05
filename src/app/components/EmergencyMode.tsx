import { Phone, MapPin, Activity, AlertCircle, Navigation, Clock, Shield, Heart } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import logo from 'figma:asset/79875bb7427953c37958c445f51a4ce2f3d7aa79.png';
import { useAppNavigate } from '../hooks/useAppNavigate';

export function EmergencyMode() {
  const { navigate } = useAppNavigate();
  const nearbyHospitals = [
    {
      id: 1,
      name: "Apollo Hospital",
      distance: "1.2 km",
      waitTime: "5 min",
      available: "Emergency Available",
      phone: "+91 22 1234 5678"
    },
    {
      id: 2,
      name: "Fortis Hospital",
      distance: "2.8 km",
      waitTime: "8 min",
      available: "Emergency Available",
      phone: "+91 22 8765 4321"
    },
    {
      id: 3,
      name: "Lilavati Hospital",
      distance: "3.5 km",
      waitTime: "12 min",
      available: "Emergency Available",
      phone: "+91 22 2345 6789"
    }
  ];

  const firstAidGuides = [
    { id: 1, title: "Heart Attack", icon: <Heart className="w-5 h-5" /> },
    { id: 2, title: "Stroke", icon: <Activity className="w-5 h-5" /> },
    { id: 3, title: "Severe Bleeding", icon: <AlertCircle className="w-5 h-5" /> },
    { id: 4, title: "Burns", icon: <Shield className="w-5 h-5" /> }
  ];

  return (
    <div className="h-screen pt-20 pb-16 bg-red-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emergency Header */}
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl mb-1 text-red-900">Emergency Mode</h1>
          <p className="text-sm text-red-700">We're here to help. Stay calm.</p>
        </div>

        {/* Emergency Actions */}
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <Button 
            size="lg" 
            className="h-auto py-4 bg-red-600 hover:bg-red-700 text-white"
          >
            <Phone className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="text-base">Call Ambulance</div>
              <div className="text-xs opacity-90">102 / 108</div>
            </div>
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="h-auto py-4 border-2 border-red-600 text-red-900 hover:bg-red-100"
          >
            <Navigation className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="text-base">Navigate to Hospital</div>
              <div className="text-xs opacity-70">Nearest emergency</div>
            </div>
          </Button>
        </div>

        {/* Current Location */}
        <Card className="p-3 mb-6 bg-white border-red-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Your location</div>
              <div className="text-sm text-foreground">Andheri West, Mumbai, Maharashtra</div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-0 text-xs">Detected</Badge>
          </div>
        </Card>

        {/* Nearby Hospitals */}
        <div className="mb-6">
          <h2 className="text-xl mb-3 text-red-900">Nearest Emergency Services</h2>
          <div className="space-y-2">
            {nearbyHospitals.map((hospital) => (
              <Card key={hospital.id} className="p-3 bg-white hover:shadow-md transition-shadow border-red-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-0.5 text-sm text-red-900">{hospital.name}</h3>
                    <div className="flex flex-wrap gap-2 text-xs mb-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{hospital.distance}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{hospital.waitTime} away</span>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                      {hospital.available}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-xs">
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Navigation className="w-3 h-3 mr-1" />
                      Navigate
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* First Aid Guides */}
        <div className="mb-6">
          <h2 className="text-xl mb-3 text-red-900">Quick First Aid Guides</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {firstAidGuides.map((guide) => (
              <Card key={guide.id} className="p-3 bg-white hover:bg-red-50 transition-colors cursor-pointer border-red-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                    {guide.icon}
                  </div>
                  <span className="text-sm text-red-900">{guide.title}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <Card className="p-4 bg-white border-red-200">
          <h3 className="mb-3 text-sm text-red-900">Emergency Contacts</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-foreground">Ambulance</span>
              <Button size="sm" variant="outline" className="text-xs h-8">
                <Phone className="w-3 h-3 mr-1" />
                102 / 108
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-foreground">Police</span>
              <Button size="sm" variant="outline" className="text-xs h-8">
                <Phone className="w-3 h-3 mr-1" />
                100
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-foreground">Fire</span>
              <Button size="sm" variant="outline" className="text-xs h-8">
                <Phone className="w-3 h-3 mr-1" />
                101
              </Button>
            </div>
          </div>
        </Card>

        {/* Exit Emergency Mode */}
        <div className="mt-6 text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('home')}
            className="text-sm text-red-700 hover:text-red-900"
          >
            Exit Emergency Mode
          </Button>
        </div>
      </div>
    </div>
  );
}