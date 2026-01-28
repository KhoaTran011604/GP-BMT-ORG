'use client';

import { ArrowDownCircle, ArrowUpCircle, RefreshCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TransactionTypeToggleProps {
    value: 'income' | 'expense' | 'adjustment';
    onChange: (value: 'income' | 'expense' | 'adjustment') => void;
}

export function TransactionTypeToggle({ value, onChange }: TransactionTypeToggleProps) {
    return (
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={() => onChange('income')}
                        className={`
                            flex items-center justify-center p-2 rounded-md font-medium text-sm transition-all duration-200
                            ${value === 'income'
                                ? 'bg-white shadow-sm text-green-700 ring-1 ring-green-200'
                                : 'text-gray-600 hover:text-gray-900'
                            }
                        `}
                    >
                        <ArrowDownCircle
                            size={16}
                            className={value === 'income' ? 'text-green-600' : 'text-gray-400'}
                        />
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Khoản thu</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={() => onChange('expense')}
                        className={`
                            flex items-center justify-center p-2 rounded-md font-medium text-sm transition-all duration-200
                            ${value === 'expense'
                                ? 'bg-white shadow-sm text-red-700 ring-1 ring-red-200'
                                : 'text-gray-600 hover:text-gray-900'
                            }
                        `}
                    >
                        <ArrowUpCircle
                            size={16}
                            className={value === 'expense' ? 'text-red-600' : 'text-gray-400'}
                        />
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Khoản chi</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={() => onChange('adjustment')}
                        className={`
                            flex items-center justify-center p-2 rounded-md font-medium text-sm transition-all duration-200
                            ${value === 'adjustment'
                                ? 'bg-white shadow-sm text-blue-700 ring-1 ring-blue-200'
                                : 'text-gray-600 hover:text-gray-900'
                            }
                        `}
                    >
                        <RefreshCcw
                            size={16}
                            className={value === 'adjustment' ? 'text-blue-600' : 'text-gray-400'}
                        />
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Điều chỉnh</p>
                </TooltipContent>
            </Tooltip>
        </div>
    );
}
