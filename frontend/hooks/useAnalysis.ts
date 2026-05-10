import { useState, useCallback } from "react";
import { AnalysisReport, AnalysisStep } from "@/types";
import { sleep } from "@/lib/utils";

interface UseAnalysisReturn {
  report: AnalysisReport | null;
  step: AnalysisStep;
  stepLabel: string;
  progress: number;
  error: string | null;
  analyze: (address: string) => Promise<void>;
  reset: () => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [step, setStep] = useState<AnalysisStep>("idle");
  const [stepLabel, setStepLabel] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (address: string) => {
    if (!address.trim()) return;

    setError(null);
    setReport(null);
    setProgress(0);

    // Step 1 – show fetching UI immediately, fire real API call
    setStep("fetching");
    setStepLabel("Fetching on-chain data…");

    const apiPromise = fetch(`/api/analyze?address=${encodeURIComponent(address.trim())}`)
      .then((r) => r.json());

    // Progress animation while waiting for the API
    await sleep(1200);
    setProgress(25);

    setStep("analyzing");
    setStepLabel("Analyzing holder distribution…");
    await sleep(1400);
    setProgress(55);

    setStep("generating");
    setStepLabel("Generating AI security report…");

    // Wait for real data
    let result: AnalysisReport;
    try {
      const data = await apiPromise;
      if (data.error) throw new Error(data.error);
      result = data as AnalysisReport;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      setError(msg);
      setStep("idle");
      setStepLabel("");
      setProgress(0);
      return;
    }

    await sleep(800);
    setProgress(100);
    setReport(result);
    setStep("complete");
    setStepLabel("Analysis complete");
  }, []);

  const reset = useCallback(() => {
    setReport(null);
    setStep("idle");
    setStepLabel("");
    setProgress(0);
    setError(null);
  }, []);

  return { report, step, stepLabel, progress, error, analyze, reset };
}
