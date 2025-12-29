import React from 'react';
import { Check, Circle } from 'lucide-react';
import { SubmissionStatus } from '../types';

interface StepIndicatorProps {
  status: SubmissionStatus;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ status }) => {
  const steps = [
    { id: 'claim', label: 'Claim Product', statuses: [SubmissionStatus.CLAIMED, SubmissionStatus.ORDER_SUBMITTED, SubmissionStatus.ORDER_VERIFIED, SubmissionStatus.REVIEW_SUBMITTED, SubmissionStatus.COMPLETED] },
    { id: 'order', label: 'Order & Proof', statuses: [SubmissionStatus.ORDER_SUBMITTED, SubmissionStatus.ORDER_VERIFIED, SubmissionStatus.REVIEW_SUBMITTED, SubmissionStatus.COMPLETED] },
    { id: 'review', label: 'Review & Proof', statuses: [SubmissionStatus.REVIEW_SUBMITTED, SubmissionStatus.COMPLETED] },
    { id: 'complete', label: 'Get Rebate', statuses: [SubmissionStatus.COMPLETED] },
  ];

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
        
        {steps.map((step, index) => {
          const isCompleted = step.statuses.includes(status);
          const isCurrent = !isCompleted && (
            (index === 0 && status === SubmissionStatus.AVAILABLE) ||
            (index === 1 && status === SubmissionStatus.CLAIMED) ||
            (index === 2 && (status === SubmissionStatus.ORDER_SUBMITTED || status === SubmissionStatus.ORDER_VERIFIED)) ||
            (index === 3 && status === SubmissionStatus.REVIEW_SUBMITTED)
          );

          return (
            <div key={step.id} className="flex flex-col items-center bg-slate-50 px-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isCurrent 
                      ? 'bg-white border-primary-600 text-primary-600'
                      : 'bg-white border-slate-300 text-slate-300'
                }`}
              >
                {isCompleted ? <Check size={16} /> : <span className="text-xs font-bold">{index + 1}</span>}
              </div>
              <span className={`text-xs mt-2 font-medium ${isCurrent || isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};