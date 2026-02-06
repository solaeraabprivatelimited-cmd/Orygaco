import { useState } from 'react';
import { FileText, Download, Search, Filter, ChevronLeft, Calendar, User, Pill, TestTube, Syringe, Heart, Eye, Share2, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface HealthRecordsPageProps {
  onNavigate: (view: string) => void;
  onBack: () => void;
}

type ViewMode = 'list' | 'detail';
type RecordType = 'prescription' | 'lab-report' | 'consultation' | 'vaccination' | 'imaging';

interface HealthRecord {
  id: number;
  type: RecordType;
  title: string;
  date: string;
  doctor: string;
  hospital: string;
  details?: any;
}

const mockRecords: HealthRecord[] = [
  {
    id: 1,
    type: 'prescription',
    title: 'Cardiac Medication',
    date: '2024-12-20',
    doctor: 'Dr. Priya Sharma',
    hospital: 'Apollo Hospitals, Indore',
    details: {
      diagnosis: 'Hypertension Management',
      medications: [
        { name: 'Metoprolol', dosage: '50mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take in the morning with food' },
        { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take after dinner' },
        { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take at bedtime' }
      ],
      symptoms: 'Elevated blood pressure, occasional headaches',
      followUp: 'Review in 2 weeks',
      notes: 'Monitor blood pressure daily. Maintain low-salt diet.'
    }
  },
  {
    id: 2,
    type: 'lab-report',
    title: 'Complete Blood Count (CBC)',
    date: '2024-12-18',
    doctor: 'Dr. Rajesh Kumar',
    hospital: 'Max Healthcare, Indore',
    details: {
      testName: 'Complete Blood Count',
      reportId: 'LAB-2024-1218-001',
      tests: [
        { parameter: 'Hemoglobin', value: '14.2', unit: 'g/dL', range: '13.0-17.0', status: 'normal' },
        { parameter: 'WBC Count', value: '7,800', unit: '/μL', range: '4,000-11,000', status: 'normal' },
        { parameter: 'RBC Count', value: '5.1', unit: 'million/μL', range: '4.5-5.9', status: 'normal' },
        { parameter: 'Platelets', value: '245,000', unit: '/μL', range: '150,000-400,000', status: 'normal' },
        { parameter: 'ESR', value: '8', unit: 'mm/hr', range: '0-20', status: 'normal' }
      ],
      summary: 'All parameters within normal limits',
      verifiedBy: 'Dr. Meera Iyer (Pathologist)'
    }
  },
  {
    id: 3,
    type: 'consultation',
    title: 'Cardiology Consultation',
    date: '2024-12-15',
    doctor: 'Dr. Priya Sharma',
    hospital: 'Apollo Hospitals, Indore',
    details: {
      chiefComplaint: 'Chest pain and breathlessness',
      vitals: {
        bp: '142/88 mmHg',
        pulse: '82 bpm',
        temp: '98.2°F',
        spo2: '97%',
        weight: '78 kg',
        height: '175 cm'
      },
      examination: 'Cardiovascular examination revealed regular rhythm, no murmurs. Respiratory system normal.',
      diagnosis: 'Hypertension (Stage 1), Anxiety-related chest discomfort',
      treatment: 'Started on antihypertensive medication. Advised lifestyle modifications.',
      advice: 'Low-salt diet, regular exercise (30 min walking daily), stress management, avoid smoking and alcohol'
    }
  },
  {
    id: 4,
    type: 'lab-report',
    title: 'Lipid Profile',
    date: '2024-12-10',
    doctor: 'Dr. Priya Sharma',
    hospital: 'Apollo Hospitals, Indore',
    details: {
      testName: 'Lipid Profile',
      reportId: 'LAB-2024-1210-089',
      tests: [
        { parameter: 'Total Cholesterol', value: '198', unit: 'mg/dL', range: '<200', status: 'normal' },
        { parameter: 'LDL Cholesterol', value: '118', unit: 'mg/dL', range: '<100', status: 'borderline' },
        { parameter: 'HDL Cholesterol', value: '52', unit: 'mg/dL', range: '>40', status: 'normal' },
        { parameter: 'Triglycerides', value: '145', unit: 'mg/dL', range: '<150', status: 'normal' },
        { parameter: 'VLDL Cholesterol', value: '29', unit: 'mg/dL', range: '<30', status: 'normal' }
      ],
      summary: 'LDL slightly elevated. Recommend dietary modification and statin therapy.',
      verifiedBy: 'Dr. Arun Patel (Pathologist)'
    }
  },
  {
    id: 5,
    type: 'vaccination',
    title: 'COVID-19 Booster Dose',
    date: '2024-11-05',
    doctor: 'Dr. Amit Verma',
    hospital: 'Government Hospital, Indore',
    details: {
      vaccineName: 'Covishield (Booster)',
      batchNo: 'CVD-2024-B-4532',
      manufacturer: 'Serum Institute of India',
      site: 'Left upper arm',
      nextDose: 'Not required',
      sideEffects: 'Mild pain at injection site (resolved in 24 hours)',
      certificateNo: 'IN-MP-2024-11-001234'
    }
  },
  {
    id: 6,
    type: 'imaging',
    title: 'Chest X-Ray',
    date: '2024-12-15',
    doctor: 'Dr. Priya Sharma',
    hospital: 'Apollo Hospitals, Indore',
    details: {
      studyType: 'Chest X-Ray PA View',
      reportId: 'RAD-2024-1215-067',
      indication: 'Chest pain evaluation',
      findings: 'Heart size normal. Lung fields clear. No active pulmonary pathology. No pleural effusion. Bony structures normal.',
      impression: 'Normal chest X-ray',
      radiologist: 'Dr. Sneha Desai (MD Radiology)'
    }
  },
  {
    id: 7,
    type: 'prescription',
    title: 'Antibiotic Course',
    date: '2024-11-28',
    doctor: 'Dr. Karan Malhotra',
    hospital: 'Medanta Hospital, Indore',
    details: {
      diagnosis: 'Upper Respiratory Tract Infection',
      medications: [
        { name: 'Azithromycin', dosage: '500mg', frequency: 'Once daily', duration: '5 days', instructions: 'Take 1 hour before food' },
        { name: 'Paracetamol', dosage: '650mg', frequency: 'Three times daily', duration: '5 days', instructions: 'Take after meals if fever persists' },
        { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily at bedtime', duration: '7 days', instructions: 'For allergic symptoms' }
      ],
      symptoms: 'Fever, sore throat, nasal congestion',
      followUp: 'If symptoms persist beyond 5 days',
      notes: 'Complete the full antibiotic course. Stay hydrated. Rest adequately.'
    }
  },
  {
    id: 8,
    type: 'lab-report',
    title: 'HbA1c Test',
    date: '2024-11-20',
    doctor: 'Dr. Priya Sharma',
    hospital: 'Apollo Hospitals, Indore',
    details: {
      testName: 'Glycated Hemoglobin (HbA1c)',
      reportId: 'LAB-2024-1120-234',
      tests: [
        { parameter: 'HbA1c', value: '5.4', unit: '%', range: '<5.7', status: 'normal' },
        { parameter: 'Estimated Average Glucose', value: '108', unit: 'mg/dL', range: '<117', status: 'normal' }
      ],
      summary: 'No diabetes. Maintain healthy lifestyle.',
      verifiedBy: 'Dr. Priya Menon (Pathologist)'
    }
  }
];

export function HealthRecordsPage({ onNavigate, onBack }: HealthRecordsPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredRecords = mockRecords.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || record.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleViewRecord = (record: HealthRecord) => {
    setSelectedRecord(record);
    setViewMode('detail');
  };

  const getRecordIcon = (type: RecordType) => {
    switch (type) {
      case 'prescription': return <Pill className="w-4 h-4" />;
      case 'lab-report': return <TestTube className="w-4 h-4" />;
      case 'consultation': return <Heart className="w-4 h-4" />;
      case 'vaccination': return <Syringe className="w-4 h-4" />;
      case 'imaging': return <Eye className="w-4 h-4" />;
    }
  };

  const getRecordColor = (type: RecordType) => {
    switch (type) {
      case 'prescription': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'lab-report': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'consultation': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'vaccination': return 'bg-green-100 text-green-700 border-green-200';
      case 'imaging': return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  if (viewMode === 'detail' && selectedRecord) {
    return (
      <div className="h-screen pt-24 pb-16 bg-background overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setViewMode('list')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Records
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-6 pb-6 border-b border-border">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getRecordColor(selectedRecord.type)}`}>
                    {getRecordIcon(selectedRecord.type)}
                  </div>
                  <div>
                    <h1 className="text-2xl mb-1">{selectedRecord.title}</h1>
                    <div className="text-sm text-muted-foreground">
                      {new Date(selectedRecord.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className={getRecordColor(selectedRecord.type)}>
                {selectedRecord.type.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Doctor</div>
                  <div className="font-medium">{selectedRecord.doctor}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Hospital</div>
                  <div className="font-medium">{selectedRecord.hospital}</div>
                </div>
              </div>
            </div>

            {/* Prescription Details */}
            {selectedRecord.type === 'prescription' && selectedRecord.details && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg mb-3">Diagnosis</h3>
                  <p className="text-muted-foreground">{selectedRecord.details.diagnosis}</p>
                </div>

                <div>
                  <h3 className="text-lg mb-3">Symptoms</h3>
                  <p className="text-muted-foreground">{selectedRecord.details.symptoms}</p>
                </div>

                <div>
                  <h3 className="text-lg mb-3">Medications Prescribed</h3>
                  <div className="space-y-3">
                    {selectedRecord.details.medications.map((med: any, index: number) => (
                      <Card key={index} className="p-4 bg-accent/30">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium mb-1">{med.name}</h4>
                            <div className="text-sm text-muted-foreground">
                              {med.dosage} • {med.frequency} • {med.duration}
                            </div>
                          </div>
                          <Badge variant="outline">Rx</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Instructions:</strong> {med.instructions}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {selectedRecord.details.followUp && (
                  <div>
                    <h3 className="text-lg mb-3">Follow-up</h3>
                    <p className="text-muted-foreground">{selectedRecord.details.followUp}</p>
                  </div>
                )}

                {selectedRecord.details.notes && (
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <h3 className="text-lg mb-2 text-amber-900">Important Notes</h3>
                    <p className="text-sm text-amber-800">{selectedRecord.details.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Lab Report Details */}
            {selectedRecord.type === 'lab-report' && selectedRecord.details && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg">{selectedRecord.details.testName}</h3>
                    <p className="text-sm text-muted-foreground">Report ID: {selectedRecord.details.reportId}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 text-sm font-medium">Parameter</th>
                        <th className="text-left py-3 text-sm font-medium">Value</th>
                        <th className="text-left py-3 text-sm font-medium">Unit</th>
                        <th className="text-left py-3 text-sm font-medium">Normal Range</th>
                        <th className="text-left py-3 text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecord.details.tests.map((test: any, index: number) => (
                        <tr key={index} className="border-b border-border last:border-0">
                          <td className="py-3 text-sm font-medium">{test.parameter}</td>
                          <td className="py-3 text-sm">{test.value}</td>
                          <td className="py-3 text-sm text-muted-foreground">{test.unit}</td>
                          <td className="py-3 text-sm text-muted-foreground">{test.range}</td>
                          <td className="py-3">
                            <Badge 
                              variant="outline" 
                              className={
                                test.status === 'normal' 
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : test.status === 'borderline'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }
                            >
                              {test.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <h4 className="font-medium mb-2 text-blue-900">Summary</h4>
                  <p className="text-sm text-blue-800">{selectedRecord.details.summary}</p>
                </div>

                <div className="text-sm text-muted-foreground">
                  Verified by: {selectedRecord.details.verifiedBy}
                </div>
              </div>
            )}

            {/* Consultation Details */}
            {selectedRecord.type === 'consultation' && selectedRecord.details && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg mb-3">Chief Complaint</h3>
                  <p className="text-muted-foreground">{selectedRecord.details.chiefComplaint}</p>
                </div>

                <div>
                  <h3 className="text-lg mb-3">Vital Signs</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(selectedRecord.details.vitals).map(([key, value]) => (
                      <Card key={key} className="p-3 bg-accent/30">
                        <div className="text-xs text-muted-foreground mb-1 uppercase">{key}</div>
                        <div className="font-medium">{value as string}</div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg mb-3">Examination</h3>
                  <p className="text-muted-foreground">{selectedRecord.details.examination}</p>
                </div>

                <div>
                  <h3 className="text-lg mb-3">Diagnosis</h3>
                  <p className="text-muted-foreground">{selectedRecord.details.diagnosis}</p>
                </div>

                <div>
                  <h3 className="text-lg mb-3">Treatment Plan</h3>
                  <p className="text-muted-foreground">{selectedRecord.details.treatment}</p>
                </div>

                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <h3 className="text-lg mb-2 text-green-900">Medical Advice</h3>
                  <p className="text-sm text-green-800">{selectedRecord.details.advice}</p>
                </div>
              </div>
            )}

            {/* Vaccination Details */}
            {selectedRecord.type === 'vaccination' && selectedRecord.details && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg mb-3">Vaccine Information</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Vaccine Name</div>
                        <div className="font-medium">{selectedRecord.details.vaccineName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Batch Number</div>
                        <div className="font-medium">{selectedRecord.details.batchNo}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Manufacturer</div>
                        <div className="font-medium">{selectedRecord.details.manufacturer}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg mb-3">Administration Details</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Site</div>
                        <div className="font-medium">{selectedRecord.details.site}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Next Dose</div>
                        <div className="font-medium">{selectedRecord.details.nextDose}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Certificate No.</div>
                        <div className="font-medium">{selectedRecord.details.certificateNo}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedRecord.details.sideEffects && (
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <h4 className="font-medium mb-2 text-blue-900">Side Effects Reported</h4>
                    <p className="text-sm text-blue-800">{selectedRecord.details.sideEffects}</p>
                  </div>
                )}
              </div>
            )}

            {/* Imaging Details */}
            {selectedRecord.type === 'imaging' && selectedRecord.details && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Study Type</div>
                    <div className="font-medium">{selectedRecord.details.studyType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Report ID</div>
                    <div className="font-medium">{selectedRecord.details.reportId}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg mb-3">Clinical Indication</h3>
                  <p className="text-muted-foreground">{selectedRecord.details.indication}</p>
                </div>

                <div>
                  <h3 className="text-lg mb-3">Findings</h3>
                  <p className="text-muted-foreground">{selectedRecord.details.findings}</p>
                </div>

                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <h4 className="font-medium mb-2 text-green-900">Impression</h4>
                  <p className="text-sm text-green-800">{selectedRecord.details.impression}</p>
                </div>

                <div className="text-sm text-muted-foreground">
                  Reported by: {selectedRecord.details.radiologist}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen pt-[32px] pb-[64px] bg-background overflow-y-auto pr-[0px] pl-[0px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl mb-1">Health Records</h1>
            <p className="text-muted-foreground">Access your complete medical history</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onBack} className="flex-1 sm:flex-none">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Pill className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-medium">
                  {mockRecords.filter(r => r.type === 'prescription').length}
                </div>
                <div className="text-sm text-muted-foreground">Prescriptions</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TestTube className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-medium">
                  {mockRecords.filter(r => r.type === 'lab-report').length}
                </div>
                <div className="text-sm text-muted-foreground">Lab Reports</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <div className="text-2xl font-medium">
                  {mockRecords.filter(r => r.type === 'consultation').length}
                </div>
                <div className="text-sm text-muted-foreground">Consultations</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Syringe className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-medium">
                  {mockRecords.filter(r => r.type === 'vaccination').length}
                </div>
                <div className="text-sm text-muted-foreground">Vaccinations</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-medium">
                  {mockRecords.filter(r => r.type === 'imaging').length}
                </div>
                <div className="text-sm text-muted-foreground">Imaging</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 sm:flex-none">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="w-full justify-start h-auto p-1 bg-transparent">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-full px-4 py-2">All Records</TabsTrigger>
              <TabsTrigger value="prescription" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-full px-4 py-2">Prescriptions</TabsTrigger>
              <TabsTrigger value="lab-report" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-full px-4 py-2">Lab Reports</TabsTrigger>
              <TabsTrigger value="consultation" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-full px-4 py-2">Consultations</TabsTrigger>
              <TabsTrigger value="vaccination" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-full px-4 py-2">Vaccinations</TabsTrigger>
              <TabsTrigger value="imaging" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-full px-4 py-2">Imaging</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab}>
            <div className="space-y-3">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <Card 
                    key={record.id} 
                    className="p-5 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleViewRecord(record)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${getRecordColor(record.type)}`}>
                          {getRecordIcon(record.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-medium truncate mr-2">{record.title}</h3>
                            <Badge variant="outline" className={`text-xs ${getRecordColor(record.type)}`}>
                              {record.type.replace('-', ' ')}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 shrink-0" />
                              {new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 shrink-0" />
                              <span className="truncate">{record.doctor}</span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 truncate">
                            {record.hospital}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button size="sm" className="flex-1 sm:flex-none">View Details</Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg mb-2">No records found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Try adjusting your search criteria' : 'Your medical records will appear here'}
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
