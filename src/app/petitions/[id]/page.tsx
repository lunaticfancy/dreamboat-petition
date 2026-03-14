"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";

interface Petition {
  id: string;
  title: string;
  content: string;
  status: string;
  anonymousId: string;
  agreedCount: number;
  createdAt: string;
}

export default function PetitionDetailPage() {
  const params = useParams();
  const [petition, setPetition] = useState<Petition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPetition() {
      try {
        const res = await fetch(`/api/petitions/${params.id}`);
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || "청원을 찾을 수 없습니다.");
          return;
        }
        
        setPetition(data.petition);
      } catch {
        setError("청원 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchPetition();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark px-4 py-8 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">加载中...</div>
      </div>
    );
  }

  if (error || !petition) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error || "청원을 찾을 수 없습니다."}
          </div>
        </div>
      </div>
    );
  }

  const statusMap: Record<string, string> = {
    OPEN: "진행 중",
    ANSWERED: "답변 완료",
    CLOSED: "종료",
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <StatusBadge status={petition.status as "OPEN" | "ANSWERED" | "CLOSED"} />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {petition.title}
        </h1>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-4">
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {petition.content}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <div>
            <span className="font-medium text-primary">{petition.agreedCount}</span>명 동의
          </div>
          <div>
            작성일: {new Date(petition.createdAt).toLocaleDateString("ko-KR")}
          </div>
        </div>
      </div>
    </div>
  );
}
