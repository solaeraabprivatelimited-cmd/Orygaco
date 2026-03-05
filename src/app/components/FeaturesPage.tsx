import { Video, Shield, Activity, MapPin, Users, Smartphone, AlertCircle, FileText, Heart, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAppNavigate } from '../hooks/useAppNavigate';

export function FeaturesPage() {
  const { navigate } = useAppNavigate();
  const features = [
    {
      icon: <Video className="w-8 h-8" />,
      title: "Teleconsultation",
      description: "Connect with doctors through secure video calls from the comfort of your home. No travel, no waiting rooms.",
      benefits: [
        "HD video & audio quality",
        "Secure & private consultations",
        "Instant prescriptions",
        "Chat history & notes"
      ],
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: <AlertCircle className="w-8 h-8" />,
      title: "Emergency Red Alert",
      description: "One-tap access to emergency services. Get immediate help when every second counts.",
      benefits: [
        "Instant ambulance booking",
        "Location-based hospital finder",
        "First-aid guidance",
        "Emergency contacts"
      ],
      color: "bg-red-50 text-red-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Guardian Mode",
      description: "Manage healthcare for your entire family from one account. Perfect for caring for elderly parents or children.",
      benefits: [
        "Multiple family profiles",
        "Remote appointment booking",
        "Health alerts & reminders",
        "Shared medical records"
      ],
      color: "bg-purple-50 text-purple-600"
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: "AI Health Companion",
      description: "Your personal health assistant. Get answers to health questions, understand symptoms, and track your wellness.",
      benefits: [
        "Symptom checker",
        "Medication reminders",
        "Health insights",
        "Personalized recommendations"
      ],
      color: "bg-green-50 text-green-600"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Digital Health Records",
      description: "All your health records in one secure place. ABDM integrated for complete portability.",
      benefits: [
        "ABDM compliant",
        "Secure cloud storage",
        "Easy sharing with doctors",
        "Lab reports & prescriptions"
      ],
      color: "bg-amber-50 text-amber-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "ABDM Integration",
      description: "Connected to India's Ayushman Bharat Digital Mission for seamless healthcare access.",
      benefits: [
        "Portable health records",
        "Government approved",
        "DigiLocker integration",
        "Universal health ID"
      ],
      color: "bg-indigo-50 text-indigo-600"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Home Visits",
      description: "Book qualified doctors, nurses, and healthcare professionals for home visits.",
      benefits: [
        "Verified professionals",
        "Flexible scheduling",
        "Sample collection",
        "Follow-up care"
      ],
      color: "bg-teal-50 text-teal-600"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Telehealth Kiosks",
      description: "Access healthcare in rural areas through our network of telehealth kiosks.",
      benefits: [
        "500+ locations",
        "Basic diagnostics",
        "Video consultation",
        "Medicine dispensing"
      ],
      color: "bg-cyan-50 text-cyan-600"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Health Monitoring",
      description: "Track your vitals, medications, and health goals all in one place.",
      benefits: [
        "Vitals tracking",
        "Medication adherence",
        "Goal setting",
        "Progress reports"
      ],
      color: "bg-pink-50 text-pink-600"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support and medical assistance whenever you need it.",
      benefits: [
        "Always available",
        "Multi-language support",
        "Quick response",
        "Medical guidance"
      ],
      color: "bg-violet-50 text-violet-600"
    }
  ];

  return (
    <div className="min-h-screen pt-[32px] pb-[64px] pr-[0px] pl-[0px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <Badge className="mb-4">All Features</Badge>
          <h1 className="text-4xl md:text-5xl tracking-tight mb-6">
            Everything you need for <span className="text-primary">better health</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From everyday consultations to emergencies, ORYGA provides comprehensive healthcare solutions for every situation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 hover:shadow-xl transition-all">
              <div className="space-y-6">
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center`}>
                  {feature.icon}
                </div>
                
                <div>
                  <h3 className="mb-3 text-2xl">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {feature.description}
                  </p>
                </div>

                <div className="space-y-3">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Platform Access */}
        <div className="mb-16">
          <h2 className="text-3xl tracking-tight text-center mb-12">
            Access ORYGA everywhere
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="mb-2">Mobile Apps</h3>
              <p className="text-sm text-muted-foreground mb-4">
                iOS and Android apps for patients and doctors
              </p>
              <Button variant="outline" size="sm">Download App</Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-primary" />
              </div>
              <h3 className="mb-2">Web Platform</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Full-featured web access from any browser
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate('book-doctor')}>
                Get Started
              </Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="mb-2">Kiosk Network</h3>
              <p className="text-sm text-muted-foreground mb-4">
                500+ telehealth kiosks in rural areas
              </p>
              <Button variant="outline" size="sm">Find Kiosk</Button>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="p-12 bg-gradient-to-br from-primary to-primary/80 text-white text-center">
          <h2 className="text-3xl md:text-4xl mb-6 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of patients and doctors who trust ORYGA for their healthcare needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('book-doctor')}
            >
              Book Your First Appointment
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10"
              onClick={() => navigate('patient-app')}
            >
              Download App
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}