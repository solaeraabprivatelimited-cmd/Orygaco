import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, CreditCard, ChevronLeft, ArrowUpRight, ArrowDownRight, Wallet, Info, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import { useAppNavigate } from '../hooks/useAppNavigate';

interface DoctorEarningsProps {
}

export function DoctorEarnings() {
  const { navigate, goBack } = useAppNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [summary, setSummary] = useState<any>(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
      async function fetchSummary() {
          try {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) return;
              
              const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/doctor/finance/summary`, {
                  headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-Supabase-Auth': session.access_token }
              });
              
              if (res.ok) {
                  setSummary(await res.json());
              }
          } catch(e) { console.error(e); }
      }
      fetchSummary();
  }, []);

  const handleWithdraw = async () => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/doctor/finance/withdraw`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`, 
                  'X-Supabase-Auth': session.access_token 
              },
              body: JSON.stringify({ authToken: session.access_token, amount: summary?.availableBalance, bankId: 'primary' })
          });

          if (res.ok) {
              const data = await res.json();
              toast.success(`Withdrawal of ₹${data.amount} initiated. ETA: ${new Date(data.eta).toLocaleDateString()}`);
              setIsWithdrawModalOpen(false);
          } else {
              const err = await res.json();
              toast.error(err.error || "Withdrawal failed");
          }
      } catch (e) {
          toast.error("Network error");
      }
  };

  const generateStatement = async (type: 'pdf' | 'csv') => {
      try {
          setIsDownloading(true);
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-44966e3b/doctor/finance/statement`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`, 
                  'X-Supabase-Auth': session.access_token 
              },
              body: JSON.stringify({ authToken: session.access_token, type, month: 12, year: 2024 })
          });

          if (res.ok) {
              const data = await res.json();
              toast.success(`Statement generated (${type.toUpperCase()})`);
              // In real app, window.open(data.url)
          } else {
              toast.error("Failed to generate statement");
          }
      } catch (e) {
          toast.error("Error");
      } finally {
          setIsDownloading(false);
      }
  };

  return (
    <div className="h-screen pt-24 pb-16 bg-background overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl mb-1">Earnings & Payouts</h1>
            <p className="text-muted-foreground">Track your income and manage withdrawals</p>
          </div>
          <Button variant="outline" onClick={goBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              {summary?.projectedMonthlyEarnings && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Proj. ₹{summary.projectedMonthlyEarnings.toLocaleString()}
                  </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground mb-1">Total Earnings</div>
            <div className="text-2xl font-medium">₹{summary?.totalEarnings.toLocaleString() || '---'}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+12% vs last month</span>
            </div>
          </Card>

          <Card className="p-5 border-l-4 border-l-blue-500">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Available Balance</div>
            <div className="text-2xl font-medium text-blue-700">₹{summary?.availableBalance.toLocaleString() || '---'}</div>
            {summary?.nextPayoutDate && (
                <div className="text-xs text-blue-600 mt-1 font-medium">
                    Next Auto-Payout: {new Date(summary.nextPayoutDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
            )}
          </Card>

          <Card className="p-5 group relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
              <Info className="w-4 h-4 text-amber-400 cursor-help" />
            </div>
            <div className="text-sm text-muted-foreground mb-1">Pending Amount</div>
            <div className="text-2xl font-medium">₹{summary?.pendingAmount.toLocaleString() || '---'}</div>
            
            {/* Enhanced Breakdown Tooltip (Simulated via hover expand) */}
            <div className="absolute inset-x-0 bottom-0 bg-amber-50 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200 border-t border-amber-100">
                <div className="flex justify-between text-[10px] text-amber-800 mb-1">
                    <span>Processing</span>
                    <span>₹{summary?.pendingBreakdown?.processing || 0}</span>
                </div>
                <div className="flex justify-between text-[10px] text-amber-800 mb-1">
                    <span>Verification</span>
                    <span>₹{summary?.pendingBreakdown?.underVerification || 0}</span>
                </div>
                <div className="flex justify-between text-[10px] text-amber-800">
                    <span>Patient Pending</span>
                    <span>₹{summary?.pendingBreakdown?.patientPending || 0}</span>
                </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1 group-hover:opacity-0 transition-opacity">Hover for details</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Last Payout</div>
            <div className="text-2xl font-medium">₹15,600</div>
            <div className="text-xs text-muted-foreground mt-1">Dec 20, 2024</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Reports Download */}
            <Card className="p-4 flex items-center justify-between bg-slate-50 border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded border border-slate-200">
                        <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium">Monthly Statement</h3>
                        <p className="text-xs text-muted-foreground">Download your financial report for Dec 2024</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => generateStatement('csv')} disabled={isDownloading}>
                        CSV
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => generateStatement('pdf')} disabled={isDownloading}>
                        <Download className="w-3 h-3 mr-2" /> PDF
                    </Button>
                </div>
            </Card>

            {/* Transaction History (Enhanced) */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl">Recent Transactions</h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-1 rounded">Last 30 Days</span>
                </div>
              </div>

              <div className="space-y-2">
                {mockTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/30 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{transaction.patient}</span>
                          {transaction.status === 'pending' && (
                              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 rounded border border-amber-100 flex items-center gap-0.5">
                                  <Clock className="w-3 h-3" /> {transaction.eta}
                              </span>
                          )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.type} • {new Date(transaction.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="font-medium">₹{transaction.amount}</div>
                        <Badge
                          variant="outline"
                          className={
                            transaction.status === 'completed'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Earnings Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg mb-4">Monthly Overview</h3>
              <div className="space-y-3">
                {monthlyEarnings.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
                    <div>
                      <div className="font-medium mb-1">{item.month}</div>
                      <div className="text-sm text-muted-foreground">{item.consultations} consultations</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-medium">₹{item.earnings.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        ₹{Math.round(item.earnings / item.consultations)} avg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Withdraw Funds (Enhanced) */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
              <div className="text-center mb-4">
                <div className="text-sm text-blue-600/80 font-medium mb-2 uppercase tracking-wider">Available Balance</div>
                <div className="text-4xl font-bold text-blue-900 mb-1">₹{summary?.availableBalance.toLocaleString() || '---'}</div>
                <div className="text-xs text-blue-600 bg-white/50 inline-block px-2 py-1 rounded-full border border-blue-100">
                    Ready to withdraw
                </div>
              </div>
              <Button 
                className="w-full shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white" 
                size="lg"
                onClick={() => setIsWithdrawModalOpen(true)}
                disabled={!summary || summary.availableBalance < 1000}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Withdraw Funds
              </Button>
              <div className="mt-4 pt-4 border-t border-blue-200/50">
                <div className="text-xs text-blue-800/70 text-center leading-relaxed">
                  Minimum withdrawal: <span className="font-semibold">₹1,000</span><br />
                  Settlement time: <span className="font-semibold">2-3 business days</span>
                </div>
              </div>
            </Card>

            {/* Bank Details */}
            <Card className="p-6">
              <h3 className="text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-500" /> Linked Account
              </h3>
              <div className="space-y-3 text-sm mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank</span>
                  <span className="font-medium">HDFC Bank</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account</span>
                  <span className="font-mono font-medium">****8765</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-green-600 flex items-center gap-1 text-xs bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full text-xs h-8">
                Manage Accounts
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Withdrawal Confirmation Modal */}
      <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Withdrawal</DialogTitle>
            <DialogDescription>
              Please review the details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-center">
                <div className="text-sm text-muted-foreground mb-1">Transfer Amount</div>
                <div className="text-3xl font-bold text-slate-900">₹{summary?.availableBalance.toLocaleString()}</div>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 border-b">
                    <span className="text-muted-foreground">To Account</span>
                    <span className="font-medium">HDFC ****8765</span>
                </div>
                <div className="flex justify-between p-2 border-b">
                    <span className="text-muted-foreground">Settlement ETA</span>
                    <span className="font-medium">3 Days</span>
                </div>
                <div className="flex justify-between p-2 border-b">
                    <span className="text-muted-foreground">Transaction Fee</span>
                    <span className="font-medium text-green-600">₹0 (Free)</span>
                </div>
            </div>
            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded text-xs text-blue-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Funds will be transferred to your verified bank account. This action cannot be undone.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawModalOpen(false)}>Cancel</Button>
            <Button onClick={handleWithdraw} className="bg-blue-600 hover:bg-blue-700 text-white">Confirm Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}