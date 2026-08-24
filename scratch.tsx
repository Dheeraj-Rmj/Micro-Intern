import React from 'react';
const x = (
      <div className="space-y-8 animate-in fade-in duration-300 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Bento Card 6 (md:col-span-12) - Company Onboardings */}
        <div className="md:col-span-12 rounded-[40px] bg-white dark:bg-[#0A0A0A] shadow-sm border border-black/5 dark:border-white/10 p-8 flex flex-col justify-between hover:border-black/20 dark:hover:border-white/30 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-medium tracking-tight text-black dark:text-white font-serif">
                Company Onboarding Submissions
              </h3>
              <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">
                Review submitted eKYC documents and digital signatures.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {onboardings.length === 0 ? (
              <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 text-center text-xs opacity-60">
                No active onboarding sessions.
              </div>
            ) : (
              onboardings.map((ob) => (
                <div
                  key={ob.id}
                  className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm">{ob.companyName || 'Pending Submission'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ob.status === 'AUTO_VERIFIED' ? 'bg-emerald-500/10 text-emerald-600' : ob.status === 'SUBMITTED' ? 'bg-amber-500/10 text-amber-600' : 'bg-black/10 text-black/60'}`}>{ob.status}</span>
                      {ob.docVerificationScore?.status === 'AUTO_VERIFIED' && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-mono font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> MRZ Verified</span>
                      )}
                    </div>
                    <span className="text-xs text-black/50 font-mono">Token: {ob.token}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {(ob.status === 'SUBMITTED' || ob.status === 'AUTO_VERIFIED') && (
                      <button onClick={async () => {
                        if (confirm(`Approve onboarding for ${ob.companyName}?`)) {
                          try {
                            await apiClient.post(`/onboarding/admin/${ob.id}/approve`);
                            showToast('Approved', 'Company approved and MoU generated.', 'success');
                            adminApi.getOnboardings().then(setOnboardings);
                          } catch (e: any) {
                            showToast('Error', e.message || 'Failed to approve', 'error');
                          }
                        }
                      }} className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:scale-105 transition-transform">
                        Approve & Generate MoU
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* ── Generate Onboarding Link Modal ── */}
      {selectedQuickActionModal === 'onboarding' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        </div>
      )}
      </div>
);
