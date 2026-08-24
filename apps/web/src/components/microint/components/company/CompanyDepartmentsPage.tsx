"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, Users, Layers, ShieldCheck, Plus, Filter, LayoutGrid } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { companyApi } from "../../../../lib/api/company";

export const CompanyDepartmentsPage: React.FC = () => {
  const { showToast } = useApp();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await companyApi.getDepartments();
        if (res.data && res.data.length > 0) {
          setDepartments(res.data);
        } else {
          setDepartments([]);
        }
      } catch (err) {
        console.error("Failed to fetch departments:", err);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-black/5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Department Matrix
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-black dark:text-white tracking-tight">
            Department Management
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() =>
              showToast(
                "Sync Complete",
                "Department data synchronized with Active Directory.",
                "success",
              )
            }
            className="px-5 py-2.5 rounded-full bg-white dark:bg-[#0A0A0A] shadow-sm border border-black/5 dark:border-white/10 text-xs font-mono font-semibold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Sync AD</span>
          </button>
          <button
            onClick={() =>
              showToast("Create Department", "Department creation overlay triggered.", "info")
            }
            className="px-5 py-2.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-bold text-xs sm:text-sm hover:scale-105 transition-transform shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Department</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-black/50 dark:text-white/50 font-mono">
            Fetching department data...
          </div>
        ) : (
          departments.map((dept, i) => (
            <div
              key={i}
              className="p-6 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-black/20 dark:hover:border-white/20 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] dark:bg-white/5 flex items-center justify-center text-black dark:text-white">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-black/60 dark:text-white/60">
                  {dept.status}
                </span>
              </div>
              <h3 className="text-xl font-serif text-black dark:text-white mb-2">{dept.name}</h3>
              <div className="flex gap-4 text-xs font-mono text-black/50 dark:text-white/50">
                <div className="flex flex-col">
                  <span className="mb-1 uppercase tracking-widest text-[9px] text-black/40 dark:text-white/40">
                    Headcount
                  </span>
                  <span className="text-black dark:text-white font-bold">
                    {dept.headcount} Seats
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 uppercase tracking-widest text-[9px] text-black/40 dark:text-white/40">
                    Budget
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {typeof dept.budget === "number" ? `$${dept.budget}` : dept.budget}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
