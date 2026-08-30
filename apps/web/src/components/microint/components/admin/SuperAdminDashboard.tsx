"use client";
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { adminApi, type AdminStats } from "@/lib/api/admin";
import {
  Bell,
  HelpCircle,
  MoreHorizontal,
  TrendingUp,
  BarChart3,
  Users,
  Settings,
  Activity,
  Plus,
  Play,
  Info,
} from "lucide-react";

export const SuperAdminDashboard: React.FC = () => {
  const { setCurrentRoute, showToast } = useApp();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [subscriptionMetrics, setSubscriptionMetrics] = useState<any>(null);
  const [paymentMetrics, setPaymentMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          adminApi.getStats(),
          adminApi.getSubscriptionMetrics(),
          adminApi.getPaymentMetrics(),
        ]);

        if (results[0].status === "fulfilled") setStats(results[0].value);
        if (results[1].status === "fulfilled") setSubscriptionMetrics(results[1].value);
        if (results[2].status === "fulfilled") setPaymentMetrics(results[2].value);
      } catch (err: any) {
        console.error("Failed to fetch admin dashboard telemetry data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const revenue = paymentMetrics?.totalVolume || 0;
  const growth = subscriptionMetrics?.growth || "+0%";
  const totalUsers = stats?.users.total || 0;
  const activeCompanies = stats?.companies.active || 0;
  const averageValue = paymentMetrics?.averageTransactionValue || 0;
  const conversionRate = subscriptionMetrics?.conversionRate || 0;
  const totalAssessments = stats?.assessments.total || 0;
  
  return (
    <div className="min-h-screen bg-[#F1F3F5] dark:bg-[#0A0A0A] p-4 md:p-8 font-sans -m-8 text-black dark:text-white pb-24">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="w-12 h-12 bg-[#111] dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center font-bold text-xl tracking-tighter">
          AW
        </div>
        
        <div className="flex items-center bg-white dark:bg-[#1A1A1A] rounded-full p-1.5 shadow-sm">
          <button className="px-6 py-2 rounded-full bg-[#111] text-white text-sm font-semibold">
            Dashboard
          </button>
          <button className="px-6 py-2 rounded-full text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white text-sm font-semibold transition-colors">
            Widgets
          </button>
          <button className="px-6 py-2 rounded-full text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white text-sm font-semibold transition-colors">
            Analytics
          </button>
          <button className="px-6 py-2 rounded-full text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white text-sm font-semibold transition-colors">
            Settings
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-12 h-12 bg-white dark:bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-sm text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 bg-white dark:bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-sm text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 bg-white dark:bg-[#1A1A1A] rounded-full p-2 pr-5 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-orange-400 overflow-hidden flex items-center justify-center text-white font-bold text-xs">
              SA
            </div>
            <div>
              <div className="text-xs font-bold">Super Admin</div>
              <div className="text-[10px] text-black/50 dark:text-white/50">System Operations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Greeting Row */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Impact, sans-serif' }}>
          SYSTEM DASHBOARD
        </h1>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-white dark:bg-[#1A1A1A] rounded-full text-sm font-bold flex items-center gap-2 shadow-sm">
            <Activity className="w-4 h-4" /> Analytics
          </button>
          <button className="px-5 py-2.5 bg-white dark:bg-[#1A1A1A] rounded-full text-sm font-bold flex items-center gap-2 shadow-sm">
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Overall Sales (Platform Revenue) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1A1A1A] rounded-[32px] p-8 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-lg font-medium text-black/70 dark:text-white/70 mb-1">Platform Revenue</h2>
              <div className="text-5xl font-black tracking-tight" style={{ fontFamily: 'Impact, sans-serif' }}>
                $ {(revenue).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-full border border-black/10 dark:border-white/10 text-sm font-semibold flex items-center gap-2">
                Week <span className="text-[10px]">▼</span>
              </button>
              <button className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-end gap-2 h-64 mt-auto">
            {/* Custom Bar Chart mimicking the reference */}
            {[
              { label: "Jan", val: 30, tag: "+24%" },
              { label: "Feb", val: 65, tag: "+36%" },
              { label: "Mar", val: 55, tag: "+26%" },
              { label: "Apr", val: 40, tag: "+19%" },
              { label: "May", val: 45, tag: "" },
              { label: "Jun", val: 55, tag: "+25%" },
              { label: "Jul", val: 20, tag: "+14%" },
              { label: "Aug", val: 60, tag: "+25%" },
              { label: "Sep", val: 75, tag: "+32%" },
              { label: "Oct", val: 80, tag: "+10%" },
              { label: "Nov", val: 45, tag: "" },
              { label: "Dec", val: 90, tag: "+40%" },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                {bar.tag && (
                  <div className="text-[10px] font-bold text-black/60 dark:text-white/60 mb-1">{bar.tag}</div>
                )}
                <div 
                  className="w-full bg-[#FF5733] rounded-2xl rounded-b-md transition-all hover:opacity-90 relative overflow-hidden" 
                  style={{ height: `${bar.val}%`, minHeight: '20px' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>
                <div className="text-[11px] font-semibold text-black/40 dark:text-white/40">{bar.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Source / Net Profit (Growth) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1A1A1A] rounded-[32px] p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-black/70 dark:text-white/70">Source</h2>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-full border border-black/10 dark:border-white/10 text-sm font-semibold flex items-center gap-2">
                Week <span className="text-[10px]">▼</span>
              </button>
              <button className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="mb-10">
            <div className="text-sm text-black/50 dark:text-white/50 font-medium mb-1">Net Profit</div>
            <div className="text-5xl font-black tracking-tight" style={{ fontFamily: 'Impact, sans-serif' }}>
              $ {(revenue * 0.3).toLocaleString()}
            </div>
          </div>

          <div className="space-y-6 flex-1">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-black/50 dark:text-white/50 mb-3">
                <Info className="w-3 h-3" /> User Growth Over Time
              </div>
              <div className="flex gap-3">
                <div className="h-8 rounded-full bg-[#F4D03F] w-[70%]" />
                <div className="h-8 rounded-full bg-[#58D68D] w-[30%]" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-black/50 dark:text-white/50 mb-3">
                <Info className="w-3 h-3" /> Total sales volume
              </div>
              <div className="flex gap-3">
                <div className="h-8 rounded-full bg-[#9B59B6] w-[60%]" />
                <div className="h-8 rounded-full bg-[#FF5733] w-[40%]" />
              </div>
            </div>
          </div>

          <p className="text-sm text-black/50 dark:text-white/50 mt-8 font-medium">
            Net profit margin improved by 4.2% compared to last month.
          </p>
        </div>
      </div>

      {/* Lower Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Metrics Block */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1A1A1A] rounded-[32px] p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Metrics</h2>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-full border border-black/10 dark:border-white/10 text-sm font-semibold flex items-center gap-2">
                Week <span className="text-[10px]">▼</span>
              </button>
              <button className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6 border-b border-black/5 dark:border-white/5 pb-4 mb-6">
            <div className="text-sm font-bold border-b-2 border-black dark:border-white pb-4 -mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[10px]">{totalUsers}</span>
              Total Users
            </div>
            <div className="text-sm font-medium text-black/40 dark:text-white/40 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60 flex items-center justify-center text-[10px]">{activeCompanies}</span>
              Active Companies
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-[#F8F9FA] dark:bg-[#222] rounded-[24px] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white dark:border-[#222]" />
                  <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white dark:border-[#222]" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white dark:bg-[#333] flex items-center justify-center shadow-sm">
                  <BarChart3 className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
              </div>
              <div className="text-3xl font-black tracking-tighter" style={{ fontFamily: 'Impact, sans-serif' }}>${averageValue}</div>
              <div className="text-xs font-semibold text-black/50 dark:text-white/50 mt-1 leading-tight">Average<br/>Transaction</div>
            </div>

            <div className="flex-1 bg-[#F8F9FA] dark:bg-[#222] rounded-[24px] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-semibold text-black/50 dark:text-white/50">Gross Revenue</div>
                <div className="w-8 h-8 rounded-full bg-white dark:bg-[#333] flex items-center justify-center shadow-sm">
                  <Activity className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
              </div>
              <div className="text-2xl font-black tracking-tighter" style={{ fontFamily: 'Impact, sans-serif' }}>${revenue.toLocaleString()}</div>
              <div className="mt-4">
                <div className="flex justify-between text-[10px] font-semibold text-black/40 dark:text-white/40 mb-1.5">
                  <span>Goal</span>
                  <span>150 days left</span>
                </div>
                <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#58D68D] w-[65%] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Dark Action Widgets */}
          <div className="flex gap-4 mt-6">
            <div className="flex-[0.4] bg-[#111] text-white rounded-[24px] p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center cursor-pointer">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-lg font-bold">Today</div>
                <div className="text-[10px] text-white/50 mb-3">7 Notifications</div>
                <div className="flex gap-1.5 overflow-hidden">
                  {[12, 13, 14, 15, 16, 17].map((d, i) => (
                    <div key={d} className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 4 ? 'bg-white text-black' : 'border border-white/20'}`}>
                      {d}
                    </div>
                  ))}
                </div>
                <div className="text-xs font-semibold text-white/40 mt-4 border-t border-white/10 pt-3">Reminders</div>
              </div>
            </div>

            <div className="flex-[0.6] bg-[#111] text-white rounded-[24px] p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center font-bold text-xs">%</div>
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <Settings className="w-4 h-4" />
                  </div>
                </div>
                <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center cursor-pointer">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-white/50 mb-2">Plugins: <span className="text-white font-bold">Active</span></div>
                <div className="flex items-end justify-between border-b border-white/10 pb-4 mb-3">
                  <div className="text-3xl font-black tracking-tighter flex items-baseline gap-1" style={{ fontFamily: 'Impact, sans-serif' }}>
                    150<span className="text-sm font-bold text-white/40">/256 <span className="text-[10px] font-normal">Tasks</span></span>
                  </div>
                  <button className="px-4 py-1.5 bg-white text-black text-[10px] font-bold rounded-full">
                    View All
                  </button>
                </div>
                <div className="text-xs font-semibold text-white/40">Automatizations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Small Metric Cards & Total Transactions */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex gap-6">
            <div className="flex-1 bg-white dark:bg-[#1A1A1A] rounded-[32px] p-6 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="text-5xl font-black tracking-tight" style={{ fontFamily: 'Impact, sans-serif' }}>
                  {conversionRate}%
                </div>
                <div className="bg-[#58D68D] text-white px-3 py-1 rounded-full text-xs font-bold">{growth}</div>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div className="text-sm font-semibold text-black/50 dark:text-white/50 w-20 leading-tight">Conversion<br/>Rate</div>
                <div className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white dark:bg-[#1A1A1A] rounded-[32px] p-6 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="text-5xl font-black tracking-tight" style={{ fontFamily: 'Impact, sans-serif' }}>
                  ${averageValue}
                </div>
                <div className="bg-[#58D68D] text-white px-3 py-1 rounded-full text-xs font-bold">+4%</div>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div className="text-sm font-semibold text-black/50 dark:text-white/50 w-24 leading-tight">Average Order<br/>Value</div>
                <div className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="flex-[0.8] bg-white dark:bg-[#1A1A1A] rounded-[32px] p-6 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="text-sm font-semibold text-black/50 dark:text-white/50 leading-tight">Manage<br/>Customers</div>
                <button className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center">
                  <Settings className="w-3 h-3" />
                </button>
              </div>
              <div className="flex -space-x-3 mt-6">
                <div className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center bg-white dark:bg-[#1A1A1A] z-10 text-black dark:text-white font-bold cursor-pointer">
                  +
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-400 border-2 border-white dark:border-[#1A1A1A] z-20" />
                <div className="w-10 h-10 rounded-full bg-red-400 border-2 border-white dark:border-[#1A1A1A] z-30" />
              </div>
            </div>
          </div>

          {/* Bottom Grid for Transactions & Bounce Rate */}
          <div className="flex gap-6 flex-1">
            <div className="flex-[0.65] bg-white dark:bg-[#1A1A1A] rounded-[32px] p-8 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">Total Transactions</h2>
                <button className="px-5 py-2 rounded-full border border-black/10 dark:border-white/10 text-xs font-bold">
                  Settings
                </button>
              </div>
              
              <div className="flex items-start gap-3 mb-8">
                <div className="text-6xl font-black tracking-tighter" style={{ fontFamily: 'Impact, sans-serif' }}>
                  {totalAssessments.toLocaleString()}
                </div>
                <div className="bg-[#58D68D] text-white px-2 py-0.5 rounded-full text-[10px] font-bold mt-2">+10%</div>
              </div>
              <div className="text-xs font-semibold text-black/40 dark:text-white/40 -mt-6 mb-8">This month</div>

              {/* Dot Matrix Style Chart */}
              <div className="flex items-end justify-between flex-1 gap-1 mb-6 px-2">
                {[3, 1, 4, 2, 3, 2, 1, 4, 5, 2, 1, 3, 2, 1, 4, 2].map((dots, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-1.5">
                    {Array.from({ length: 5 }).map((_, dotIdx) => (
                      <div 
                        key={dotIdx} 
                        className={`w-3.5 h-3.5 rounded-full ${5 - dotIdx <= dots ? 'bg-[#FF5733]' : 'bg-transparent'}`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div className="text-xs font-medium text-black/50 dark:text-white/50 max-w-[200px] leading-relaxed">
                Total transactions grew by 9% compared to last month.
              </div>
            </div>

            <div className="flex-[0.35] bg-[#111] text-white rounded-[32px] p-8 shadow-lg relative overflow-hidden flex flex-col justify-between items-center text-center">
              {/* Decorative vertical lines */}
              <div className="absolute inset-0 flex justify-evenly opacity-10 pointer-events-none">
                <div className="w-[1px] h-full bg-white" />
                <div className="w-[1px] h-full bg-white" />
                <div className="w-[1px] h-full bg-white" />
                <div className="w-[1px] h-full bg-white" />
              </div>
              
              <h2 className="text-lg font-semibold relative z-10 text-white/80 mt-2">Bounce rate</h2>
              
              <div className="relative z-10 flex items-baseline my-auto">
                <div className="text-7xl font-black tracking-tighter" style={{ fontFamily: 'Impact, sans-serif' }}>0</div>
                <div className="text-4xl font-black tracking-tighter text-white/60" style={{ fontFamily: 'Impact, sans-serif' }}>%</div>
              </div>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
              </div>

              <button className="px-6 py-2.5 bg-white text-black text-xs font-bold rounded-full relative z-10 w-fit mb-2">
                View All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
