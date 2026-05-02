import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { CareerVerification, VerificationDocType } from '../../types/careers';
import { VERIFICATION_STATUS_COLORS } from '../../types/careers';
import {
  fetchMyVerifications,
  submitVerification,
  uploadVerificationDoc,
} from '../../lib/careersApi';
import { toast } from 'sonner';

const DOC_TYPE_LABELS: Record<VerificationDocType, string> = {
  medical_license: 'Medical License',
  hospital_proof: 'Hospital / Org Proof',
  degree: 'Degree Certificate',
};

const STATUS_ICONS = {
  pending: Clock,
  verified: CheckCircle,
  rejected: XCircle,
};

interface Props {
  userId: string;
}

export function VerificationUpload({ userId }: Props) {
  const [verifications, setVerifications] = useState<CareerVerification[]>([]);
  const [docType, setDocType] = useState<VerificationDocType | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyVerifications(userId)
      .then(setVerifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSubmit = async () => {
    if (!docType) { toast.error('Select a document type'); return; }
    if (!file) { toast.error('Choose a file to upload'); return; }

    setUploading(true);
    try {
      const url = await uploadVerificationDoc(userId, file, docType);
      const record = await submitVerification(userId, docType, url);
      setVerifications((prev) => [record, ...prev]);
      setDocType('');
      setFile(null);
      toast.success('Document submitted for review');
    } catch (err: any) {
      toast.error(err.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4 flex flex-col gap-4">
        <h2 className="text-sm font-bold">Upload Verification Document</h2>
        <p className="text-xs text-muted-foreground">
          Upload documents to get a Verified badge on your profile. Reviews typically take 1–2 business days.
        </p>

        <div>
          <Label className="text-xs mb-1 block">Document Type</Label>
          <Select
            value={docType}
            onValueChange={(v) => setDocType(v as VerificationDocType)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(DOC_TYPE_LABELS) as VerificationDocType[]).map((k) => (
                <SelectItem key={k} value={k}>{DOC_TYPE_LABELS[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs mb-1 block">File (PDF, JPG, PNG — max 10 MB)</Label>
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {file ? file.name : 'Click to choose file'}
            </span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <Button
          className="w-full"
          style={{ backgroundColor: '#E8194A' }}
          onClick={handleSubmit}
          disabled={uploading || !docType || !file}
        >
          {uploading ? 'Uploading…' : 'Submit Document'}
        </Button>
      </Card>

      {/* Submission history */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : verifications.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground">Submission History</h3>
          {verifications.map((v) => {
            const Icon = STATUS_ICONS[v.status];
            return (
              <Card key={v.id} className="p-3 flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{DOC_TYPE_LABELS[v.type]}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(v.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    VERIFICATION_STATUS_COLORS[v.status]
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {v.status}
                </span>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
