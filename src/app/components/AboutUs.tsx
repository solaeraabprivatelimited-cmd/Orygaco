import { Heart, Users, Building2, Award, Shield, Target, Zap, Globe, CheckCircle, ArrowRight } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAppNavigate } from '../hooks/useAppNavigate';

export function AboutUs() {
  const { navigate } = useAppNavigate();
  const values = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Patient-First Always",
      description: "Every decision we make starts with one question: How does this serve our patients better?"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Trust & Privacy",
      description: "Your health data is sacred. We maintain the highest standards of security and confidentiality."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Innovation with Care",
      description: "We blend cutting-edge technology with the human touch that healthcare needs."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Healthcare for All",
      description: "Quality healthcare shouldn't be a privilege. We're making it accessible across India."
    }
  ];

  const stats = [
    { value: "100K+", label: "Active Patients" },
    { value: "5,000+", label: "Verified Doctors" },
    { value: "500+", label: "Partner Hospitals" },
    { value: "150+", label: "Cities Covered" }
  ];

  const team = [
    {
      name: "Dr. Anjali Mehta",
      role: "Founder & CEO",
      specialty: "MD, Public Health",
      description: "15+ years in healthcare innovation"
    },
    {
      name: "Rahul Sharma",
      role: "Co-Founder & CTO",
      specialty: "Tech & AI Expert",
      description: "Former engineering lead at major tech firm"
    },
    {
      name: "Dr. Priya Verma",
      role: "Chief Medical Officer",
      specialty: "MBBS, Healthcare Policy",
      description: "20+ years clinical experience"
    },
    {
      name: "Amit Kumar",
      role: "Head of Operations",
      specialty: "Healthcare Management",
      description: "Scaled operations across 100+ cities"
    }
  ];

  const milestones = [
    { year: "2022", event: "ORYGA founded with vision to transform Indian healthcare" },
    { year: "2023", event: "Launched in 50 cities, partnered with 200+ hospitals" },
    { year: "2024", event: "Crossed 100K patients, introduced AI health companion" },
    { year: "2025", event: "Expanded to 150+ cities, ABDM certified, ISO compliant" }
  ];

  const certifications = [
    { name: "ABDM Certified", description: "Ayushman Bharat Digital Mission" },
    { name: "ISO 27001", description: "Information Security" },
    { name: "ISO 9001", description: "Quality Management" },
    { name: "HIPAA Compliant", description: "Healthcare Data Privacy" }
  ];

  return (
    <div className="min-h-screen pt-[24px] bg-background pr-[0px] pb-[0px] pl-[0px] p-[0px]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-[24px] pr-[16px] pb-[80px] pl-[16px]">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">About ORYGA</Badge>
            <h1 className="text-5xl tracking-tight mb-6">
              Reimagining Healthcare<br />for Every Indian
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              We're building India's most trusted healthcare platform — one that combines the warmth of human care with the power of technology.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button 
                onClick={() => navigate('book-doctor')}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Book a Consultation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('features')}
              >
                Explore Features
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-y border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Our Mission</Badge>
            <h2 className="text-3xl mb-4">Healthcare OS for Modern India</h2>
            <p className="text-muted-foreground mb-4">
              ORYGA started with a simple observation: healthcare in India is fragmented. Patients struggle to find the right doctor, medical records are scattered, and quality care feels out of reach for many.
            </p>
            <p className="text-muted-foreground mb-4">
              We're changing that. ORYGA is more than a doctor booking app — it's a complete Healthcare Operating System that brings together patients, doctors, and hospitals on one intelligent platform.
            </p>
            <p className="text-muted-foreground">
              From Tier 1 metros to Tier 3 cities, we're making world-class healthcare accessible, affordable, and genuinely human-centered.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="text-center p-8">
                <Heart className="w-20 h-20 text-primary mx-auto mb-4" />
                <div className="text-2xl mb-2">Healthcare that cares</div>
                <div className="text-muted-foreground">Technology with humanity</div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Our Values</Badge>
            <h2 className="text-3xl mb-2">What We Stand For</h2>
            <p className="text-muted-foreground">The principles that guide every decision we make</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((value, index) => (
              <Card key={index} className="p-5 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Journey/Milestones */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Our Journey</Badge>
            <h2 className="text-3xl mb-2">Growing Together</h2>
            <p className="text-muted-foreground">Key milestones in our mission to transform healthcare</p>
          </div>
          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-4 mb-6 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium flex-shrink-0">
                    {milestone.year}
                  </div>
                  {index !== milestones.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border mt-2"></div>
                  )}
                </div>
                <Card className="flex-1 p-4 mb-4">
                  <p className="text-muted-foreground">{milestone.event}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Team */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Leadership</Badge>
            <h2 className="text-3xl mb-2">Meet Our Team</h2>
            <p className="text-muted-foreground">Healthcare experts and technologists united by one mission</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {team.map((member, index) => (
              <Card key={index} className="p-5 text-center hover:shadow-md transition-shadow">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <h3 className="mb-1">{member.name}</h3>
                <div className="text-sm text-primary mb-2">{member.role}</div>
                <div className="text-xs text-muted-foreground mb-2">{member.specialty}</div>
                <p className="text-xs text-muted-foreground">{member.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Certifications & Trust */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Trust & Security</Badge>
            <h2 className="text-3xl mb-2">Certified & Compliant</h2>
            <p className="text-muted-foreground">Your trust is our responsibility</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {certifications.map((cert, index) => (
              <Card key={index} className="p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 mx-auto mb-3 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg mb-1">{cert.name}</h3>
                <p className="text-xs text-muted-foreground">{cert.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 text-center">
          <Target className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl mb-3">Join Us in Transforming Healthcare</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Whether you're a patient seeking better care, a doctor wanting to make an impact, or a hospital looking to modernize — ORYGA is built for you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button 
              onClick={() => navigate('book-doctor')}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Book Your First Appointment
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('doctor-app')}
            >
              Join as Doctor
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('hospital-admin')}
            >
              Partner as Hospital
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}