import { useState, useEffect } from 'react';
import { Building } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { VerificationBadge } from './ui/VerificationBadge';
import { useAppNavigate } from '../hooks/useAppNavigate';

export function HospitalsPage() {
  const { navigate } = useAppNavigate();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHospitals() {
      try {
        if (!projectId) return;
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/hospitals`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setHospitals(data);
        }
      } catch (e) {
        console.error('Failed to load hospitals', e);
      } finally {
        setLoading(false);
      }
    }
    loadHospitals();
  }, []);

  return (
    <div className="min-h-screen pt-[24px] pb-[64px] pr-[0px] pl-[0px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl tracking-tight mb-4">Partner Hospitals</h1>
          <p className="text-lg text-muted-foreground">
            Access quality care at partner hospitals across India
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading hospitals...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                No hospitals registered yet.
              </div>
            ) : (
              hospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-border flex flex-col"
                >
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Building className="w-12 h-12 text-primary/40" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{hospital.name}</h3>
                      <VerificationBadge
                        status={
                          hospital.verification_status ||
                          (hospital.verified ? 'verified_hospital' : null)
                        }
                        showLabel={false}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 flex items-start gap-2">
                      <span>📍</span> {hospital.location}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hospital.specialties ? (
                        hospital.specialties
                          .split(',')
                          .slice(0, 3)
                          .map((specialty: string, idx: number) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-accent rounded-full">
                              {specialty.trim()}
                            </span>
                          ))
                      ) : (
                        <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-500">
                          General
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {hospital.description || 'Leading healthcare provider.'}
                    </p>
                    <div className="mt-auto flex gap-2">
                      <button
                        onClick={() => navigate('hospital-detail', hospital)}
                        className="flex-1 py-2 bg-white border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigate('book-doctor')}
                        className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
