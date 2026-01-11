import React, { useCallback } from "react";
import { FiCheck, FiAlertCircle, FiCheckCircle, FiAward } from "react-icons/fi";

const StepIndicator = ({ 
  steps,
  currentStep, 
  onStepClick, 
  variant = "horizontal",
  progress = null, // { percentage, requiredPercentage, optionalPercentage }
}) => {
  const isVertical = variant === "vertical";
  const { percentage, requiredPercentage, optionalPercentage } = progress;
  const progressPercentage = Math.round(percentage || ((currentStep + 1) / steps.length) * 100);

  const getProgressInfo = useCallback(() => {
    if (percentage < 80) {
      return {
        message: "Incomplete fields! Please fill all mandatory fields to create listing.",
        icon: FiAlertCircle,
        color: "text-warning",
        bgColor: "bg-warning-light",
        barColor: "bg-warning",
      };
    } else if (percentage < 100) {
      return {
        message: "Ready to create! Adding optional details increases visibility and match chances.",
        icon: FiCheckCircle,
        color: "text-success",
        bgColor: "bg-success-light",
        barColor: "bg-success",
      };
    } else {
      return {
        message: "All fields complete! Your listing has the best chance of finding a match.",
        icon: FiAward,
        color: "text-success",
        bgColor: "bg-success-light",
        barColor: "bg-success",
      };
    }
  }, [percentage]);

  const progressInfo = getProgressInfo();

  return (
    <div className={`w-full`}>

      {!isVertical && (
        <div className="progress-bar mb-6">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      <div className={`
        ${isVertical 
          ? "flex flex-col space-y-2" 
          : "flex items-start justify-between"
        }
      `}>
        {steps.map((step, index) => {
          const isCompleted = step?.completed;
          const isActive = index === currentStep;
          const isClickable = !isActive && isCompleted;
          const StepIcon = step.icon;

          if (isVertical) {
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={`
                  relative flex items-center gap-4 p-3 rounded-xl w-full text-left
                  transition-all duration-200 ease-smooth group
                  ${isActive 
                    ? "bg-ink text-white" 
                    : isCompleted 
                      ? "bg-success-light hover:bg-success-light/80" 
                      : "hover:bg-surface-100"
                  }
                  ${isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-60"}
                `}
              >
                {/* Step icon/number */}
                <div
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    text-sm font-semibold transition-all duration-200
                    ${isActive 
                      ? "bg-white/20 text-white" 
                      : isCompleted 
                        ? "bg-success text-white" 
                        : "bg-surface-200 text-ink-muted"
                    }
                  `}
                >
                  {isCompleted ? (
                    <FiCheck className="w-5 h-5" strokeWidth={2.5} />
                  ) : StepIcon ? (
                    <StepIcon className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`
                      text-sm font-semibold truncate
                      ${isActive ? "text-white" : isCompleted ? "text-success-dark" : "text-ink"}
                    `}
                  >
                    {step.title}
                  </p>
                  {step.subtitle && (
                    <p
                      className={`
                        text-xs truncate mt-0.5
                        ${isActive ? "text-white/70" : "text-ink-muted"}
                      `}
                    >
                      {step.subtitle}
                    </p>
                  )}
                </div>

                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                )}
              </button>
            );
          }

          // Horizontal variant (original)
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isClickable && onStepClick?.(index)}
              disabled={!isClickable}
              className={`
                flex flex-col items-center gap-2 flex-1 group
                transition-all duration-200
                ${isClickable ? "cursor-pointer" : "cursor-not-allowed"}
              `}
            >
              {/* Step circle */}
              <div
                className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center
                  text-sm font-semibold transition-all duration-300 ease-smooth
                  ${
                    isCompleted
                      ? "bg-success text-white"
                      : isActive
                      ? "bg-ink text-white ring-4 ring-ink/10"
                      : "bg-surface-200 text-ink-muted"
                  }
                  ${isClickable && !isActive ? "group-hover:scale-105" : ""}
                `}
              >
                {isCompleted ? (
                  <FiCheck className="w-5 h-5" strokeWidth={3} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step label */}
              <div className="text-center">
                <p
                  className={`
                    text-sm font-medium transition-colors duration-200
                    ${isActive ? "text-ink" : "text-ink-muted"}
                  `}
                >
                  {step.title}
                </p>
                {step.subtitle && (
                  <p className="text-xs text-ink-faint mt-0.5 hidden sm:block">
                    {step.subtitle}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {isVertical && progress && (
        <div className="mt-6 px-3 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-muted font-medium">Completion</span>
            <span className={`font-bold ${progressInfo?.color || 'text-ink'}`}>
              {progressPercentage}%
            </span>
          </div>

          <div className="relative">
            <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-smooth ${progressInfo?.barColor || 'bg-ink'}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            <div 
              className="absolute top-0 w-0.5 h-2 bg-ink/30"
              style={{ left: '80%' }}
            />
          </div>

          <div className="flex items-center justify-between text-2xs text-ink-muted">
            <span>Required: {requiredPercentage}%</span>
            <span>Optional: {optionalPercentage}%</span>
          </div>

          {progressInfo && (
            <div className={`rounded-xl p-2 ${progressInfo.bgColor}`}>
              <div className="flex gap-2">
                <progressInfo.icon className={`w-4 h-4 ${progressInfo.color} flex-shrink-0 mt-0.5`} />
                <p className={`text-xs ${progressInfo.color}`}>
                  {progressInfo.message}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StepIndicator;
