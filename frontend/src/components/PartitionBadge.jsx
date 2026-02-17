import React from 'react';
import { REG_D, REG_A_PLUS } from '../config/constants';

export default function PartitionBadge({ partition }) {
  const getPartitionStyle = () => {
    if (partition === REG_D) {
      return {
        bg: 'bg-blue-900/30',
        border: 'border-blue-600',
        text: 'text-blue-400',
        label: 'Reg D (506c)',
      };
    } else if (partition === REG_A_PLUS) {
      return {
        bg: 'bg-green-900/30',
        border: 'border-green-600',
        text: 'text-green-400',
        label: 'Reg A+',
      };
    } else {
      return {
        bg: 'bg-gray-900/30',
        border: 'border-gray-600',
        text: 'text-gray-400',
        label: 'Unknown',
      };
    }
  };

  const style = getPartitionStyle();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${style.bg} ${style.border} ${style.text} border`}
    >
      {style.label}
    </span>
  );
}
