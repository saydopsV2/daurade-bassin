import React from 'react';
import { getScoreColor, getScoreLabel } from '../utils/scoring.js';

export default function ScoreRing({ score, size = 80, strokeWidth = 6, showLabel = true, className = '' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-abyss-700/50"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
              filter: `drop-shadow(0 0 6px ${color}40)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-bold tabular-nums"
            style={{
              fontSize: size * 0.3,
              color,
              textShadow: `0 0 10px ${color}30`,
            }}
          >
            {score}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-center" style={{ color }}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}

export function ScoreBadge({ score, className = '' }) {
  const color = getScoreColor(score);
  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold border-2 ${className}`}
      style={{
        color,
        borderColor: color,
        backgroundColor: `${color}15`,
        textShadow: `0 0 8px ${color}30`,
      }}
    >
      {score}
    </span>
  );
}
